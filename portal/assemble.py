import json, collections, os
HERE = os.path.dirname(os.path.abspath(__file__))
U = os.path.join(HERE, "..", "analysis", "results") + os.sep
R = json.load(open(U+"survey_results.json")); H = json.load(open(U+"facility_results.json")); L = json.load(open(U+"village_link.json"))
G = json.load(open(os.path.join(HERE, "geo.json")))
# per-polygon aggregates
agg = collections.defaultdict(lambda: {"names": set()})
for v in R["villages"]:
    if v["village"] not in L["link"]: continue
    pid = "R%d" % L["link"][v["village"]]["idx"]; a = agg[pid]; s = str(v["survey"])
    a["names"].add(v["village"]); a["arm"] = v["arm"]; a["ward_s"] = v["ward"]
    b = a.setdefault(s, {"n": 0, "pos": 0, "net_n": 0, "net_k": 0, "hh": 0})
    for k in ("n", "pos", "net_n", "net_k", "hh"): b[k] += v[k]
M = {}
for pid, a in agg.items():
    o = {"names": sorted(a["names"]), "arm": a["arm"], "area": a["ward_s"]}
    for s in ("0", "1"):
        if s in a:
            b = a[s]; o[s] = {"n": b["n"], "pos": b["pos"], "hh": b["hh"], "prev": round(100*b["pos"]/b["n"], 1) if b["n"] else None, "net": round(100*b["net_k"]/b["net_n"], 1) if b["net_n"] else None}
    M[pid] = o
P1i = {"Ikwiriri", "Umwe", "Mgomba", "Chumbi"}; P1c = {"Kibiti", "Dimani", "Mtawanya", "Mjawa", "Bungu"}
P2i = P1i | P1c | {"Tingi", "Miteja", "Kinjumbi", "Chumo", "Mingumbi"}; P2c = {"Ngorongo", "Ruaruke", "Pande", "Njinjo", "Mitole", "Miguruwe", "Kandawale"}
for f in G["villages"]["features"]:
    p = f["properties"]; w = p["ward"]
    p["p1"] = 1 if w in P1i else 0 if w in P1c else None
    p["p2"] = 1 if w in P2i else 0 if w in P2c else None
    if p["vil"] == "Namayuni": p["p2"] = 1
    if p["id"] in M: p["s"] = 1
# facility completeness
for blk in ("hf_low", "hf_high"):
    rows = H[blk]; fac = list(rows[0]["fac"].keys())
    H[blk+"_complete"] = {f: round(100*sum(1 for r in rows if r["fac"][f][0] > 0)/len(rows), 0) for f in fac}
R["link_gps"] = L["gps"]; R["link_methods"] = {v: d["method"] for v, d in L["link"].items() if d["method"] != "name"}
out = {"R": R, "H": H, "M": M, "geo": G["villages"], "nat": G["nat"]}
s = json.dumps(out, separators=(",", ":"), ensure_ascii=False)
open(os.path.join(HERE, "data.json"), "w", encoding="utf-8").write(s)
print(len(s)//1024, "KB written to data.json")
