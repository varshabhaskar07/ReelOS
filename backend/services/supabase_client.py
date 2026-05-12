from postgrest import SyncPostgrestClient
from config import settings

_client: SyncPostgrestClient | None = None


def get_supabase() -> SyncPostgrestClient:
    global _client
    if _client is None:
        _client = SyncPostgrestClient(
            base_url=f"{settings.supabase_url}/rest/v1",
            headers={
                "apikey": settings.supabase_service_key,
                "Authorization": f"Bearer {settings.supabase_service_key}",
            },
        )
    return _client
