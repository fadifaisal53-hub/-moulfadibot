import httpx
from ..config import settings


class ApiClient:
    def __init__(self):
        self._client = httpx.AsyncClient(
            base_url=settings.API_URL,
            headers={"x-internal-key": settings.API_KEY},
            timeout=30.0,
        )

    async def get(self, path, params=None):
        r = await self._client.get(path, params=params)
        r.raise_for_status()
        return r.json()

    async def post(self, path, json=None):
        r = await self._client.post(path, json=json)
        r.raise_for_status()
        return r.json()

    async def close(self):
        await self._client.aclose()


api = ApiClient()
