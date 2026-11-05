"""DaejeonPlay initial API — development prototype, not production authentication."""
from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import RecommendRequest, ProgressPreviewRequest
from app.services import PLACES, FESTIVALS, festival_status, recommend_places, progress_preview

app = FastAPI(title='DaejeonPlay API', version='0.1.0', description='Rule-based MVP API. No live GPS/LLM/RAG yet.')
# Allow only local demo origins during development; update before production.
app.add_middleware(CORSMiddleware,
                   allow_origins=['http://localhost:5500', 'http://127.0.0.1:5500'],
                   allow_methods=['GET', 'POST'], allow_headers=['Content-Type'])


@app.get('/api/v1/health')
def health():
    return {'status': 'ok', 'version': '0.1.0', 'mode': 'prototype'}


@app.get('/api/v1/places')
def get_places(category: str | None = None, region: str | None = None):
    result = [p for p in PLACES if (category is None or p['cat'] == category)
              and (region is None or p['region'] == region)]
    return {'count': len(result), 'items': result, 'source_type': 'local_sample_json'}


@app.get('/api/v1/places/{place_id}')
def get_place(place_id: str):
    for place in PLACES:
        if place['id'] == place_id:
            return place
    raise HTTPException(status_code=404, detail='Place not found')


@app.get('/api/v1/festivals')
def get_festivals(status: str | None = None):
    today = datetime.now(ZoneInfo('Asia/Seoul')).date()
    rows = [{**f, 'status': festival_status(f, today)} for f in FESTIVALS]
    if status:
        if status not in ('upcoming', 'ongoing', 'past'):
            raise HTTPException(status_code=422, detail='status must be upcoming|ongoing|past')
        rows = [f for f in rows if f['status'] == status]
    return {'count': len(rows), 'items': rows, 'checked_at': today.isoformat()}


@app.post('/api/v1/recommend')
def recommend(request: RecommendRequest):
    return recommend_places(**request.model_dump())


@app.post('/api/v1/progress/preview')
def progress(request: ProgressPreviewRequest):
    return progress_preview(**request.model_dump())
