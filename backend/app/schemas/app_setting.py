from pydantic import BaseModel
from typing import Optional

class ClockStateResponse(BaseModel):
    clock_started_at: Optional[str] = None
