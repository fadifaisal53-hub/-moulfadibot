from aiogram import Router, F
from aiogram.types import (
    CallbackQuery,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
    Message,
)
from aiogram.fsm.context import FSMContext
from ..services.api_client import api

router = Router(name="quiz")


async def _render(target, state: FSMContext):
    data = await state.get_data()
    quiz = data["quiz"]
    idx = data["idx"]
    score = data.get("score", 0)

    if idx >= len(quiz["questions"]):
        total = len(quiz["questions"])
        passed = score >= total * 0.7
        emoji = "🎉" if passed else "💪"
        text = f"{emoji} <b>اكتمل الاختبار!</b>\n\nنتيجتك: <b>{score}/{total}</b>"
        if isinstance(target, CallbackQuery):
            await target.message.edit_text(text)
        else:
            await target.answer(text)
        await state.clear()
        return

    q = quiz["questions"][idx]
    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text=opt, callback_data=f"quiz:ans:{i}")]
            for i, opt in enumerate(q["choices"])
        ]
    )
    text = (
        f"❓ <b>سؤال {idx + 1}/{len(quiz['questions'])}</b>\n\n{q['prompt']}"
    )
    if isinstance(target, CallbackQuery):
        await target.message.edit_text(text, reply_markup=kb)
    else:
        await target.answer(text, reply_markup=kb)


@router.callback_query(F.data.startswith("quiz:start:"))
async def start_quiz(
    callback: CallbackQuery, state: FSMContext, db_user: dict | None = None
):
    lid = callback.data.split(":")[2]
    uid = db_user["id"] if db_user else "anon"
    try:
        quiz = await api.post(
            "/internal/quiz/generate",
            json={"userId": uid, "lessonId": lid},
        )
    except Exception as e:
        await callback.answer(f"خطأ: {e}", show_alert=True)
        return
    await state.update_data(quiz=quiz, idx=0, score=0)
    await _render(callback, state)
    await callback.answer()


@router.callback_query(F.data.startswith("quiz:ans:"))
async def answer(callback: CallbackQuery, state: FSMContext):
    choice = int(callback.data.split(":")[2])
    data = await state.get_data()
    q = data["quiz"]["questions"][data["idx"]]
    correct_idx = q["choices"].index(q["answer"])
    correct = choice == correct_idx
    if correct:
        data["score"] = data.get("score", 0) + 1
    data["idx"] += 1
    await state.update_data(**data)
    fb = "✅ صحيح!" if correct else f"❌ خطأ. الصحيح: {q['answer']}"
    await callback.answer(fb, show_alert=True)
    await _render(callback, state)
