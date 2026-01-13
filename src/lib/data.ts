import { Plant } from "./types";

export const PLANTS: Plant[] = [
    {
        id: "rose-knockout",
        name: "Knock Out® Rose",
        botanicalName: "Rosa 'Radrazz'",
        careSchedule: [
            { day: 0, action: "Water", description: "Water thoroughly at the base until soil is saturated." },
            { day: 3, action: "Check Moisture", description: "Stick finger 1 inch into soil. If dry, water again." },
            { day: 7, action: "Mulch", description: "Apply 2-3 inches of mulch to retain moisture." },
            { day: 14, action: "Fertilize", description: "Apply a balanced rose fertilizer." },
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
            { day: 14, action: "Weed", description: "Clear any weeds from the base to reduce competition." }
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
            { day: 14, action: "Mulch", description: "Refresh mulch to keep roots cool and moist." }
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
            { day: 14, action: "Fertilize", description: "Apply a bloom-booster liquid fertilizer." }
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
            { day: 14, action: "Mulch", description: "Verify mulch layer is suppressing weeds effectively." }
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
            { day: 14, action: "Fertilize", description: "Light feeding after Day 14." }
        ],
        troubleshooting: [
            { symptom: "Insects on leaves", diagnosis: "Pests", action: "Inspect undersides of leaves." }
        ]
    }
];

export function getPlantById(id: string): Plant | undefined {
    return PLANTS.find((p) => p.id === id);
}
