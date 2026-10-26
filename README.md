# 1,7-mRCTR Evidence Portal · 1,7-mRCTR 证据门户

**Live site / 在线访问:** https://alanhuang116.github.io/rufiji-mrctr-portal/ (English) · https://alanhuang116.github.io/rufiji-mrctr-portal/#zh (中文)

An interactive, bilingual (English / 中文) re-analysis of the China–UK–Tanzania pilot of **1,7-malaria Reactive Community-based Testing and Response (1,7-mRCTR)** in Rufiji District, Tanzania. It uses the 2015 baseline and 2018 endline household surveys (19,686 people; 15,680 malaria rapid tests) and the 2016 health-facility and community-screening registers.

中英双语交互式门户，对坦桑尼亚鲁菲吉县中英坦三方 **1,7-疟疾社区反应式检测与应对（1,7-mRCTR）** 试点进行再分析，数据包括2015年基线与2018年终线家庭调查（19,686人，15,680次疟疾快速检测）以及2016年卫生机构与社区筛查登记。

## Headline results · 主要结果

| | Intervention · 干预 | Control · 对照 |
|---|---|---|
| RDT prevalence 2015 · 基线感染率 | 25.7% | 28.1% |
| RDT prevalence 2018 · 终线感染率 | 4.9% | 13.6% |

- Adjusted difference-in-differences odds ratio **0.32** (95% CI 0.25–0.42); published estimate 0.34. · 调整后双重差分比值比 **0.32**（95% CI 0.25–0.42），已发表估计为0.34。
- Endline prevalence in intervention wards was **61% below** the level expected from the control trend. · 干预乡终线感染率比按对照组趋势推算的预期水平低 **61%**。
- Gains concentrated in the high-transmission area (−18.7 points) and among children aged 5–14 (−15.1 points). · 获益集中在高传播区（−18.7个百分点）和5–14岁儿童（−15.1个百分点）。

The portal also covers the village map, wealth and bed-net equity, fever and care-seeking, 2016 facility positivity, and a data-quality review. · 门户还包括村庄地图、财富与蚊帐公平性、发热与就医、2016年机构阳性率及数据质量核查。

## Repository layout · 目录结构

```
index.html            the portal (single self-contained page; loads d3 and Google Fonts from CDNs)
analysis/             Python scripts that produce the aggregate results from the raw study files
  01_harmonize.py     harmonise baseline + endline surveys into one person-level table (kept outside the repo)
  02_analysis.py      prevalence, difference-in-differences, subgroups, equity, nets, care, data-quality checks
  03_facility.py      2016 facility registers and FSAT community-screening rounds
  04_village_link.py  link survey villages to boundary polygons (name match, GPS fallback)
  stats.py, shpio.py  cluster-robust OLS/logit; minimal shapefile reader
  results/            aggregate outputs used by the portal (no individual records)
portal/               page source: templates, i18n.js (EN/中文 strings), app.js (charts and map), data.json
  build_geo.py        simplify village and district boundaries into geo.json
  assemble.py         combine results + geometry into data.json
  build.py            write ../index.html
```

## Reproducing · 复现

The raw survey, facility and boundary files are **not** included. Place the study folder `data sharing/` next to `analysis/` (i.e. at the repository root), then:

原始调查、机构与边界文件**未**包含在本仓库中。将研究数据文件夹 `data sharing/` 放在仓库根目录（与 `analysis/` 同级）后运行：

```bash
pip install pandas numpy openpyxl xlrd
python analysis/01_harmonize.py      # writes ~/tmp/D.pkl (individual-level; not committed)
python analysis/02_analysis.py
python analysis/03_facility.py
python analysis/04_village_link.py
python portal/build_geo.py "data sharing/shapefile"
python portal/assemble.py
python portal/build.py               # rebuilds index.html
```

## Methods in brief · 方法简述

- Outcome: RDT result for each person tested. · 结局：每位受检者的RDT结果。
- Difference-in-differences (round × arm) in logistic and linear probability models, adjusted for age group, sex, net use and wealth quintile; 95% CIs clustered by household. · 在logistic与线性概率模型中估计双重差分（轮次×分组），调整年龄组、性别、蚊帐使用与财富五分位，95%置信区间按家庭聚类。
- Wealth index: first principal component of 21 assets and housing materials, quintiles. · 财富指数：21项资产与住房材料的第一主成分，五等分。
- Limitations: non-randomised, two wards per arm; independent cross-sections; household-clustered CIs understate ward-level uncertainty. · 局限：非随机设计，每组仅2个乡；独立横断面；家庭聚类置信区间低估乡级不确定性。

## Privacy · 隐私

The portal and the files in `analysis/results/` contain aggregate figures only: no names, household IDs or household coordinates. · 门户及 `analysis/results/` 中的文件仅含汇总数据，不含姓名、家庭编号或家庭坐标。

## Related publications · 相关文献

- Mlacha YP, Wang D, et al. Effectiveness of the innovative 1,7-malaria reactive community-based testing and response (1,7-mRCTR) approach on malaria burden reduction in Southeastern Tanzania. *Malaria Journal* 2020;19:292.
- Chang W, Cohen J, Wang D-Q, et al. Impact of 1,7-malaria reactive community-based testing and response (1,7-mRCTR) approach on malaria prevalence in Tanzania. *Infectious Diseases of Poverty* 2023;12:116.
- Gao C, Huang S, et al. Development of a new wealth index for Tanzania: the moderated effect of the implementation of 1,7-mRCTR by socioeconomic position with malaria prevention. *BMJ Global Health* 2026;11:e021154.
