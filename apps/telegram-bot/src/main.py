import asyncio
import logging
from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.client.session.aiohttp import AiohttpSession
from aiogram.enums import ParseMode
from aiogram.types import BotCommand
from aiogram.fsm.storage.memory import MemoryStorage

from .config import settings
from .middlewares.database import DatabaseMiddleware
from .routers import start, lessons, quiz, profile, leaderboard, settings as settings_router
from .services.api_client import api


async def main():
    logging.basicConfig(level=logging.INFO)
    
    # إعداد الوسيط (Cloudflare Worker) لتجاوز حظر IP
    session = AiohttpSession(api="https://telegrambot.fadifaisal53.workers.dev")
    
    bot = Bot(
        token=settings.BOT_TOKEN,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
        session=session,
    )
    dp = Dispatcher(storage=MemoryStorage())

    # ربط قاعدة البيانات
    dp.update.outer_middleware(DatabaseMiddleware())
    
    # تفعيل الأوامر
    dp.include_routers(
        start.router,
        lessons.router,
        quiz.router,
        profile.router,
        leaderboard.router,
        settings_router.router,
    )

    # إعداد قائمة الأوامر في تيليجرام (تم إصلاح الخطأ هنا)
    await bot.set_my_commands([
        BotCommand(command="start", description="البداية"),
        BotCommand(command="lessons", description="الدروس"),
        BotCommand(command="profile", description="ملفي"),
        BotCommand(command="leaderboard", description="المتصدرون"),
        BotCommand(command="help", description="مساعدة"),
    ])

    try:
        await bot.delete_webhook(drop_pending_updates=True)
        print("🤖 البوت يعمل...")
        await dp.start_polling(bot)
    finally:
        await api.close()
        await bot.session.close()


if __name__ == "__main__":
    asyncio.run(main())
