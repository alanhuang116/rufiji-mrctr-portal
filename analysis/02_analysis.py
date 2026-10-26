"""Survey analysis: prevalence, difference-in-differences, heterogeneity, equity, prevention, care-seeking,
data quality. Writes aggregate-only results (no individual records) to survey_results.json."""
import sys,os,json; HERE=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0,HERE)
import numpy as np, pandas as pd, warnings; warnings.filterwarnings("ignore")
from stats import fit, prop
D=pd.read_pickle(os.path.expanduser("~/tmp/D.pkl"))
R={}
def key(k): return "_".join(str(int(x)) if isinstance(x,(float,np.floating,int,np.integer)) else str(x) for x in (k if isinstance(k,tuple) else (k,)))
def tab(by,var="rdt",data=None):
    data=D if data is None else data
    return {key(k):prop(d[var].values,d.hh.values) for k,d in data.groupby(by,observed=True)}
R["meta"]={}
for (s,a),d in D.groupby(["survey","arm"]):
    dd=d.date[d.date>"2015-01-01"]
    R["meta"][key((s,a))]={"people":int(len(d)),"households":int(d.hh.nunique()),"tested":int(d.rdt.notna().sum()),"pos":int(d.rdt.sum()),
        "villages":int(d.village.nunique()),"date0":str(dd.min())[:10],"date1":str(dd.max())[:10],"female":round(100*(1-d.male.mean()),1),
        "under5":round(100*(d.agegrp=="<5").mean(),1),"age_med":round(float(d.age.median()),1)}
R["prev_arm"]=tab(["survey","arm"]); R["prev_ward"]=tab(["survey","ward"])
base=["endline","arm","inter"]; adj=base+["age5_14","age15","male","slept_net",("wq",1,[1,2,3,4,5])]
did={"logit_crude":fit(D,"rdt",base),"logit_adj":fit(D,"rdt",adj),"lpm_crude":fit(D,"rdt",base,"lpm"),"lpm_adj":fit(D,"rdt",adj,"lpm")}
vb=set(D[(D.survey==0)&D.village.notna()].village); ve=set(D[(D.survey==1)&D.village.notna()].village); common=vb&ve
R["footprint"]={"baseline_only":sorted(vb-ve),"endline_only":sorted(ve-vb),"common":sorted(common)}
C=D[D.village.isin(common)]
did["logit_adj_common"]=fit(C,"rdt",adj); did["lpm_adj_common"]=fit(C,"rdt",adj,"lpm"); R["prev_arm_common"]=tab(["survey","arm"],data=C)
for w in ["Chumbi","Ikwiriri"]:
    S=D[(D.ward==w)|(D.arm==0)]; did[f"lpm_adj_{w}"]=fit(S,"rdt",adj,"lpm"); did[f"logit_adj_{w}"]=fit(S,"rdt",adj)
R["did"]=did
het=[]
def hrow(en,zh,group,S,cov):
    m=fit(S,"rdt",cov,"lpm")["inter"]; mo=fit(S,"rdt",cov)["inter"]
    het.append({"en":en,"zh":zh,"group":group,"did":m["est"],"lo":m["lo"],"hi":m["hi"],"p":m["p"],"or":mo["est"],"orlo":mo["lo"],"orhi":mo["hi"],
                "base_int":round(S[(S.survey==0)&(S.arm==1)].rdt.mean()*100,1),"base_ctl":round(S[(S.survey==0)&(S.arm==0)].rdt.mean()*100,1),
                "end_int":round(S[(S.survey==1)&(S.arm==1)].rdt.mean()*100,1),"end_ctl":round(S[(S.survey==1)&(S.arm==0)].rdt.mean()*100,1),"n":int(S.rdt.notna().sum())})
noage=[c for c in adj if c not in ("age5_14","age15")]
for g,en,zh in [("<5","Under 5","5岁以下"),("5-14","Age 5–14","5–14岁"),("15+","Age 15+","15岁及以上")]: hrow(en,zh,"age",D[D.agegrp==g],noage)
for v,en,zh in [(0,"Female","女性"),(1,"Male","男性")]: hrow(en,zh,"sex",D[D.male==v],[c for c in adj if c!="male"])
for q in [1,2,3,4,5]: hrow(f"Wealth Q{q}"+(" (poorest)" if q==1 else " (richest)" if q==5 else ""),f"财富Q{q}"+("(最贫困)" if q==1 else "(最富裕)" if q==5 else ""),"wealth",D[D.wq==q],[c for c in adj if not isinstance(c,tuple)])
for v,en,zh in [(1,"Slept under a net","前夜使用蚊帐"),(0,"Did not use a net","前夜未使用蚊帐")]: hrow(en,zh,"net",D[D.slept_net==v],[c for c in adj if c!="slept_net"])
for w,en,zh in [("Chumbi","High-transmission area (Chumbi/Mohoro)","高传播区(Chumbi/Mohoro)"),("Ikwiriri","Lower-transmission area (Ikwiriri/Umwe/Mgomba)","较低传播区(Ikwiriri/Umwe/Mgomba)")]: hrow(en,zh,"ward",D[(D.ward==w)|(D.arm==0)],adj)
R["het"]=het
labs=["0–4","5–9","10–14","15–19","20–29","30–39","40–49","50+"]
D["ageb"]=pd.cut(D.age,[-1,4.999,9.999,14.999,19.999,29.999,39.999,49.999,200],labels=labs)
R["age_curve"]={"labels":labs,"data":{key((s,a)):[prop(x.rdt.values,x.hh.values) for _,x in d.groupby("ageb",observed=False)] for (s,a),d in D.groupby(["survey","arm"])}}
R["wealth"]={var:{key((s,a)):[prop(x[var].values,x.hh.values) for _,x in d.groupby("wq")] for (s,a),d in D.groupby(["survey","arm"])} for var in ["rdt","slept_net","has_net"]}
R["wealth_dist"]={key((s,a)):[round(100*x,1) for x in d.groupby("hh").wq.first().value_counts(normalize=True).sort_index().values] for (s,a),d in D.groupby(["survey","arm"])}
D["use_given_access"]=np.where(D.has_net==1,D.slept_net,np.nan)
R["nets"]={v:tab(["survey","arm"],v) for v in ["hh_net","has_net","slept_net","use_given_access"]}
R["rdt_by_net"]=tab(["survey","arm","slept_net"])
R["fever"]=tab(["survey","arm"],"fever"); R["seek"]=tab(["survey","arm"],"seek"); R["rdt_by_fever"]=tab(["survey","arm","fever"])
cat={1:"public",2:"public",3:"public",7:"private",8:"private",9:"drugshop",10:"shop",4:"community",5:"community",6:"community",11:"traditional"}
D["wcat"]=D["where"].map(cat); W=D[D.wcat.notna()]
R["where"]={key((s,a)):{k:round(100*v,1) for k,v in d.wcat.value_counts(normalize=True).items()} for (s,a),d in W.groupby(["survey","arm"])}
R["where_n"]={key((s,a)):int(len(d)) for (s,a),d in W.groupby(["survey","arm"])}
R["risk"]=fit(D,"rdt",adj+["eaves_open","screened","floor_imp","roof_imp","wall_imp"])
R["housing"]={v:tab(["survey","arm"],v) for v in ["eaves_open","screened","floor_imp","roof_imp","irs"]}
vt=[]
for (s,w,v),d in D[D.village.notna()].groupby(["survey","ward","village"]):
    vt.append({"survey":int(s),"ward":w,"arm":int(d.arm.iloc[0]),"village":v,"n":int(d.rdt.notna().sum()),"pos":int(d.rdt.sum()),
               "net_n":int(d.slept_net.notna().sum()),"net_k":int(d.slept_net.sum()),"hh":int(d.hh.nunique())})
R["villages"]=vt
I=D[(D.survey==1)&(D.arm==1)&D.mda_hh.notna()]
R["mda"]={"asked_people":int(len(I)),"asked_hh":int(I.hh.nunique()),"hh_part":prop(I.groupby("hh").mda_hh.first().values,I.groupby("hh").mda_hh.first().index.values),
          "ind_took":prop(I.mda_ind.values,I.hh.values),"rdt_by_took":tab(["mda_ind"],data=I),
          "villages":{v:{"hh":int(d.hh.nunique()),"part":round(100*d.groupby("hh").mda_hh.first().mean(),1)} for v,d in I.groupby("village")}}
mv={}
for s,d in D.groupby("survey"):
    x=d.dropna(subset=["rdt","micro"]); tp=int(((x.rdt==1)&(x.micro==1)).sum()); fp=int(((x.rdt==1)&(x.micro==0)).sum()); fn=int(((x.rdt==0)&(x.micro==1)).sum()); tn=int(((x.rdt==0)&(x.micro==0)).sum()); N=tp+fp+fn+tn
    po=(tp+tn)/N; pe=((tp+fp)*(tp+fn)+(fn+tn)*(fp+tn))/N**2
    mv[str(s)]={"tp":tp,"fp":fp,"fn":fn,"tn":tn,"N":N,"agree":round(100*po,1),"kappa":round((po-pe)/(1-pe),3),"rdt_pos":round(100*(tp+fp)/N,1),"mic_pos":round(100*(tp+fn)/N,1),"expected_overlap":round((tp+fp)*(tp+fn)/N,1)}
R["micro_rdt"]=mv
E1=D[D.survey==1]; R["travel"]=tab(["arm","travel"],data=E1)
R["travel_or"]=fit(E1,"rdt",["arm","travel","age5_14","age15","male","slept_net",("wq",1,[1,2,3,4,5])])["travel"]
R["travel_share"]={str(a):round(100*d.travel.mean(),1) for a,d in E1.groupby("arm")}
p=R["prev_arm"]; cf=p["0_1"]["p"]*p["1_0"]["p"]/p["0_0"]["p"]
R["counterfactual"]={"expected":round(cf,1),"observed":p["1_1"]["p"],"reduction":round(100*(1-p["1_1"]["p"]/cf),1)}
for w in ["Chumbi","Ikwiriri"]:
    c=R["prev_ward"][f"0_{w}"]["p"]*p["1_0"]["p"]/p["0_0"]["p"]; R["counterfactual"][w]={"expected":round(c,1),"observed":R["prev_ward"][f"1_{w}"]["p"],"reduction":round(100*(1-R["prev_ward"][f"1_{w}"]["p"]/c),1)}
json.dump(R,open(os.path.join(HERE,"results","survey_results.json"),"w"),default=lambda o: float(o) if isinstance(o,np.floating) else int(o) if isinstance(o,np.integer) else None)
print("did adj", did["logit_adj"]["inter"], did["lpm_adj"]["inter"]); print("cf",R["counterfactual"]); print("mda",R["mda"]["hh_part"],R["mda"]["ind_took"],R["mda"]["rdt_by_took"],R["mda"]["villages"])
print("micro",mv); print("travel",R["travel"],R["travel_or"],R["travel_share"]); print("rdt_by_net",{k:v["p"] for k,v in R["rdt_by_net"].items()})
