from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import (
    CallbackQuery,
    Message,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
)
from aiogram.utils.keyboard import InlineKeyboardBuilder
from ..services.api_client import api

router = Router(name="lessons")


@router.message(Command("lessons"))
@router.message(F.text == "📚 الدروس")
async def list_lessons(message: Message):
    try:
        lessons = await api.get("/internal/lessons")
    except Exception as e:
        await message.answer(f"❌ {e}")
        return

    kb = InlineKeyboardBuilder()
    for l in lessons[:20]:
        icon = "🐍" if l["language"] == "python" else "🟨"
        kb.row(
            InlineKeyboardButton(
                text=f"{icon} {l['title']}",
                callback_data=f"lesson:open:{l['id']}",
            )
        )
    await message.answer(
        "📚 <b>الدروس المتاحة</b>", reply_markup=kb.as_markup()
    )


@router.callback_query(F.data.startswith("lesson:open:"))
async def open_lesson(callback: CallbackQuery):
    lid = callback.data.split(":")[2]
    try:
        lesson = await api.get(f"/internal/lessons/{lid}")
    except Exception as e:
        await callback.answer(f"خطأ: {e}", show_alert=True)
        return

    text = (
        f"<b>{lesson['title']}</b>\n"
        f"<i>{lesson['summary']}</i>\n\n"
        f"{lesson['body']}\n\n"
        f"🎯 <b>المطلوب:</b> {lesson['goal']}"
    )
    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🎯 ابدأ الاختبار",
                    callback_data=f"quiz:start:{lid}",
                )
            ],
        ]
    )
    await callback.message.edit_text(text, reply_markup=kb)
    await callback.answer()


@router.callback_query(F.data == "lesson:list")
async def back_to_list(callback: CallbackQuery):
    await list_lessons(callback.message)
    await callback.answer()
