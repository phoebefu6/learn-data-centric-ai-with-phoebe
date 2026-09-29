exec(open("common.py").read())
# ---- session 2 (CONSTRUCTED labellers on the real images) ----
# Step 1 · three labellers on the same 800 images
# A is the declared plant from session 1. B shares A's guideline and its look-alike confusions,
# drawn independently. C is careless: 20 percent of labels replaced by a random digit.
lab_A = g_train
rng_B = np.random.default_rng(2)
def plant_with(r, ids):
    given = y[ids].copy()
    for (a, b), rate in PLANT.items():
        cand = np.array([i for i, t in enumerate(ids) if y[t] == a])
        m = int(round(rate * len(cand)))
        look = [((X[ids[i]] - centre[b]) ** 2).sum() - ((X[ids[i]] - centre[a]) ** 2).sum() for i in cand]
        top = cand[np.argsort(look, kind="stable")][: int(np.ceil(2 * m))]
        given[r.choice(top, m, replace=False)] = b
    return given
lab_B = plant_with(rng_B, train)
rng_C = np.random.default_rng(3)
lab_C = y[train].copy()
careless = rng_C.random(800) < 0.20
lab_C[careless] = rng_C.integers(0, 10, careless.sum())
truth = y[train]
for name, L in (("A", lab_A), ("B", lab_B), ("C", lab_C)):
    print(name, "accuracy against the true digit:", f"{100*(L == truth).mean():.1f}%")

# Step 2 · raw agreement and Cohen's kappa between A and B
def kappa(p, q):
    po = (p == q).mean()
    pe = sum((p == k).mean() * (q == k).mean() for k in range(10))
    return po, pe, (po - pe) / (1 - pe)
po, pe, k = kappa(lab_A, lab_B)
print(f"A-B agreement {100*po:.1f}%, chance {100*pe:.1f}%, kappa {k:.3f}")
po, pe, k = kappa(lab_A, lab_C)
print(f"A-C agreement {100*po:.1f}%, chance {100*pe:.1f}%, kappa {k:.3f}")

# Step 3 · where do A and B disagree? per digit, by A's label
for d in range(10):
    m = lab_A == d
    print(d, f"{100*(lab_B[m] == d).mean():.0f}%", end="  ")
print()

# Step 4 · the trap: agreement is not correctness
both = lab_A == lab_B
print("A and B agree on", int(both.sum()), "rows; of those,", int((both & (lab_A != truth)).sum()), "are wrong together")

# Step 5 · majority vote of A, B, C
votes = np.stack([lab_A, lab_B, lab_C], axis=1)
maj, ties = [], 0
for row in votes:
    c = np.bincount(row, minlength=10)
    if c.max() == 1:
        ties += 1
        maj.append(row[0])          # no majority: fall back to A, and say so
    else:
        maj.append(int(c.argmax()))
maj = np.array(maj)
print("majority vote accuracy:", f"{100*(maj == truth).mean():.1f}%", "| three-way splits:", ties)
print("majority vote wrong labels:", int((maj != truth).sum()), "| A alone:", int((lab_A != truth).sum()))

# Step 6 · rewrite the guideline for the worst pair (constructed effect)
# Suppose the revised rule "a 7 has a top bar, a 1 is a single stroke" ends the 1/7 confusion only.
fixed = lab_A.copy()
pair = ((truth == 1) & (lab_A == 7)) | ((truth == 7) & (lab_A == 1))
fixed[pair] = truth[pair]
print("1/7 rows fixed by the new rule:", int(pair.sum()))
print("model on A:", score(X[train], lab_A), "| on A with the 1/7 rule:", score(X[train], fixed), "| on majority vote:", score(X[train], maj), "of 500")
