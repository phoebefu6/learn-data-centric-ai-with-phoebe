"""build_mindmap.py - writes window.MINDMAP_DATA into index.html with json.dumps (never an f-string)."""
import json, re
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
S = [
    ("Hold the model,\nfix the data", "01-hold-the-model-fix-the-data.html", "#FB923C",
     ["Two loops, one system", "Quote the whole table", "Start after the errors"]),
    ("When labellers\ndisagree", "02-when-labellers-disagree.html", "#FB923C",
     ["Agreement beyond percent", "Consensus labelling", "The guideline is a spec"]),
    ("Finding the\nwrong labels", "03-finding-the-wrong-labels.html", "#FB923C",
     ["Out-of-sample votes", "Per-class thresholds", "The confident joint"]),
    ("The data-edit\nbench", "04-the-data-edit-bench.html", "#F87171",
     ["Two counters", "More of the same", "The detector leak"]),
    ("Slice, augment\nor collect", "05-slice-augment-or-collect.html", "#FB923C",
     ["Slices without peeking", "Augment for coverage", "Collect or clean"]),
    ("The data-edit\nspec", "06-the-data-edit-spec.html", "#FB923C",
     ["Beat the bench", "The edit log", "The stopping rule"]),
]
data = {"title": "Data-Centric\nAI", "centerColor": "#3D4A1C",
        "sessions": [{"label": l, "href": "courses/" + h, "color": c,
                      "concepts": [{"label": x, "href": "courses/" + h} for x in cs]} for l, h, c, cs in S]}
p = ROOT / "index.html"
s = p.read_text()
block = "<script>\nwindow.MINDMAP_DATA = " + json.dumps(data, indent=1) + ";\n</script>"
s = re.sub(r"<!-- mindmap:data -->(\n<script>\nwindow.MINDMAP_DATA = .*?;\n</script>)?", lambda m: "<!-- mindmap:data -->\n" + block, s, flags=re.S)
p.write_text(s)
print("mindmap written")
