"""Small, dependency-free estimators: cluster-robust (household) OLS / logistic regression."""
import numpy as np, pandas as pd, math
def _clmeat(S, g):
    G = pd.DataFrame(S).groupby(np.asarray(g)).sum().values
    return G.T@G, G.shape[0]
def ols_cl(X, y, g):
    X=np.asarray(X,float); y=np.asarray(y,float)
    XtX=X.T@X; beta=np.linalg.solve(XtX, X.T@y); r=y-X@beta
    bread=np.linalg.inv(XtX); M,G=_clmeat(X*r[:,None], g); N,K=X.shape
    V=bread@M@bread*(G/(G-1))*((N-1)/(N-K)); return beta, np.sqrt(np.diag(V))
def logit_cl(X, y, g, it=60):
    X=np.asarray(X,float); y=np.asarray(y,float); b=np.zeros(X.shape[1])
    for _ in range(it):
        p=1/(1+np.exp(-X@b)); W=p*(1-p); H=X.T@(X*W[:,None]); step=np.linalg.solve(H, X.T@(y-p)); b+=step
        if np.max(np.abs(step))<1e-9: break
    p=1/(1+np.exp(-X@b)); bread=np.linalg.inv(X.T@(X*(p*(1-p))[:,None]))
    M,G=_clmeat(X*(y-p)[:,None], g); N,K=X.shape
    V=bread@M@bread*(G/(G-1))*((N-1)/(N-K)); return b, np.sqrt(np.diag(V))
def pval(z): return math.erfc(abs(z)/math.sqrt(2))
def prop(y, g):
    y=np.asarray(y,float); m=~np.isnan(y); y=y[m]; g=np.asarray(g)[m]
    if len(y)<2: return None
    b,se=ols_cl(np.ones((len(y),1)), y, g); p=b[0]; s=se[0]
    return {"p":round(float(p)*100,2),"lo":round(max(0,float(p-1.96*s))*100,2),"hi":round(min(1,float(p+1.96*s))*100,2),"n":int(len(y)),"k":int(y.sum())}
def design(df, cols):
    X=[np.ones(len(df))]; names=["const"]
    for c in cols:
        if isinstance(c, tuple):
            col, ref, levels = c
            for L in levels:
                if L==ref: continue
                X.append((df[col]==L).astype(float).values); names.append(f"{col}={L}")
        else:
            X.append(df[c].astype(float).values); names.append(c)
    return np.column_stack(X), names
def fit(df, y, cols, kind="logit"):
    d=df.dropna(subset=[y]+[c[0] if isinstance(c,tuple) else c for c in cols])
    X,names=design(d, cols)
    b,se = (logit_cl if kind=="logit" else ols_cl)(X, d[y].values, d.hh.values)
    out={}
    for n,bb,ss in zip(names,b,se):
        bb=float(bb); ss=float(ss)
        if kind=="logit": out[n]={"est":round(math.exp(bb),3),"lo":round(math.exp(bb-1.96*ss),3),"hi":round(math.exp(bb+1.96*ss),3),"p":pval(bb/ss)}
        else: out[n]={"est":round(bb*100,2),"lo":round((bb-1.96*ss)*100,2),"hi":round((bb+1.96*ss)*100,2),"p":pval(bb/ss)}
    out["_n"]=int(len(d)); out["_clusters"]=int(d.hh.nunique()); return out
