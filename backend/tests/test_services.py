from datetime import date
from fastapi.testclient import TestClient

from app.main import app
from app.services import PLACES, FESTIVALS, level_for, progress_preview, recommend_places, festival_status

client = TestClient(app)


def test_place_catalog_count():
    assert len(PLACES) == 21
    response = client.get('/api/v1/places')
    assert response.status_code == 200
    assert response.json()['count'] == 21


def test_level_boundaries():
    assert level_for(0) == 1
    assert level_for(99) == 1
    assert level_for(100) == 2
    assert level_for(250) == 3


def test_progress_is_per_category_and_deduplicated():
    ids = [next(p['id'] for p in PLACES if p['cat'] == 'food')]
    x = progress_preview(ids * 3)
    assert x['unique_place_completions'] == 1
    assert x['levels']['food']['xp'] == next(p['xp'] for p in PLACES if p['id'] == ids[0])
    assert x['levels']['explore']['xp'] == 0


def test_recommend_skips_visited_and_honors_constraints():
    first = next(p for p in PLACES if p['cat'] == 'explore' and not p['indoor'])
    data = recommend_places(available_minutes=140, category='explore', pace='walk', visited_ids=[first['id']])
    assert data['ai_generated'] is False
    assert data['travel_time_verified'] is False
    assert first['id'] not in [p['place_id'] for p in data['places']]
    assert all(p['category'] == 'explore' for p in data['places'])
    assert data['total_on_site_minutes'] <= 140


def test_recommend_indoor_filter():
    data = recommend_places(available_minutes=150, pace='indoor')
    by_id = {p['id']: p for p in PLACES}
    assert data['places']
    assert all(by_id[p['place_id']]['indoor'] for p in data['places'])


def test_recommend_unknown_region_empty():
    data = recommend_places(available_minutes=120, region='nonexistent')
    assert data['places'] == []


def test_festival_status_uses_real_dates():
    festival = FESTIVALS[0]
    assert festival_status(festival, date(2025, 1, 1)) == 'upcoming'
    assert festival_status(festival, date(2027, 1, 1)) == 'past'


def test_api_validation_and_404():
    assert client.get('/api/v1/places/not-real').status_code == 404
    assert client.post('/api/v1/recommend', json={'available_minutes': 10}).status_code == 422
    assert client.get('/api/v1/health').json()['status'] == 'ok'
