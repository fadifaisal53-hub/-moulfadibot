from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, WebAppInfo
from ..config import settings


def main_menu_kb() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="📚 الدروس"), KeyboardButton(text="🎯 اختبرني")],
            [KeyboardButton(text="🏆 المتصدرون"), KeyboardButton(text="👤 ملفي")],
            [
                KeyboardButton(
                    text="💻 افتح المحرر",
                    web_app=WebAppInfo(url=settings.WEBAPP_URL),
                )
            ],
        ],
        resize_keyboard=True,
        input_field_placeholder="اختر من القائمة",
    )
