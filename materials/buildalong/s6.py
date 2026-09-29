exec(open("s3.py").read().split("# Step 6")[0].replace("print(", "(lambda *a, **k: None)("))
# ---- session 6 ----
# Step 1 · audit the detector without an answer key: review a random sample of flags
audit_rng = np.random.default_rng(6)
flagged = np.where(flag)[0]
sample = audit_rng.choice(flagged, 20, replace=False)
really_wrong = int((g_train[sample] != y[train][sample]).sum())   # stands in for a human reviewer
print("audit:", really_wrong, "of 20 sampled flags were real errors")

# Step 2 · a second pass: does running the detector again on the relabelled set still pay?
lab = sug.copy()
planted_now = lab != y[train]
V2 = np.zeros((800, 10), dtype=int)
for f in range(4):
    hold = folds == f
    V2[hold] = knn_votes(Xtr[~hold], lab[~hold], Xtr[hold])
_, sug2 = confident_joint(V2, lab)
flag2 = sug2 != lab
tp2 = int((flag2 & planted_now).sum())
print("pass 2: flagged", int(flag2.sum()), "of which still-wrong labels", tp2, "| wrong labels before pass 2:", int(planted_now.sum()))
print("pass 1:", score(Xtr, lab), "| pass 2:", score(Xtr, sug2), "of 500")
print("wrong labels after pass 2:", int((sug2 != y[train]).sum()))
