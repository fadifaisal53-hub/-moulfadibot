from aiogram import BaseMiddleware
from ..services.api_client import api


class DatabaseMiddleware(BaseMiddleware):
    async def __call__(self, handler, event, data):
        user = data.get("event_from_user")
        if user:
            try:
                db_user = await api.post(
                    "/internal/users/ensure",
                    json={
                        "telegramId": user.id,
                        "handle": user.username or user.first_name,
                    },
                )
                data["db_user"] = db_user
            except Exception as e:
                print(f"[DB] {e}")
        return await handler(event, data)
