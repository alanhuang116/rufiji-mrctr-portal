"""Data-cleaning audit: documents every exclusion, recode and derived variable with counts.
Reads the raw files (and ~/tmp/D.pkl from 01_harmonize.py). Writes cleaning_log.json (aggregates only)."""
import sys, os, json, re, datetime as dt
HERE=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0,HERE)
import pandas as pd, numpy as np, warnings; warnings.filterwarnings("ignore")
SRC=os.path.join(HERE,"..","data sharing","baseline-endline")
b=pd.read_stata(os.path.join(SRC,"3_Baseline survey.dta"),convert_categoricals=False)
e=pd.read_stata(os.path.join(SRC,"Endline_household_survery merged.dta"),convert_categoricals=False)
D=pd.read_pickle(os.path.expanduser("~/tmp/D.pkl"))
num=lambda s: pd.to_numeric(s,errors="coerce")
vc=lambda s: {str(k):int(v) for k,v in s.value_counts(dropna=False).items()}
L={"baseline":{},"endline":{},"harmonised":{},"wealth":{},"models":{},"facility":{},"geo":{}}
# ---------------- baseline ----------------
B=L["baseline"]
B["raw_rows"]=len(b); B["raw_vars"]=b.shape[1]
B["empty_member_rows"]=int(b.sex.isna().sum()); bb=b[b.sex.notna()].copy(); B["rows_after"]=len(bb)
B["households_parent_key"]=int(bb.PARENT_KEY.nunique())
B["hhid_99_or_blank_rows"]=int(bb.householdInfohhId.astype(str).isin(["99",""]).sum())
B["ward_raw"]=vc(bb.studyInfoward)
B["village_99_or_blank"]=int(bb.studyInfovillage.isin(["99",""]).sum())
B["ward_literal_rows"]=int((bb.studyInfoward=="ward").sum())
d=bb.formInfointerviewDate; B["date_min"]=str(d.min())[:10]; B["date_max"]=str(d.max())[:10]; B["date_pre2015_rows"]=int((d<"2015-01-01").sum())
B["date_range_valid"]=[str(d[d>="2015-01-01"].min())[:10],str(d[d>="2015-01-01"].max())[:10]]
age=num(bb.age); ap=num(bb.ageApprox); dob=(bb.formInfointerviewDate-bb.dob).dt.days/365.25
a1=age.where(age<=110); a2=a1.fillna(ap.where(ap<=110)); a3=a2.fillna(dob.where((dob>=0)&(dob<=110)))
B["age"]={"reported":int(age.notna().sum()),"reported_gt110_set_missing":int((age>110).sum()),"max_reported":float(age.max()),"from_approx":int((a1.isna()&a2.notna()).sum()),"from_dob":int((a2.isna()&a3.notna()).sum()),"still_missing":int(a3.isna().sum()),
          "dob_negative_or_gt110":int(((dob<0)|(dob>110)).sum())}
B["sex"]=vc(bb.sex)
B["rdt_results"]=vc(bb.mrdtResults); B["rdt_taken"]=vc(bb.mrdtTaken)
B["rdt_taken_no_result"]=int(((num(bb.mrdtTaken)==1)&(bb.mrdtResults=="")).sum())
B["micro_pf"]=vc(bb.pfalciparu)
B["fever"]=vc(bb.fever); B["seek_given_fever"]=vc(bb.loc[num(bb.fever)==1,"seekTreatment"])
B["slept_net"]=vc(bb.sleptUnderNet); B["has_net"]=vc(bb.hasNet)
wt=bb.whereTreated.astype(str).str.strip(); B["where_multi_select"]=int(wt.str.contains(" ").sum()); B["where_answered"]=int((wt!="").sum())
B["travel"]=vc(bb.travelHistoryoutOfVillage)
B["floor"]=vc(bb.householdInfofloor); B["roof"]=vc(bb.householdInforoof); B["walls"]=vc(bb.householdInfoviambaza)
B["eaves"]=vc(bb.hhEnvGrpopenEaves); B["screen"]=vc(bb.hhEnvGrpwindowScreen); B["irs"]=vc(bb.hhEnvGrpeverSprayedIRS)
# ---------------- endline ----------------
E=L["endline"]
E["raw_rows"]=len(e); E["raw_vars"]=e.shape[1]; E["households"]=int((e.site.astype(str)+"_"+e.hh_number.astype(str)).nunique())
E["site"]=vc(e.site); E["tr_intensity"]=vc(e.tr_intensity); E["w_ctrl"]=vc(e.w_ctrl); E["high_intens_wards"]=vc(e.high_intens_wards)
E["date_range"]=[str(e.inte_date.min())[:10],str(e.inte_date.max())[:10]]
age=num(e.age); ap=num(e.age_approx); dob=(e.inte_date-e.Dob).dt.days/365.25
a1=age.where(age<=110); a2=a1.fillna(ap.where(ap<=110)); a3=a2.fillna(dob.where((dob>=0)&(dob<=110)))
E["age"]={"reported":int(age.notna().sum()),"reported_gt110_set_missing":int((age>110).sum()),"from_approx":int((a1.isna()&a2.notna()).sum()),"approx_gt110_set_missing":int((ap>110).sum()),"from_dob":int((a2.isna()&a3.notna()).sum()),"still_missing":int(a3.isna().sum())}
E["sex"]=vc(e.Sex); E["rdt_results"]=vc(e.mrdt_results); E["rdt_taken"]=vc(e.mrdt_taken); E["micro_pf"]=vc(e.Q6_pf)
E["fever"]=vc(e.q_fever); E["seek_given_fever"]=vc(e.loc[e.q_fever==1,"seek_treatment"])
E["slept_net"]=vc(e.slept_under_net); E["has_net"]=vc(e.has_net); E["travel"]=vc(e.out_of_village)
E["mda_hh"]=vc(e.q5p_mda); E["mda_ind"]=vc(e.tk_med_MDA)
E["gps_nonmissing"]=int(e.gps_co_latitude.notna().sum()); E["gps_lat_range"]=[float(e.gps_co_latitude.min()),float(e.gps_co_latitude.max())]; E["gps_lon_range"]=[float(e.gps_co_longitude.min()),float(e.gps_co_longitude.max())]
E["floor"]=vc(e.hh_floor_made_of); E["roof"]=vc(e.q14_roofing); E["walls"]=vc(e.h_walls_made_of)
E["kibiti_a_hamlet"]=vc(e.h_kia); E["kibiti_b_hamlet"]=vc(e.h_kib)
# ---------------- harmonised ----------------
Hm=L["harmonised"]
Hm["rows"]=len(D); Hm["by_survey_arm"]={f"{int(s)}_{int(a)}":{"people":int(len(g)),"households":int(g.hh.nunique()),"tested":int(g.rdt.notna().sum()),"pos":int(g.rdt.sum())} for (s,a),g in D.groupby(["survey","arm"])}
Hm["village_missing"]={str(int(s)):int(g.village.isna().sum()) for s,g in D.groupby("survey")}
Hm["villages_per_survey"]={str(int(s)):int(g.village.nunique()) for s,g in D.groupby("survey")}
Hm["age_missing"]={str(int(s)):int(g.age.isna().sum()) for s,g in D.groupby("survey")}
Hm["agegrp"]={f"{int(s)}":{str(k):int(v) for k,v in g.agegrp.value_counts().items()} for s,g in D.groupby("survey")}
miss=lambda c: {str(int(s)):int(g[c].isna().sum()) for s,g in D[D.rdt.notna()].groupby("survey")}
Hm["missing_among_tested"]={c:miss(c) for c in ["age","male","slept_net","wq","fever","travel"]}
Hm["tested_share"]={f"{int(s)}_{int(a)}":round(100*g.rdt.notna().mean(),1) for (s,a),g in D.groupby(["survey","arm"])}
# ---------------- wealth ----------------
acols=[c for c in D.columns if c.startswith("a_")]+["floor_imp","roof_imp","wall_imp"]
Hh=D.groupby("hh")[acols+["survey"]].first()
L["wealth"]["households"]=int(len(Hh)); L["wealth"]["hh_with_any_missing_item"]=int(Hh[acols].isna().any(axis=1).sum())
L["wealth"]["item_missing"]={c:int(Hh[c].isna().sum()) for c in acols}
Hf=Hh[acols].fillna(Hh[acols].mode().iloc[0]); Z=(Hf-Hf.mean())/Hf.std(ddof=0); Z=Z.loc[:,Hf.std(ddof=0)>0]
w,vec=np.linalg.eigh(np.corrcoef(Z.values.T)); pc=vec[:,-1]
if pc[list(Z.columns).index("a_motorcycle")]<0: pc=-pc
L["wealth"]["pc1_share"]=round(float(w[-1]/w.sum()),3); L["wealth"]["pc2_share"]=round(float(w[-2]/w.sum()),3)
L["wealth"]["items"]=[{"item":c,"loading":round(float(l),3),"prev_2015":round(100*float(Hf.loc[Hh.survey==0,c].mean()),1),"prev_2018":round(100*float(Hf.loc[Hh.survey==1,c].mean()),1)} for c,l in zip(Z.columns,pc)]
q=D.groupby("hh").wscore.first(); L["wealth"]["cutpoints"]=[round(float(x),3) for x in q.quantile([.2,.4,.6,.8])]
# ---------------- model samples ----------------
adjcols=["rdt","endline","arm","inter","age5_14","age15","male","slept_net","wq"]
t=D.dropna(subset=["rdt"]); a=D.dropna(subset=adjcols)
L["models"]={"tested":int(len(t)),"tested_households":int(t.hh.nunique()),"adjusted_sample":int(len(a)),"adjusted_households":int(a.hh.nunique()),"dropped_for_covariates":int(len(t)-len(a)),
  "adjusted_by_survey_arm":{f"{int(s_)}_{int(a_)}":int(len(g)) for (s_,a_),g in a.groupby(["survey","arm"])},"tested_by_survey_arm":{f"{int(s_)}_{int(a_)}":int(len(g)) for (s_,a_),g in t.groupby(["survey","arm"])},
  "dropped_reason":{"slept_net_missing":int(t.slept_net.isna().sum()),"age_missing":int(t.age.isna().sum()),"male_missing":int(t.male.isna().sum())}}
# ---------------- facility checks ----------------
P=os.path.join(HERE,"..","data sharing","HF Data"); x=pd.ExcelFile(os.path.join(P,"HEALTH FACILITY INFO-WEEKLY REPORT-2016-V_21.xlsx"))
d=x.parse(0,header=None)
def colsum(r0,r1,c): return int(pd.to_numeric(d.iloc[r0:r1+1,c],errors="coerce").fillna(0).sum())
lowS=sum(colsum(5,46,c) for c in [1,6,9,12,15,18]); lowP=sum(colsum(5,46,c+1) for c in [1,6,9,12,15,18])
hiS=sum(colsum(63,104,c) for c in [1,6,9,12,15]); hiP=sum(colsum(63,104,c+1) for c in [1,6,9,12,15])
L["facility"]={"low_rows":42,"high_rows":42,"low_sum":[lowS,lowP],"low_total_row":[int(d.iloc[47,21]),int(d.iloc[47,22])],"high_sum":[hiS,hiP],"high_total_row":[int(d.iloc[105,18]),int(d.iloc[105,19])],
  "labels_irregular":["3-9.10.20166 (year typed 20166)","4 -17.01.2015 in the high-area block (year typed 2015 for 2016)","4 12.6.2016 (space instead of dash)"],
  "multiweek_periods":[str(d.iloc[i,0]).strip() for i in range(5,47) if str(d.iloc[i,0]).strip() in ("1-30.11.2015","14.12.15-3.1.16","4 -17.01.2016","15-28.2.2016")],
  "zero_weeks":{str(d.iloc[61,c]).strip():int((pd.to_numeric(d.iloc[63:105,c],errors="coerce").fillna(0)==0).sum()) for c in [1,6,9,12,15]} | {str(d.iloc[3,c]).strip():int((pd.to_numeric(d.iloc[5:47,c],errors="coerce").fillna(0)==0).sum()) for c in [1,6,9,12,15,18]},
  "dup_check":{"mohoro_7_13dec":[int(d.iloc[65,1]),int(d.iloc[65,2])],"ikwiriri_nov":[int(d.iloc[5,1]),int(d.iloc[5,2])]}}
f=x.parse(1,header=None)
L["facility"]["fsat_total_rows"]={"low":[str(f.iloc[122,1]),int(f.iloc[122,7]),int(f.iloc[122,9])],"high":[str(f.iloc[197,1]),int(f.iloc[197,7]),int(f.iloc[197,9])]}
L["facility"]["fsat_rows"]={"low":int(pd.to_numeric(f.iloc[5:122,7],errors="coerce").notna().sum()),"high":int(pd.to_numeric(f.iloc[133:197,7],errors="coerce").notna().sum())}
L["facility"]["fsat_screened_gt_pop_rows"]=int(sum((pd.to_numeric(f.iloc[r,7],errors="coerce")>pd.to_numeric(f.iloc[r,6],errors="coerce")) for r in list(range(5,122))+list(range(133,197))))
L["facility"]["fsat_hhs_screened_gt_hhs_rows"]=int(sum((pd.to_numeric(f.iloc[r,4],errors="coerce")>pd.to_numeric(f.iloc[r,3],errors="coerce")) for r in list(range(5,122))+list(range(133,197))))
json.dump(L,open(os.path.join(HERE,"results","cleaning_log.json"),"w"),indent=1,default=lambda o: int(o) if isinstance(o,np.integer) else float(o) if isinstance(o,np.floating) else str(o))
print(json.dumps({k:L[k] for k in ["models"]},indent=0)); print(L["baseline"]["age"],L["endline"]["age"]); print(L["facility"])
