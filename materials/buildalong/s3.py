exec(open("common.py").read())
# ---- session 3 ----
# Step 1 · out-of-sample votes, four folds
folds = np.arange(800) % 4
rng.shuffle(folds)
Xtr = X[train]

def knn_votes(Xa, ya, Xq):
    D = ((Xq[:, None, :] - Xa[None, :, :]) ** 2).sum(-1)
    nb = np.argsort(D, axis=1, kind="stable")[:, :K]
    return np.array([np.bincount(ya[row], minlength=10) for row in nb])

V = np.zeros((800, 10), dtype=int)
for f in range(4):
    hold = folds == f
    V[hold] = knn_votes(Xtr[~hold], g_train[~hold], Xtr[hold])
print(V[5], "given", g_train[5])

# Step 2 · per-class thresholds
n = np.bincount(g_train, minlength=10)
S = np.array([V[g_train == j, j].sum() for j in range(10)])
t = S / (10 * n)
print(np.round(t, 2))

# Step 3 · the confident joint
def confident_joint(V, g):
    n = np.bincount(g, minlength=10)
    S = np.array([V[g == j, j].sum() for j in range(10)])
    C = np.zeros((10, 10), dtype=int)
    sug = g.copy()
    for r in range(len(g)):
        over = [l for l in range(10) if V[r, l] * n[l] >= S[l]]
        if not over:
            continue
        top = max(V[r, l] for l in over)
        best = [l for l in over if V[r, l] == top]
        j = g[r] if g[r] in best else best[0]
        C[g[r], j] += 1
        sug[r] = j
    return C, sug

C, sug = confident_joint(V, g_train)
flag = sug != g_train
print(C.diagonal(), "flagged:", flag.sum())
print([(i, j, C[i, j]) for i in range(10) for j in range(10) if i != j and C[i, j]])

# Step 4 · score the detector against the declared plant
planted = g_train != y[train]
def report(name, fl):
    tp = (fl & planted).sum()
    print(f"{name}: flagged {fl.sum()}, caught {tp}, precision {100*tp/fl.sum():.1f}%, recall {100*tp/planted.sum():.1f}%")
report("confident learning", flag)
# the baseline: flag when the given label is not among the top-voted digits
report("argmax disagrees", V[np.arange(800), g_train] != V.max(1))

# Step 5 · the leak: in-sample votes
Vin = knn_votes(Xtr, g_train, Xtr)
_, sug_in = confident_joint(Vin, g_train)
report("in-sample", sug_in != g_train)

# Step 6 · the two edits, scored on the untouched test set
print("remove:", score(Xtr[~flag], g_train[~flag]), "of 500")
print("relabel:", score(Xtr, sug), "of 500")
print("relabelled right:", int((sug[flag] == y[train][flag]).sum()), "of", int(flag.sum()))
