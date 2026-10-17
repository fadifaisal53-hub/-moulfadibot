from aiogram import Router
from aiogram.filters import CommandStart, Command
from aiogram.types import Message
from ..keyboards.main_menu import main_menu_kb

router = Router(name="start")


@router.message(CommandStart())
async def cmd_start(message: Message, db_user: dict | None = None):
    if db_user:
        await message.answer(
            f"أهلاً <b>{db_user.get('handle', '')}</b>! 👋\n\n"
            f"⭐ {db_user.get('xp', 0)} XP · المستوى {db_user.get('level', 1)}\n"
            f"🔥 سلسلة: {db_user.get('streak', 0)} يوم",
            reply_markup=main_menu_kb(),
        )
        return
    await message.answer(
        "🎓 <b>أهلاً بك في مولينكس!</b>\n\n"
        "منصة تفاعلية لتعلّم البرمجة والأمن السيبراني بالعربية.",
        reply_markup=main_menu_kb(),
    )


@router.message(Command("help"))
async def cmd_help(message: Message):
    await message.answer(
        "🎓 <b>الأوامر:</b>\n\n"
        "/start — البداية\n/lessons — الدروس\n"
        "/profile — ملفك\n/leaderboard — المتصدرون",
        reply_markup=main_menu_kb(),
    )
