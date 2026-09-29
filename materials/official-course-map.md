# Official course map - learn-data-centric-ai-with-phoebe

Internal build document. Never linked from an audience page. Written 2026-09-29 before any page.

- Bucket `ds`, diff 3 (Advanced), audience builders (practitioners), icon 🧹, single track, 6 x 45 min.
- Every session carries a leader callout: "What to ask for" (what a lead should ask the team for).
- Spine: hold the model fixed, fix the data. Starts AFTER errors have been found.

## Evidence tiers

- **read at source (RS)**: the primary document was opened and the wording/number read in it during this build.
- **reported (RP)**: known only through a secondary page or search summary; say "reported" on the page.
- **computed (C)**: produced by the bench or the Python reference in this repo.
- **constructed (K)**: an invented teaching case, labelled "constructed" on the page.

## Primary sources, with what was read

### S1. Andrew Ng, "MLOps: From Model-centric to Data-centric AI" (DeepLearning.AI live event, March 2021) - slide deck, 29 slides, RS
Read from the slide PDF (a copy hosted on a university course site; the deck is Ng's, every slide footed "Andrew Ng").
- "AI system = Code + Data (model/algorithm)". RS
- Steel sheet inspection: baseline 76.2 percent accuracy, target 90.0 percent. RS
- Table "Improving the code vs. the data": steel defect detection baseline 76.2%, model-centric +0% (76.2%), data-centric +16.9% (93.1%); solar panel 75.68%, +0.04% (75.72%), +3.06% (78.74%); surface inspection 85.05%, +0.00% (85.05%), +0.4% (85.45%). RS. Note: the third column is honest nuance, data-centric bought only 0.4 points there. Teach all three rows, not only steel.
- Model-centric view: "Hold the data fixed and iteratively improve the code/model." Data-centric view: "Hold the code fixed and iteratively improve the data." RS
- Speech transcription consistency example: "Um, today's weather" / "Um... today's weather" / "Today's weather". RS
- Iguana detection: labelling instruction "Use bounding boxes to indicate the position of iguanas" leads to inconsistent boxes. RS
- Making data quality systematic: "Ask two independent labelers to label a sample of images. Measure consistency between labelers to discover where they disagree. For classes where the labelers disagree, revise the labeling instructions until they become consistent." RS
- Steel defect detection has 39 classes; the consistency example is "Class 23: Foreign particle defect". RS
- Small data: "You have 500 examples, and 12% of the examples are noisy (incorrectly or inconsistently labeled). The following are about equally effective: Clean up the noise; Collect another 500 new examples (double the training set)." And "significant room for improvement in problems with <10,000 examples". RS. This is stated on the slide as a theory claim, no experiment attached; the next slide is a clean-vs-noisy mAP curve (250 to 1,500 examples) with no dataset named. Teach it as Ng's claim.
- "Big data problems where there's a long tail of rare events in the input (web search, self-driving cars, recommender systems) are also small data problems." RS
- Iterative loop: train, error analysis to find the types of data the algorithm does poorly on (e.g. speech with car noise), then "get more of that data via data augmentation, data generation or data collection (change inputs x) or give more consistent definition for labels if they were found to be ambiguous (change labels y)". RS
- "Good data is: defined consistently (definition of labels y is unambiguous); cover of important cases (good coverage of inputs x); has timely feedback from production data; sized appropriately." RS
- "MLOps' most important task is to make high quality data available through all stages of the ML project lifecycle." RS
- Slide "Data is Food for AI": 80% prep / 20% action; "~1% of AI research?" vs "~99% of AI research?" - question marks on the slide; it is a rhetorical estimate, never quote it as a measured share.

### S2. Data-Centric AI Competition (DeepLearning.AI and Landing AI, 2021)
- Page: "improve a dataset given a fixed model"; "fixing incorrect labels, adding examples that represent edge cases, apply data augmentation"; submissions due "September 4, 2021. 6PM PT"; scored on accuracy; two award categories, Best Performance Overall and Most Innovative. RS (https-deeplearning-ai.github.io/data-centric-comp/)
- Task is handwritten Roman numerals: the leaderboard config's evaluation tag is "eval-mnist-roman"; The Batch issue 96 letter names "Roman MNIST", "a noisy collection of handwritten Roman numerals". RS
- Fixed model is a ResNet50 (cut off), images resized to 32x32; about 1,500 starting images; submissions capped at 10,000 images. RP (winner write-ups and search summaries; not read on an official page). Say "reported".

### S3. MIT, "Introduction to Data-Centric AI" (dcai.csail.mit.edu), IAP 2023 and 2024. Instructors Anish Athalye, Curtis Northcutt, Jonas Mueller. RS
- Definition: typical ML classes teach techniques to produce effective models "for a given dataset"; data-centric AI recognises "you can also improve the dataset itself rather than treating it as fixed", as "a systematic engineering discipline" rather than "ad hoc trial/error and intuition". RS
- 2024 lectures: Data-Centric AI vs. Model-Centric AI; Label Errors and Confident Learning; Advanced Confident Learning, LLM and GenAI applications; Class Imbalance, Outliers, and Distribution Shift; Dataset Creation and Curation; Data-centric Evaluation of ML Models; Data Curation for LLMs. Each has a lab (Jupyter). 2023 special topics include Growing or Compressing Datasets; Encoding Human Priors: Data Augmentation and Prompt Engineering. RS
- Label errors lecture: out-of-sample predicted probabilities via cross-validation; "The thresholds for each class are the average predicted probability of examples in that class"; confident counting; the lab is "your own implementation of automatic label error identification using Confident Learning". RS
- Dataset creation lecture: majority vote consensus; "Resolving ties is ambiguous in majority vote"; "A bad annotator and good annotator have equal impact"; annotator quality as agreement with consensus; Dawid-Skene per-annotator confusion matrix, cannot give reliable consensus for singly-labelled examples; CROWDLAB combines any classifier's predicted probabilities with the annotations. RS
- Data-centric evaluation lecture: "a data slice" is "a subset of the dataset that shares a common characteristic"; average per-example loss over held-out data in the slice; find hidden slices by sorting validation examples by loss and clustering the high-loss ones; four remedies: more flexible model, over-sample or up-weight the minority subgroup, "Collect additional data from the subgroup of interest", engineer features; evaluation examples "should only be used for computing evaluation scores, not for any modeling decisions". The lab: improve a given model "solely by improving its training data". RS
- Human priors lecture (2023): invariances are "a change to the input data that doesn't change its output"; augmentation helps "when collecting more data is hard or expensive or time consuming"; examples flips/rotations, Mixup (label mixed too). RS

### S4. Northcutt, Jiang, Chuang (2021), "Confident Learning: Estimating Uncertainty in Dataset Labels", Journal of Artificial Intelligence Research 70, 1373-1411. RS (arXiv 1911.00068 full text)
- Two inputs: out-of-sample predicted probabilities (n x m) and the noisy labels; computed beforehand, "e.g. cross-validation"; any model producing probabilities works; CL "decouples the model and data cleaning". RS
- Per-class threshold t_j = the average self-confidence of examples labelled j (eq. 2). RS
- Confident joint C[i][j] = count of examples labelled i whose p(j) >= t_j, and among classes over threshold j is the argmax (collision handling, eq. 1). RS
- Why thresholds: robust to "heterogeneous class probability distributions" and "class-imbalance"; an over-confident class gets a proportionally larger threshold. RS
- Near-uniform predictions are counted in no bin, "robust to pure noise or examples from an alien class". RS
- Calibrate C to Q (row sums match observed class counts, total sums to 1, eq. 3). RS
- Methods: baseline C_confusion (flag where argmax disagrees with the given label, "similar to a single iteration of INCV"); C_{y,y*} (off-diagonals of the confident joint); Prune by Class; Prune by Noise Rate (margin ranking); C+NR (intersection). RS
- "k = 4 is fixed in the experiments using cross-validation". RS
- Assumes class-conditional noise; abstract: CL on ImageNet estimates "645 missile images are mislabeled as their parent class projectile"; finds label errors in "the presumed error-free MNIST". RS

### S5. Northcutt, Athalye, Mueller (2021), "Pervasive Label Errors in Test Sets Destabilize Machine Learning Benchmarks", NeurIPS 2021 Datasets and Benchmarks Track (arXiv 2103.14749); labelerrors.com. RS (full text)
- 10 datasets; "an average of at least 3.3% errors across the 10 datasets"; at least 6% of the ImageNet validation set. RS
- 51% of algorithmically flagged candidates were real errors, on average across datasets. RS
- Human validation: each flagged item shown to five MTurk workers; an error if fewer than 3 of 5 agree with the given label. RS
- Table 1 (test set, CL guessed, validated, % error): MNIST 10,000 / 100 / 15 / 0.15%; CIFAR-10 10,000 / 275 / 54 / 0.54%; CIFAR-100 10,000 / 2,235 / 585 / 5.85%; Caltech-256 29,780 / 2,360 / 458 / 1.54%; ImageNet val 50,000 / 5,440 / 2,916 / 5.83%; QuickDraw 50,426,266 / 6,825,383 guessed, 2,500 checked, 1,870 validated, estimated 5,105,386 / 10.12%; 20news 7,532 / 93 / 82 / 1.09%; IMDB 25,000 / 1,310 / 725 / 2.90%; Amazon Reviews 9,996,437 / 533,249 guessed, 1,000 checked, 732 validated / 3.90%; AudioSet 20,371 / 307 / 275 / 1.35%. RS
- Table 2 MNIST: 85 non-errors, 15 errors of the 100 flagged. So on MNIST the flag precision was 15 percent. RS. Use it: precision varies wildly by dataset.
- ImageNet: ResNet-18 outperforms ResNet-50 if the prevalence of originally mislabelled test examples increases by just 6%; CIFAR-10: VGG-11 outperforms VGG-19 at +5%. RS
- Test labels found by rank on normalized margin, top rho x n. Corrected labels "are not 100% perfect". RS
- Errors "primarily systematic mislabeling, not just random noise". RS

### S6. Supporting, used lightly
- Buolamwini and Gebru (2018), "Gender Shades", PMLR 81: darker-skinned females misclassified with error rates "up to 34.7%"; lighter-skinned males maximum "0.8%". RS (abstract). Also quoted in the MIT evaluation notes.
- Sheng, Provost, Ipeirotis (2008), "Get Another Label? Improving Data Quality and Data Mining Using Multiple, Noisy Labelers", KDD 2008, 614-622: studies when repeated labelling improves label and model quality. RP (abstract via index pages). Cite only for "repeated labelling has conditions under which it pays".
- Cohen (1960) kappa: agreement corrected for chance, kappa = (p_o - p_e) / (1 - p_e). Standard statistics, cite as the formula.
- UCI Optical Recognition of Handwritten Digits: E. Alpaydin and C. Kaynak (1998), UCI Machine Learning Repository; 43 writers, 30 in training and 13 in test; 32x32 bitmaps counted in 4x4 blocks to 8x8, pixels 0-16. sklearn's load_digits is "a copy of the test set", 1,797 images. RS (sklearn DESCR). License on UCI: CC BY 4.0. RP

## The bench: canon numbers (C)

Everything below is printed by the widget and reproduced by `materials/build_dcai_bench.py`.
`node materials/check_node_vs_python.js` = AGREE on all 48 configurations, every flagged row index and
every test-prediction count identical (integer arithmetic; mutation test confirmed it can fail).

Setup: 1,797 UCI digits, seed 20210921. 500 clean test, 800 training, 497 pool. Frozen model kNN, k = 10,
squared Euclidean on 64 integer pixels. Confident learning: 4-fold out-of-sample votes, per-class thresholds.
Plant (declared, constructed): true 1 -> given 7 at 35%, 7 -> 1 at 25%, 3 -> 8 at 30%, 8 -> 3 at 20%,
4 -> 9 at 35%, 9 -> 4 at 25%; items drawn at random from the 2m that look most like the target digit.
Planted in the 800: 133 (16.6%) = 1->7: 27, 7->1: 21, 3->8: 23, 8->3: 17, 4->9: 27, 9->4: 18.
Planted in the 1,297: 219.

| Rung (preset) | Test acc | Correct of 500 | Train rows | Wrong labels left |
|---|---|---|---|---|
| Reference: the true labels (only knowable because the plant is declared) | 97.8% | 489 | 800 | 0 |
| Baseline: noisy labels | 91.4% | 457 | 800 | 133 |
| ANTI: add 497 rows with the same noise | 90.8% | 454 | 1,297 | 219 |
| Remove what CL flags | 95.8% | 479 | 702 | 48 |
| Relabel what CL flags | 95.6% | 478 | 800 | 61 |
| Relabel, then drop ambiguous (110 dropped) | 95.0% | 475 | 690 | 23 |
| Relabel, then shift the weakest digit (9; 284 copies) | 96.0% | 480 | 1,084 | 61 |
| BREAK: relabel with in-sample detector (the leak) | 94.8% | 474 | 800 | 95 |
| Collect the 497 more AND clean all of it | 95.6% | 478 | 1,297 | 118 |

Detector (second counter), on the 800:
- Confident learning, out of sample: 98 flagged, 85 were planted errors -> precision 86.7%, recall 63.9% (85 of 133). Every one of the 85 caught was relabelled to its true digit; the 13 false alarms were relabelled wrongly.
- Argmax baseline (C_confusion), same votes: 141 flagged, precision 77.3%, recall 82.0%.
- In-sample (leak): 42 flagged, precision 95.2%, recall 30.1% (40 of 133).
- On the 1,297 (collect): 133 flagged, 117 caught, precision 88.0%, recall 53.4%.
- Per-class thresholds on the 800 (as printed): 0: 1.00, 1: 0.49, 2: 0.94, 3: 0.54, 4: 0.59, 5: 0.95, 6: 0.98, 7: 0.66, 8: 0.58, 9: 0.60.
- Confident joint off-diagonals, 800; row = GIVEN label, column = suggested. 1 -> 7: 14; 2 -> 8: 1; 3 -> 7: 1; 3 -> 8: 14; 4 -> 9: 7; 5 -> 9: 1; 7 -> 1: 20; 8 -> 1: 3; 8 -> 3: 17; 9 -> 4: 19; 9 -> 8: 1. Diagonal: 80, 46, 65, 43, 44, 59, 83, 49, 48, 42.
  (Given 1 suggested 7 = mostly true 7s the plant labelled 1.)
- Weakest digit by cross-validated agreement on the relabelled 800: 9.

Other printed combinations worth quoting (custom knobs):
- 800, remove, drop ambiguous: 94.0% (470), 601 rows, 13 wrong labels left. Cleaner set, lower accuracy.
- 800, leave flags alone, drop ambiguous: 91.2% (456).
- 1,297, relabel, drop ambiguous: 96.6% (483), 1,154 rows. Best on the bench, tied with 1,297 remove + ambiguous + shift: 96.6% (483).
- 1,297, remove, drop ambiguous: 96.4% (482).
- 800, relabel + ambiguous + shift: 94.4% (472).

20-seed sweep (seeds 20210904..20210923, same plant rule, `materials/bench-sweep-python.json`), means:
reference 97.26, baseline 89.97, more-with-noise 90.22 (+0.25; worse than baseline in 8 of 20 seeds;
range -1.0 to +2.8), remove 94.17 (+4.20, never worse), relabel 94.45 (+4.48), relabel+ambiguous 93.61,
relabel+shift 94.52 (+0.07 over relabel), leak 92.70, collect+clean 94.60. CL precision 88.76, recall 59.57;
in-sample recall 32.45. The shipped seed is the one closest to these means; on it remove beats relabel
by one test item, while on the 20-seed mean relabel is ahead by 0.28 points: teach it as "about equal".

Honest limits to print:
- The plant is constructed; real noise has unknown shape. Precision and recall exist only because it is declared.
- 500 test items: one item = 0.2 points. Differences under ~1 point on one seed are noise; quote the sweep.
- kNN is a stand-in frozen model; CL works with any probabilistic model (S4).
- 8x8 digits are easy; a 1-pixel shift at 8x8 is a 4-pixel shift of the 32x32 original. Coarse transform.

## Build-along canon (C, from materials/buildalong/*.out, run from a scratch directory)

Session 1 (s1.out): digits (1797, 64), class counts 178 182 177 183 181 182 181 179 174 180; split 500/800/497;
true labels 489 of 500; planted 133 of 800; baseline 457; more rows same noise 454.

Session 2 (s2.out), CONSTRUCTED labellers on the real 800 images: A = the declared plant; B = same guideline
and look-alike confusions drawn independently (seed 2); C = careless, 20% of labels replaced by a random digit (seed 3).
- Accuracy against the true digit: A 83.4%, B 83.4%, C 80.5%.
- A-B raw agreement 83.8%, chance 10.1%, Cohen's kappa 0.819. A-C agreement 67.6%, chance 10.0%, kappa 0.640.
- B agrees with A, by A's label: 0 100%, 1 71%, 2 100%, 3 71%, 4 67%, 5 100%, 6 100%, 7 76%, 8 77%, 9 72%.
- A and B agree on 670 rows; 68 of those are wrong together (agreement is not correctness).
- Majority vote of A, B, C: 89.8% correct, 25 three-way splits (fall back to A), 82 wrong labels vs 133 for A alone.
- Guideline rewrite for the 1/7 pair (constructed effect: ends that confusion only): 48 rows fixed.
- Frozen model trained on A: 457 of 500; on A with the 1/7 rule: 472; on the majority vote: 483 (costs three labels per row).

Session 3 (s3.out): row 5 out-of-sample votes [0 2 0 0 0 0 0 8 0 0], given 1 (8 of 10 neighbours say 7);
thresholds 1.00 0.49 0.94 0.54 0.59 0.95 0.98 0.66 0.58 0.60; joint diagonal 80 46 65 43 44 59 83 49 48 42;
flagged 98; CL 98 / 85 / 86.7% / 63.9%; argmax-disagrees (given label not among the top-voted) 141 / 109 / 77.3% / 82.0%;
in-sample 42 / 40 / 95.2% / 30.1%; remove 479; relabel 478; relabelled right 85 of 98.

Session 5 (s5.out): cross-validated agreement on the relabelled 800 per digit (agree/total): 0 80/80, 1 71/81 (87.7%),
2 77/79, 3 67/74 (90.5%), 4 69/81 (85.2%), 5 76/76, 6 87/88, 7 76/84 (90.5%), 8 74/86 (86.0%), 9 57/71 (80.3%);
weakest 9; 284 shifted rows; relabel 478 -> relabel + shifts 480; test 9s 56 -> 59 of 65 (read after the choice);
collect raw 454, collect and clean 478, clean the 800 only 478; 800 relabel drop 110 ambiguous 475;
1,297 relabel drop 143 ambiguous 483.

Session 6 (s6.out): audit of 20 random flags (seed 6): 17 of 20 real errors (true precision 86.7%);
second detector pass on the relabelled 800 flags 6 rows, 5 of them still-wrong labels, of 61 wrong labels
left after pass 1; pass 1 478, pass 2 479; wrong labels after pass 2: 57.
Best on the bench with data edits only: 96.6% (483) on the 1,297 with relabel + drop ambiguous (also
remove + ambiguous + shift); best on the 800 alone: 96.0% (480), relabel + shift.

## Per-session coverage

### 1 Hold the model, fix the data (diff 3)
Parts: (1) AI system = code + data, model-centric vs data-centric loops (S1, S3 def); (2) the evidence and its limits: the three-project table from S1 (all three rows incl. +0.4), the competition inverting the format (S2), the test-set label errors (S5 3.3% average, 6% ImageNet, MNIST 0.15%) ; (3) where this starts: after error analysis (seam to ml-strategy p3/p4/p5), the four data edits (relabel, remove, add targeted, re-specify labels) and the "good data" checklist (S1). Build-along: load digits, freeze kNN, plant declared noise, measure baseline 91.4 vs reference 97.8 and the anti-lever 90.8, with Python (numbers from the reference).
Leader callout: ask for the frozen-model baseline and the list of data edits, not a new architecture.

### 2 When labellers disagree (diff 3)
Label consistency (S1 speech + iguana + two-labeller protocol + class 23), agreement measurement (raw percent agreement, Cohen's kappa formula; constructed worked example), consensus labelling (majority vote, its tie and equal-weight problems, Dawid-Skene, CROWDLAB: S3), label guidelines as a spec that gets revised, adjudication; 5-worker 3-of-5 rule of S5 as a real consensus design; Sheng et al RP for repeated labelling conditions. Build-along: compute agreement and kappa on a constructed two-labeller table (constructed; say so), majority vote with three labellers, find the class with lowest agreement, rewrite the guideline.

### 3 Finding the wrong labels (diff 3)
Confident learning mechanism (S4): out-of-sample probabilities by k-fold CV (why in-sample fails: the leak rung, recall 30.1 vs 63.9), per-class thresholds (bench values 1.00 for 0s vs 0.49 for 1s), the confident joint and its off-diagonals, collision rule, argmax baseline comparison (141 flags 77.3/82.0 vs 98 flags 86.7/63.9), ranking by margin, CL's class-conditional assumption and failure modes (S5 Figure 2: part vs whole, unusual viewpoints; MNIST flag precision 15%). Build-along: implement CL in numpy on the digits, reproduce 98 flags.

### 4 The data-edit bench (BENCH, diff 4 red)
The widget. Ladder above; two counters; anti-lever; leak break; thumbnails.

### 5 Slice, augment or collect (diff 3)
Slicing (S3 evaluation: slice def, loss sort + cluster, Gender Shades 34.7 vs 0.8), per-digit test accuracy on the bench, targeted augmentation as encoding an invariance (S3 human priors), the weakest-slice shift (+0.4 on the seed, +0.07 on 20-seed mean: augmentation fixes coverage, not labels), collect vs clean (S1 500/12% claim; bench: more-with-noise 90.8 vs clean 95.6-95.8; collect-and-clean 95.6; with ambiguous-drop the 1,297 reach 96.6 while the 800 drop to 95.0 - small-data strategy: pruning costs more when data is scarce), small-data long tail (S1). Build-along: slice table, shifted copies, compare.

### 6 The data-edit spec (capstone, diff 3)
Beat the benchmark by data edits only (bench best 96.6 on the 1,297 with relabel + ambiguous; on the 800 alone best 96.0), and write the spec: frozen model and seed, test set rule (never edited, never used for decisions), edit log per row (who, why, detector score), guideline version, precision audit on a sample (S5's 5-worker check), the stopping rule, what not to claim. Competition S2 as the model of the format.

## Seams (link, never re-teach)

- Error-analysis spreadsheet, Eyeball/Blackbox dev sets, bias-variance: learn-ml-strategy-with-phoebe
  p3 https://phoebefu6.github.io/learn-ml-strategy-with-phoebe/courses/p3-error-analysis-spreadsheet.html
  p4 https://phoebefu6.github.io/learn-ml-strategy-with-phoebe/courses/p4-eyeball-and-blackbox.html
  p5 https://phoebefu6.github.io/learn-ml-strategy-with-phoebe/courses/p5-bias-and-variance.html
  This course starts AFTER errors are found.
- Feature construction and leakage: learn-feature-engineering-with-phoebe (b5 leakage https://phoebefu6.github.io/learn-feature-engineering-with-phoebe/courses/b5-leakage.html). Note the "leak" rung here is detector leakage (in-sample probabilities), not feature leakage; say so.
- Data-quality monitoring in pipelines: learn-data-observability-with-phoebe https://phoebefu6.github.io/learn-data-observability-with-phoebe/
- Entity dedupe at scale: learn-entity-resolution-with-phoebe https://phoebefu6.github.io/learn-entity-resolution-with-phoebe/ (one line).

## Not covered (honest list)

- Training-time noise-robust losses (co-teaching, loss correction): model-centric, out of scope.
- Outlier and out-of-distribution detection, class imbalance and distribution shift lectures of S3: named, not taught.
- LLM data curation and prompt data (S3 2024 lecture 7): not covered.
- Active learning, weak supervision (Snorkel), synthetic data generation: named only.
- Multi-label, bounding-box and segmentation label errors: only classification is computed.
- Cleanlab library API: not taught; the algorithm is implemented by hand so it can be checked.
- The competition winners' methods: not read at source, not taught.
- Certificates and videos stay with MIT and DeepLearning.AI.

## Citation appendix (exact form for pages)

- Ng, A. (2021). MLOps: From Model-centric to Data-centric AI. DeepLearning.AI live event, slide deck.
- DeepLearning.AI and Landing AI (2021). Data-Centric AI Competition. https-deeplearning-ai.github.io/data-centric-comp
- Athalye, A., Northcutt, C., Mueller, J. Introduction to Data-Centric AI, MIT IAP 2023 and 2024. dcai.csail.mit.edu
- Northcutt, C. G., Jiang, L., Chuang, I. L. (2021). Confident Learning: Estimating Uncertainty in Dataset Labels. JAIR 70, 1373-1411.
- Northcutt, C. G., Athalye, A., Mueller, J. (2021). Pervasive Label Errors in Test Sets Destabilize Machine Learning Benchmarks. NeurIPS Datasets and Benchmarks. labelerrors.com
- Buolamwini, J., Gebru, T. (2018). Gender Shades. PMLR 81.
- Sheng, V. S., Provost, F., Ipeirotis, P. G. (2008). Get Another Label? KDD 2008. (reported)
- Cohen, J. (1960). A coefficient of agreement for nominal scales. Educational and Psychological Measurement 20(1).
- Alpaydin, E., Kaynak, C. (1998). Optical Recognition of Handwritten Digits. UCI Machine Learning Repository.
