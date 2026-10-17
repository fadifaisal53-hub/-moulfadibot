from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton

router = Router(name="settings")


@router.message(Command("settings"))
@router.message(F.text == "⚙️ الإعدادات")
async def show_settings(message: Message):
    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🔊 الأصوات: مفعّلة", callback_data="set:sound"
                )
            ],
            [
                InlineKeyboardButton(
                    text="🌐 اللغة: العربية", callback_data="set:lang"
                )
            ],
        ]
    )
    await message.answer("⚙️ <b>الإعدادات</b>", reply_markup=kb)


@router.callback_query(F.data.startswith("set:"))
async def toggle(callback):
    await callback.answer("قريباً!")
