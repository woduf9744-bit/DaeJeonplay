"""Backend MVP: a deterministic sample data engine. No live maps, AI, GPS, or photo verification."""

import json
from datetime import date
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent / 'data'
PLACES = json.loads((DATA_DIR / 'places.json').read_text(encoding='utf-8'))
FESTIVALS = json.loads((DATA_DIR / 'festivals.json').read_text(encoding='utf-8'))
PLACE_BY_ID = {p['id']: p for p in PLACES}
FESTIVAL_BY_ID = {f['id']: f for f in FESTIVALS}
CATEGORIES = ('food', 'explore', 'culture', 'experience', 'science')


def level_for(xp: int) -> int:
    """Level starts at 1 and rises by one per 100 XP (temporary game balancing)."""
    return max(1, xp // 100 + 1)


def progress_preview(completed_place_ids: list[str], completed_festival_ids: list[str] | None = None) -> dict:
    """Pure preview only: not proof of visits. XP never awarded by this function."""
    festival_ids = set(completed_festival_ids or [])
    place_ids = set(completed_place_ids)
    xp = {category: 0 for category in CATEGORIES}
    for place_id in place_ids:
        place = PLACE_BY_ID.get(place_id)
        if place:
            xp[place['cat']] += place['xp']
    for festival_id in festival_ids:
        festival = FESTIVAL_BY_ID.get(festival_id)
        if festival:
            xp[festival['cat']] += festival['xp']
    return {
        'levels': {category: {'xp': xp[category], 'level': level_for(xp[category]), 'remainder_xp': xp[category] % 100} for category in CATEGORIES},
        'unique_place_completions': len(place_ids.intersection(PLACE_BY_ID)),
        'unique_festival_completions': len(festival_ids.intersection(FESTIVAL_BY_ID)),
        'unknown_place_ids': sorted(place_ids - PLACE_BY_ID.keys()),
        'unknown_festival_ids': sorted(festival_ids - FESTIVAL_BY_ID.keys()),
        'notice': '시연용 계산 결과입니다. 실제 방문 인증이나 서버의 XP 지급 처리는 구현 전입니다.',
    }


def recommend_places(
    available_minutes: int,
    category: str | None = None,
    region: str | None = None,
    pace: str = 'any',
    visited_ids: list[str] | None = None,
    max_places: int = 3,
) -> dict:
    """Rule-based suggestions. `mins` are on-site estimates; travel time is NOT included."""
    visited = set(visited_ids or [])
    candidates = [p for p in PLACES if p['id'] not in visited
                  and (category is None or p['cat'] == category)
                  and (region is None or p['region'] == region)
                  and p['mins'] <= available_minutes
                  and (pace != 'indoor' or p['indoor'])
                  and (pace != 'walk' or not p['drive'])]

    # Stable scoring: smaller venue time first; driving preference ranks drive stops earlier.
    def score(p):
        drive_bonus = 0 if pace == 'drive' and p['drive'] else 1
        return (drive_bonus, p['mins'], p['id'])

    candidates.sort(key=score)
    selected, total = [], 0
    for place in candidates:
        if len(selected) >= max_places:
            break
        if total + place['mins'] > available_minutes:
            continue
        selected.append({
            'place_id': place['id'],
            'name': place['name'],
            'category': place['cat'],
            'district': place['district'],
            'on_site_minutes': place['mins'],
            'xp': place['xp'],
            'mission': place['mission'],
            'reason': '입력한 분류·지역·실내/이동 조건에 맞는 샘플 장소입니다.',
            'source': place['source'],
        })
        total += place['mins']
    return {
        'places': selected,
        'total_on_site_minutes': total,
        'travel_time_verified': False,
        'ai_generated': False,
        'notice': '규칙 기반 추천 시연입니다. 실제 이동 시간·영업시간·입장료는 확인되지 않았습니다.',
    }


def festival_status(festival: dict, today: date) -> str:
    start = date.fromisoformat(festival['start'])
    end = date.fromisoformat(festival['end'])
    return 'upcoming' if today < start else 'past' if today > end else 'ongoing'
