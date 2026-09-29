# Step 1 · the real digits
import numpy as np
from sklearn.datasets import load_digits

d = load_digits()
X, y = d.data.astype(np.int64), d.target
print(X.shape, np.bincount(y))

# Step 2 · one split, frozen forever
rng = np.random.default_rng(20210921)
perm = rng.permutation(len(y))
test, train, pool = perm[:500], perm[500:1300], perm[1300:]
print(len(test), len(train), len(pool))

# Step 3 · the frozen model
K = 10
def knn_predict(Xtr, ytr, Xq):
    D = ((Xq[:, None, :] - Xtr[None, :, :]) ** 2).sum(-1)
    nb = np.argsort(D, axis=1, kind="stable")[:, :K]
    out = []
    for row in nb:
        votes = np.bincount(ytr[row], minlength=10)
        best = votes.max()
        out.append(next(ytr[j] for j in row if votes[ytr[j]] == best))
    return np.array(out)

def score(Xtr, ytr):
    return int((knn_predict(Xtr, ytr, X[test]) == y[test]).sum())

print("true labels:", score(X[train], y[train]), "of 500")

# Step 4 · plant the declared noise
PLANT = {(1, 7): .35, (7, 1): .25, (3, 8): .30, (8, 3): .20, (4, 9): .35, (9, 4): .25}
centre = np.array([X[y == c].mean(0) for c in range(10)])
def plant(ids):
    given = y[ids].copy()
    for (a, b), rate in PLANT.items():
        cand = np.array([i for i, t in enumerate(ids) if y[t] == a])
        m = int(round(rate * len(cand)))
        look = [((X[ids[i]] - centre[b]) ** 2).sum() - ((X[ids[i]] - centre[a]) ** 2).sum() for i in cand]
        top = cand[np.argsort(look, kind="stable")][: int(np.ceil(2 * m))]
        given[rng.choice(top, m, replace=False)] = b
    return given
g_train, g_pool = plant(train), plant(pool)
print("planted:", int((g_train != y[train]).sum()), "of 800")

# Step 5 · baseline and the tempting fix
print("baseline:", score(X[train], g_train), "of 500")
print("more rows, same noise:", score(np.vstack([X[train], X[pool]]), np.concatenate([g_train, g_pool])), "of 500")
