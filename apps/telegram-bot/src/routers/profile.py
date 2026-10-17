from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import Message
from ..services.api_client import api

router = Router(name="profile")


@router.message(Command("profile"))
@router.message(F.text == "👤 ملفي")
async def show_profile(message: Message, db_user: dict | None = None):
    if not db_user:
        await message.answer("جرّب /start")
        return
    try:
        p = await api.get(f"/internal/users/{db_user['id']}/profile")
    except Exception as e:
        await message.answer(f"❌ {e}")
        return
    u = p["user"]
    badges = " ".join(b["badgeId"] for b in p["badges"]) or "لا شارات بعد"
    await message.answer(
        f"👤 <b>{u['handle']}</b>\n\n"
        f"⭐ <b>{u['xp']}</b> XP · المستوى <b>{u['level']}</b>\n"
        f"🔥 سلسلة: {u['streak']} يوم\n\n"
        f"🏅 {badges}"
    )
