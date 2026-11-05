import sys
from pathlib import Path

# Support `python -m pytest backend/tests` from the repository root.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
