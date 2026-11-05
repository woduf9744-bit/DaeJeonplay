from typing import Literal
from pydantic import BaseModel, Field

Category = Literal['food', 'explore', 'culture', 'experience', 'science']
Pace = Literal['any', 'walk', 'indoor', 'drive']


class RecommendRequest(BaseModel):
    category: Category | None = None
    region: str | None = None
    available_minutes: int = Field(default=120, ge=15, le=600)
    pace: Pace = 'any'
    visited_ids: list[str] = Field(default_factory=list)
    max_places: int = Field(default=3, ge=1, le=5)


class ProgressPreviewRequest(BaseModel):
    completed_place_ids: list[str] = Field(default_factory=list)
    completed_festival_ids: list[str] = Field(default_factory=list)
