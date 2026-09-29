"""digit_svg.py - draw real bench digits as inline SVG for the figures (paths, not rects).
python3 materials/digit_svg.py <row> <x> <y> <cell> [ink]   -> prints a <g> of paths for training row <row>."""
import json, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
DIG = "0123456789abcdefg"
def sample():
    t = (ROOT / "assets/dcai-sample.js").read_text()
    return json.loads(t[t.index("DCAI_SAMPLE = ") + 14:].rstrip().rstrip(";"))
def digit_g(px, x, y, cell, ink="#1E2413"):
    by = {}
    for p, ch in enumerate(px):
        v = DIG.index(ch)
        if v:
            by.setdefault(v, []).append(p)
    parts = []
    for v in sorted(by):
        d = "".join("M%g %gh%gv%gh-%gz" % (x + (p % 8) * cell, y + (p // 8) * cell, cell, cell, cell) for p in by[v])
        parts.append('<path d="%s" fill="%s" fill-opacity="%.2f"/>' % (d, ink, v / 16))
    return '<g stroke="none">' + "".join(parts) + "</g>"
if __name__ == "__main__":
    s = sample()
    rows = s["train"]["px"] + s["extra"]["px"]
    r, x, y, c = int(sys.argv[1]), float(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4])
    print(digit_g(rows[r], x, y, c, sys.argv[5] if len(sys.argv) > 5 else "#1E2413"))
