"""Topology-aware simplification of village polygons + national district outline -> geo.json"""
import json, sys, math, collections, os
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from shpio import read_dbf, read_shp
# usage: python build_geo.py "<path>/data sharing/shapefile"
SRC = (sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "data sharing", "shapefile")).rstrip("/\\") + "/"
Q = 1e5
def q(p): return (round(p[0]*Q), round(p[1]*Q))
def dp(pts, tol):
    if len(pts) < 3: return pts
    keep = [False]*len(pts); keep[0] = keep[-1] = True; st = [(0, len(pts)-1)]
    while st:
        i, j = st.pop()
        if j <= i+1: continue
        (x1,y1),(x2,y2) = pts[i], pts[j]; dx, dy = x2-x1, y2-y1; L = math.hypot(dx, dy)
        best, bk = -1, None
        for k in range(i+1, j):
            x, y = pts[k]
            d = abs(dx*(y-y1)-dy*(x-x1))/L if L > 0 else math.hypot(x-x1, y-y1)
            if d > best: best, bk = d, k
        if best > tol: keep[bk] = True; st += [(i, bk), (bk, j)]
    return [p for p, k in zip(pts, keep) if k]
def ring_area(r):
    a = 0
    for i in range(len(r)-1): a += r[i][0]*r[i+1][1]-r[i+1][0]*r[i][1]
    return a/2
def centroid(rings):
    A = cx = cy = 0
    for r in rings:
        for i in range(len(r)-1):
            c = r[i][0]*r[i+1][1]-r[i+1][0]*r[i][1]; A += c; cx += (r[i][0]+r[i+1][0])*c; cy += (r[i][1]+r[i+1][1])*c
    A /= 2
    return [round(cx/(6*A), 4), round(cy/(6*A), 4)] if A else None
def simplify_set(polys, tol):
    """polys: list of rings-lists (quantized int coords). Shared borders simplified identically."""
    member = collections.defaultdict(set)
    for pi, rings in enumerate(polys):
        for ri, r in enumerate(rings):
            for v in r: member[v].add((pi, ri))
    out = []
    for pi, rings in enumerate(polys):
        nr = []
        for ri, r in enumerate(rings):
            if r[0] == r[-1]: r = r[:-1]
            n = len(r)
            if n < 3: continue
            fixed = [i for i in range(n) if member[r[i]] != member[r[i-1]] or member[r[i]] != member[r[(i+1) % n]]]
            if len(fixed) < 3:
                # isolated ring: anchor at 0 and farthest points
                fixed = sorted(set(fixed + [0, n//3, 2*n//3]))
            res = []
            for a, b in zip(fixed, fixed[1:] + [fixed[0] + n]):
                seg = [r[k % n] for k in range(a, b+1)]
                # canonical direction so neighbours simplify the same way
                rev = seg[0] > seg[-1]
                s = dp(seg[::-1] if rev else seg, tol*Q)
                s = s[::-1] if rev else s
                res += s[:-1]
            if len(res) >= 3:
                res.append(res[0]); nr.append(res)
        out.append(nr)
    return out
# ---- villages: Rufiji/Kibiti + Kilwa
feats = []; polys = []; meta = []
for fname, dist, vk in [("shapefiles/Kibiti_Rufiji", "Rufiji/Kibiti", "VILL_NAME"), ("shapefiles/Kilwa_district", "Kilwa", "VILLAGE_N")]:
    _, rows = read_dbf(SRC+fname+".dbf"); shapes = read_shp(SRC+fname+".shp")
    for i, (row, s) in enumerate(zip(rows, shapes)):
        if not s: continue
        polys.append([[q(p) for p in r] for r in s[1]])
        meta.append({"id": ("R" if dist != "Kilwa" else "K")+str(i), "dist": dist, "ward": row["WARD_NAME"], "vil": row[vk], "council": row.get("DISTRICT_N")})
before = sum(len(r) for p in polys for r in p)
S = simplify_set(polys, 0.0012)
after = sum(len(r) for p in S for r in p)
for m, rings, orig in zip(meta, S, polys):
    rr = [[[x/Q, y/Q] for x, y in r] for r in rings]
    if not rr: continue
    ofl = [[[x/Q, y/Q] for x, y in r] for r in orig]
    m["c"] = centroid(ofl); m["area"] = round(abs(sum(ring_area(r) for r in ofl))*12321, 1)  # ~km2 at this latitude
    feats.append({"type": "Feature", "properties": m, "geometry": {"type": "Polygon", "coordinates": [[[round(x, 4), round(y, 4)] for x, y in r] for r in rr]}})
# ---- national districts (inset)
_, rows = read_dbf(SRC+"newshape/Districts_Shapefiles_2019/Districts and TC as 2020.dbf"); shapes = read_shp(SRC+"newshape/Districts_Shapefiles_2019/Districts and TC as 2020.shp")
npolys = []; nmeta = []
for row, s in zip(rows, shapes):
    if not s: continue
    npolys.append([[q(p) for p in r] for r in s[1]]); nmeta.append({"n": row["NewDist20"], "r": row["Region_Nam"]})
NS = simplify_set(npolys, 0.03)
nat = []
for m, rings in zip(nmeta, NS):
    rings = [r for r in rings if abs(ring_area(r)) > (0.02*Q)**2]
    if not rings: continue
    nat.append({"type": "Feature", "properties": m, "geometry": {"type": "Polygon", "coordinates": [[[round(x/Q, 3), round(y/Q, 3)] for x, y in r] for r in rings]}})
geo = {"villages": {"type": "FeatureCollection", "features": feats}, "nat": {"type": "FeatureCollection", "features": nat}}
json.dump(geo, open(os.path.join(HERE, "geo.json"), "w"), separators=(",", ":"))
print("village vertices", before, "->", after, "features", len(feats), "nat", len(nat))
print("sizes KB", len(json.dumps(geo["villages"], separators=(",", ":")))//1024, len(json.dumps(geo["nat"], separators=(",", ":")))//1024)
print(sorted({m["ward"] for m in meta if m["dist"] == "Kilwa"}))
print([m["vil"] for m in meta if m["dist"] == "Kilwa" and m["vil"].lower() in ("somanga", "namayuni", "mikoma")])
