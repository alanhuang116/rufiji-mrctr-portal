"""Link survey village names to village polygons in shapefile/shapefiles/Kibiti_Rufiji.shp.
Exact name match first; for names absent from the shapefile, use the polygon containing most endline
household GPS points. Also reports GPS-vs-name agreement. Writes village_link.json (no coordinates of households)."""
import sys,os,json; HERE=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0,HERE)
import pandas as pd, numpy as np
from shpio import read_dbf, read_shp
S=os.path.join(HERE,"..","data sharing","shapefile","shapefiles","Kibiti_Rufiji")
_,rows=read_dbf(S+".dbf"); shapes=read_shp(S+".shp")
def pip(x,y,ring):
    ins=False; j=len(ring)-1
    for i in range(len(ring)):
        xi,yi=ring[i]; xj,yj=ring[j]
        if ((yi>y)!=(yj>y)) and (x<(xj-xi)*(y-yi)/(yj-yi+1e-15)+xi): ins=not ins
        j=i
    return ins
def locate(x,y):
    hits=[]
    for i,s in enumerate(shapes):
        if not s: continue
        b=s[2]
        if b[0]<=x<=b[2] and b[1]<=y<=b[3]:
            n=sum(pip(x,y,r) for r in s[1])
            if n%2==1: hits.append(i)
    return hits[0] if hits else None
D=pd.read_pickle(os.path.expanduser("~/tmp/D.pkl"))
byname={}
for i,r in enumerate(rows): byname.setdefault(r["VILL_NAME"].lower(),i)
alias={"muhoro magharibi":"mohoro","muhoro mashariki":"mohoro","ndundu tawa":"ndundutawa","kingwila":"kingwira","zimbwini":"zimwini"}
E=D[(D.survey==1)&D.lat.notna()].drop_duplicates("hh")
E=E.assign(idx=[locate(x,y) for x,y in zip(E.lon,E.lat)])
link={}; method={}
for v in sorted(D.village.dropna().unique()):
    k=alias.get(v.lower(),v.lower())
    if k in byname: link[v]=byname[k]; method[v]="name"
    else:
        c=E[E.village==v].idx.value_counts()
        if len(c): link[v]=int(c.index[0]); method[v]=f"gps ({int(c.iloc[0])}/{int(c.sum())} households)"
E["name_idx"]=E.village.map(link)
ward=lambda i: rows[int(i)]["WARD_NAME"] if pd.notna(i) else None
agree_ward=float((E.idx.map(ward)==E.name_idx.map(ward)).mean()); inside=float(E.idx.notna().mean())
out={"link":{v:{"idx":int(i),"shape_village":rows[i]["VILL_NAME"],"shape_ward":rows[i]["WARD_NAME"],"method":method[v]} for v,i in link.items()},
     "gps":{"households":int(len(E)),"inside_pct":round(100*inside,1),"ward_agree_pct":round(100*agree_ward,1),
            "village_agree_pct":round(100*float((E.idx==E.name_idx).mean()),1)}}
json.dump(out,open(os.path.join(HERE,"results","village_link.json"),"w"),indent=1)
print(out["gps"]); [print(v,d) for v,d in out["link"].items() if d["method"]!="name"]
