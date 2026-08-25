from pydantic import BaseModel
from typing import Optional

class MissYouStatsResponse(BaseModel):
    partner_count: int
    my_count: int
    partner_last_sent: Optional[str] = None
    my_last_sent: Optional[str] = None
    partner_name: str
