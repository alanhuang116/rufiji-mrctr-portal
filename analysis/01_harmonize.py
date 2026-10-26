"""Harmonise the 2015 baseline and 2018 endline household surveys into one person-level table.
Output (individual-level, kept OUTSIDE the shared folder): ~/tmp/D.pkl"""
import pandas as pd, numpy as np, warnings, os
warnings.filterwarnings("ignore")
SRC=os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","data sharing","baseline-endline")
OUT=os.path.expanduser("~/tmp"); os.makedirs(OUT,exist_ok=True)
b=pd.read_stata(os.path.join(SRC,"3_Baseline survey.dta"),convert_categoricals=False)
e=pd.read_stata(os.path.join(SRC,"Endline_household_survery merged.dta"),convert_categoricals=False)
def yn(s,yes=1,no=2):
    s=pd.to_numeric(s,errors="coerce"); return np.where(s==yes,1.0,np.where(s==no,0.0,np.nan))
def num(s): return pd.to_numeric(s,errors="coerce")
# ---------- baseline (Sep-Dec 2015) ----------
b=b[b.sex.notna()].copy()                                  # drop 65 empty member rows
B=pd.DataFrame(index=b.index); B["survey"]=0
B["ward"]=b.studyInfoward.map({"Bungu":"Bungu","Kibiti":"Kibiti","Ikwiriri":"Ikwiriri","Umwe":"Ikwiriri","Mgomba":"Ikwiriri","chumbi":"Chumbi"})
B["village"]=b.studyInfovillage.replace({"99":np.nan,"":np.nan})
B["hh"]="B_"+b.PARENT_KEY.astype(str); B["date"]=b.formInfointerviewDate
age=num(b.age).where(lambda x:x<=110).fillna(num(b.ageApprox).where(lambda x:x<=110))
dob=(b.formInfointerviewDate-b.dob).dt.days/365.25; B["age"]=age.fillna(dob.where((dob>=0)&(dob<=110)))
B["male"]=yn(b.sex,1,2)
B["rdt"]=np.where(b.mrdtResults=="positive",1.0,np.where(b.mrdtResults=="negative",0.0,np.nan))
B["micro"]=yn(b.pfalciparu); B["fever"]=yn(b.fever)
B["seek"]=np.where(B.fever==1,yn(b.seekTreatment),np.nan)
B["where"]=num(b.whereTreated.astype(str).str.strip().str.split().str[0])
B["has_net"]=yn(b.hasNet); B["slept_net"]=yn(b.sleptUnderNet); B["hh_net"]=yn(b.householdInfonet)
B["travel"]=yn(b.travelHistoryoutOfVillage)
B["eaves_open"]=yn(b.hhEnvGrpopenEaves); B["screened"]=yn(b.hhEnvGrpwindowScreen)
B["floor_imp"]=num(b.householdInfofloor).isin([2,3,4]).astype(float)
B["roof_imp"]=num(b.householdInforoof).isin([1,2]).astype(float)
B["wall_imp"]=num(b.householdInfoviambaza).isin([1]).astype(float)
B["irs"]=yn(b.hhEnvGrpeverSprayedIRS); B["mda_hh"]=np.nan; B["mda_ind"]=np.nan
for k,v in {"bed":"bed","mattress":"mattress","wardrobe":"wardrobe","sofa":"sofa","watch":"watch","iron":"iron","radio":"radio","bicycle":"bicycle","motorcycle":"motorcycle","car":"carOrTractor","fowls":"fowls","cows":"cows","goats":"goats"}.items():
    B["a_"+k]=yn(b["householdInfo"+v])
B["a_elec"]=(num(b.householdInfolightSource)==3).astype(float)
B["a_toilet"]=num(b.householdInfotoiletType).isin([1,2]).astype(float)
B["a_fuel"]=num(b.householdInfocookingFuel).isin([1,3]).astype(float)
B["a_tap"]=num(b.householdInfowaterSource).isin([1,4]).astype(float)
B["a_edu"]=(num(b.householdInfoeducationLevelHoH)>=3).astype(float)
B["lat"]=np.nan; B["lon"]=np.nan   # baseline has no household GPS
# ---------- endline (Mar-Apr 2018) ----------
E=pd.DataFrame(index=e.index); E["survey"]=1
E["ward"]=np.where(e.site==2,np.where(e.w_ctrl==1,"Kibiti",np.where(e.w_ctrl==2,"Bungu",None)),
                   np.where(e.tr_intensity==1,"Chumbi",np.where(e.tr_intensity==2,"Ikwiriri",None)))
cks={1:"Kati",2:"Kaskazini",3:"Kusini"}; v=pd.Series(np.nan,index=e.index,dtype=object)
for col,base in [("q4_3village","Ikwiriri"),("q4_4village","Umwe"),("q4_5village","Mgomba")]:
    m=e[col].notna(); v[m]=base+" "+e.loc[m,col].map(cks)
m=e.vil_high_mal.notna(); v[m]=e.loc[m,"vil_high_mal"].map({1:"Muhoro Mashariki",2:"Muhoro Magharibi",3:"King'ongo",4:"Kiwanga",5:"Ndundu Tawa",6:"Shela"})
m=e.q5_1_1village.notna(); v[m]=e.loc[m,"q5_1_1village"].map({1:"Chumbi A",2:"Chumbi B",3:"Chumbi C"})
m=e.q2_28_village.notna(); v[m]=e.loc[m,"q2_28_village"].map({1:"Kibiti A",2:"Kibiti B",3:"Kimbuga",4:"Miwaga",5:"Ngulakula",6:"Mng'aru",7:"Kinyanya",8:"Mtawanya A",9:"Mtawanya B"})
m=(v=="Kibiti A")&e.h_kia.notna(); v[m]=e.loc[m,"h_kia"].map({1:"Kingwila",2:"Sokoni",3:"Makaoni",4:"Mbebetini"})
m=(v=="Kibiti B")&e.h_kib.notna(); v[m]=e.loc[m,"h_kib"].map({1:"Kibiti Kusini",2:"Nyatanga",3:"Lumiozi",4:"Zimbwini",5:"Kitembo",6:"Kibiti Kati"})
m=e.q2_29_village.notna(); v[m]=e.loc[m,"q2_29_village"].map({1:"Bungu A",2:"Bungu B",3:"Nyambili",4:"Nyambunda",5:"Msafiri",6:"Mangombela"})
E["village"]=v; E["hh"]="E_"+e.site.astype(str)+"_"+e.hh_number.astype(str); E["date"]=e.inte_date
age=num(e.age).where(lambda x:x<=110).fillna(num(e.age_approx).where(lambda x:x<=110))
dob=(e.inte_date-e.Dob).dt.days/365.25; E["age"]=age.fillna(dob.where((dob>=0)&(dob<=110)))
E["male"]=yn(e.Sex,1,2); E["rdt"]=yn(e.mrdt_results); E["micro"]=yn(e.Q6_pf)
E["fever"]=yn(e.q_fever); E["seek"]=np.where(E.fever==1,yn(e.seek_treatment),np.nan); E["where"]=num(e.where_treated)
E["has_net"]=yn(e.has_net); E["slept_net"]=yn(e.slept_under_net); E["hh_net"]=yn(e.mosquito_net); E["travel"]=yn(e.out_of_village)
E["eaves_open"]=yn(e.eaves_open); E["screened"]=yn(e.screened_windows)
E["floor_imp"]=num(e.hh_floor_made_of).isin([2,3,4]).astype(float)
E["roof_imp"]=num(e.q14_roofing).isin([1,2]).astype(float)
E["wall_imp"]=num(e.h_walls_made_of).isin([1]).astype(float)
E["irs"]=yn(e.ever_sprayed_irs); E["mda_hh"]=yn(e.q5p_mda); E["mda_ind"]=yn(e.tk_med_MDA)
for k,c in {"bed":"bed","mattress":"mattress","wardrobe":"wardrobe","sofa":"sofa","watch":"watch","iron":"iron","radio":"radio","bicycle":"bicycle","motorcycle":"motorcycle","car":"car_tractor","fowls":"fowls","cows":"cows","goats":"goats"}.items():
    E["a_"+k]=yn(e[c])
E["a_elec"]=(num(e.q22_light)==3).astype(float); E["a_toilet"]=num(e.q20_t_type).isin([1,2]).astype(float)
E["a_fuel"]=num(e.q16_fuel_type).isin([1,3]).astype(float); E["a_tap"]=num(e.q18_wsource).isin([1,4]).astype(float)
E["a_edu"]=(num(e.edu_lev_head)>=3).astype(float)
E["lat"]=e.gps_co_latitude; E["lon"]=e.gps_co_longitude   # used only for village linkage; never exported
# ---------- combine ----------
D=pd.concat([B,E],ignore_index=True)
D["arm"]=D.ward.map({"Ikwiriri":1,"Chumbi":1,"Kibiti":0,"Bungu":0})
D.loc[D.ward.isna()&(D.survey==0),"arm"]=1   # 85 baseline records with ward recorded as "ward"; treated as intervention (matches published counts)
D["agegrp"]=pd.cut(D.age,[-1,4.999,14.999,200],labels=["<5","5-14","15+"])
# household wealth index: 1st principal component of 21 assets/housing items, pooled, quintiles
acols=[c for c in D.columns if c.startswith("a_")]+["floor_imp","roof_imp","wall_imp"]
H=D.groupby("hh")[acols].first(); H=H.fillna(H.mode().iloc[0]); Z=(H-H.mean())/H.std(ddof=0); Z=Z.loc[:,H.std(ddof=0)>0]
w,vec=np.linalg.eigh(np.corrcoef(Z.values.T)); pc=vec[:,-1]
if pc[list(Z.columns).index("a_motorcycle")]<0: pc=-pc
H["wscore"]=Z.values@pc; H["wq"]=pd.qcut(H.wscore,5,labels=[1,2,3,4,5]).astype(int)
D=D.join(H[["wscore","wq"]],on="hh")
D["endline"]=D.survey.astype(float); D["inter"]=D.endline*D.arm
D["age5_14"]=(D.agegrp=="5-14").astype(float); D["age15"]=(D.agegrp=="15+").astype(float)
D.loc[D.agegrp.isna(),["age5_14","age15"]]=np.nan
D.to_pickle(os.path.join(OUT,"D.pkl"))
print("rows",len(D),"PC1 share",round(w[-1]/w.sum(),3)); print(D.groupby(["survey","arm"]).rdt.agg(["count","sum","mean"]))
