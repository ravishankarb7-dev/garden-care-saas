import { Plant } from "./types";

const BASE_PLANTS: Plant[] = [
    {
        id: "rose-knockout",
        name: "Knock Out® Rose",
        botanicalName: "Rosa 'Radrazz'",
        careSchedule: [
            { day: 0, action: "Water", description: "Water thoroughly at the base until soil is saturated." },
            { day: 3, action: "Check Moisture", description: "Stick finger 1 inch into soil. If dry, water again." },
            { day: 7, action: "Mulch", description: "Apply 2-3 inches of mulch to retain moisture." },
            { day: 14, action: "Fertilize", description: "Apply a balanced rose fertilizer." },
            { day: 21, action: "Stabilization Check", description: "Water deeply if soil is stable. Inspect for early pest pressure." },
            { day: 28, action: "Establishment Transition", description: "Shift to weather-responsive watering. Avoid overfeeding." },
        ],
        troubleshooting: [
            { symptom: "Yellow Leaves", diagnosis: "Overwatering or Drainage Issue", action: "Check soil moisture. Ensure pot/ground drains well." },
            { symptom: "Black Spots on Leaves", diagnosis: "Black Spot Fungus", action: "Remove affected leaves. Avoid overhead watering." },
        ],
    },
    {
        id: "hydrangea-endless-summer",
        name: "Endless Summer Hydrangea",
        botanicalName: "Hydrangea macrophylla",
        careSchedule: [
            { day: 0, action: "Water", description: "Hydrangeas love water! Soak the root ball." },
            { day: 1, action: "Shade Check", description: "Ensure it gets morning sun but afternoon shade." },
            { day: 3, action: "Water", description: "Keep soil consistently moist, not soggy." },
            { day: 21, action: "Deep Soak", description: "Ensure deep soil moisture. Hydrangeas struggle with shallow watering." },
            { day: 28, action: "Monitor", description: "Watch for midday wilt; increase water if persistent." },
        ],
        troubleshooting: [
            { symptom: "Wilting during day", diagnosis: "Heat Stress", action: "Normal in high heat. If it recovers at night, it's fine. If not, water." },
            { symptom: "Brown leaf edges", diagnosis: "Underwatering", action: "Increase watering frequency." },
        ],
    },
    {
        id: "lavender-provence",
        name: "Provence Lavender",
        botanicalName: "Lavandula x intermedia",
        careSchedule: [
            { day: 0, action: "Water", description: "Water in well." },
            { day: 7, action: "Sun Check", description: "Ensure 6+ hours of direct sun." },
            { day: 14, action: "Ignore", description: "Lavender prefers dry feet. Do not overwater." },
            { day: 21, action: "Drainage Check", description: "Ensure no standing water. Soil should be drying well between drinks." },
            { day: 28, action: "Minimize Care", description: "Transition to very infrequent watering to harden off." },
        ],
        troubleshooting: [
            { symptom: "Drooping and turning gray", diagnosis: "Root Rot", action: "Stop watering immediately. Improve drainage." },
        ],
    },
    {
        id: "african-milk-tree",
        name: "African Milk Tree",
        botanicalName: "Euphorbia trigona",
        imageUrl: "/images/african-milk-tree.png",
        careSchedule: [
            { day: 0, action: "Sun", description: "Place in bright, indirect light." },
            { day: 14, action: "Water", description: "Water sparingly. Allow soil to dry completely." },
            { day: 28, action: "Check Light", description: "Ensure plant isn't leaning (seeking light). Rotate if needed." },
        ],
        troubleshooting: [{ symptom: "Soft stem", diagnosis: "Rot", action: "Cut away rot and let callous." }]
    },
    {
        id: "african-violet",
        name: "African Violet",
        botanicalName: "Saintpaulia",
        imageUrl: "/images/african-violet.png",
        careSchedule: [
            { day: 0, action: "Water", description: "Water from bottom to avoid wetting leaves." },
            { day: 4, action: "Light", description: "Needs bright but filtered light." },
            { day: 21, action: "Fertilize Lightly", description: "Use specialized violet food (1/4 strength) if growing actively." },
        ],
        troubleshooting: [{ symptom: "Spots on leaves", diagnosis: "Cold water damage", action: "Use lukewarm water." }]
    },
    {
        id: "aglaonema-beauty",
        name: "Aglaonema Beauty",
        botanicalName: "Aglaonema rotundum",
        imageUrl: "/images/aglaonema-beauty.png",
        careSchedule: [
            { day: 0, action: "Water", description: "Keep soil moist but not soggy." },
            { day: 7, action: "Mist", description: "Mist leaves to increase humidity." },
            { day: 21, action: "Soil Check", description: "Top inch should be dry before next water." },
        ],
        troubleshooting: [{ symptom: "Brown tips", diagnosis: "Dry air", action: "Mist more often." }]
    },
    {
        id: "aglaonema-siam",
        name: "Aglaonema Siam",
        botanicalName: "Aglaonema 'Siam Aurora'",
        imageUrl: "/images/aglaonema-siam.png",
        careSchedule: [
            { day: 0, action: "Water", description: "Allow top inch of soil to dry before watering." },
            { day: 21, action: "Leaf Check", description: "Wipe dust from leaves to support photosynthesis." },
        ],
        troubleshooting: []
    },
    {
        id: "aglaonema-silver-bay",
        name: "Aglaonema Silver Bay",
        botanicalName: "Aglaonema commutatum",
        imageUrl: "/images/aglaonema-silver-bay.png",
        careSchedule: [
            { day: 0, action: "Low Light", description: "Tolerates low light well." },
            { day: 3, action: "Weed", description: "Check soil surface for weeds." },
            { day: 10, action: "Water", description: "Water from bottom: Fill saucer, let sit 20m." },
            { day: 14, action: "Fertilize", description: "Apply balanced liquid fertilizer diluted to 1/2 strength." },
            { day: 21, action: "Pest Control", description: "Inspect underside of leaves for mites." },
            { day: 24, action: "No Water", description: "Explicit dry period. Do not water." },
            { day: 28, action: "Establishment", description: "Roots should be settling. Water only when top 2 inches dry." },
        ],
        troubleshooting: []
    },
    {
        id: "aglaonema-snow-white",
        name: "Aglaonema Snow White",
        botanicalName: "Aglaonema costatum",
        imageUrl: "/images/aglaonema-snow-white.png",
        careSchedule: [],
        troubleshooting: []
    },
    // NEW CATEGORIES FROM CARE GUIDE
    {
        id: "evergreen-shrubs",
        name: "Evergreen Shrubs",
        botanicalName: "Various",
        careSchedule: [
            { day: 1, action: "Water", description: "Soak the root ball thoroughly to settle soil." },
            { day: 2, action: "Water", description: "Water again ensuring deep penetration." },
            { day: 3, action: "Check Soil", description: "Ensure soil is moist but not waterlogged." },
            { day: 5, action: "Water", description: "Water deeply if the top inch of soil is dry." },
            { day: 7, action: "Water", description: "Maintain consistent moisture. Mulch helps retain it." },
            { day: 10, action: "Water", description: "Water if no rain has fallen recently." },
            { day: 14, action: "Weed", description: "Clear any weeds from the base to reduce competition." },
            { day: 21, action: "Stabilization", description: "Extend intervals between watering if moisture holds." },
            { day: 28, action: "Transition", description: "Water only when soil begins to dry at depth." }
        ],
        troubleshooting: [
            { symptom: "Webbing on leaves", diagnosis: "Spider Mites", action: "Watch for mites during hot, dry weather. Spray with water." }
        ]
    },
    {
        id: "deciduous-flowering-shrubs",
        name: "Deciduous Flowering Shrubs",
        botanicalName: "Various",
        careSchedule: [
            { day: 1, action: "Water", description: "Water at the base to avoid wetting leaves." },
            { day: 2, action: "Check", description: "Check for wilting, especially in afternoon sun." },
            { day: 3, action: "Water", description: "Keep soil consistently damp to establish roots." },
            { day: 4, action: "Water", description: "Water thoroughly. Azaleas and Hydrangeas love moisture." },
            { day: 6, action: "Moisture Check", description: "Dig down 2 inches. If dry, water deeply." },
            { day: 9, action: "Water", description: "Water deeply if rainfall has been scarce." },
            { day: 12, action: "Inspect", description: "Look for yellowing leaves (chlorosis)." },
            { day: 14, action: "Mulch", description: "Refresh mulch to keep roots cool and moist." },
            { day: 21, action: "Deep Watering", description: "Water deeply to encourage deep rooting." },
            { day: 28, action: "Transition", description: "Shift to weather-based monitoring." }
        ],
        troubleshooting: []
    },
    {
        id: "annual-flowering-plants",
        name: "Annual Flowering Plants",
        botanicalName: "Various",
        careSchedule: [
            { day: 1, action: "Water", description: "Give a thorough drink. Containers dry out fast." },
            { day: 2, action: "Check Pot", description: "Lift pot; if light, water immediately. If heavy, wait." },
            { day: 3, action: "Water", description: "Daily watering is key for blooms in heat." },
            { day: 5, action: "Deadhead", description: "Pinch off spent blooms to encourage new flowers." },
            { day: 7, action: "Water", description: "Keep it up! Consistent water equals more flowers." },
            { day: 10, action: "Check", description: "Look for drooping leaves or dry soil surface." },
            { day: 14, action: "Fertilize", description: "Apply a bloom-booster liquid fertilizer." },
            { day: 21, action: "Pest Check", description: "Check for aphids or slugs. Remove manually." },
            { day: 28, action: "Monitor", description: "Water according to heat/weather conditions." }
        ],
        troubleshooting: [
            { symptom: "Sticky leaves", diagnosis: "Aphids/Whiteflies", action: "Treat with insecticidal soap." }
        ]
    },
    {
        id: "perennial-flowering-plants",
        name: "Perennial Flowering Plants",
        botanicalName: "Various",
        careSchedule: [
            { day: 1, action: "Water", description: "Water in well to remove air pockets around roots." },
            { day: 2, action: "Check", description: "Ensure soil is settling well." },
            { day: 3, action: "Water", description: "Keep moist. Perennials need help settling in." },
            { day: 5, action: "Water", description: "Water if the top inch of soil feels dry." },
            { day: 7, action: "Inspect", description: "Check that the plant is standing upright and firm." },
            { day: 10, action: "Water", description: "Deep watering promotes deep roots." },
            { day: 14, action: "Mulch", description: "Verify mulch layer is suppressing weeds effectively." },
            { day: 21, action: "Growth Check", description: "Look for new leaf emergence." },
            { day: 28, action: "Establishment", description: "Reduce frequency but water deeply." }
        ],
        troubleshooting: [
            { symptom: "Holes in leaves", diagnosis: "Slugs/Snails", action: "Check in wet conditions." }
        ]
    },
    {
        id: "vegetable-starts",
        name: "Vegetable Starts",
        botanicalName: "Various",
        careSchedule: [
            { day: 1, action: "Water", description: "Keep soil moist to help establishment." },
            { day: 2, action: "Check Moisture", description: "Ensure soil remains damp. Water if dry." },
            { day: 3, action: "Water", description: "Water continuously to support root growth." },
            { day: 4, action: "Moisture Check", description: "Tomatoes need consistent water. Check top inch." },
            { day: 5, action: "Water", description: "Water deeply. Avoid wetting leaves to prevent disease." },
            { day: 7, action: "Water", description: "Water every other day. Mulch now if you haven't." },
            { day: 9, action: "Water", description: "Check soil; water if top inch is dry." },
            { day: 12, action: "Water", description: "Maintain consistent moisture for fruit set." },
            { day: 14, action: "Fertilize", description: "Light feeding after Day 14." },
            { day: 21, action: "Stabilize", description: "Extend watering intervals if soil holds moisture." },
            { day: 28, action: "Transition", description: "Weather-responsive monitoring. Do not overfeed." }
        ],
        troubleshooting: [
            { symptom: "Insects on leaves", diagnosis: "Pests", action: "Inspect undersides of leaves." }
        ]
    }

];

export const PLANTS: Plant[] = [
    ...BASE_PLANTS,
    // USER SPECIFIC CATEGORIES ALIASING EXISTING CONTENT
    {
        id: "shrub_evergreen",
        name: "Evergreen Shrubs",
        botanicalName: "Various",
        careSchedule: BASE_PLANTS.find(p => p.id === 'evergreen-shrubs')?.careSchedule || [],
        troubleshooting: BASE_PLANTS.find(p => p.id === 'evergreen-shrubs')?.troubleshooting || []
    },
    {
        id: "shrub_deciduous_flowering",
        name: "Deciduous Flowering Shrubs",
        botanicalName: "Various",
        careSchedule: BASE_PLANTS.find(p => p.id === 'deciduous-flowering-shrubs')?.careSchedule || [],
        troubleshooting: BASE_PLANTS.find(p => p.id === 'deciduous-flowering-shrubs')?.troubleshooting || []
    },
    {
        id: "plant_annual_flowering",
        name: "Annual Flowering Plants",
        botanicalName: "Various",
        careSchedule: BASE_PLANTS.find(p => p.id === 'annual-flowering-plants')?.careSchedule || [],
        troubleshooting: BASE_PLANTS.find(p => p.id === 'annual-flowering-plants')?.troubleshooting || []
    },
    {
        id: "plant_perennial_flowering",
        name: "Perennial Flowering Plants",
        botanicalName: "Various",
        careSchedule: BASE_PLANTS.find(p => p.id === 'perennial-flowering-plants')?.careSchedule || [],
        troubleshooting: BASE_PLANTS.find(p => p.id === 'perennial-flowering-plants')?.troubleshooting || []
    },
    {
        id: "plant_vegetable_start",
        name: "Vegetable Starts",
        botanicalName: "Various",
        careSchedule: BASE_PLANTS.find(p => p.id === 'vegetable-starts')?.careSchedule || [],
        troubleshooting: BASE_PLANTS.find(p => p.id === 'vegetable-starts')?.troubleshooting || []
    },
    // USER SPECIFIC CATEGORIES WITH NO SCHEDULE (YET)
    { id: "shrub_drought_tolerant", name: "Drought Tolerant Shrubs", botanicalName: "Various", careSchedule: [], troubleshooting: [] },
    { id: "shrub_hedge_screening", name: "Hedge & Screening Shrubs", botanicalName: "Various", careSchedule: [], troubleshooting: [] },
    { id: "shrub_acid_loving", name: "Acid Loving Shrubs", botanicalName: "Various", careSchedule: [], troubleshooting: [] },
    { id: "shrub_native", name: "Native Shrubs", botanicalName: "Various", careSchedule: [], troubleshooting: [] },
    { id: "shrub_broadleaf_evergreen", name: "Broadleaf Evergreen Shrubs", botanicalName: "Various", careSchedule: [], troubleshooting: [] },
    { id: "shrub_shade", name: "Shade Shrubs", botanicalName: "Various", careSchedule: [], troubleshooting: [] },
    { id: "shrub_sun", name: "Sun Shrubs", botanicalName: "Various", careSchedule: [], troubleshooting: [] },
    { id: "shrub_foundation", name: "Foundation Shrubs", botanicalName: "Various", careSchedule: [], troubleshooting: [] },
    { id: "shrub_mature_transplant", name: "Mature Transplants", botanicalName: "Various", careSchedule: [], troubleshooting: [] },
    { id: "shrub_container", name: "Container Shrubs", botanicalName: "Various", careSchedule: [], troubleshooting: [] },
    { id: "plant_shade", name: "Shade Plants", botanicalName: "Various", careSchedule: [], troubleshooting: [] },
    { id: "plant_moisture_loving", name: "Moisture Loving Plants", botanicalName: "Various", careSchedule: [], troubleshooting: [] },
    { id: "plant_drought_tolerant", name: "Drought Tolerant Plants", botanicalName: "Various", careSchedule: [], troubleshooting: [] },
    { id: "plant_sun", name: "Sun Plants", botanicalName: "Various", careSchedule: [], troubleshooting: [] },
    { id: "plant_ornamental_grass", name: "Ornamental Grasses", botanicalName: "Various", careSchedule: [], troubleshooting: [] },
    { id: "plant_groundcover", name: "Groundcover Plants", botanicalName: "Various", careSchedule: [], troubleshooting: [] },
    { id: "plant_herb_container", name: "Container Herbs", botanicalName: "Various", careSchedule: [], troubleshooting: [] },
    { id: "plant_herb_inground", name: "Inground Herbs", botanicalName: "Various", careSchedule: [], troubleshooting: [] }
];

export function getPlantById(id: string): Plant | undefined {
    return PLANTS.find((p) => p.id === id);
}
