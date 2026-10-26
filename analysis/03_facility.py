"""Health-facility weekly malaria reports (Nov 2015-Oct 2016) and community focal screening (FSAT) rounds
in the intervention wards. Writes facility_results.json (aggregates only)."""
import pandas as pd, numpy as np, re, json, os, datetime as dt, warnings
warnings.filterwarnings("ignore")
HERE=os.path.dirname(os.path.abspath(__file__)); P=os.path.join(HERE,"..","data sharing","HF Data")
x=pd.ExcelFile(os.path.join(P,"HEALTH FACILITY INFO-WEEKLY REPORT-2016-V_21.xlsx"))
d=x.parse(0,header=None)
def span(lbl, prev_end):
    s=str(lbl).strip(); s=s.replace("20166","2016")
    t=[int(v) for v in re.findall(r"\d+",s)]
    ed,em,ey=t[-3],t[-2],t[-1]; ey=ey+2000 if ey<100 else ey
    end=dt.date(ey,em,ed)
    if prev_end and end<=prev_end: end=end.replace(year=end.year+1)  # one label typed 2015 for 2016
    sd=t[0]; sm=t[1] if len(t)>=5 else (em if sd<=ed else em-1); sy=end.year if sm<=em else end.year-1
    return dt.date(sy,sm,sd), end
def block(r0,r1,facs,cols):
    out=[]; prev=None
    for i in range(r0,r1+1):
        lab=d.iloc[i,0]
        if pd.isna(lab) or not str(lab).strip() or str(lab).startswith("Total"): continue
        st,en=span(lab,prev); prev=en
        row={"label":str(lab).strip(),"start":st.isoformat(),"end":en.isoformat(),"days":(en-st).days+1,"fac":{}}
        S=Q=0
        for f,c in zip(facs,cols):
            s=pd.to_numeric(d.iloc[i,c],errors="coerce"); p=pd.to_numeric(d.iloc[i,c+1],errors="coerce")
            s=0 if pd.isna(s) else int(s); p=0 if pd.isna(p) else int(p); row["fac"][f]=[s,p]; S+=s; Q+=p
        row.update(susp=S,pos=Q,tpr=round(100*Q/S,1) if S else None,susp_wk=round(S*7/row["days"],1),pos_wk=round(Q*7/row["days"],1))
        out.append(row)
    return out
low=block(5,46,["Ikwiriri HC","Arafa Disp. (Ikwiriri)","Faraja Disp.","Mico Disp.","Mission Disp.","AMELAB"],[1,6,9,12,15,18])
high=block(63,104,["Mohoro HC","Arafa Disp. (Mohoro)","Ndundutawa Disp.","Kiwanga Disp.","Chumbi Disp."],[1,6,9,12,15])
fac_tot={}
for blk in (low,high):
    for f in blk[0]["fac"]:
        S=sum(r["fac"][f][0] for r in blk); Q=sum(r["fac"][f][1] for r in blk); fac_tot[f]={"susp":S,"pos":Q,"tpr":round(100*Q/S,1)}
# FSAT focal screening rounds
f=x.parse(1,header=None)
def fsat(r0,r1,area):
    rows=[]; date=vil=None
    for i in range(r0,r1+1):
        a=f.iloc[i]
        if str(a[0]).startswith("Total") or str(a[1]).startswith("Total"): continue
        if pd.notna(a[0]) and str(a[0]).strip(): date=str(a[0]).strip()
        if pd.notna(a[1]) and str(a[1]).strip(): vil=str(a[1]).strip()
        hhs,hhsc,pop,popsc,pos=[pd.to_numeric(a[c],errors="coerce") for c in (3,4,6,7,9)]
        if pd.isna(popsc): continue
        rows.append({"area":area,"date":date,"village":vil,"hamlet":(str(a[2]).strip() if pd.notna(a[2]) else "").title(),"pop":pop,"screened":popsc,"pos":pos})
    return rows
F=pd.DataFrame(fsat(5,121,"low")+fsat(133,196,"high")).fillna(0)
F["end"]=pd.to_datetime([span(s,None)[1] for s in F.date]); F["month"]=F.end.dt.to_period("M").astype(str)
norm=lambda s: re.sub(r"(centre|center|central|centr|cente|cent)","c",s.lower())[:9]
HAM_ALIAS={"msikiti":"msikitini","nyalindi":"nyarindi","ngansinda":"ngasinda","kwampakaliwa":"mpakilwa","mpimaroad":"mpima","stendi":"stand","mpilipili":"mpelempele","lumyozi":"lumiozi"}
VIL_ALIAS={"umwe c":"umwe c","mohoro m":"mohoro m"}
hn=F.hamlet.str.lower().str.replace(" ","").map(lambda h: HAM_ALIAS.get(h,h))
F["hamkey"]=F.village.map(norm).map(lambda v: VIL_ALIAS.get(v,v))+"|"+hn   # spelling variants in the logbook unified
F=F.sort_values("end",kind="stable"); F["visit"]=F.groupby("hamkey").cumcount()+1
vis=F.assign(vb=F.visit.clip(upper=3)).groupby(["area","vb"]).agg(scr=("screened","sum"),pos=("pos","sum"),k=("hamlet","count")).reset_index()
mon=F.groupby(["area","month"]).agg(scr=("screened","sum"),pos=("pos","sum"),k=("hamlet","count")).reset_index()
stated={a:str(f.iloc[r,1]) for a,r in (("low",122),("high",197))}
L=pd.read_excel(os.path.join(P,"Rufiji_Kibiti HF.xls")).dropna(subset=["Latitude"])
out={"hf_low":low,"hf_high":high,"fac_tot":fac_tot,
     "fsat_visits":[{"area":r.area,"visit":int(r.vb),"scr":int(r.scr),"pos":int(r.pos),"tpr":round(100*r.pos/r.scr,1),"k":int(r.k)} for r in vis.itertuples()],
     "fsat_monthly":[{"area":r.area,"month":r.month,"scr":int(r.scr),"pos":int(r.pos),"tpr":round(100*r.pos/r.scr,1),"k":int(r.k)} for r in mon.itertuples()],
     "fsat_tot":{a:{"rounds_stated":stated[a],"screened":int(g.screened.sum()),"pos":int(g.pos.sum()),"tpr":round(100*g.pos.sum()/g.screened.sum(),1),"hamlets":int(g.hamkey.nunique()),"visits":int(len(g)),"pop_targeted":int(g.drop_duplicates("hamkey")["pop"].sum())} for a,g in F.groupby("area")},
     "facilities":[{"name":r["Facility Name"],"type":r["Facility Type"],"ward":r["Ward"],"council":r["Council"],"own":r["Ownership"],"lat":round(float(r.Latitude),5),"lon":round(float(r.Longitude),5)} for _,r in L.iterrows()]}
json.dump(out,open(os.path.join(HERE,"results","facility_results.json"),"w"))
print([(r["label"],r["start"],r["end"],r["days"]) for r in low+high if r["days"]!=7])
print(fac_tot); print(out["fsat_tot"]); print(vis)
