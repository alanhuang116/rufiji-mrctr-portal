# Methods and data cleaning · 方法与数据清洗

*1,7-mRCTR Evidence Portal — Version 2 · 26 October 2026 · 第2版 · 2026年10月26日*

[English](#english) · [中文](#中文)

---

## English

A complete record of how the raw files became the numbers on this page: what was dropped, recoded or derived at each step, with counts recomputed from the raw data. Open any section for detail.

### Data sources

All inputs come from the shared `data sharing` folder. Raw files were read without modification; every change described below happens in code.

| File | Content | Size | Used for |
|---|---|---|---|
| `3_Baseline survey.dta` | Baseline household survey, one row per household member; household, housing, net, fever and travel modules merged with RDT and slide results | 9,617 rows × 183 variables | Prevalence, DiD, subgroups, equity |
| `Endline_household_survery merged.dta` | Endline household survey, same design, adds MDA, GPS and treatment modules | 10,134 rows × 282 variables | Same as baseline |
| `Data dictionary for endline-baseline.xlsx` | Question text and value labels (299 lines) | 1 sheet | Decoding endline numeric codes |
| `HEALTH FACILITY INFO-WEEKLY REPORT-2016-V_21.xlsx` | Weekly suspected / positive malaria cases at 11 facilities; FSAT focal screening log | 2 sheets | Facility positivity, reactive rounds |
| `Rufiji_Kibiti HF.xls` | Facility list with type, ownership and coordinates | 82 facilities | Map layer |
| `shapefile/shapefiles/*.shp` | Village boundaries, Rufiji/Kibiti (118) and Kilwa (102), WGS84 | 220 polygons | Village map, GPS check |
| `Districts and TC as 2020.shp` | National district boundaries | 195 polygons | Locator inset |
| `Table 2_Study area…docx`, policy briefs, protocol | Study arms for Phase I and II; published results | – | Arm definitions, comparison with published estimates |

### Sample flow

From raw member records to the people included in the adjusted models. People without an RDT result contribute to descriptive tables (nets, fever, housing) but not to prevalence or effect estimates.

**Baseline 2015**

- **9,617** member records in the raw file
- ↓ −65 empty member records
- **9,552** people in 2,027 households
- ↓ −1,861 no RDT result
- **7,691** with an RDT result (control 3,935 · intervention 3,756)
- ↓ −93 missing age or net use
- **7,598** in the adjusted models (control 3,891 · intervention 3,707)

**Endline 2018**

- **10,134** member records in the raw file
- ↓ −0 empty member records
- **10,134** people in 2,427 households
- ↓ −2,145 no RDT result
- **7,989** with an RDT result (control 4,523 · intervention 3,466)
- ↓ −279 missing age or net use
- **7,710** in the adjusted models (control 4,297 · intervention 3,413)

**Main adjusted model: 15,308 people in 4,350 households.**

### Data cleaning: household surveys

Each step is applied in `01_harmonize.py`; the counts are recomputed from the raw files by `05_cleaning_log.py`.

| # | Step | Rule | Baseline 2015 | Endline 2018 |
|---|---|---|---|---|
| 1 | Empty member records | Rows with no sex, age or test data are dropped | 65 dropped → 9,552 people | 0 dropped → 10,134 people |
| 2 | Household identifier | Baseline household IDs are unreliable (893 member rows carry “99” or blank), so the ODK submission key (`PARENT_KEY`) defines the household. Endline uses site + registered household number. | 2,027 households | 2,427 households |
| 3 | Ward and study arm | Baseline ward text mapped to four analysis areas: Ikwiriri, Umwe, Mgomba → *Ikwiriri area*; “chumbi” (incl. Mohoro villages) → *Chumbi/Mohoro*; Kibiti; Bungu. Endline: `site` (1 = intervention, 2 = control) × `tr_intensity` (1 = high → Chumbi/Mohoro, 2 = low → Ikwiriri area) × `w_ctrl` (1 = Kibiti, 2 = Bungu). | 85 rows with ward recorded as “ward” and village “99” assigned to intervention (reproduces published counts) | All rows assigned |
| 4 | Village names | Baseline: free-text names, “99” and blank set missing. Endline: numeric codes decoded with the data dictionary; Kibiti A/B codes refined to the hamlet-level names used at baseline (Kingwila, Sokoni, Makaoni, Mbebetini, Kibiti Kusini, Nyatanga, Kibiti Kati…). | 191 rows without village (kept in arm-level analyses); 34 village names | 0 missing; 34 village names |
| 5 | Interview dates | Dates before 2015 are tablet-clock errors and are ignored; dates are descriptive only and do not enter models. | 33 rows dated 2000-01-02; valid range 2015-09-10 to 2015-12-01 | 2018-03-24 to 2018-04-29 |
| 6 | Age | Priority: reported age (values >110 rejected) → approximate age → age from date of birth and interview date (0–110 years). Grouped as <5, 5–14, 15+. | 5,321 reported (1 value of 600 rejected), 1,078 approximate, 3,074 from DOB, 80 missing | 2,295 reported, 1,045 approximate, 6,792 from DOB, 3 missing |
| 7 | Malaria RDT (outcome) | Baseline text “positive”/“negative”; endline codes 1/2. Blank = not tested; untested people are excluded from prevalence. | 7,691 tested; 1,861 blank | 7,989 tested; 2,145 missing |
| 8 | Microscopy | *P. falciparum* 1 = yes, 2 = no; other codes (9, 0) set missing. Used only for the RDT–slide concordance check. | 9 invalid codes set missing | – |
| 9 | “Don't know” answers | Code 98 set missing for fever, care-seeking and net use. | Fever 176; care-seeking 5; net use 358 | Care-seeking 1; net use missing 305 |
| 10 | Care-seeking place | Asked only of people with fever who sought care. Multi-select answers keep the first code. Grouped: public hospital/HC/dispensary; private or faith facility; drug shop (duka la dawa); general shop; community health worker, field worker, mobile clinic or traditional healer. | 6 multi-select answers | – |
| 11 | Travel | Travel outside the village in the previous month. Baseline item was answered by only 833 people, so travel analyses use endline only. | Not analysed | All answered |
| 12 | Housing | Improved floor = wood, terrazzo or cement; improved roof = tiles, concrete, iron or asbestos; improved walls = stone, cement or brick. “Other” (99) and “don't know” (98) count as not improved. Baseline window-screen code 3 (no windows) set missing. | Screen code 3: 966 rows | – |
| 13 | Analysis sample | Adjusted models use complete cases on age group, sex, net use and wealth quintile. | 7,598 of 7,691 tested | 7,710 of 7,989 tested |

### Variable definitions

| Analysis variable | Baseline field | Endline field | Definition |
|---|---|---|---|
| RDT positive | `mrdtResults` | `mrdt_results` | 1 = positive, 0 = negative; missing if not tested |
| Slide positive | `pfalciparu` | `Q6_pf` | *P. falciparum* on microscopy (concordance check only) |
| Arm | `studyInfoward` | `site` | 1 = intervention wards, 0 = control wards |
| Transmission area | `studyInfoward` | `tr_intensity` | Chumbi/Mohoro (high) vs Ikwiriri area (lower), intervention arm only |
| Age group | `age`, `ageApprox`, `dob` | `age`, `age_approx`, `Dob` | <5, 5–14, 15+ years (see cleaning step 6) |
| Male | `sex` | `Sex` | 1 = male, 0 = female |
| Slept under a net | `sleptUnderNet` | `slept_under_net` | Previous night; 98 set missing |
| Has a net / household owns a net | `hasNet` / `householdInfonet` | `has_net` / `mosquito_net` | Person-level and household-level ownership |
| Recent fever | `fever` | `q_fever` | Fever in the past 14 days |
| Sought care | `seekTreatment` | `seek_treatment` | Among those with fever |
| Travelled | – | `out_of_village` | Travelled outside the village (endline only) |
| MDA participation | – | `q5p_mda`, `tk_med_MDA` | Household took part; person took DHA-PPQ (Umwe, Mgomba) |
| Wealth quintile | 21 items (see wealth index) | Q1 poorest … Q5 richest, pooled cut points |  |

### Wealth index

Each household contributes one record (4,454 households across both rounds). The 21 binary items below were standardised and combined with principal component analysis on the pooled data, so one scale applies to both rounds. The first component explains 24.4% of variance (second: 8.5%). Its sign is set so that owning a motorcycle raises the score. No item had missing values after recoding, so mode imputation was not triggered. Households are cut into quintiles at the pooled 20th, 40th, 60th and 80th percentiles (−1.81, −1.13, −0.13, 1.82). Livestock items load near zero and contribute almost nothing.

| Item | Loading on PC1 | Households 2015 | Households 2018 |
|---|---|---|---|
| Sofa | 0.33 | 16.2% | 20.8% |
| Electric lighting | 0.33 | 18.1% | 29.7% |
| Improved floor | 0.32 | 32.2% | 51.4% |
| Wardrobe | 0.32 | 14.1% | 19.1% |
| Cooks with electricity, gas, kerosene or charcoal | 0.29 | 24.0% | 48.2% |
| Flush or modern pit toilet | 0.28 | 8.8% | 17.4% |
| Iron | 0.28 | 16.8% | 16.2% |
| Brick, stone or cement walls | 0.24 | 11.2% | 20.3% |
| Watch | 0.22 | 20.8% | 10.3% |
| Household head: secondary school or more | 0.22 | 8.2% | 13.6% |
| Iron, tile or concrete roof | 0.20 | 68.4% | 83.4% |
| Mattress | 0.20 | 72.6% | 88.0% |
| Radio | 0.18 | 54.1% | 50.8% |
| Motorcycle | 0.16 | 10.9% | 13.5% |
| Tap water (private or public) | 0.13 | 33.4% | 51.1% |
| Car or tractor | 0.11 | 1.9% | 1.3% |
| Bed | 0.09 | 94.4% | 95.6% |
| Bicycle | 0.03 | 58.6% | 48.8% |
| Goats | 0.01 | 5.1% | 2.8% |
| Cows | −0.01 | 1.2% | 0.6% |
| Chickens or ducks | −0.06 | 43.9% | 35.0% |

### Statistical analysis

**Prevalence.** RDT prevalence is the mean of the binary outcome among people tested; its 95% CI uses a household-clustered sandwich standard error (equivalent to a GEE with identity link and independence working correlation).

**Difference-in-differences.** For person *i* in household *h* in round *t*:

```
logit Pr(y_iht = 1) = β_0 + β_1·Endline_t + β_2·Arm_h + β_3·(Endline_t × Arm_h) + γ′X_iht
```

exp(β_3) is the DiD odds ratio. The same specification with an identity link (linear probability model) gives β_3 in percentage points. X contains age group (5–14, 15+ vs <5), sex, net use the previous night and wealth quintile (Q2–Q5 vs Q1); crude models omit X. Logistic models are fitted by Newton–Raphson.

**Standard errors.** Cluster-robust (sandwich) by household with the small-sample factor G/(G−1) × (N−1)/(N−K); 95% Wald intervals; two-sided p-values from the normal distribution. The adjusted model has 15,308 people in 4,350 households.

**Counterfactual.** Expected intervention prevalence at endline = intervention baseline × (control endline ÷ control baseline). The headline reduction compares the observed endline prevalence with this value.

**Sensitivity and subgroups.** (1) Crude vs adjusted. (2) Same-village restriction: only the 27 villages sampled in both rounds. (3) Transmission area: each intervention area against all control wards. (4) Subgroups: the adjusted model refitted within age group, sex, wealth quintile and net use, dropping the covariate that defines the subgroup. (5) Risk factors: one pooled logistic model adding open eaves, window screens and improved floor, roof and walls.

**Other estimates.** Net cascade, fever, care-seeking and travel are proportions with household-clustered CIs. Travel odds ratio: endline-only logistic model with arm, travel, age group, sex, net use and wealth. RDT–slide agreement: Cohen's κ from the 2×2 table, with expected double-positives = (RDT+ × slide+) ÷ N.

**Software.** Python 3 with pandas and NumPy; estimators written in `stats.py` without external statistics packages. Results were checked against the published positive counts (1,103 · 967 · 621 · 163) and odds ratio (0.34).

### Facility registers and community screening

| # | Step | Rule and result |
|---|---|---|
| 1 | Layout | Two blocks on sheet 1: lower-transmission area (Ikwiriri HC, Arafa, Faraja, Mico, Mission, AMELAB) and high-transmission area (Mohoro HC, Arafa, Ndundutawa, Kiwanga, Chumbi), 42 reporting periods each, November 2015 – October 2016. Each facility has suspected tested, positive and positivity columns; positivity is recomputed from counts. |
| 2 | Period labels | Free-text labels (e.g. “14.12.15-3.1.16”) parsed into start and end dates. Fixed: “3-9.10.20166” (year typed 20166), “4 -17.01.2015” in the high-area block (2015 for 2016), “4 12.6.2016” (missing dash). Four periods span 2–4 weeks (the whole of November 2015, 14 Dec – 3 Jan, 4–17 Jan, 15–28 Feb); counts are divided by days × 7 when shown per week, positivity is unaffected. |
| 3 | Totals check | Row sums against the workbook's own total rows. Lower area: 37,636 tested (total row 37,636), 10,406 positive (total row 10,403). High area: 22,439 tested (total row 22,435), 10,386 positive (total row 10,391). The small gaps are in the workbook totals; row values are used. |
| 4 | Completeness | A period with zero suspected cases is treated as not reported: AMELAB 26/42, Ndundutawa 9/42, Kiwanga 5/42, Chumbi 1/42; all other facilities 42/42. |
| 5 | Duplicate row | Mohoro HC, 7–13 Dec 2015 (1,838 tested, 421 positive) is identical to Ikwiriri HC's November 2015 row. Kept, flagged on the chart. |
| 6 | FSAT log | 117 hamlet-visit rows in the lower area and 64 in the high area. Merged cells for date and village are carried down. Totals reproduce the workbook exactly: 11,194 / 2,248 and 13,290 / 4,857 (screened, positive). |
| 7 | Hamlet names | Spelling variants unified before counting visits: Msikiti/Msikitini, Nyalindi/Nyarindi, Ngansinda/Ngasinda, Kwampakaliwa/Mpakilwa, Mpima road/Mpima; village prefixes “Centre/Center/Central” merged. Visit number = order of screening date within a hamlet; visits 3+ are pooled. |
| 8 | Implausible rows | 2 rows report more people screened than the hamlet population and 10 rows more households screened than listed. Kept as recorded. |

### Maps and village linkage

- **Name matching.** 37 of 41 survey village names match a polygon in the Rufiji/Kibiti boundary file directly or through spelling aliases (Muhoro → Mohoro, Ndundu Tawa → Ndundutawa, Kingwila → Kingwira, Zimbwini → Zimwini). Muhoro Magharibi and Muhoro Mashariki share the single Mohoro polygon.
- **GPS placement.** The remaining 4 names are placed in the polygon that contains most of their endline households: King'ongo and Shela → Mohoro, Mbebetini → Sokoni, Mangombela → Bungu A.
- **GPS validation.** All 2,427 endline households were tested with a point-in-polygon check: 100.0% fall inside a village polygon, 97.8% inside the ward recorded on the form and 75.5% inside the recorded village. Household coordinates are used only for this check and are not published.
- **Geometry.** Coordinates snapped to 0.00001° so shared borders match exactly; vertices where the set of neighbouring polygons changes are fixed, and the lines between them are simplified with Douglas–Peucker at 0.0012° (about 130 m). This keeps shared borders identical, with no gaps or slivers. Village vertices fell from 81,573 to 10,875.
- **Display.** Planar projection (latitude reflected), adequate at this scale. Prevalence classes: 0–5, 5–10, 10–15, 15–20, 20–30, 30–40, 40%+; net-use classes in 10-point steps from 40%. Phase I/II arms come from Table 1 of the study-area file.

### Limitations

- Non-randomised design with two intervention and two control ward groups; household-clustered CIs understate uncertainty at ward level, where only four clusters exist.
- Independent cross-sections, not a cohort; the sampled villages changed between rounds (7 baseline-only, 7 endline-only).
- Rounds differ in season: baseline September–December, endline March–April. The DiD removes season effects shared by both arms but not arm-specific ones.
- About one person in five was not tested; prevalence assumes testing is unrelated to infection within arm and round.
- HRP2-based RDTs can stay positive for weeks after treatment, which may overstate infection where reactive treatment was recent.
- An MDA with DHA-PPQ in Umwe and Mgomba is recorded at endline but not described in the published evaluation; it may contribute to the lower-transmission result.
- Endline microscopy does not agree with RDT beyond chance and is not used.
- Facility data cover the intervention area only, so they describe trends and cannot estimate effects.

### Reproducibility and privacy

| Script | What it does | Output |
|---|---|---|
| `01_harmonize.py` | Cleans and harmonises both surveys (steps 1–12), builds the wealth index | `~/tmp/D.pkl` (individual-level, kept outside the shared folder) |
| `02_analysis.py` | Prevalence, DiD, subgroups, equity, nets, care, MDA, microscopy, travel | `survey_results.json` |
| `03_facility.py` | Facility registers and FSAT rounds | `facility_results.json` |
| `04_village_link.py` | Village–polygon linkage and GPS validation | `village_link.json` |
| `05_cleaning_log.py` | Recomputes every count in this methods record | `cleaning_log.json` |
| `portal/build_geo.py`, `assemble.py`, `build.py` | Simplifies boundaries, merges results, writes the page | `index.html` |

Run the scripts in order from the `analysis_scripts` folder next to `data sharing`. The portal and all JSON outputs hold aggregates only: no names, household IDs or household coordinates. Add `#zh` to the link for Chinese or `#en` for English.

### Version history

- **v2 · 26 Oct 2026.** Detailed methods and data-cleaning record added (sample flow, 13 cleaning steps with counts, variable dictionary, wealth-index loadings, model equations, facility and map processing). Cleaning audit script `05_cleaning_log.py` added. Version label added to the footer.
- **v1 · 26 Oct 2026.** First release: ten findings, impact, subgroups, village map, prevention and equity, fever and care, facilities, data quality.

---

## 中文

完整记录原始文件如何转化为本页数字：每一步删除、重新编码或派生了哪些内容，并附从原始数据重新计算的计数。展开任一部分查看详情。

### 数据来源

所有输入均来自共享的 `data sharing` 文件夹。原始文件未作任何改动，下文所述的全部处理均在代码中完成。

| 文件 | 内容 | 规模 | 用途 |
|---|---|---|---|
| `3_Baseline survey.dta` | 基线家庭调查，每行一名家庭成员；家庭、住房、蚊帐、发热、外出模块与RDT及镜检结果合并 | 9,617行 × 183个变量 | 感染率、双重差分、亚组、公平性 |
| `Endline_household_survery merged.dta` | 终线家庭调查，设计相同，另含群体服药、GPS与治疗模块 | 10,134行 × 282个变量 | 同基线 |
| `Data dictionary for endline-baseline.xlsx` | 问题文本与取值标签（299行） | 1个工作表 | 解码终线数值编码 |
| `HEALTH FACILITY INFO-WEEKLY REPORT-2016-V_21.xlsx` | 11家卫生机构每周疑似与阳性病例；FSAT疫点筛查记录 | 2个工作表 | 机构阳性率、反应式筛查 |
| `Rufiji_Kibiti HF.xls` | 卫生机构名录（类型、所有制、坐标） | 82家 | 地图图层 |
| `shapefile/shapefiles/*.shp` | 村级边界：鲁菲吉/基比蒂（118个）与基尔瓦（102个），WGS84 | 220个多边形 | 村庄地图、GPS核验 |
| `Districts and TC as 2020.shp` | 全国县级边界 | 195个多边形 | 位置示意图 |
| `Table 2_Study area…docx`、政策简报、研究方案 | 一期与二期研究分组；已发表结果 | – | 分组定义、与已发表估计比较 |

### 样本流程

从原始成员记录到纳入调整模型的人数。无RDT结果者计入描述性统计（蚊帐、发热、住房），但不计入感染率与效果估计。

**基线 2015**

- **9,617** 原始文件成员记录
- ↓ −65 空成员记录
- **9,552** 人，2,027户
- ↓ −1,861 无RDT结果
- **7,691** 人有RDT结果 (对照 3,935 · 干预 3,756)
- ↓ −93 年龄或蚊帐使用缺失
- **7,598** 人纳入调整模型 (对照 3,891 · 干预 3,707)

**终线 2018**

- **10,134** 原始文件成员记录
- ↓ −0 空成员记录
- **10,134** 人，2,427户
- ↓ −2,145 无RDT结果
- **7,989** 人有RDT结果 (对照 4,523 · 干预 3,466)
- ↓ −279 年龄或蚊帐使用缺失
- **7,710** 人纳入调整模型 (对照 4,297 · 干预 3,413)

**主要调整模型：4,350户，15,308人。**

### 数据清洗：家庭调查

各步骤在 `01_harmonize.py` 中执行；计数由 `05_cleaning_log.py` 从原始文件重新计算。

| # | 步骤 | 规则 | 基线 2015 | 终线 2018 |
|---|---|---|---|---|
| 1 | 空成员记录 | 无性别、年龄及检测数据的行予以删除 | 删除65行 → 9,552人 | 删除0行 → 10,134人 |
| 2 | 家庭标识 | 基线家庭编号不可靠（893个成员行为“99”或空白），故以ODK提交键（`PARENT_KEY`）界定家庭；终线以站点+登记户号界定。 | 2,027户 | 2,427户 |
| 3 | 乡与研究分组 | 基线乡名映射为4个分析片区：Ikwiriri、Umwe、Mgomba → *Ikwiriri片区*；“chumbi”（含Mohoro各村）→ *Chumbi/Mohoro*；Kibiti；Bungu。终线：`site`（1=干预，2=对照）× `tr_intensity`（1=高 → Chumbi/Mohoro，2=低 → Ikwiriri片区）× `w_ctrl`（1=Kibiti，2=Bungu）。 | 85行乡字段为“ward”、村为“99”，归入干预组（可复现已发表计数） | 全部已归类 |
| 4 | 村名 | 基线为自由文本，“99”与空白设为缺失。终线数值编码按数据字典解码；Kibiti A/B编码细化为基线使用的村组级名称（Kingwila、Sokoni、Makaoni、Mbebetini、Kibiti Kusini、Nyatanga、Kibiti Kati等）。 | 191行缺村名（保留于分组层面分析）；34个村名 | 无缺失；34个村名 |
| 5 | 访谈日期 | 2015年前的日期为平板时钟错误，予以忽略；日期仅作描述，不进入模型。 | 33行日期为2000-01-02；有效范围2015-09-10至2015-12-01 | 2018-03-24至2018-04-29 |
| 6 | 年龄 | 优先顺序：报告年龄（>110剔除）→ 估计年龄 → 由出生日期与访谈日期推算（0–110岁）。分组为<5、5–14、15+。 | 报告5,321人（剔除1个值600），估计1,078人，出生日期推算3,074人，缺失80人 | 报告2,295人，估计1,045人，出生日期推算6,792人，缺失3人 |
| 7 | 疟疾RDT（结局） | 基线为文本“positive/negative”；终线编码1/2。空白=未检测；未检测者不计入感染率。 | 受检7,691人；空白1,861 | 受检7,989人；缺失2,145 |
| 8 | 镜检 | 恶性疟原虫1=是，2=否；其他编码（9、0）设为缺失。仅用于RDT与镜检一致性核查。 | 9个无效编码设为缺失 | – |
| 9 | “不知道” | 发热、就医与蚊帐使用中的编码98设为缺失。 | 发热176；就医5；蚊帐358 | 就医1；蚊帐缺失305 |
| 10 | 就医地点 | 仅询问发热且就医者。多选答案取第一个编码。归类：公立医院/卫生中心/诊所；私立或教会机构；药店（duka la dawa）；普通商店；社区卫生员、现场工作人员、流动诊所或传统医者。 | 多选答案6个 | – |
| 11 | 外出 | 过去一个月离村外出。基线该题仅833人作答，故外出分析仅用终线。 | 未分析 | 全部作答 |
| 12 | 住房 | 改良地面=木板、水磨石或水泥；改良屋顶=瓦、混凝土、铁皮或石棉；改良墙体=石、水泥或砖。“其他”（99）与“不知道”（98）计为未改良。基线窗纱编码3（无窗）设为缺失。 | 编码3：966行 | – |
| 13 | 分析样本 | 调整模型采用年龄组、性别、蚊帐使用和财富五分位均完整的个案。 | 受检7,691人中7,598人 | 受检7,989人中7,710人 |

### 变量定义

| 分析变量 | 基线字段 | 终线字段 | 定义 |
|---|---|---|---|
| RDT阳性 | `mrdtResults` | `mrdt_results` | 1=阳性，0=阴性；未检测为缺失 |
| 镜检阳性 | `pfalciparu` | `Q6_pf` | 镜检恶性疟原虫（仅用于一致性核查） |
| 分组 | `studyInfoward` | `site` | 1=干预乡，0=对照乡 |
| 传播区域 | `studyInfoward` | `tr_intensity` | Chumbi/Mohoro（高）与Ikwiriri片区（较低），仅干预组 |
| 年龄组 | `age`、`ageApprox`、`dob` | `age`、`age_approx`、`Dob` | <5、5–14、15+岁（见清洗步骤6） |
| 男性 | `sex` | `Sex` | 1=男，0=女 |
| 前夜使用蚊帐 | `sleptUnderNet` | `slept_under_net` | 前一晚；98设为缺失 |
| 个人/家庭拥有蚊帐 | `hasNet` / `householdInfonet` | `has_net` / `mosquito_net` | 个人层面与家庭层面拥有 |
| 近期发热 | `fever` | `q_fever` | 近14天发热 |
| 就医 | `seekTreatment` | `seek_treatment` | 限发热者 |
| 外出 | – | `out_of_village` | 曾离村外出（仅终线） |
| 群体服药 | – | `q5p_mda`、`tk_med_MDA` | 家庭参与；个人服用DHA-PPQ（Umwe、Mgomba） |
| 财富五分位 | 21项指标（见财富指数） | Q1最贫 … Q5最富，合并样本切点 |  |

### 财富指数

每户一条记录（两轮合计4,454户）。下列21项二分类指标经标准化后，在合并数据上进行主成分分析，使两轮采用同一尺度。第一主成分解释24.4%的方差（第二主成分8.5%），方向设定为拥有摩托车者得分更高。重新编码后各指标均无缺失，未触发众数插补。按合并样本第20、40、60、80百分位（−1.81, −1.13, −0.13, 1.82）将家庭五等分。牲畜类指标载荷接近零，几乎无贡献。

| 指标 | 第一主成分载荷 | 2015年家庭占比 | 2018年家庭占比 |
|---|---|---|---|
| 沙发 | 0.33 | 16.2% | 20.8% |
| 电力照明 | 0.33 | 18.1% | 29.7% |
| 改良地面 | 0.32 | 32.2% | 51.4% |
| 衣柜 | 0.32 | 14.1% | 19.1% |
| 以电、燃气、煤油或木炭做饭 | 0.29 | 24.0% | 48.2% |
| 冲水或改良坑厕 | 0.28 | 8.8% | 17.4% |
| 熨斗 | 0.28 | 16.8% | 16.2% |
| 砖、石或水泥墙 | 0.24 | 11.2% | 20.3% |
| 手表 | 0.22 | 20.8% | 10.3% |
| 户主受过中学及以上教育 | 0.22 | 8.2% | 13.6% |
| 铁皮、瓦或混凝土屋顶 | 0.20 | 68.4% | 83.4% |
| 床垫 | 0.20 | 72.6% | 88.0% |
| 收音机 | 0.18 | 54.1% | 50.8% |
| 摩托车 | 0.16 | 10.9% | 13.5% |
| 自来水（私人或公共） | 0.13 | 33.4% | 51.1% |
| 汽车或拖拉机 | 0.11 | 1.9% | 1.3% |
| 床 | 0.09 | 94.4% | 95.6% |
| 自行车 | 0.03 | 58.6% | 48.8% |
| 山羊 | 0.01 | 5.1% | 2.8% |
| 牛 | −0.01 | 1.2% | 0.6% |
| 鸡或鸭 | −0.06 | 43.9% | 35.0% |

### 统计分析

**感染率。**RDT感染率为受检者二分类结局的均值；95%置信区间采用按家庭聚类的三明治标准误（等价于恒等连接、独立工作相关矩阵的GEE）。

**双重差分。**对于第*t*轮、家庭*h*中的个体*i*：

```
logit Pr(y_iht = 1) = β_0 + β_1·终线_t + β_2·分组_h + β_3·(终线_t × 分组_h) + γ′X_iht
```

exp(β_3)为双重差分比值比。采用恒等连接的同一设定（线性概率模型）得到以百分点表示的β_3。X包括年龄组（5–14、15+对比<5）、性别、前夜蚊帐使用及财富五分位（Q2–Q5对比Q1）；未调整模型不含X。logistic模型以Newton–Raphson法拟合。

**标准误。**按家庭聚类的稳健（三明治）标准误，小样本校正因子G/(G−1) × (N−1)/(N−K)；95% Wald区间；双侧p值基于正态分布。调整模型纳入4,350户15,308人。

**反事实。**干预组终线预期感染率 = 干预组基线 ×（对照组终线 ÷ 对照组基线）。主要降幅为观察到的终线感染率与该值之比。

**敏感性与亚组分析。**（1）未调整与调整模型。（2）相同村庄：仅限两轮均抽样的27个村。（3）传播区域：各干预片区分别对比全部对照乡。（4）亚组：在年龄组、性别、财富五分位及蚊帐使用各亚组内重新拟合调整模型，并去除定义该亚组的协变量。（5）风险因素：在合并logistic模型中加入屋檐开放、窗纱及改良地面、屋顶、墙体。

**其他估计。**蚊帐覆盖链、发热、就医与外出为比例，置信区间按家庭聚类。外出比值比：仅终线的logistic模型，含分组、外出、年龄组、性别、蚊帐使用与财富。RDT与镜检一致性：基于2×2表计算Cohen κ，随机预期双阳性数 =（RDT阳性 × 镜检阳性）÷ N。

**软件。**Python 3（pandas、NumPy）；估计量在 `stats.py` 中自行实现，未使用外部统计包。结果已与已发表的阳性数（1,103 · 967 · 621 · 163）及比值比（0.34）核对。

### 卫生机构登记与社区筛查数据处理

| # | 步骤 | 规则与结果 |
|---|---|---|
| 1 | 表格结构 | 第1个工作表分两块：较低传播区（Ikwiriri卫生中心、Arafa、Faraja、Mico、Mission、AMELAB）与高传播区（Mohoro卫生中心、Arafa、Ndundutawa、Kiwanga、Chumbi），各42个报告周期，2015年11月至2016年10月。每家机构含疑似检测数、阳性数与阳性率；阳性率由计数重新计算。 |
| 2 | 周期标签 | 自由文本标签（如“14.12.15-3.1.16”）解析为起止日期。修正：“3-9.10.20166”（年份误为20166）、高传播区“4 -17.01.2015”（2016误为2015）、“4 12.6.2016”（缺连字符）。4个周期跨2–4周（2015年11月整月、12月14日至1月3日、1月4–17日、2月15–28日）；按周展示时计数除以天数×7，阳性率不受影响。 |
| 3 | 合计核对 | 逐行求和与表内合计行比较。较低传播区：检测37,636（合计行37,636），阳性10,406（合计行10,403）。高传播区：检测22,439（合计行22,435），阳性10,386（合计行10,391）。微小差异来自表内合计，分析采用逐行数值。 |
| 4 | 报告完整性 | 疑似病例为零的周期视为未报告：AMELAB 26/42，Ndundutawa 9/42，Kiwanga 5/42，Chumbi 1/42；其余机构均为42/42。 |
| 5 | 重复记录 | Mohoro卫生中心2015年12月7–13日（检测1,838人，阳性421人）与Ikwiriri卫生中心2015年11月数据完全相同。予以保留，并在图中标记。 |
| 6 | FSAT记录 | 较低传播区117条、高传播区64条村组筛查记录。日期与村名的合并单元格向下填充。合计与表内完全一致：11,194 / 2,248与13,290 / 4,857（筛查数、阳性数）。 |
| 7 | 村组名称 | 统计复访前统一拼写变体：Msikiti/Msikitini、Nyalindi/Nyarindi、Ngansinda/Ngasinda、Kwampakaliwa/Mpakilwa、Mpima road/Mpima；村名前缀“Centre/Center/Central”合并。复访次数=同一村组内按筛查日期排序的序号；第3次及以后合并。 |
| 8 | 不合理记录 | 2条记录筛查人数超过村组人口，10条筛查户数超过登记户数。按原记录保留。 |

### 地图与村庄匹配

- **名称匹配。**41个调查村名中，37个可直接或经拼写别名（Muhoro → Mohoro、Ndundu Tawa → Ndundutawa、Kingwila → Kingwira、Zimbwini → Zimwini）匹配到鲁菲吉/基比蒂边界文件中的多边形。Muhoro Magharibi与Muhoro Mashariki共用Mohoro多边形。
- **GPS定位。**其余4个村名归入包含其多数终线家庭的多边形：King'ongo与Shela → Mohoro，Mbebetini → Sokoni，Mangombela → Bungu A。
- **GPS核验。**对全部2,427户终线家庭做点面包含检验：100.0%位于某一村多边形内，97.8%位于问卷记录的乡内，75.5%位于记录的村内。家庭坐标仅用于此核验，不予公开。
- **几何处理。**坐标对齐至0.00001°以使共享边界完全重合；相邻多边形集合发生变化的顶点保持固定，其间线段以Douglas–Peucker法按0.0012°（约130米）简化，使共享边界保持一致、无缝隙。村级顶点由81,573个减少至10,875个。
- **显示。**平面投影（纬度翻转），在此尺度下足够精确。感染率分级：0–5、5–10、10–15、15–20、20–30、30–40、40%以上；蚊帐使用率自40%起每10个百分点一级。一期/二期分组来自研究区域文件表1。

### 局限性

- 非随机设计，干预与对照各仅两组乡；乡级仅有4个聚类，按家庭聚类的置信区间低估了乡级不确定性。
- 两轮为独立横断面而非队列；两轮抽样村庄有变化（7个仅基线、7个仅终线）。
- 两轮季节不同：基线为9–12月，终线为3–4月。双重差分可消除两组共有的季节效应，但不能消除分组特有的季节效应。
- 约五分之一的受访者未接受检测；感染率估计假定同一分组与轮次内是否检测与感染无关。
- 基于HRP2的RDT在治疗后数周内可能仍呈阳性，在近期开展过反应式治疗的地区可能高估感染。
- 终线记录了Umwe与Mgomba的DHA-PPQ群体服药，但已发表评估未提及，可能影响较低传播区的结果。
- 终线镜检与RDT的一致性不超过随机水平，未予使用。
- 机构数据仅覆盖干预地区，只能描述趋势，不能估计效果。

### 可重复性与隐私

| 脚本 | 功能 | 输出 |
|---|---|---|
| `01_harmonize.py` | 清洗并统一两轮调查（步骤1–12），构建财富指数 | `~/tmp/D.pkl`（个体层面，存放于共享文件夹之外） |
| `02_analysis.py` | 感染率、双重差分、亚组、公平性、蚊帐、就医、群体服药、镜检、外出 | `survey_results.json` |
| `03_facility.py` | 卫生机构登记与FSAT筛查 | `facility_results.json` |
| `04_village_link.py` | 村庄与多边形匹配及GPS核验 | `village_link.json` |
| `05_cleaning_log.py` | 重新计算本方法记录中的全部计数 | `cleaning_log.json` |
| `portal/build_geo.py`、`assemble.py`、`build.py` | 简化边界、合并结果、生成页面 | `index.html` |

在 `data sharing` 旁的 `analysis_scripts` 文件夹中按顺序运行。门户及全部JSON输出仅含汇总数据，不含姓名、家庭编号或家庭坐标。在链接后加 `#zh` 打开中文版，加 `#en` 打开英文版。

### 版本记录

- **v2 · 2026年10月26日。**新增详细方法与数据清洗记录（样本流程、13个清洗步骤及计数、变量字典、财富指数载荷、模型公式、机构与地图数据处理）。新增清洗核查脚本 `05_cleaning_log.py`。页脚新增版本标识。
- **v1 · 2026年10月26日。**首次发布：十项发现、干预效果、亚组、村庄地图、预防与公平、发热与就医、卫生机构、数据质量。
