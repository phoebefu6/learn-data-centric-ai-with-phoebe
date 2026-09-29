<!-- learn-with-phoebe hub banner -->
> ### 📚 Part of [**Learn with Phoebe**](https://phoebefu6.github.io/learn-with-phoebe/)
> The shelf of 130 free, hands-on courses on AI, data, and the craft around them. **[Browse every course ↗](https://phoebefu6.github.io/learn-with-phoebe/)**
<!-- /learn-with-phoebe hub banner -->

# Learn Data-Centric AI with Phoebe

Six 45-minute sessions for practitioners on data-centric AI: hold the model fixed and fix the data.
Label consistency and consensus labelling, finding wrong labels with confident learning, a data-edit
bench computed in the browser, slicing, targeted augmentation against collecting more, and the
data-edit spec that makes edits survive the next model.

**Live site:** https://phoebefu6.github.io/learn-data-centric-ai-with-phoebe/

| # | Session | Signature thing |
|---|---|---|
| 1 | Hold the model, fix the data | Freeze a model, plant declared noise on real digits, measure the three bounding numbers |
| 2 | When labellers disagree | Agreement, Cohen's kappa, consensus labelling, and why agreement is not correctness |
| 3 | Finding the wrong labels | Confident learning by hand: out-of-sample votes, per-class thresholds, the confident joint |
| 4 | The data-edit bench | Eight data edits on one frozen model, with test accuracy and detector recall side by side |
| 5 | Slice, augment or collect | Weak slices without peeking at the test set, augmentation for coverage, collect against clean |
| 6 | The data-edit spec | Beat the bench by data edits only, then write the spec |

The bench in session 4 (`assets/dcai-live.js`, data in `assets/dcai-sample.js`) holds all 1,797 real
images of the UCI Optical Recognition of Handwritten Digits test copy (Alpaydin and Kaynak, 1998), a
frozen k-nearest-neighbour model (k = 10), a clean 500-image test set, and a declared label-noise plant
of six look-alike confusions on the 800 training rows. Cleaning the 133 planted errors with confident
learning takes the model from 91.4 to 95.8 percent; 497 more rows from the same labellers take it to
90.8. Every number is computed in the browser, and `materials/build_dcai_bench.py` reproduces every
flag to the row (`node materials/check_node_vs_python.js`).

The noise is constructed and declared, which is the only reason the detector's precision and recall
can be counted. The images and every accuracy are real computations.

by Phoebe Fu
