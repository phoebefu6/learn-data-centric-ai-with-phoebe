/* dcai-live.js - the data-edit bench for learn-data-centric-ai-with-phoebe
 *
 * Hold the model fixed, fix the data. 1,797 real handwritten digits (UCI Optical Recognition of
 * Handwritten Digits, via dcai-sample.js) are split once, with a seed, into 500 test images that are
 * never relabelled, 800 training images, and a pool of 497 more. A declared label-noise plant has
 * relabelled 1s as 7s, 3s as 8s, 4s as 9s and back, favouring the images that look most like the
 * other digit, the way a tired labeller errs.
 *
 * The model is FROZEN: k-nearest neighbours, k = 10, squared Euclidean distance on the 64 integer
 * pixels. Every edit on the bench changes only the training rows or their labels, then the same
 * model is scored on the same clean test set. Everything is computed here, in integer arithmetic,
 * and materials/build_dcai_bench.py reproduces every flag to the row.
 *
 * What is REAL: the images, the model, every accuracy, every flag, the confident joint.
 * What is CONSTRUCTED, and labelled so on the widget: the noise. It is planted and declared, which
 * is the only reason precision and recall of the detector can be counted at all.
 */
(function (root) {
  "use strict";

  var K = 10, FOLDS = 4, NBASE = 800, AMBIG_MAX = 5;
  var DIG = "0123456789abcdefg";

  /* ---------- data ---------- */
  function decode(pxs) {
    return pxs.map(function (s) {
      var a = new Int32Array(64);
      for (var i = 0; i < 64; i++) a[i] = DIG.indexOf(s.charAt(i));
      return a;
    });
  }
  function prepare(S) {
    return {
      Xte: decode(S.test.px), yte: S.test.y.slice(),
      X: decode(S.train.px).concat(decode(S.extra.px)),
      y: S.train.y.concat(S.extra.y), g: S.train.g.concat(S.extra.g),
      folds: S.folds.slice(), seed: S.seed, plant: S.plant
    };
  }
  function shift(img, dx, dy) {
    var out = new Int32Array(64);
    for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
      var rr = r - dy, cc = c - dx;
      if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) out[r * 8 + c] = img[rr * 8 + cc];
    }
    return out;
  }

  /* ---------- the frozen model: kNN, k = 10 ----------
   * Neighbours ordered by (distance, training index). Votes are counts out of 10. A vote tie goes
   * to whichever tied digit appears first among the neighbours, nearest first. */
  function neighbours(Xtr, q) {
    var nd = [], ni = [];
    for (var j = 0; j < Xtr.length; j++) {
      var a = Xtr[j], d = 0;
      for (var p = 0; p < 64; p++) { var t = a[p] - q[p]; d += t * t; }
      if (nd.length === K && d >= nd[K - 1]) continue;
      var pos = nd.length;
      while (pos > 0 && nd[pos - 1] > d) pos--;
      nd.splice(pos, 0, d); ni.splice(pos, 0, j);
      if (nd.length > K) { nd.pop(); ni.pop(); }
    }
    return ni;
  }
  function knn(Xtr, ytr, Xq) {
    var V = [], pred = [];
    for (var r = 0; r < Xq.length; r++) {
      var nb = neighbours(Xtr, Xq[r]), v = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      for (var i = 0; i < nb.length; i++) v[ytr[nb[i]]]++;
      var m = Math.max.apply(null, v), pr = -1;
      for (i = 0; i < nb.length; i++) if (v[ytr[nb[i]]] === m) { pr = ytr[nb[i]]; break; }
      V.push(v); pred.push(pr);
    }
    return { V: V, pred: pred };
  }
  function oosVotes(X, g, folds, inSample) {
    if (inSample) return knn(X, g, X).V;
    var V = new Array(X.length);
    for (var f = 0; f < FOLDS; f++) {
      var Xa = [], ga = [], qb = [], ib = [];
      for (var i = 0; i < X.length; i++) {
        if (folds[i] === f) { qb.push(X[i]); ib.push(i); } else { Xa.push(X[i]); ga.push(g[i]); }
      }
      var res = knn(Xa, ga, qb).V;
      for (i = 0; i < ib.length; i++) V[ib[i]] = res[i];
    }
    return V;
  }

  /* ---------- confident learning (Northcutt, Jiang and Chuang 2021, eqs. 1-2) ----------
   * p_j = V_j / 10 and the per-class threshold t_j = mean self-confidence of rows GIVEN label j,
   * so p_j >= t_j is V_j * n_j >= S_j in integers. Among classes over their threshold the largest
   * p wins; a tie that includes the given label keeps it, otherwise the lowest digit. */
  function confidentLearning(V, g) {
    var n = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], S = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], i, l;
    for (i = 0; i < g.length; i++) { n[g[i]]++; S[g[i]] += V[i][g[i]]; }
    var joint = [];
    for (i = 0; i < 10; i++) joint.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    var flag = new Array(g.length), sug = g.slice();
    for (i = 0; i < g.length; i++) {
      flag[i] = false;
      var cand = [];
      for (l = 0; l < 10; l++) if (n[l] > 0 && V[i][l] * n[l] >= S[l]) cand.push(l);
      if (!cand.length) continue;
      var m = -1;
      cand.forEach(function (c) { if (V[i][c] > m) m = V[i][c]; });
      var best = cand.filter(function (c) { return V[i][c] === m; });
      var js = best.indexOf(g[i]) >= 0 ? g[i] : best[0];
      joint[g[i]][js]++;
      if (js !== g[i]) { flag[i] = true; sug[i] = js; }
    }
    return { flag: flag, sug: sug, joint: joint, S: S, n: n };
  }
  function argmaxFlags(V, g) {
    return g.map(function (gi, i) {
      var m = Math.max.apply(null, V[i]);
      return V[i][gi] !== m;
    });
  }
  function detStats(flag, planted) {
    var f = 0, tp = 0, pl = 0;
    for (var i = 0; i < flag.length; i++) {
      if (flag[i]) f++;
      if (planted[i]) pl++;
      if (flag[i] && planted[i]) tp++;
    }
    return { flagged: f, caught: tp, planted: pl,
             precision_pct: Math.round(1000 * tp / Math.max(1, f)) / 10,
             recall_pct: Math.round(1000 * tp / pl) / 10 };
  }

  /* ---------- one configuration, end to end ---------- */
  function configId(c) {
    return c.pool + "-" + c.fix + "-" + (c.ambig ? "amb" : "x") + "-" + (c.aug ? "aug" : "x") + "-" + (c.leak ? "leak" : "oos");
  }
  function evaluate(d, c) {
    var n = c.pool === "base" ? NBASE : d.g.length, i;
    var X = d.X.slice(0, n), y = d.y.slice(0, n), g = d.g.slice(0, n), folds = d.folds.slice(0, n);
    var planted = g.map(function (gi, k) { return gi !== y[k]; });
    var V = oosVotes(X, g, folds, c.leak);
    var cl = confidentLearning(V, g);
    var det = detStats(cl.flag, planted);
    var rr = 0;
    for (i = 0; i < n; i++) if (cl.flag[i] && cl.sug[i] === y[i]) rr++;
    det.relabel_right = rr;
    det.argmax = detStats(argmaxFlags(V, g), planted);

    var keep = new Array(n), lab = g.slice();
    for (i = 0; i < n; i++) keep[i] = true;
    if (c.fix === "remove") for (i = 0; i < n; i++) { if (cl.flag[i]) keep[i] = false; }
    if (c.fix === "relabel") lab = cl.sug.slice();
    var dropped = 0;
    if (c.ambig) for (i = 0; i < n; i++) {
      if (keep[i] && Math.max.apply(null, V[i]) <= AMBIG_MAX) { keep[i] = false; dropped++; }
    }
    var Xk = [], gk = [], fk = [], yk = [], src = [];
    for (i = 0; i < n; i++) if (keep[i]) { Xk.push(X[i]); gk.push(lab[i]); fk.push(folds[i]); yk.push(y[i]); src.push(i); }
    var kept = Xk.length, info = { weakest: null, aug_rows: 0 };
    if (c.aug) {
      var Vk = oosVotes(Xk, gk, fk, false);
      var agree = [];
      for (var dg = 0; dg < 10; dg++) agree.push([0, 0]);
      for (i = 0; i < kept; i++) {
        agree[gk[i]][1]++;
        var am = 0;
        for (var l = 1; l < 10; l++) if (Vk[i][l] > Vk[i][am]) am = l;
        if (am === gk[i]) agree[gk[i]][0]++;
      }
      var w = 0;
      for (dg = 1; dg < 10; dg++) if (agree[dg][0] * agree[w][1] < agree[w][0] * agree[dg][1]) w = dg;
      var add = 0;
      for (i = 0; i < kept; i++) if (gk[i] === w) {
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (s) { Xk.push(shift(Xk[i], s[0], s[1])); gk.push(w); add++; });
      }
      info = { weakest: w, aug_rows: add, agree: agree };
    }
    var res = knn(Xk, gk, d.Xte), ok = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tot = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], correct = 0;
    for (i = 0; i < d.yte.length; i++) {
      tot[d.yte[i]]++;
      if (res.pred[i] === d.yte[i]) { ok[d.yte[i]]++; correct++; }
    }
    var left = 0;
    for (i = 0; i < kept; i++) if (gk[i] !== yk[i]) left++;
    var flagged = [];
    for (i = 0; i < n; i++) if (cl.flag[i]) flagged.push(i);
    var out = { id: configId(c), config: c, train_rows: Xk.length, correct: correct, test: d.yte.length,
                acc_pct: Math.round(1000 * correct / d.yte.length) / 10,
                per_class_correct: ok, per_class_total: tot, wrong_label_rows_left: left,
                planted: det.planted, detector: det, ambiguous_dropped: dropped, flagged_rows: flagged,
                weakest: info.weakest, aug_rows: info.aug_rows,
                _cl: cl, _V: V, _planted: planted, _n: n };
    if (info.agree) out.agree = info.agree;
    return out;
  }
  function reference(d) {
    var r = knn(d.X.slice(0, NBASE), d.y.slice(0, NBASE), d.Xte), c = 0;
    for (var i = 0; i < d.yte.length; i++) if (r.pred[i] === d.yte[i]) c++;
    return { correct: c, acc_pct: Math.round(1000 * c / d.yte.length) / 10 };
  }

  var PRESETS = [
    { id: "base", label: "Baseline: train on the labels you were given", c: { pool: "base", fix: "none", ambig: false, aug: false, leak: false },
      note: "800 rows, 133 of them carrying a planted wrong label. The number every edit is measured against." },
    { id: "more", label: "Add 497 more rows with the same noise", anti: true, tag: "more data, same labellers",
      c: { pool: "more", fix: "none", ambig: false, aug: false, leak: false },
      note: "The request every stalled project makes. Same labelling process, same confusions, 62 percent more rows." },
    { id: "remove", label: "Remove what confident learning flags", c: { pool: "base", fix: "remove", ambig: false, aug: false, leak: false },
      note: "Four-fold out-of-sample votes, per-class thresholds, the off-diagonal of the confident joint. Flagged rows leave." },
    { id: "relabel", label: "Relabel what confident learning flags", c: { pool: "base", fix: "relabel", ambig: false, aug: false, leak: false },
      note: "Same flags, but each row keeps its image and takes the label confident learning suggests." },
    { id: "ambig", label: "Relabel, then drop ambiguous rows", c: { pool: "base", fix: "relabel", ambig: true, aug: false, leak: false },
      note: "Also drop every row whose neighbours reach no majority (5 or fewer of 10 votes for any digit)." },
    { id: "aug", label: "Relabel, then shift the weakest digit", c: { pool: "base", fix: "relabel", ambig: false, aug: true, leak: false },
      note: "Find the digit the cleaned training set agrees with least (cross-validated, never the test set) and add four 1-pixel shifts of each of its rows." },
    { id: "leak", label: "Relabel, but let the detector see each row's own label", anti: true, tag: "the leak",
      c: { pool: "base", fix: "relabel", ambig: false, aug: false, leak: true },
      note: "In-sample votes: every row is its own nearest neighbour, so it vouches for its own label." },
    { id: "collect", label: "Collect the 497 more, and clean all of it", c: { pool: "more", fix: "relabel", ambig: false, aug: false, leak: false },
      note: "The fair version of 'more data': the new rows go through the same confident-learning pass." }
  ];

  /* ---------- UI ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]; });
  }
  function metric(label, value, unit, kind) {
    return '<div class="mb-metric"><span class="mb-mlabel">' + esc(label) + '</span><span class="mb-mvalue">' + esc(value) +
      '</span><span class="mb-munit">' + esc(unit) + '</span><span class="mb-mkind is-' + kind + '">' + kind + "</span></div>";
  }
  function thumb(img, cls, title) {
    var s = '<svg class="dc-thumb ' + cls + '" viewBox="0 0 8 8" role="img" aria-label="' + esc(title) + '">';
    for (var p = 0; p < 64; p++) if (img[p] > 0) {
      s += '<rect x="' + (p % 8) + '" y="' + Math.floor(p / 8) + '" width="1" height="1" fill-opacity="' + (img[p] / 16).toFixed(3) + '"/>';
    }
    return s + "</svg>";
  }
  function fmtDelta(x) { return (x > 0 ? "+" : "") + x.toFixed(1); }

  var el, readout, gallery, slices, ctl = {}, presetBtns = {}, data, base, ref, cache = {}, currentPreset = "base";

  function run(c) {
    var id = configId(c);
    if (!cache[id]) cache[id] = evaluate(data, c);
    return cache[id];
  }
  function currentConfig() {
    return { pool: ctl.pool.value, fix: ctl.fix.value, ambig: ctl.ambig.checked, aug: ctl.aug.checked, leak: ctl.leak.checked };
  }

  function verdict(r) {
    var dlt = r.acc_pct - base.acc_pct;
    if (r.id === base.id) {
      return ["ok", "The baseline: " + r.planted + " planted wrong labels in training, " + (ref.correct - r.correct) +
        " test digits below the " + ref.acc_pct.toFixed(1) + "% the true labels would reach"];
    }
    if (r.config.leak && r.config.fix !== "none") {
      return ["bad", "The detector graded its own homework: it flagged " + r.detector.flagged + " rows and found " +
        r.detector.recall_pct.toFixed(1) + "% of the planted errors, against " + base.detector.recall_pct.toFixed(1) + "% out of sample"];
    }
    if (dlt < 0) return ["bad", fmtDelta(dlt) + " points against the baseline. " + r.wrong_label_rows_left + " wrong labels are still in the training set"];
    if (dlt < 1) return ["bad", fmtDelta(dlt) + " points: this edit bought almost nothing. " + r.wrong_label_rows_left + " wrong labels are still in the training set"];
    return ["good", fmtDelta(dlt) + " points on the same frozen model, from data edits only"];
  }

  function render() {
    var c = currentConfig(), r = run(c), g = verdict(r), dlt = r.acc_pct - base.acc_pct;
    readout.innerHTML =
      '<div class="mb-verdict is-' + g[0] + '">' + esc(g[1]) + ' <span class="mb-mkind is-measured">measured</span></div>' +
      '<div class="mb-metrics">' +
        metric("Test accuracy", r.acc_pct.toFixed(1) + "%", r.correct + " of " + r.test + " clean test digits", "measured") +
        metric("Against the baseline", fmtDelta(dlt), "points; baseline " + base.acc_pct.toFixed(1) + "%, true labels " + ref.acc_pct.toFixed(1) + "%", "measured") +
        metric("Training rows", r.train_rows, (r.ambiguous_dropped ? r.ambiguous_dropped + " ambiguous dropped, " : "") + (r.aug_rows ? r.aug_rows + " shifted copies of the digit " + r.weakest : "no rows added"), "measured") +
        metric("Wrong labels left in training", r.wrong_label_rows_left, "of " + r.planted + " planted in these rows", "planted") +
        metric("Detector precision", r.detector.precision_pct.toFixed(1) + "%", r.detector.caught + " of " + r.detector.flagged + " flags were planted errors", "planted") +
        metric("Detector recall", r.detector.recall_pct.toFixed(1) + "%", r.detector.caught + " of " + r.detector.planted + " planted errors found", "planted") +
      "</div>";
    var am = r.detector.argmax, jl = [];
    for (var gi = 0; gi < 10; gi++) for (var si = 0; si < 10; si++) {
      if (gi !== si && r._cl.joint[gi][si] > 0) jl.push([r._cl.joint[gi][si], gi, si]);
    }
    jl.sort(function (a, b) { return b[0] - a[0] || a[1] - b[1] || a[2] - b[2]; });
    readout.innerHTML += '<div class="dc-joint"><span class="dc-klabel">Where the flags go · off-diagonal of the confident joint, given label → suggested</span>' +
      jl.map(function (x) { return '<span class="dt-sp"><b>' + x[1] + " → " + x[2] + "</b> " + x[0] + "</span>"; }).join("") + "</div>" +
      '<div class="dc-joint"><span class="dc-klabel">Per-class thresholds t · the average share of its own digit\'s votes a row given that label receives</span>' +
      r._cl.S.map(function (sv, j) { return '<span class="dt-sp"><b>' + j + "</b> " + (r._cl.n[j] ? (sv / (10 * r._cl.n[j])).toFixed(2) : "-") + "</span>"; }).join("") + "</div>" +
      '<p class="mb-hint">For comparison, flagging every row whose out-of-sample vote winner disagrees with its label would flag ' +
      am.flagged + " rows: precision " + am.precision_pct.toFixed(1) + "%, recall " + am.recall_pct.toFixed(1) + "%. Per-class thresholds trade some recall for fewer false alarms.</p>";

    /* gallery: flagged rows, then the planted rows confident learning missed */
    var cl = r._cl, d = data, html = "", shown = 0, i;
    var flagged = r.flagged_rows;
    html += '<h5 class="dc-gh">Flagged by confident learning <span>' + flagged.length + " rows · given label → suggested · rust ring = a planted error, caught; grey ring = a false alarm</span></h5><div class=\"dc-grid\">";
    for (i = 0; i < flagged.length && shown < 60; i++, shown++) {
      var k = flagged[i], hit = r._planted[k];
      html += '<figure class="dc-cell ' + (hit ? "is-hit" : "is-miss") + '">' + thumb(d.X[k], "", "row " + k + " given " + d.g[k] + " suggested " + cl.sug[k]) +
        "<figcaption>" + d.g[k] + " → <b>" + cl.sug[k] + "</b></figcaption></figure>";
    }
    html += "</div>";
    if (flagged.length > 60) html += '<p class="mb-hint">' + (flagged.length - 60) + " more flagged rows not drawn.</p>";
    var missed = [];
    for (i = 0; i < r._n; i++) if (r._planted[i] && !cl.flag[i]) missed.push(i);
    html += '<h5 class="dc-gh">Planted errors it missed <span>' + missed.length + " rows · given label (true digit) · these are the ones that look most like the wrong digit</span></h5><div class=\"dc-grid\">";
    for (i = 0; i < missed.length && i < 30; i++) {
      var q = missed[i];
      html += '<figure class="dc-cell is-quiet">' + thumb(d.X[q], "", "row " + q + " given " + d.g[q] + " true " + d.y[q]) +
        "<figcaption>" + d.g[q] + " (" + d.y[q] + ")</figcaption></figure>";
    }
    html += "</div>";
    if (missed.length > 30) html += '<p class="mb-hint">' + (missed.length - 30) + " more missed rows not drawn.</p>";
    gallery.innerHTML = html;

    /* slices: per-digit test accuracy, this configuration against the baseline */
    var rows = "";
    for (i = 0; i < 10; i++) {
      var a = r.per_class_correct[i], t = r.per_class_total[i], b0 = base.per_class_correct[i];
      var dd = a - b0, cls = dd > 0 ? "dt-up" : (dd < 0 ? "dt-down" : "");
      rows += '<span class="dt-sp' + (dd > 0 ? " is-up" : (dd < 0 ? " is-down" : "")) + '"><b>' + i + "</b> " + a + "/" + t +
        (dd ? ' <em class="' + cls + '">' + (dd > 0 ? "+" : "") + dd + "</em>" : "") + "</span>";
    }
    slices.innerHTML = '<h5 class="dc-gh">Per-digit test accuracy <span>correct of each digit in the 500 test images; the change is against the baseline</span></h5><div class="dt-splits">' + rows + "</div>";

    Object.keys(presetBtns).forEach(function (k) {
      var p = PRESETS.filter(function (x) { return x.id === k; })[0];
      var on = configId(p.c) === configId(c);
      presetBtns[k].classList.toggle("is-on", on);
      presetBtns[k].querySelector("input").checked = on;
    });
  }

  function setConfig(c) {
    ctl.pool.value = c.pool; ctl.fix.value = c.fix;
    ctl.ambig.checked = c.ambig; ctl.aug.checked = c.aug; ctl.leak.checked = c.leak;
    render();
  }
  function show(id) {
    var p = PRESETS.filter(function (x) { return x.id === id; })[0];
    if (p) { currentPreset = id; setConfig(p.c); }
  }

  function buildUI() {
    var panel = document.createElement("div");
    panel.className = "mb-presets";
    PRESETS.forEach(function (p) {
      var lab = document.createElement("label");
      lab.className = "mb-preset" + (p.anti ? " is-anti" : "");
      lab.innerHTML = '<input type="radio" name="dcai-p" value="' + p.id + '"><span class="mb-pname">' + esc(p.label) +
        (p.anti ? ' <em class="mb-anti">' + esc(p.tag) + "</em>" : "") + '</span><span class="mb-pnote">' + esc(p.note) + "</span>";
      lab.querySelector("input").addEventListener("change", function () { show(p.id); });
      panel.appendChild(lab);
      presetBtns[p.id] = lab;
    });

    var knobs = document.createElement("div");
    knobs.className = "dc-knobs";
    knobs.innerHTML =
      '<span class="dc-klabel">Or combine the edits yourself</span>' +
      '<label>Rows <select data-k="pool"><option value="base">the 800</option><option value="more">the 800 + 497 more</option></select></label>' +
      '<label>Flagged rows <select data-k="fix"><option value="none">leave alone</option><option value="remove">remove</option><option value="relabel">relabel</option></select></label>' +
      '<label><input type="checkbox" data-k="ambig"> drop ambiguous</label>' +
      '<label><input type="checkbox" data-k="aug"> shift the weakest digit</label>' +
      '<label class="dc-break"><input type="checkbox" data-k="leak"> in-sample detector (the leak)</label>';
    ["pool", "fix", "ambig", "aug", "leak"].forEach(function (k) {
      ctl[k] = knobs.querySelector('[data-k="' + k + '"]');
      ctl[k].addEventListener("change", render);
    });

    var hint = document.createElement("p");
    hint.className = "mb-hint";
    hint.textContent = "Frozen model: k-nearest neighbours, k = 10, squared distance on the 64 pixels, identical in every row of the bench. " +
      "Data: all 1,797 real 8x8 images of the UCI Optical Recognition of Handwritten Digits test copy, split with seed " + data.seed +
      " into 500 clean test images, 800 training images and 497 more. The label noise is PLANTED and declared: 1s, 3s, 4s, 7s, 8s and 9s " +
      "relabelled as their look-alike, favouring the images that look most like the other digit. Rows tagged planted can only be counted " +
      "because the plant is known; on your own data you never have that column. Everything else is measured, in your browser.";

    readout = document.createElement("div"); readout.className = "mb-readout";
    slices = document.createElement("div"); slices.className = "dc-slices";
    gallery = document.createElement("div"); gallery.className = "dc-gallery";
    el.appendChild(panel); el.appendChild(knobs); el.appendChild(hint);
    el.appendChild(readout); el.appendChild(slices); el.appendChild(gallery);
    show("base");
  }

  function init() {
    el = document.getElementById("dcai-bench");
    if (!el || !root.DCAI_SAMPLE) return;
    data = prepare(root.DCAI_SAMPLE);
    base = run(PRESETS[0].c);
    ref = reference(data);
    buildUI();
    root.DCAI_LIVE = {
      presets: PRESETS.map(function (p) { return p.id; }),
      show: show,
      run: function (id) { var p = PRESETS.filter(function (x) { return x.id === id; })[0]; return run(p.c); },
      reference: ref,
      get current() { return currentPreset; }
    };
  }

  var api = { K: K, PRESETS: PRESETS, prepare: prepare, evaluate: evaluate, reference: reference, configId: configId, knn: knn };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  }
})(typeof window !== "undefined" ? window : this);
