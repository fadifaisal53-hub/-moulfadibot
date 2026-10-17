from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import Message
from ..services.api_client import api

router = Router(name="leaderboard")


@router.message(Command("leaderboard"))
@router.message(F.text == "🏆 المتصدرون")
async def leaderboard(message: Message):
    try:
        data = await api.get("/internal/leaderboard/global?limit=10")
    except Exception as e:
        await message.answer(f"❌ {e}")
        return
    medals = {0: "🥇", 1: "🥈", 2: "🥉"}
    lines = ["🏆 <b>المتصدرون</b>\n"]
    for i, u in enumerate(data):
        p = medals.get(i, f"{i + 1}.")
        lines.append(f"{p} {u['handle']} — <b>{u['xp']}</b> XP")
    if not data:
        lines.append("لا يوجد متسابقون بعد.")
    await message.answer("\n".join(lines))
