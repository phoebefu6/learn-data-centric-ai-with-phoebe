exec(open("s3.py").read().split("# Step 6")[0].replace("print(", "(lambda *a, **k: None)("))
# ---- session 5 ----
# Step 1 · per-digit agreement on the relabelled training set, never the test set
lab = sug.copy()
Vk = np.zeros((800, 10), dtype=int)
for f in range(4):
    hold = folds == f
    Vk[hold] = knn_votes(Xtr[~hold], lab[~hold], Xtr[hold])
agree = [(int((Vk[lab == d].argmax(1) == d).sum()), int((lab == d).sum())) for d in range(10)]
for d, (a, t) in enumerate(agree):
    print(d, f"{a}/{t}", f"{100*a/t:.1f}%")
weakest = min(range(10), key=lambda d: (agree[d][0] / agree[d][1], d))
print("weakest:", weakest)

# Step 2 · four one-pixel shifts of every row of the weakest digit
def shift(img, dx, dy):
    a = img.reshape(8, 8)
    out = np.zeros_like(a)
    for r in range(8):
        for c in range(8):
            if 0 <= r - dy < 8 and 0 <= c - dx < 8:
                out[r, c] = a[r - dy, c - dx]
    return out.reshape(64)

src = np.where(lab == weakest)[0]
extra = np.array([shift(Xtr[i], dx, dy) for i in src for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))])
X_aug = np.vstack([Xtr, extra])
g_aug = np.concatenate([lab, np.full(len(extra), weakest)])
print("added:", len(extra), "rows")
print("relabel:", score(Xtr, lab), "| relabel + shifts:", score(X_aug, g_aug), "of 500")

# Step 3 · read the slice on the test set, after the choice is made
def per_digit(Xa, ga):
    p = knn_predict(Xa, ga, X[test])
    return [int(((p == d) & (y[test] == d)).sum()) for d in range(10)]
print("test 9s:", per_digit(Xtr, lab)[9], "->", per_digit(X_aug, g_aug)[9], "of", int((y[test] == 9).sum()))

# Step 4 · collect or clean: the pool, raw and cleaned
folds_pool = np.arange(len(pool)) % 4
rng.shuffle(folds_pool)
X_all = np.vstack([Xtr, X[pool]])
g_all = np.concatenate([g_train, g_pool])
f_all = np.concatenate([folds, folds_pool])
V_all = np.zeros((len(g_all), 10), dtype=int)
for f in range(4):
    hold = f_all == f
    V_all[hold] = knn_votes(X_all[~hold], g_all[~hold], X_all[hold])
_, sug_all = confident_joint(V_all, g_all)
print("collect, raw:", score(X_all, g_all), "| collect and clean:", score(X_all, sug_all), "| clean the 800 only:", score(Xtr, lab))

# Step 5 · drop ambiguous rows (no neighbour majority), at two sizes
amb800 = V.max(1) <= 5
amb_all = V_all.max(1) <= 5
print("800 relabel, drop", int(amb800.sum()), "ambiguous:", score(Xtr[~amb800], lab[~amb800]))
print("1297 relabel, drop", int(amb_all.sum()), "ambiguous:", score(X_all[~amb_all], sug_all[~amb_all]))
