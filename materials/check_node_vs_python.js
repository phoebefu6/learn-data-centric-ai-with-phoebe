// check_node_vs_python.js - runs the browser engine (assets/dcai-live.js) in node over all 48 bench
// configurations and compares every flag and every accuracy with materials/bench-canon-python.json.
// Usage: node materials/check_node_vs_python.js   (exit 0 = agree to the row)
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..");
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, "assets/dcai-sample.js"), "utf8"), ctx);
const eng = require(path.join(root, "assets/dcai-live.js"));
const py = JSON.parse(fs.readFileSync(path.join(__dirname, "bench-canon-python.json"), "utf8"));
const d = eng.prepare(ctx.window.DCAI_SAMPLE);
let bad = 0, n = 0;
const ref = eng.reference(d);
if (ref.correct !== py.reference_true_labels.correct) { bad++; console.log("reference differs", ref, py.reference_true_labels); }
const out = {};
for (const id of Object.keys(py.configs)) {
  const p = py.configs[id];
  const r = eng.evaluate(d, p.config);
  n++;
  const checks = [
    ["correct", r.correct, p.correct], ["train_rows", r.train_rows, p.train_rows],
    ["wrong_label_rows_left", r.wrong_label_rows_left, p.wrong_label_rows_left],
    ["flagged_rows", JSON.stringify(r.flagged_rows), JSON.stringify(p.flagged_rows)],
    ["detector", JSON.stringify(r.detector), JSON.stringify(p.detector)],
    ["per_class", JSON.stringify(r.per_class_correct), JSON.stringify(p.per_class_correct)],
    ["weakest", r.weakest, p.weakest], ["aug_rows", r.aug_rows, p.aug_rows],
    ["ambiguous_dropped", r.ambiguous_dropped, p.ambiguous_dropped]];
  for (const [k, a, b] of checks) if (a !== b) { bad++; console.log("DIFF", id, k, a, b); }
  out[id] = { acc_pct: r.acc_pct, correct: r.correct, flagged: r.detector.flagged };
}
fs.writeFileSync(path.join(__dirname, "bench-canon-node.json"), JSON.stringify({ reference: ref, configs: out }, null, 1));
console.log(bad ? `FAIL ${bad} differences over ${n} configurations` : `AGREE: ${n} configurations, every flag and every test prediction count identical`);
process.exit(bad ? 1 : 0);
