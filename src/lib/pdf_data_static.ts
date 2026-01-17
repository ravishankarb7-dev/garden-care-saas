export const PDF_STATIC_DATA: Record<string, string> = {
    "28_Day_Stabilization_Primary_Advisory_v2.pdf": `
28-Day Plant Stabilization Schedule (Primary Advisory)
Purpose: This document defines the survival-critical and establishment-critical care logic for the first 28 days
after purchase or planting. It is designed as a conservative, agent-readable reference. Category-specific PDFs
provide additional nuance but must not contradict this baseline.
Global Guardrails (Always Enforced – P1)
1 Plant only when soil is workable (not frozen, not waterlogged).
2 Water based on soil/root-zone moisture, not on the calendar.
3 Avoid quick-release fertilizer at planting or during heat/drought stress.
4 Pause irrigation after heavy rain; standing water beyond ~24 hours is a drainage failure.
5 If advice conflicts: survival rules override optimization advice.
Day 0 (Planting Day) – P1
1 Plant at correct depth (root flare or crown at soil surface unless species-specific guidance says otherwise).
2 Eliminate air pockets; ensure firm soil-root contact.
3 Water in thoroughly until the entire root ball and surrounding soil are saturated.
4 Apply mulch 2–3 inches deep where appropriate; keep mulch off stems/crowns.
5 Do NOT fertilize at planting unless a labeled starter solution is explicitly recommended.
Days 1–7 (Acute Establishment Window) – P1
1 Check soil moisture daily; water deeply whenever the root zone begins to dry.
2 Containers may require multiple moisture checks per day in heat or wind.
3 Avoid shallow, frequent sprinkling; water at the base.
4 Provide temporary shade or wind protection if plants wilt during extreme conditions.
5 Do not prune except for dead or broken tissue.
Days 8–14 (Early Root Expansion) – P1 / P2
1 Continue frequent moisture checks; many plants still require daily or every-other-day watering.
2 Allow slight surface drying between waterings, but never allow the root ball to dry out.
3 Inspect for early pest pressure (aphids, mites, slugs); intervene conservatively.
4 Avoid fertilizing unless plants are actively growing AND soil/media was not pre-fertilized.
Days 15–21 (Stabilization Phase) – P2
1 Begin extending time between waterings if soil moisture remains stable.
2 Water deeply; avoid reverting to shallow watering.
3 Light, dilute feeding may be considered ONLY if growth is active and conditions are mild.
4 Continue weed suppression to reduce competition for water.
Days 22–28 (Transition to Establishment) – P2
1 Shift from daily checks to weather-responsive monitoring.
2 Water when soil begins to dry at depth; avoid calendar-only schedules.
3 Do not increase fertilizer rates; overfeeding during early establishment causes long-term stress.
4 Remove temporary supports/shade gradually if used.
Weather & Seasonal Overrides (Always P1)
1 Heat waves: increase watering frequency; provide temporary shade; suspend fertilization.
2 Cold snaps/frost: protect tender plants; water beforehand only if soil is dry and above freezing.
3 Heavy rain: stop irrigation; ensure drainage; pull mulch back if soil remains wet.
4 Winter dry periods (evergreens): water on mild days if soil is not frozen.
Failure Signals vs Normal Adjustment – P1
1 Normal: mild wilting immediately after planting that recovers after watering; temporary leaf drop.
2 Warning: persistent wilt with wet soil, stem collapse, progressive browning or blackening.
3 Action: treat wet-soil wilt as drainage failure, not drought.
Operationalization Notes (For Product Implementation)
1 Add machine-readable tokens (e.g., DAY_RANGE, PRIORITY, OVERRIDE_TYPE) to each rule for
deterministic parsing.
2 Map this baseline directly to rule objects; category-specific logic may narrow but must not violate P1
guardrails.
3 Validate this baseline with extension faculty before locking v1 as a source-of-truth artifact.
End of primary stabilization window. After Day 28, transition to category-specific guidance and long-term care rules.
`
    ,
    "Vegetable_Starts_Agent_Grade_Priority.pdf": `
Vegetable Starts — Agent - Grade Care Narrative(Priority
Tagged)
Purpose: agent - readable horticultural narrative for generating care schedules and cautions.Priority tags:
P1 = survival - critical, P2 = establishment success, P3 = optimization, P4 = advanced / reference.P1 statements are
conservative and exception - aware.
    A.Site & Light Requirements(P1)
• Most fruiting vegetables need full sun(6–8 + hours).
• Insufficient sun reduces yield and increases disease risk.
    B.Temperature & Climate Constraints(P1)
• Use soil temperature to time planting.
• Cool - season benchmark: ~50°F(10°C) soil for many cool - season crops.
• Warm - season crops(tomato / pepper / basil): soil ³60°F(16°C); tomatoes ideally 65–70°F(18–21°C).
• Protect from frost / cold nights; cold soil stalls roots and increases rot risk.
    C.Seasonal Timing / Planting Window(P1)
• Warm - season transplants: plant after last frost and only when soil temps meet thresholds.
• Cool - season transplants: plant earlier when soil temps permit.
• Avoid planting into cold, waterlogged soil.
• Avoid transplanting immediately before multi - day heat wave unless irrigation / shade is available.
    D.Watering & Moisture Profile(Day 0–30)(P1)
• Day 0: water in thoroughly; ensure good soil - root contact.
• First week: keep evenly moist; check daily(more often in heat / wind).
• After week 1: water deeply when top 1–2 inches are dry; avoid chronic saturation.
• Water at base; avoid wetting foliage late in day.
    E.Soil Requirements(P2)
• Well - drained, fertile soil; incorporate compost broadly.
• Raised beds improve drainage and soil warming.
    F.Planting & Installation Rules(P1)
• Correct depth varies by crop(tomatoes can be deeper; many others at pot depth).
• Firm soil around roots; eliminate air gaps.
• Mulch after soil has warmed for warm - season crops to avoid keeping soil cold.
    G.Fertilization Guidance(P2)
• A dilute starter fertilizer is commonly used for transplants; apply only at label - safe dilution to avoid burn.
• Do not over - fertilize; burn damage is common.
• Delay stronger feeding until plants resume active growth.
    H.Pest & Disease Risk(Early Window)(P2)
• Inspect for cutworms / aphids; use collars for cutworms where common.
• Cold, wet conditions increase rot risk; prioritize drainage and soil warmth.
    I.Weed Competition Sensitivity(P2)
• Keep weed - free early; weeds compete and harbor pests.
    J.Weather Exception Handling(P1)
• Frost: cover overnight; remove in morning.
• Heat wave: provide afternoon shade; increase watering; avoid fertilizing during heat stress.
• Heavy rain: ensure drainage; avoid working wet soil(compaction).
    K.Growth & Establishment Signals(P2)
• Normal: slight wilt on planting day; recovery within hours after watering.
• Concerning: persistent wilt with moist soil, stem collapse, fast - spreading discoloration.
    L.Safety & Customer Guardrails(P1)
• Do not plant warm - season crops into cold soil.
• Do not apply fertilizer to dry soil; water first.
    M.Location - Based Modifiers(P2)
• Short seasons: use soil thermometer and row covers; time mulch for warming.
• Hot / humid: prioritize airflow and early - day watering.
    N.Lifecycle Transition(Post 30 Days)(P4)
• Move to crop - specific schedules(staking, pruning, feeding) after establishment.
`
    ,
    "General_Annuals_Agent_Grade_Priority.pdf": `
Annual Flowering Plants — Agent - Grade Care Narrative
    (Priority Tagged)
Purpose: agent - readable horticultural narrative for generating care schedules and cautions.Priority tags:
P1 = survival - critical, P2 = establishment success, P3 = optimization, P4 = advanced / reference.P1 statements are
conservative and exception - aware.
    A.Site & Light Requirements(P1)
• Match tag: many bedding annuals require full sun; some prefer shade / part shade.
• Wrong light leads to rapid failure(wilting / scorch) or poor bloom.
    B.Temperature & Climate Constraints(P1)
• Plant frost - sensitive annuals only after frost risk has passed.
• Heat stress: in very hot weather, containers may require daily to twice - daily watering.
    C.Seasonal Timing / Planting Window(P1)
• For frost - sensitive annuals: plant after last frost and when nights are reliably mild.
• Avoid planting into cold, saturated soil; growth stalls and roots rot.
• Mid - summer planting is high - risk without consistent irrigation / shade management.
    D.Watering & Moisture Profile(Day 0–30)(P1)
• Water in immediately after planting; ensure full root ball saturation.
• Week 1: keep evenly moist(not soggy); check daily(containers may need 1–2 checks / day).
• After week 1: water when top ~1 inch is dry; water thoroughly until excess drains(containers).
• Water at base; avoid routine overhead watering late day.
    E.Soil Requirements(P2)
• Loose, well - drained soil; containers must have drainage holes.
• Mulch reduces evaporation in beds.
    F.Planting & Installation Rules(P1)
• Plant at same depth as in the pot unless species - specific guidance says otherwise.
• Space for airflow; reduce fungal risk.
    G.Fertilization Guidance(P2)
• If soil was not pre - fertilized, a dilute starter solution can be applied about 1 week after transplanting(or per
label).
• Avoid fertilizing dry soil; water first.Avoid over - application(burn risk).
    H.Pest & Disease Risk(Early Window)(P2)
• Aphids / whiteflies: begin with water spray and removal of heavily infested tips.
• Humidity + wet foliage increases disease; prefer morning base - watering.
    I.Weed Competition Sensitivity(P2)
• Remove weeds early; mulch where appropriate.
    J.Weather Exception Handling(P1)
• Heat wave: increase watering frequency; provide afternoon shade for heat - sensitive annuals; prioritize
morning watering.
• Heavy rain: prevent waterlogging; ensure drainage; move containers under cover if possible.
• Cold snap: cover overnight; avoid planting right before a forecast freeze.
    K.Growth & Establishment Signals(P2)
• Normal: mild wilt on first day; recovery after watering within hours.
• Concerning: repeated wilt despite moist soil, stem collapse, leaf scorch expanding daily.
    L.Safety & Customer Guardrails(P1)
• Never let most containers sit in standing water.
• Do not fertilize dry soil; water first.
    M.Location - Based Modifiers(P2)
• Arid / windy: higher evaporation—mulch and wind protection matter.
• Humid / coastal: prioritize spacing / airflow and morning watering.
    N.Lifecycle Transition(Post 30 Days)(P4)
• Move to species - specific maintenance feeding and deadheading schedules.
`
    ,
    "Herbaceous_Perennials_Agent_Grade_Priority.pdf": `
Perennial Flowering Plants — Agent - Grade Care Narrative(Priority Tagged)
Purpose: agent - readable horticultural narrative for generating care schedules and cautions.Priority tags:
P1 = survival - critical, P2 = establishment success, P3 = optimization, P4 = advanced / reference.P1 statements are
conservative and exception - aware.
    A.Site & Light Requirements(P1)
• Species varies: follow tag for sun / shade.
• Wrong exposure reduces establishment and bloom.
    B.Temperature & Climate Constraints(P1)
• Plant when soil is workable; avoid frozen / waterlogged soil.
• Heat stress increases transplant failure; avoid planting into prolonged extreme heat.
• Cold zones: allow ~6 weeks before hard freeze for fall plantings.
    C.Seasonal Timing / Planting Window(P1)
• Best: spring or early fall(allow rooting before extremes).
• Avoid planting during peak summer heat without irrigation / shade plan.
• Avoid winter planting in frozen / waterlogged soils; mild climates may plant in winter if soil workable.
    D.Watering & Moisture Profile(Day 0–30)(P1)
• Water in thoroughly at planting.
• First 2 weeks: check moisture daily; water deeply as needed to keep root zone evenly moist.
• After 2 weeks: water when soil begins to dry; avoid saturation(many perennials dislike wet feet).
    E.Soil Requirements(P2)
• Drainage critical for many perennials; consider raised bed in heavy soils.
• pH preferences vary; follow tag for acid - loving or lime - loving species.
    F.Planting & Installation Rules(P1)
• Plant at same depth as in container(crown at soil surface for most perennials).
• Mulch lightly around, not over, the crown.
• Remove only damaged tissue at planting.
    G.Fertilization Guidance(P2)
• Avoid fertilizing heat - or drought - stressed plants.
• Prefer compost / soil prep; fertilize lightly only after new growth indicates rooting.
    H.Pest & Disease Risk(Early Window)(P2)
• Slugs / snails increase in wet conditions; manage with sanitation / barriers.
• Crown rot risk if crowns are buried or soil stays saturated.
    I.Weed Competition Sensitivity(P2)
• Keep weeds down; avoid deep cultivation near new roots.
    J.Weather Exception Handling(P1)
• Heat: temporary shade and more frequent watering; avoid wetting foliage mid - day.
• Frost: cover tender new transplants if a hard freeze is forecast soon after planting.
• Heavy rain: ensure drainage; pull mulch back from crowns if staying wet.
    K.Growth & Establishment Signals(P2)
• Normal: slower growth in year 1; mild dieback after transplant.
• Concerning: mushy crown, persistent wilt with wet soil, rapid blackening of stems.
    L.Safety & Customer Guardrails(P1)
• Do not bury crowns.
• Do not plant into waterlogged soil.
    M.Location - Based Modifiers(P2)
• Cold zones: prioritize spring planting or early fall with winter protection; avoid late fall planting.
• Hot zones: favor fall / winter planting where soil stays workable to reduce heat stress.
    N.Lifecycle Transition(Post 30 Days)(P4)
• Species - specific division / pruning / fertilization after establishment.
`
    ,
    "Deciduous_Flowering_Shrubs_Agent_Grade_Priority.pdf": `
Deciduous Flowering Shrubs — Agent - Grade Care Narrative(Priority Tagged)
Purpose: agent - readable horticultural narrative for generating care schedules and cautions.Priority tags:
P1 = survival - critical, P2 = establishment success, P3 = optimization, P4 = advanced / reference.P1 statements are
conservative and exception - aware.
    A.Site & Light Requirements(P1)
• Match plant tag; many flowering shrubs need full sun to part sun for best bloom; shade reduces flowering.
• Provide afternoon shade for heat - sensitive types in very hot climates if label indicates.
    B.Temperature & Climate Constraints(P1)
• Plant only when soil is workable(not frozen / waterlogged).
• Establishment best in moderate temps; treat prolonged > 90°F(32°C) as high - risk during first month.
• Late frosts can damage early growth / buds; protect if freeze is forecast soon after planting.
    C.Seasonal Timing / Planting Window(P1)
• Best planting: autumn to early spring when soil isn’t extremely wet or frozen.
• Container - grown shrubs can be planted outside that window with higher aftercare.
• Avoid planting in hot / dry weather; avoid peak winter in frozen / waterlogged soils.
• Mild - winter exception: winter planting acceptable if soil workable and irrigation available.
    D.Watering & Moisture Profile(Day 0–30)(P1)
• Water in thoroughly at planting.
• Days 1–14: check moisture daily; water deeply when top few inches are dry.
• Typical establishment schedule: Weeks 1–2 daily; Weeks 3–12 every 2–3 days; then weekly until
established(adjust for rain / soil).
• Avoid soggy soils; pause irrigation after heavy rains.
    E.Soil Requirements(P2)
• Well - drained soil preferred; amend broadly rather than heavily amending only the hole in heavy clay.
• pH varies by species(e.g., hydrangea color effects); follow tag where relevant.
    F.Planting & Installation Rules(P1)
• Root flare at grade; firm soil to eliminate air pockets.
• Mulch 2–3 inches, keep away from stems.
• Do not prune heavily at planting; remove only dead / broken wood(pruning timing depends on bloom habit).
    G.Fertilization Guidance(P1)
• Avoid quick - release fertilizing at planting; rely on good soil prep.
• Fertilize only after establishment / active growth and only when soil moisture is adequate; prefer
slow - release or compost.
    H.Pest & Disease Risk(Early Window)(P2)
• Aphids can appear on tender growth; strong water spray is a first response.
• High humidity + overhead watering can increase foliar disease; water at base.
    I.Weed Competition Sensitivity(P2)
• Maintain a mulched, weed - free ring; hand - pull weeds close to stems to avoid root disturbance.
    J.Weather Exception Handling(P1)
• Heat wave: increase watering frequency; consider temporary shade for stress - prone species.
• Frost: cover tender new growth / buds; water before freeze only if soil is dry and above freezing.
• Heavy rain: pause watering; ensure drainage within 24 hours.
    K.Growth & Establishment Signals(P2)
• Normal: temporary wilt that recovers after watering; slight leaf yellowing from transplant shock.
• Concerning: ongoing wilt in wet soil, blackened stems, rapid leaf drop.
    L.Safety & Customer Guardrails(P1)
• Do not plant into frozen or waterlogged soil.
• Do not prune 'for shape' immediately after planting(can remove flower buds).
• Do not fertilize drought - stressed plants.
    M.Location - Based Modifiers(P2)
• Cold zones: prioritize spring planting or early fall with sufficient time before hard freeze.
• Warm zones: fall / winter planting often preferred to avoid summer stress.
    N.Lifecycle Transition(Post 30 Days)(P4)
• Species - specific pruning and feeding schedules apply after establishment; follow bloom habit(old wood vs
new wood).
`
    ,
    "Evergreen_Shrubs_Agent_Grade_Priority.pdf": `
Evergreen Shrubs — Agent - Grade Care Narrative(Priority Tagged)
Purpose: agent - readable horticultural narrative for generating care schedules and cautions.Priority tags:
P1 = survival - critical, P2 = establishment success, P3 = optimization, P4 = advanced / reference.P1 statements are
conservative and exception - aware.
    A.Site & Light Requirements(P1)
• Acceptable range: full sun to partial shade; match plant tag for best performance.
• Avoid deep shade for sun - preferring evergreens(thin growth, stress).
• Avoid extreme reflected afternoon heat on broadleaf evergreens(leaf scorch risk).
    B.Temperature & Climate Constraints(P1)
• Planting allowed only when soil is workable(not frozen, not waterlogged).
• Minimum soil temperature guideline for planting: ~40°F(4°C) and rising.
• Heat - stress risk increases sharply in hot, dry weather; treat prolonged > 90°F(32°C) as high - risk during
establishment.
• Hard - freeze risk: <28°F(-2°C) shortly after planting increases dehydration / winter burn risk; protect roots
and foliage.
    C.Seasonal Timing / Planting Window(P1)
• Best for most evergreens: autumn or spring(roots establish with less heat stress).
• Container - grown shrubs can be planted outside ideal windows but require substantially more aftercare.
• Avoid planting in hot / dry periods; avoid peak winter when soil is frozen or saturated.
• Winter exception: in mild climates, winter planting is acceptable if soil is workable and irrigation is available
during dry spells.
    D.Watering & Moisture Profile(Day 0–30)(P1)
• Water in thoroughly at planting(Day 0).
• Days 1–14: check soil moisture daily; water deeply when the top few inches are dry and the root ball is not
moist.
• Rule of thumb schedule(adjust to weather / soil): Weeks 1–2: water daily; Weeks 3–12: every 2–3 days;
then weekly until established.
• Water at the base; avoid frequent light sprinkling(encourages shallow roots).
• Avoid saturation: if soil is soggy or standing water persists, pause watering and address drainage.
    E.Soil Requirements(P2)
• Drainage is critical: most evergreens fail in chronically wet soils(root rot).
• Preferred pH varies by species; default safe range for many landscape evergreens is ~6.0–7.0 unless
known acid - loving.
• Improve drainage / structure with organic matter in the planting area; avoid creating a 'pot in a hole' in heavy
clay.
    F.Planting & Installation Rules(P1)
• Set root flare at or slightly above finished grade; never bury the trunk / stem base.
• Loosen circling roots; ensure good soil - root contact(no air pockets).
• Mulch 2–3 inches over the root zone; keep mulch 2–3 inches away from stems / trunks.
• Stake only if necessary(wind exposure / top - heavy); remove supports after establishment.
    G.Fertilization Guidance(P1)
• Avoid quick - release fertilizer at planting; it can inhibit root growth and increase stress.
• Do not fertilize drought - stressed shrubs; fertilize only after adequate rooting, or if a soil test indicates need.
• Safe default: defer fertilization until after establishment(often after the first flush / season), then use
slow - release at label rates.
    H.Pest & Disease Risk(Early Window)(P2)
• Hot / dry stress increases spider mite risk on many evergreens; inspect foliage weekly in heat.
• Overwatering + poor drainage increases root - rot risk; treat persistent wilting with wet soil as a drainage
issue, not a watering deficit.
• Avoid wetting foliage late in the day in humid periods(disease pressure).
    I.Weed Competition Sensitivity(P2)
• Keep a weed - free mulched ring around the root zone to reduce competition for moisture.
• Avoid herbicide contact with green stems and avoid pre - emergents unless label - safe for the plant and
timing.
        J.Weather Exception Handling(P1)
• Heat wave(multiple days of high temps / wind): increase watering frequency; add temporary shade for
broadleaf evergreens.
• Heavy rain: pause irrigation; confirm water drains within 24 hours.
• Frost / hard freeze soon after planting: water before freeze if soil is dry and above freezing; protect with
burlap / frost cloth; refresh mulch.
• Winter dry spell(evergreen): water on a mild day if soil is not frozen and temperatures are above ~40°F.
    K.Growth & Establishment Signals(P2)
• Normal: mild leaf drop, temporary dullness, slight wilt during first days that recovers after watering.
• Concerning: persistent wilting despite moist soil, progressive browning / scorch, dieback at tips.
• Recovery indicator: foliage firms up and new root / terminal growth appears in season.
    L.Safety & Customer Guardrails(P1)
• Never bury the root flare.
• Do not 'sip water' daily—water deeply, then re - water based on moisture check.
• Avoid fertilizing at planting or during drought / heat stress.
    M.Location - Based Modifiers(P2)
• Hot urban / reflective sites: treat as higher heat zone; increase shade and watering vigilance.
• Cold windy exposure: windbreak / burlap for first winter; prioritize fall planting only if adequate time before
hard freezes.
• High rainfall regions: prioritize raised planting and drainage improvements.
    N.Lifecycle Transition(Post 30 Days)(P4)
• After stabilization: shift from establishment schedule to weather - based deep watering; avoid frequent
shallow irrigation.
• Pruning is species - dependent; restrict to dead / damaged wood until established.
`
};