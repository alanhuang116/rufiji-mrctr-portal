/* Detailed methods & data-cleaning record (EN / 中文). Numbers in {{…}} are filled from the cleaning log at runtime. */
const METHODS = [
{ id: "m-sources", open: true,
  t: ["Data sources", "数据来源"],
  h: [`
<p>All inputs come from the shared <code>data sharing</code> folder. Raw files were read without modification; every change described below happens in code.</p>
<table class="mt"><thead><tr><th>File</th><th>Content</th><th>Size</th><th>Used for</th></tr></thead><tbody>
<tr><td><code>3_Baseline survey.dta</code></td><td>Baseline household survey, one row per household member; household, housing, net, fever and travel modules merged with RDT and slide results</td><td>{{b_raw}} rows × {{b_vars}} variables</td><td>Prevalence, DiD, subgroups, equity</td></tr>
<tr><td><code>Endline_household_survery merged.dta</code></td><td>Endline household survey, same design, adds MDA, GPS and treatment modules</td><td>{{e_raw}} rows × {{e_vars}} variables</td><td>Same as baseline</td></tr>
<tr><td><code>Data dictionary for endline-baseline.xlsx</code></td><td>Question text and value labels (299 lines)</td><td>1 sheet</td><td>Decoding endline numeric codes</td></tr>
<tr><td><code>HEALTH FACILITY INFO-WEEKLY REPORT-2016-V_21.xlsx</code></td><td>Weekly suspected / positive malaria cases at 11 facilities; FSAT focal screening log</td><td>2 sheets</td><td>Facility positivity, reactive rounds</td></tr>
<tr><td><code>Rufiji_Kibiti HF.xls</code></td><td>Facility list with type, ownership and coordinates</td><td>82 facilities</td><td>Map layer</td></tr>
<tr><td><code>shapefile/shapefiles/*.shp</code></td><td>Village boundaries, Rufiji/Kibiti (118) and Kilwa (102), WGS84</td><td>220 polygons</td><td>Village map, GPS check</td></tr>
<tr><td><code>Districts and TC as 2020.shp</code></td><td>National district boundaries</td><td>195 polygons</td><td>Locator inset</td></tr>
<tr><td><code>Table 2_Study area…docx</code>, policy briefs, protocol</td><td>Study arms for Phase I and II; published results</td><td>–</td><td>Arm definitions, comparison with published estimates</td></tr>
</tbody></table>`,
`
<p>所有输入均来自共享的 <code>data sharing</code> 文件夹。原始文件未作任何改动，下文所述的全部处理均在代码中完成。</p>
<table class="mt"><thead><tr><th>文件</th><th>内容</th><th>规模</th><th>用途</th></tr></thead><tbody>
<tr><td><code>3_Baseline survey.dta</code></td><td>基线家庭调查，每行一名家庭成员；家庭、住房、蚊帐、发热、外出模块与RDT及镜检结果合并</td><td>{{b_raw}}行 × {{b_vars}}个变量</td><td>感染率、双重差分、亚组、公平性</td></tr>
<tr><td><code>Endline_household_survery merged.dta</code></td><td>终线家庭调查，设计相同，另含群体服药、GPS与治疗模块</td><td>{{e_raw}}行 × {{e_vars}}个变量</td><td>同基线</td></tr>
<tr><td><code>Data dictionary for endline-baseline.xlsx</code></td><td>问题文本与取值标签（299行）</td><td>1个工作表</td><td>解码终线数值编码</td></tr>
<tr><td><code>HEALTH FACILITY INFO-WEEKLY REPORT-2016-V_21.xlsx</code></td><td>11家卫生机构每周疑似与阳性病例；FSAT疫点筛查记录</td><td>2个工作表</td><td>机构阳性率、反应式筛查</td></tr>
<tr><td><code>Rufiji_Kibiti HF.xls</code></td><td>卫生机构名录（类型、所有制、坐标）</td><td>82家</td><td>地图图层</td></tr>
<tr><td><code>shapefile/shapefiles/*.shp</code></td><td>村级边界：鲁菲吉/基比蒂（118个）与基尔瓦（102个），WGS84</td><td>220个多边形</td><td>村庄地图、GPS核验</td></tr>
<tr><td><code>Districts and TC as 2020.shp</code></td><td>全国县级边界</td><td>195个多边形</td><td>位置示意图</td></tr>
<tr><td><code>Table 2_Study area…docx</code>、政策简报、研究方案</td><td>一期与二期研究分组；已发表结果</td><td>–</td><td>分组定义、与已发表估计比较</td></tr>
</tbody></table>`] },

{ id: "m-flow", open: true,
  t: ["Sample flow", "样本流程"],
  flow: true,
  h: [`<p>From raw member records to the people included in the adjusted models. People without an RDT result contribute to descriptive tables (nets, fever, housing) but not to prevalence or effect estimates.</p>`,
      `<p>从原始成员记录到纳入调整模型的人数。无RDT结果者计入描述性统计（蚊帐、发热、住房），但不计入感染率与效果估计。</p>`] },

{ id: "m-clean", open: false,
  t: ["Data cleaning: household surveys", "数据清洗：家庭调查"],
  h: [`
<p>Each step is applied in <code>01_harmonize.py</code>; the counts are recomputed from the raw files by <code>05_cleaning_log.py</code>.</p>
<table class="mt steps"><thead><tr><th>#</th><th>Step</th><th>Rule</th><th>Baseline 2015</th><th>Endline 2018</th></tr></thead><tbody>
<tr><td>1</td><td>Empty member records</td><td>Rows with no sex, age or test data are dropped</td><td>{{b_empty}} dropped → {{b_rows}} people</td><td>0 dropped → {{e_raw}} people</td></tr>
<tr><td>2</td><td>Household identifier</td><td>Baseline household IDs are unreliable ({{b_hhid99}} member rows carry “99” or blank), so the ODK submission key (<code>PARENT_KEY</code>) defines the household. Endline uses site + registered household number.</td><td>{{b_hh}} households</td><td>{{e_hh}} households</td></tr>
<tr><td>3</td><td>Ward and study arm</td><td>Baseline ward text mapped to four analysis areas: Ikwiriri, Umwe, Mgomba → <i>Ikwiriri area</i>; “chumbi” (incl. Mohoro villages) → <i>Chumbi/Mohoro</i>; Kibiti; Bungu. Endline: <code>site</code> (1 = intervention, 2 = control) × <code>tr_intensity</code> (1 = high → Chumbi/Mohoro, 2 = low → Ikwiriri area) × <code>w_ctrl</code> (1 = Kibiti, 2 = Bungu).</td><td>{{b_ward_literal}} rows with ward recorded as “ward” and village “99” assigned to intervention (reproduces published counts)</td><td>All rows assigned</td></tr>
<tr><td>4</td><td>Village names</td><td>Baseline: free-text names, “99” and blank set missing. Endline: numeric codes decoded with the data dictionary; Kibiti A/B codes refined to the hamlet-level names used at baseline (Kingwila, Sokoni, Makaoni, Mbebetini, Kibiti Kusini, Nyatanga, Kibiti Kati…).</td><td>{{b_vil_missing}} rows without village (kept in arm-level analyses); 34 village names</td><td>0 missing; 34 village names</td></tr>
<tr><td>5</td><td>Interview dates</td><td>Dates before 2015 are tablet-clock errors and are ignored; dates are descriptive only and do not enter models.</td><td>{{b_date_bad}} rows dated 2000-01-02; valid range {{b_d0}} to {{b_d1}}</td><td>{{e_d0}} to {{e_d1}}</td></tr>
<tr><td>6</td><td>Age</td><td>Priority: reported age (values &gt;110 rejected) → approximate age → age from date of birth and interview date (0–110 years). Grouped as &lt;5, 5–14, 15+.</td><td>{{b_age_rep}} reported (1 value of 600 rejected), {{b_age_apx}} approximate, {{b_age_dob}} from DOB, {{b_age_miss}} missing</td><td>{{e_age_rep}} reported, {{e_age_apx}} approximate, {{e_age_dob}} from DOB, {{e_age_miss}} missing</td></tr>
<tr><td>7</td><td>Malaria RDT (outcome)</td><td>Baseline text “positive”/“negative”; endline codes 1/2. Blank = not tested; untested people are excluded from prevalence.</td><td>{{b_rdt_n}} tested; {{b_rdt_blank}} blank</td><td>{{e_rdt_n}} tested; {{e_rdt_miss}} missing</td></tr>
<tr><td>8</td><td>Microscopy</td><td><i>P. falciparum</i> 1 = yes, 2 = no; other codes (9, 0) set missing. Used only for the RDT–slide concordance check.</td><td>9 invalid codes set missing</td><td>–</td></tr>
<tr><td>9</td><td>“Don't know” answers</td><td>Code 98 set missing for fever, care-seeking and net use.</td><td>Fever {{b_fever_dk}}; care-seeking {{b_seek_dk}}; net use {{b_net_dk}}</td><td>Care-seeking {{e_seek_dk}}; net use missing {{e_net_miss}}</td></tr>
<tr><td>10</td><td>Care-seeking place</td><td>Asked only of people with fever who sought care. Multi-select answers keep the first code. Grouped: public hospital/HC/dispensary; private or faith facility; drug shop (duka la dawa); general shop; community health worker, field worker, mobile clinic or traditional healer.</td><td>{{b_where_multi}} multi-select answers</td><td>–</td></tr>
<tr><td>11</td><td>Travel</td><td>Travel outside the village in the previous month. Baseline item was answered by only {{b_travel_ans}} people, so travel analyses use endline only.</td><td>Not analysed</td><td>All answered</td></tr>
<tr><td>12</td><td>Housing</td><td>Improved floor = wood, terrazzo or cement; improved roof = tiles, concrete, iron or asbestos; improved walls = stone, cement or brick. “Other” (99) and “don't know” (98) count as not improved. Baseline window-screen code 3 (no windows) set missing.</td><td>Screen code 3: {{b_screen3}} rows</td><td>–</td></tr>
<tr><td>13</td><td>Analysis sample</td><td>Adjusted models use complete cases on age group, sex, net use and wealth quintile.</td><td>{{adj_b}} of {{tst_b}} tested</td><td>{{adj_e}} of {{tst_e}} tested</td></tr>
</tbody></table>`,
`
<p>各步骤在 <code>01_harmonize.py</code> 中执行；计数由 <code>05_cleaning_log.py</code> 从原始文件重新计算。</p>
<table class="mt steps"><thead><tr><th>#</th><th>步骤</th><th>规则</th><th>基线 2015</th><th>终线 2018</th></tr></thead><tbody>
<tr><td>1</td><td>空成员记录</td><td>无性别、年龄及检测数据的行予以删除</td><td>删除{{b_empty}}行 → {{b_rows}}人</td><td>删除0行 → {{e_raw}}人</td></tr>
<tr><td>2</td><td>家庭标识</td><td>基线家庭编号不可靠（{{b_hhid99}}个成员行为“99”或空白），故以ODK提交键（<code>PARENT_KEY</code>）界定家庭；终线以站点+登记户号界定。</td><td>{{b_hh}}户</td><td>{{e_hh}}户</td></tr>
<tr><td>3</td><td>乡与研究分组</td><td>基线乡名映射为4个分析片区：Ikwiriri、Umwe、Mgomba → <i>Ikwiriri片区</i>；“chumbi”（含Mohoro各村）→ <i>Chumbi/Mohoro</i>；Kibiti；Bungu。终线：<code>site</code>（1=干预，2=对照）× <code>tr_intensity</code>（1=高 → Chumbi/Mohoro，2=低 → Ikwiriri片区）× <code>w_ctrl</code>（1=Kibiti，2=Bungu）。</td><td>{{b_ward_literal}}行乡字段为“ward”、村为“99”，归入干预组（可复现已发表计数）</td><td>全部已归类</td></tr>
<tr><td>4</td><td>村名</td><td>基线为自由文本，“99”与空白设为缺失。终线数值编码按数据字典解码；Kibiti A/B编码细化为基线使用的村组级名称（Kingwila、Sokoni、Makaoni、Mbebetini、Kibiti Kusini、Nyatanga、Kibiti Kati等）。</td><td>{{b_vil_missing}}行缺村名（保留于分组层面分析）；34个村名</td><td>无缺失；34个村名</td></tr>
<tr><td>5</td><td>访谈日期</td><td>2015年前的日期为平板时钟错误，予以忽略；日期仅作描述，不进入模型。</td><td>{{b_date_bad}}行日期为2000-01-02；有效范围{{b_d0}}至{{b_d1}}</td><td>{{e_d0}}至{{e_d1}}</td></tr>
<tr><td>6</td><td>年龄</td><td>优先顺序：报告年龄（&gt;110剔除）→ 估计年龄 → 由出生日期与访谈日期推算（0–110岁）。分组为&lt;5、5–14、15+。</td><td>报告{{b_age_rep}}人（剔除1个值600），估计{{b_age_apx}}人，出生日期推算{{b_age_dob}}人，缺失{{b_age_miss}}人</td><td>报告{{e_age_rep}}人，估计{{e_age_apx}}人，出生日期推算{{e_age_dob}}人，缺失{{e_age_miss}}人</td></tr>
<tr><td>7</td><td>疟疾RDT（结局）</td><td>基线为文本“positive/negative”；终线编码1/2。空白=未检测；未检测者不计入感染率。</td><td>受检{{b_rdt_n}}人；空白{{b_rdt_blank}}</td><td>受检{{e_rdt_n}}人；缺失{{e_rdt_miss}}</td></tr>
<tr><td>8</td><td>镜检</td><td>恶性疟原虫1=是，2=否；其他编码（9、0）设为缺失。仅用于RDT与镜检一致性核查。</td><td>9个无效编码设为缺失</td><td>–</td></tr>
<tr><td>9</td><td>“不知道”</td><td>发热、就医与蚊帐使用中的编码98设为缺失。</td><td>发热{{b_fever_dk}}；就医{{b_seek_dk}}；蚊帐{{b_net_dk}}</td><td>就医{{e_seek_dk}}；蚊帐缺失{{e_net_miss}}</td></tr>
<tr><td>10</td><td>就医地点</td><td>仅询问发热且就医者。多选答案取第一个编码。归类：公立医院/卫生中心/诊所；私立或教会机构；药店（duka la dawa）；普通商店；社区卫生员、现场工作人员、流动诊所或传统医者。</td><td>多选答案{{b_where_multi}}个</td><td>–</td></tr>
<tr><td>11</td><td>外出</td><td>过去一个月离村外出。基线该题仅{{b_travel_ans}}人作答，故外出分析仅用终线。</td><td>未分析</td><td>全部作答</td></tr>
<tr><td>12</td><td>住房</td><td>改良地面=木板、水磨石或水泥；改良屋顶=瓦、混凝土、铁皮或石棉；改良墙体=石、水泥或砖。“其他”（99）与“不知道”（98）计为未改良。基线窗纱编码3（无窗）设为缺失。</td><td>编码3：{{b_screen3}}行</td><td>–</td></tr>
<tr><td>13</td><td>分析样本</td><td>调整模型采用年龄组、性别、蚊帐使用和财富五分位均完整的个案。</td><td>受检{{tst_b}}人中{{adj_b}}人</td><td>受检{{tst_e}}人中{{adj_e}}人</td></tr>
</tbody></table>`] },

{ id: "m-vars", open: false,
  t: ["Variable definitions", "变量定义"],
  h: [`
<table class="mt"><thead><tr><th>Analysis variable</th><th>Baseline field</th><th>Endline field</th><th>Definition</th></tr></thead><tbody>
<tr><td>RDT positive</td><td><code>mrdtResults</code></td><td><code>mrdt_results</code></td><td>1 = positive, 0 = negative; missing if not tested</td></tr>
<tr><td>Slide positive</td><td><code>pfalciparu</code></td><td><code>Q6_pf</code></td><td><i>P. falciparum</i> on microscopy (concordance check only)</td></tr>
<tr><td>Arm</td><td><code>studyInfoward</code></td><td><code>site</code></td><td>1 = intervention wards, 0 = control wards</td></tr>
<tr><td>Transmission area</td><td><code>studyInfoward</code></td><td><code>tr_intensity</code></td><td>Chumbi/Mohoro (high) vs Ikwiriri area (lower), intervention arm only</td></tr>
<tr><td>Age group</td><td><code>age</code>, <code>ageApprox</code>, <code>dob</code></td><td><code>age</code>, <code>age_approx</code>, <code>Dob</code></td><td>&lt;5, 5–14, 15+ years (see cleaning step 6)</td></tr>
<tr><td>Male</td><td><code>sex</code></td><td><code>Sex</code></td><td>1 = male, 0 = female</td></tr>
<tr><td>Slept under a net</td><td><code>sleptUnderNet</code></td><td><code>slept_under_net</code></td><td>Previous night; 98 set missing</td></tr>
<tr><td>Has a net / household owns a net</td><td><code>hasNet</code> / <code>householdInfonet</code></td><td><code>has_net</code> / <code>mosquito_net</code></td><td>Person-level and household-level ownership</td></tr>
<tr><td>Recent fever</td><td><code>fever</code></td><td><code>q_fever</code></td><td>Fever in the past 14 days</td></tr>
<tr><td>Sought care</td><td><code>seekTreatment</code></td><td><code>seek_treatment</code></td><td>Among those with fever</td></tr>
<tr><td>Travelled</td><td>–</td><td><code>out_of_village</code></td><td>Travelled outside the village (endline only)</td></tr>
<tr><td>MDA participation</td><td>–</td><td><code>q5p_mda</code>, <code>tk_med_MDA</code></td><td>Household took part; person took DHA-PPQ (Umwe, Mgomba)</td></tr>
<tr><td>Wealth quintile</td><td colspan="2">21 items (see wealth index)</td><td>Q1 poorest … Q5 richest, pooled cut points</td></tr>
</tbody></table>`,
`
<table class="mt"><thead><tr><th>分析变量</th><th>基线字段</th><th>终线字段</th><th>定义</th></tr></thead><tbody>
<tr><td>RDT阳性</td><td><code>mrdtResults</code></td><td><code>mrdt_results</code></td><td>1=阳性，0=阴性；未检测为缺失</td></tr>
<tr><td>镜检阳性</td><td><code>pfalciparu</code></td><td><code>Q6_pf</code></td><td>镜检恶性疟原虫（仅用于一致性核查）</td></tr>
<tr><td>分组</td><td><code>studyInfoward</code></td><td><code>site</code></td><td>1=干预乡，0=对照乡</td></tr>
<tr><td>传播区域</td><td><code>studyInfoward</code></td><td><code>tr_intensity</code></td><td>Chumbi/Mohoro（高）与Ikwiriri片区（较低），仅干预组</td></tr>
<tr><td>年龄组</td><td><code>age</code>、<code>ageApprox</code>、<code>dob</code></td><td><code>age</code>、<code>age_approx</code>、<code>Dob</code></td><td>&lt;5、5–14、15+岁（见清洗步骤6）</td></tr>
<tr><td>男性</td><td><code>sex</code></td><td><code>Sex</code></td><td>1=男，0=女</td></tr>
<tr><td>前夜使用蚊帐</td><td><code>sleptUnderNet</code></td><td><code>slept_under_net</code></td><td>前一晚；98设为缺失</td></tr>
<tr><td>个人/家庭拥有蚊帐</td><td><code>hasNet</code> / <code>householdInfonet</code></td><td><code>has_net</code> / <code>mosquito_net</code></td><td>个人层面与家庭层面拥有</td></tr>
<tr><td>近期发热</td><td><code>fever</code></td><td><code>q_fever</code></td><td>近14天发热</td></tr>
<tr><td>就医</td><td><code>seekTreatment</code></td><td><code>seek_treatment</code></td><td>限发热者</td></tr>
<tr><td>外出</td><td>–</td><td><code>out_of_village</code></td><td>曾离村外出（仅终线）</td></tr>
<tr><td>群体服药</td><td>–</td><td><code>q5p_mda</code>、<code>tk_med_MDA</code></td><td>家庭参与；个人服用DHA-PPQ（Umwe、Mgomba）</td></tr>
<tr><td>财富五分位</td><td colspan="2">21项指标（见财富指数）</td><td>Q1最贫 … Q5最富，合并样本切点</td></tr>
</tbody></table>`] },

{ id: "m-wealth", open: false, wealth: true,
  t: ["Wealth index", "财富指数"],
  h: [`
<p>Each household contributes one record ({{w_hh}} households across both rounds). The 21 binary items below were standardised and combined with principal component analysis on the pooled data, so one scale applies to both rounds. The first component explains {{w_pc1}}% of variance (second: {{w_pc2}}%). Its sign is set so that owning a motorcycle raises the score. No item had missing values after recoding, so mode imputation was not triggered. Households are cut into quintiles at the pooled 20th, 40th, 60th and 80th percentiles ({{w_cuts}}). Livestock items load near zero and contribute almost nothing.</p>`,
`
<p>每户一条记录（两轮合计{{w_hh}}户）。下列21项二分类指标经标准化后，在合并数据上进行主成分分析，使两轮采用同一尺度。第一主成分解释{{w_pc1}}%的方差（第二主成分{{w_pc2}}%），方向设定为拥有摩托车者得分更高。重新编码后各指标均无缺失，未触发众数插补。按合并样本第20、40、60、80百分位（{{w_cuts}}）将家庭五等分。牲畜类指标载荷接近零，几乎无贡献。</p>`] },

{ id: "m-stats", open: false,
  t: ["Statistical analysis", "统计分析"],
  h: [`
<p><b>Prevalence.</b> RDT prevalence is the mean of the binary outcome among people tested; its 95% CI uses a household-clustered sandwich standard error (equivalent to a GEE with identity link and independence working correlation).</p>
<p><b>Difference-in-differences.</b> For person <i>i</i> in household <i>h</i> in round <i>t</i>:</p>
<div class="eq">logit Pr(y<sub>iht</sub> = 1) = β<sub>0</sub> + β<sub>1</sub>·Endline<sub>t</sub> + β<sub>2</sub>·Arm<sub>h</sub> + β<sub>3</sub>·(Endline<sub>t</sub> × Arm<sub>h</sub>) + γ′X<sub>iht</sub></div>
<p>exp(β<sub>3</sub>) is the DiD odds ratio. The same specification with an identity link (linear probability model) gives β<sub>3</sub> in percentage points. X contains age group (5–14, 15+ vs &lt;5), sex, net use the previous night and wealth quintile (Q2–Q5 vs Q1); crude models omit X. Logistic models are fitted by Newton–Raphson.</p>
<p><b>Standard errors.</b> Cluster-robust (sandwich) by household with the small-sample factor G/(G−1) × (N−1)/(N−K); 95% Wald intervals; two-sided p-values from the normal distribution. The adjusted model has {{adj}} people in {{adj_hh}} households.</p>
<p><b>Counterfactual.</b> Expected intervention prevalence at endline = intervention baseline × (control endline ÷ control baseline). The headline reduction compares the observed endline prevalence with this value.</p>
<p><b>Sensitivity and subgroups.</b> (1) Crude vs adjusted. (2) Same-village restriction: only the {{n_common}} villages sampled in both rounds. (3) Transmission area: each intervention area against all control wards. (4) Subgroups: the adjusted model refitted within age group, sex, wealth quintile and net use, dropping the covariate that defines the subgroup. (5) Risk factors: one pooled logistic model adding open eaves, window screens and improved floor, roof and walls.</p>
<p><b>Other estimates.</b> Net cascade, fever, care-seeking and travel are proportions with household-clustered CIs. Travel odds ratio: endline-only logistic model with arm, travel, age group, sex, net use and wealth. RDT–slide agreement: Cohen's κ from the 2×2 table, with expected double-positives = (RDT+ × slide+) ÷ N.</p>
<p><b>Software.</b> Python 3 with pandas and NumPy; estimators written in <code>stats.py</code> without external statistics packages. Results were checked against the published positive counts (1,103 · 967 · 621 · 163) and odds ratio (0.34).</p>`,
`
<p><b>感染率。</b>RDT感染率为受检者二分类结局的均值；95%置信区间采用按家庭聚类的三明治标准误（等价于恒等连接、独立工作相关矩阵的GEE）。</p>
<p><b>双重差分。</b>对于第<i>t</i>轮、家庭<i>h</i>中的个体<i>i</i>：</p>
<div class="eq">logit Pr(y<sub>iht</sub> = 1) = β<sub>0</sub> + β<sub>1</sub>·终线<sub>t</sub> + β<sub>2</sub>·分组<sub>h</sub> + β<sub>3</sub>·(终线<sub>t</sub> × 分组<sub>h</sub>) + γ′X<sub>iht</sub></div>
<p>exp(β<sub>3</sub>)为双重差分比值比。采用恒等连接的同一设定（线性概率模型）得到以百分点表示的β<sub>3</sub>。X包括年龄组（5–14、15+对比&lt;5）、性别、前夜蚊帐使用及财富五分位（Q2–Q5对比Q1）；未调整模型不含X。logistic模型以Newton–Raphson法拟合。</p>
<p><b>标准误。</b>按家庭聚类的稳健（三明治）标准误，小样本校正因子G/(G−1) × (N−1)/(N−K)；95% Wald区间；双侧p值基于正态分布。调整模型纳入{{adj_hh}}户{{adj}}人。</p>
<p><b>反事实。</b>干预组终线预期感染率 = 干预组基线 ×（对照组终线 ÷ 对照组基线）。主要降幅为观察到的终线感染率与该值之比。</p>
<p><b>敏感性与亚组分析。</b>（1）未调整与调整模型。（2）相同村庄：仅限两轮均抽样的{{n_common}}个村。（3）传播区域：各干预片区分别对比全部对照乡。（4）亚组：在年龄组、性别、财富五分位及蚊帐使用各亚组内重新拟合调整模型，并去除定义该亚组的协变量。（5）风险因素：在合并logistic模型中加入屋檐开放、窗纱及改良地面、屋顶、墙体。</p>
<p><b>其他估计。</b>蚊帐覆盖链、发热、就医与外出为比例，置信区间按家庭聚类。外出比值比：仅终线的logistic模型，含分组、外出、年龄组、性别、蚊帐使用与财富。RDT与镜检一致性：基于2×2表计算Cohen κ，随机预期双阳性数 =（RDT阳性 × 镜检阳性）÷ N。</p>
<p><b>软件。</b>Python 3（pandas、NumPy）；估计量在 <code>stats.py</code> 中自行实现，未使用外部统计包。结果已与已发表的阳性数（1,103 · 967 · 621 · 163）及比值比（0.34）核对。</p>`] },

{ id: "m-fac", open: false,
  t: ["Facility registers and community screening", "卫生机构登记与社区筛查数据处理"],
  h: [`
<table class="mt steps"><thead><tr><th>#</th><th>Step</th><th>Rule and result</th></tr></thead><tbody>
<tr><td>1</td><td>Layout</td><td>Two blocks on sheet 1: lower-transmission area (Ikwiriri HC, Arafa, Faraja, Mico, Mission, AMELAB) and high-transmission area (Mohoro HC, Arafa, Ndundutawa, Kiwanga, Chumbi), 42 reporting periods each, November 2015 – October 2016. Each facility has suspected tested, positive and positivity columns; positivity is recomputed from counts.</td></tr>
<tr><td>2</td><td>Period labels</td><td>Free-text labels (e.g. “14.12.15-3.1.16”) parsed into start and end dates. Fixed: {{lab_irr}}. Four periods span 2–4 weeks ({{multi}}); counts are divided by days × 7 when shown per week, positivity is unaffected.</td></tr>
<tr><td>3</td><td>Totals check</td><td>Row sums against the workbook's own total rows. Lower area: {{low_s}} tested (total row {{low_ts}}), {{low_p}} positive (total row {{low_tp}}). High area: {{hi_s}} tested (total row {{hi_ts}}), {{hi_p}} positive (total row {{hi_tp}}). The small gaps are in the workbook totals; row values are used.</td></tr>
<tr><td>4</td><td>Completeness</td><td>A period with zero suspected cases is treated as not reported: AMELAB {{z_amelab}}/42, Ndundutawa {{z_ndu}}/42, Kiwanga {{z_kiw}}/42, Chumbi {{z_chu}}/42; all other facilities 42/42.</td></tr>
<tr><td>5</td><td>Duplicate row</td><td>Mohoro HC, 7–13 Dec 2015 ({{dup}}) is identical to Ikwiriri HC's November 2015 row. Kept, flagged on the chart.</td></tr>
<tr><td>6</td><td>FSAT log</td><td>{{fs_low_rows}} hamlet-visit rows in the lower area and {{fs_hi_rows}} in the high area. Merged cells for date and village are carried down. Totals reproduce the workbook exactly: {{fs_low}} and {{fs_hi}} (screened, positive).</td></tr>
<tr><td>7</td><td>Hamlet names</td><td>Spelling variants unified before counting visits: Msikiti/Msikitini, Nyalindi/Nyarindi, Ngansinda/Ngasinda, Kwampakaliwa/Mpakilwa, Mpima road/Mpima; village prefixes “Centre/Center/Central” merged. Visit number = order of screening date within a hamlet; visits 3+ are pooled.</td></tr>
<tr><td>8</td><td>Implausible rows</td><td>{{fs_gtpop}} rows report more people screened than the hamlet population and {{fs_gthh}} rows more households screened than listed. Kept as recorded.</td></tr>
</tbody></table>`,
`
<table class="mt steps"><thead><tr><th>#</th><th>步骤</th><th>规则与结果</th></tr></thead><tbody>
<tr><td>1</td><td>表格结构</td><td>第1个工作表分两块：较低传播区（Ikwiriri卫生中心、Arafa、Faraja、Mico、Mission、AMELAB）与高传播区（Mohoro卫生中心、Arafa、Ndundutawa、Kiwanga、Chumbi），各42个报告周期，2015年11月至2016年10月。每家机构含疑似检测数、阳性数与阳性率；阳性率由计数重新计算。</td></tr>
<tr><td>2</td><td>周期标签</td><td>自由文本标签（如“14.12.15-3.1.16”）解析为起止日期。修正：{{lab_irr}}。4个周期跨2–4周（{{multi}}）；按周展示时计数除以天数×7，阳性率不受影响。</td></tr>
<tr><td>3</td><td>合计核对</td><td>逐行求和与表内合计行比较。较低传播区：检测{{low_s}}（合计行{{low_ts}}），阳性{{low_p}}（合计行{{low_tp}}）。高传播区：检测{{hi_s}}（合计行{{hi_ts}}），阳性{{hi_p}}（合计行{{hi_tp}}）。微小差异来自表内合计，分析采用逐行数值。</td></tr>
<tr><td>4</td><td>报告完整性</td><td>疑似病例为零的周期视为未报告：AMELAB {{z_amelab}}/42，Ndundutawa {{z_ndu}}/42，Kiwanga {{z_kiw}}/42，Chumbi {{z_chu}}/42；其余机构均为42/42。</td></tr>
<tr><td>5</td><td>重复记录</td><td>Mohoro卫生中心2015年12月7–13日（{{dup}}）与Ikwiriri卫生中心2015年11月数据完全相同。予以保留，并在图中标记。</td></tr>
<tr><td>6</td><td>FSAT记录</td><td>较低传播区{{fs_low_rows}}条、高传播区{{fs_hi_rows}}条村组筛查记录。日期与村名的合并单元格向下填充。合计与表内完全一致：{{fs_low}}与{{fs_hi}}（筛查数、阳性数）。</td></tr>
<tr><td>7</td><td>村组名称</td><td>统计复访前统一拼写变体：Msikiti/Msikitini、Nyalindi/Nyarindi、Ngansinda/Ngasinda、Kwampakaliwa/Mpakilwa、Mpima road/Mpima；村名前缀“Centre/Center/Central”合并。复访次数=同一村组内按筛查日期排序的序号；第3次及以后合并。</td></tr>
<tr><td>8</td><td>不合理记录</td><td>{{fs_gtpop}}条记录筛查人数超过村组人口，{{fs_gthh}}条筛查户数超过登记户数。按原记录保留。</td></tr>
</tbody></table>`] },

{ id: "m-geo", open: false,
  t: ["Maps and village linkage", "地图与村庄匹配"],
  h: [`
<ul>
<li><b>Name matching.</b> {{n_name}} of {{n_vil}} survey village names match a polygon in the Rufiji/Kibiti boundary file directly or through spelling aliases (Muhoro → Mohoro, Ndundu Tawa → Ndundutawa, Kingwila → Kingwira, Zimbwini → Zimwini). Muhoro Magharibi and Muhoro Mashariki share the single Mohoro polygon.</li>
<li><b>GPS placement.</b> The remaining {{n_gps}} names are placed in the polygon that contains most of their endline households: King'ongo and Shela → Mohoro, Mbebetini → Sokoni, Mangombela → Bungu A.</li>
<li><b>GPS validation.</b> All {{gps_n}} endline households were tested with a point-in-polygon check: {{gps_in}}% fall inside a village polygon, {{gps_w}}% inside the ward recorded on the form and {{gps_v}}% inside the recorded village. Household coordinates are used only for this check and are not published.</li>
<li><b>Geometry.</b> Coordinates snapped to 0.00001° so shared borders match exactly; vertices where the set of neighbouring polygons changes are fixed, and the lines between them are simplified with Douglas–Peucker at 0.0012° (about 130 m). This keeps shared borders identical, with no gaps or slivers. Village vertices fell from {{v0}} to {{v1}}.</li>
<li><b>Display.</b> Planar projection (latitude reflected), adequate at this scale. Prevalence classes: 0–5, 5–10, 10–15, 15–20, 20–30, 30–40, 40%+; net-use classes in 10-point steps from 40%. Phase I/II arms come from Table 1 of the study-area file.</li>
</ul>`,
`
<ul>
<li><b>名称匹配。</b>{{n_vil}}个调查村名中，{{n_name}}个可直接或经拼写别名（Muhoro → Mohoro、Ndundu Tawa → Ndundutawa、Kingwila → Kingwira、Zimbwini → Zimwini）匹配到鲁菲吉/基比蒂边界文件中的多边形。Muhoro Magharibi与Muhoro Mashariki共用Mohoro多边形。</li>
<li><b>GPS定位。</b>其余{{n_gps}}个村名归入包含其多数终线家庭的多边形：King'ongo与Shela → Mohoro，Mbebetini → Sokoni，Mangombela → Bungu A。</li>
<li><b>GPS核验。</b>对全部{{gps_n}}户终线家庭做点面包含检验：{{gps_in}}%位于某一村多边形内，{{gps_w}}%位于问卷记录的乡内，{{gps_v}}%位于记录的村内。家庭坐标仅用于此核验，不予公开。</li>
<li><b>几何处理。</b>坐标对齐至0.00001°以使共享边界完全重合；相邻多边形集合发生变化的顶点保持固定，其间线段以Douglas–Peucker法按0.0012°（约130米）简化，使共享边界保持一致、无缝隙。村级顶点由{{v0}}个减少至{{v1}}个。</li>
<li><b>显示。</b>平面投影（纬度翻转），在此尺度下足够精确。感染率分级：0–5、5–10、10–15、15–20、20–30、30–40、40%以上；蚊帐使用率自40%起每10个百分点一级。一期/二期分组来自研究区域文件表1。</li>
</ul>`] },

{ id: "m-lim", open: false,
  t: ["Limitations", "局限性"],
  h: [`
<ul>
<li>Non-randomised design with two intervention and two control ward groups; household-clustered CIs understate uncertainty at ward level, where only four clusters exist.</li>
<li>Independent cross-sections, not a cohort; the sampled villages changed between rounds (7 baseline-only, 7 endline-only).</li>
<li>Rounds differ in season: baseline September–December, endline March–April. The DiD removes season effects shared by both arms but not arm-specific ones.</li>
<li>About one person in five was not tested; prevalence assumes testing is unrelated to infection within arm and round.</li>
<li>HRP2-based RDTs can stay positive for weeks after treatment, which may overstate infection where reactive treatment was recent.</li>
<li>An MDA with DHA-PPQ in Umwe and Mgomba is recorded at endline but not described in the published evaluation; it may contribute to the lower-transmission result.</li>
<li>Endline microscopy does not agree with RDT beyond chance and is not used.</li>
<li>Facility data cover the intervention area only, so they describe trends and cannot estimate effects.</li>
</ul>`,
`
<ul>
<li>非随机设计，干预与对照各仅两组乡；乡级仅有4个聚类，按家庭聚类的置信区间低估了乡级不确定性。</li>
<li>两轮为独立横断面而非队列；两轮抽样村庄有变化（7个仅基线、7个仅终线）。</li>
<li>两轮季节不同：基线为9–12月，终线为3–4月。双重差分可消除两组共有的季节效应，但不能消除分组特有的季节效应。</li>
<li>约五分之一的受访者未接受检测；感染率估计假定同一分组与轮次内是否检测与感染无关。</li>
<li>基于HRP2的RDT在治疗后数周内可能仍呈阳性，在近期开展过反应式治疗的地区可能高估感染。</li>
<li>终线记录了Umwe与Mgomba的DHA-PPQ群体服药，但已发表评估未提及，可能影响较低传播区的结果。</li>
<li>终线镜检与RDT的一致性不超过随机水平，未予使用。</li>
<li>机构数据仅覆盖干预地区，只能描述趋势，不能估计效果。</li>
</ul>`] },

{ id: "m-repro", open: false,
  t: ["Reproducibility and privacy", "可重复性与隐私"],
  h: [`
<table class="mt"><thead><tr><th>Script</th><th>What it does</th><th>Output</th></tr></thead><tbody>
<tr><td><code>01_harmonize.py</code></td><td>Cleans and harmonises both surveys (steps 1–12), builds the wealth index</td><td><code>~/tmp/D.pkl</code> (individual-level, kept outside the shared folder)</td></tr>
<tr><td><code>02_analysis.py</code></td><td>Prevalence, DiD, subgroups, equity, nets, care, MDA, microscopy, travel</td><td><code>survey_results.json</code></td></tr>
<tr><td><code>03_facility.py</code></td><td>Facility registers and FSAT rounds</td><td><code>facility_results.json</code></td></tr>
<tr><td><code>04_village_link.py</code></td><td>Village–polygon linkage and GPS validation</td><td><code>village_link.json</code></td></tr>
<tr><td><code>05_cleaning_log.py</code></td><td>Recomputes every count in this methods record</td><td><code>cleaning_log.json</code></td></tr>
<tr><td><code>portal/build_geo.py</code>, <code>assemble.py</code>, <code>build.py</code></td><td>Simplifies boundaries, merges results, writes the page</td><td><code>index.html</code></td></tr>
</tbody></table>
<p>Run the scripts in order from the <code>analysis_scripts</code> folder next to <code>data sharing</code>. The portal and all JSON outputs hold aggregates only: no names, household IDs or household coordinates. Add <code>#zh</code> to the link for Chinese or <code>#en</code> for English.</p>`,
`
<table class="mt"><thead><tr><th>脚本</th><th>功能</th><th>输出</th></tr></thead><tbody>
<tr><td><code>01_harmonize.py</code></td><td>清洗并统一两轮调查（步骤1–12），构建财富指数</td><td><code>~/tmp/D.pkl</code>（个体层面，存放于共享文件夹之外）</td></tr>
<tr><td><code>02_analysis.py</code></td><td>感染率、双重差分、亚组、公平性、蚊帐、就医、群体服药、镜检、外出</td><td><code>survey_results.json</code></td></tr>
<tr><td><code>03_facility.py</code></td><td>卫生机构登记与FSAT筛查</td><td><code>facility_results.json</code></td></tr>
<tr><td><code>04_village_link.py</code></td><td>村庄与多边形匹配及GPS核验</td><td><code>village_link.json</code></td></tr>
<tr><td><code>05_cleaning_log.py</code></td><td>重新计算本方法记录中的全部计数</td><td><code>cleaning_log.json</code></td></tr>
<tr><td><code>portal/build_geo.py</code>、<code>assemble.py</code>、<code>build.py</code></td><td>简化边界、合并结果、生成页面</td><td><code>index.html</code></td></tr>
</tbody></table>
<p>在 <code>data sharing</code> 旁的 <code>analysis_scripts</code> 文件夹中按顺序运行。门户及全部JSON输出仅含汇总数据，不含姓名、家庭编号或家庭坐标。在链接后加 <code>#zh</code> 打开中文版，加 <code>#en</code> 打开英文版。</p>`] },

{ id: "m-ver", open: false,
  t: ["Version history", "版本记录"],
  h: [`
<ul>
<li><b>v2 · 26 Oct 2026.</b> Detailed methods and data-cleaning record added (sample flow, 13 cleaning steps with counts, variable dictionary, wealth-index loadings, model equations, facility and map processing). Cleaning audit script <code>05_cleaning_log.py</code> added. Version label added to the footer.</li>
<li><b>v1 · 26 Oct 2026.</b> First release: ten findings, impact, subgroups, village map, prevention and equity, fever and care, facilities, data quality.</li>
</ul>`,
`
<ul>
<li><b>v2 · 2026年10月26日。</b>新增详细方法与数据清洗记录（样本流程、13个清洗步骤及计数、变量字典、财富指数载荷、模型公式、机构与地图数据处理）。新增清洗核查脚本 <code>05_cleaning_log.py</code>。页脚新增版本标识。</li>
<li><b>v1 · 2026年10月26日。</b>首次发布：十项发现、干预效果、亚组、村庄地图、预防与公平、发热与就医、卫生机构、数据质量。</li>
</ul>`] },
];
