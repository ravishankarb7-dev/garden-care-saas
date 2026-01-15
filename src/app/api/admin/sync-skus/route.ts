
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase Admin Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Defined Categories map (Snake Case Key -> Human Label)
        const categories = [
            { key: "shrub_evergreen", label: "Evergreen Shrubs" },
            { key: "shrub_deciduous_flowering", label: "Deciduous Flowering Shrubs" },
            { key: "plant_annual_flowering", label: "Annual Flowering Plants" },
            { key: "plant_perennial_flowering", label: "Perennial Flowering Plants" },
            { key: "plant_vegetable_start", label: "Vegetable Starts" },
            { key: "shrub_drought_tolerant", label: "Drought Tolerant Shrubs" },
            { key: "shrub_hedge_screening", label: "Hedge & Screening Shrubs" },
            { key: "shrub_acid_loving", label: "Acid Loving Shrubs" },
            { key: "shrub_native", label: "Native Shrubs" },
            { key: "shrub_broadleaf_evergreen", label: "Broadleaf Evergreen Shrubs" },
            { key: "shrub_shade", label: "Shade Shrubs" },
            { key: "shrub_sun", label: "Sun Shrubs" },
            { key: "shrub_foundation", label: "Foundation Shrubs" },
            { key: "shrub_mature_transplant", label: "Mature Transplants" },
            { key: "shrub_container", label: "Container Shrubs" },
            { key: "plant_shade", label: "Shade Plants" },
            { key: "plant_moisture_loving", label: "Moisture Loving Plants" },
            { key: "plant_drought_tolerant", label: "Drought Tolerant Plants" },
            { key: "plant_sun", label: "Sun Plants" },
            { key: "plant_ornamental_grass", label: "Ornamental Grasses" },
            { key: "plant_groundcover", label: "Groundcover Plants" },
            { key: "plant_herb_container", label: "Container Herbs" },
            { key: "plant_herb_inground", label: "Inground Herbs" }
        ];

        // 2. Upsert Categories
        const categoryMap = new Map<string, string>(); // Key -> UUID
        for (const cat of categories) {
            // We use the KEY as the unique identifier for lookup, but allow ID generation
            const { data, error } = await supabase
                .from('care_categories')
                .upsert({ key: cat.key, label: cat.label, is_active: true }, { onConflict: 'key' })
                .select()
                .single();

            if (error) throw new Error(`Category upsert failed for ${cat.key}: ${error.message}`);
            categoryMap.set(cat.key, data.id);
        }

        // 3. Define SKU Mapping
        const skuMappings = [
            // Shrub Evergreen
            { sku: "GC-SHR-BOXWOOD-GREENMOUNTAIN-3G", name: "Boxwood 'Green Mountain' 3G", cat: "shrub_evergreen" },
            { sku: "GC-SHR-BOXWOOD-GREENVELVET-3G", name: "Boxwood 'Green Velvet' 3G", cat: "shrub_evergreen" },
            { sku: "GC-SHR-HOLLY-INKBERRY-3G", name: "Inkberry Holly 3G", cat: "shrub_evergreen" },
            { sku: "GC-SHR-HOLLY-SKYPOINTER-3G", name: "Holly 'Sky Pointer' 3G", cat: "shrub_evergreen" },
            { sku: "GC-SHR-YEW-DENSIFORMIS-3G", name: "Yew 'Densiformis' 3G", cat: "shrub_evergreen" },
            // Shrub Drought Tolerant
            { sku: "GC-SHR-JUNIPER-BLUESTAR-3G", name: "Juniper 'Blue Star' 3G", cat: "shrub_drought_tolerant" },
            { sku: "GC-SHR-JUNIPER-BLUEPACIFIC-3G", name: "Juniper 'Blue Pacific' 3G", cat: "shrub_drought_tolerant" },
            { sku: "GC-SHR-BARBERRY-3G", name: "Barberry 3G", cat: "shrub_drought_tolerant" },
            // Hedge
            { sku: "GC-SHR-ARBORVITAE-EMERALDGREEN-3G", name: "Arborvitae 'Emerald Green' 3G", cat: "shrub_hedge_screening" },
            { sku: "GC-SHR-ARBORVITAE-GREEN-GIANT-7G", name: "Arborvitae 'Green Giant' 7G", cat: "shrub_hedge_screening" },
            { sku: "GC-SHR-LEYLAND-CYPRESS-7G", name: "Leyland Cypress 7G", cat: "shrub_hedge_screening" },
            { sku: "GC-SHR-PRIVET-7G", name: "Privet 7G", cat: "shrub_hedge_screening" },
            // Acid Loving
            { sku: "GC-SHR-AZALEA-ENCORE-3G", name: "Encore Azalea 3G", cat: "shrub_acid_loving" },
            // Native
            { sku: "GC-SHR-AZALEA-NATIVE-3G", name: "Native Azalea 3G", cat: "shrub_native" },
            // Broadleaf Evergreen
            { sku: "GC-SHR-RHODODENDRON-CATAWBIENSE-3G", name: "Rhododendron (Catawba) 3G", cat: "shrub_broadleaf_evergreen" },
            { sku: "GC-SHR-CAMELLIA-JAPONICA-3G", name: "Camellia japonica 3G", cat: "shrub_broadleaf_evergreen" },
            // Shade
            { sku: "GC-SHR-MOUNTAIN-LAUREL-3G", name: "Mountain Laurel 3G", cat: "shrub_shade" },
            { sku: "GC-SHR-AUCUBA-3G", name: "Aucuba 3G", cat: "shrub_shade" },
            // Deciduous Flowering
            { sku: "GC-SHR-HYDRANGEA-PANICLE-3G", name: "Hydrangea (Panicle) 3G", cat: "shrub_deciduous_flowering" },
            { sku: "GC-SHR-HYDRANGEA-MACROPHYLLA-3G", name: "Hydrangea (Bigleaf) 3G", cat: "shrub_deciduous_flowering" },
            { sku: "GC-SHR-SPIREA-GOLDFLAME-3G", name: "Spirea 'Goldflame' 3G", cat: "shrub_deciduous_flowering" },
            { sku: "GC-SHR-WEIGELA-WINEANDROSES-3G", name: "Weigela 'Wine & Roses' 3G", cat: "shrub_deciduous_flowering" },
            { sku: "GC-SHR-VIBURNUM-SNOWBALL-3G", name: "Viburnum 'Snowball' 3G", cat: "shrub_deciduous_flowering" },
            // Sun
            { sku: "GC-SHR-BUTTERFLY-BUSH-3G", name: "Butterfly Bush 3G", cat: "shrub_sun" },
            { sku: "GC-SHR-POTENTILLA-3G", name: "Potentilla 3G", cat: "shrub_sun" },
            // Foundation
            { sku: "GC-SHR-LOROPETALUM-3G", name: "Loropetalum 3G", cat: "shrub_foundation" },
            { sku: "GC-SHR-NANDINA-3G", name: "Nandina 3G", cat: "shrub_foundation" },
            // Mature
            { sku: "GC-SHR-BOXWOOD-10G", name: "Boxwood 10G (Specimen)", cat: "shrub_mature_transplant" },
            { sku: "GC-SHR-HYDRANGEA-7G", name: "Hydrangea 7G (Specimen)", cat: "shrub_mature_transplant" },
            // Container
            { sku: "GC-SHR-AZALEA-2G-CONTAINER", name: "Azalea 2G (Patio/Container)", cat: "shrub_container" },
            { sku: "GC-SHR-BOXWOOD-2G-CONTAINER", name: "Boxwood 2G (Patio/Container)", cat: "shrub_container" },

            // Annuals
            { sku: "GC-ANNUAL-PETUNIA-4IN", name: "Petunia 4-inch", cat: "plant_annual_flowering" },
            { sku: "GC-ANNUAL-CALIBRACHOA-4IN", name: "Calibrachoa 4-inch", cat: "plant_annual_flowering" },
            { sku: "GC-ANNUAL-GERANIUM-4IN", name: "Geranium 4-inch", cat: "plant_annual_flowering" },
            { sku: "GC-ANNUAL-BEGONIA-4IN", name: "Begonia 4-inch", cat: "plant_annual_flowering" },
            { sku: "GC-ANNUAL-IMPATIENS-4IN", name: "Impatiens 4-inch", cat: "plant_annual_flowering" },
            { sku: "GC-ANNUAL-MARIGOLD-4IN", name: "Marigold 4-inch", cat: "plant_annual_flowering" },
            { sku: "GC-ANNUAL-ZINNIA-4IN", name: "Zinnia 4-inch", cat: "plant_annual_flowering" },
            { sku: "GC-ANNUAL-COLEUS-4IN", name: "Coleus 4-inch", cat: "plant_annual_flowering" },
            { sku: "GC-ANNUAL-LANTANA-4IN", name: "Lantana 4-inch", cat: "plant_annual_flowering" },
            { sku: "GC-ANNUAL-VERBENA-4IN", name: "Verbena 4-inch", cat: "plant_annual_flowering" },
            { sku: "GC-ANNUAL-SALVIA-4IN", name: "Salvia (Annual) 4-inch", cat: "plant_annual_flowering" },
            { sku: "GC-ANNUAL-PANSY-6PK", name: "Pansy 6-pack", cat: "plant_annual_flowering" },
            { sku: "GC-ANNUAL-VIOLA-6PK", name: "Viola 6-pack", cat: "plant_annual_flowering" },
            { sku: "GC-ANNUAL-SNAPDRAGON-6PK", name: "Snapdragon 6-pack", cat: "plant_annual_flowering" },
            { sku: "GC-ANNUAL-PETUNIA-WAVE-4IN", name: "Petunia 'Wave' 4-inch", cat: "plant_annual_flowering" },
            { sku: "GC-ANNUAL-ANGELONIA-4IN", name: "Angelonia 4-inch", cat: "plant_annual_flowering" },
            { sku: "GC-ANNUAL-DIANTHUS-4IN", name: "Dianthus 4-inch", cat: "plant_annual_flowering" },

            // Drought Tolerant Plants
            { sku: "GC-ANNUAL-PORTULACA-4IN", name: "Portulaca 4-inch", cat: "plant_drought_tolerant" },
            { sku: "GC-ANNUAL-GAZANIA-4IN", name: "Gazania 4-inch", cat: "plant_drought_tolerant" },
            { sku: "GC-PERENNIAL-CATNIP-1G", name: "Catmint (Nepeta) 1G", cat: "plant_drought_tolerant" },
            { sku: "GC-PERENNIAL-LAVENDER-1G", name: "Lavender 1G", cat: "plant_drought_tolerant" },
            { sku: "GC-PERENNIAL-SEDUM-1G", name: "Sedum 1G", cat: "plant_drought_tolerant" },
            { sku: "GC-HERB-LAVENDER-4IN", name: "Lavender 4-inch", cat: "plant_drought_tolerant" },

            // Plant Shade
            { sku: "GC-ANNUAL-NEW-GUINEA-IMPATIENS-4IN", name: "New Guinea Impatiens 4 inch", cat: "plant_shade" },
            { sku: "GC-PERENNIAL-HOSTA-LARGE-2G", name: "Hosta 2G (Large)", cat: "plant_shade" },
            { sku: "GC-PERENNIAL-FERN-1G", name: "Fern 1G", cat: "plant_shade" },

            // Plant Sun (Perennials)
            { sku: "GC-PERENNIAL-SALVIA-PERENNIAL-1G", name: "Salvia (Perennial) 1G", cat: "plant_sun" },
            { sku: "GC-PERENNIAL-IRIS-1G", name: "Iris 1G", cat: "plant_sun" },

            // Perennial Flowering
            { sku: "GC-PERENNIAL-HOSTA-1G", name: "Hosta 1G", cat: "plant_perennial_flowering" },
            { sku: "GC-PERENNIAL-DAYLILY-1G", name: "Daylily 1G", cat: "plant_perennial_flowering" },
            { sku: "GC-PERENNIAL-CONEFLOWER-1G", name: "Coneflower (Echinacea) 1G", cat: "plant_perennial_flowering" },
            { sku: "GC-PERENNIAL-BLACKEYEDSUSAN-1G", name: "Black-eyed Susan (Rudbeckia) 1G", cat: "plant_perennial_flowering" },
            { sku: "GC-PERENNIAL-COREOPSIS-1G", name: "Coreopsis 1G", cat: "plant_perennial_flowering" },
            { sku: "GC-PERENNIAL-HEUCHERA-1G", name: "Heuchera (Coral Bells) 1G", cat: "plant_perennial_flowering" },
            { sku: "GC-PERENNIAL-PHLOX-1G", name: "Garden Phlox 1G", cat: "plant_perennial_flowering" },
            { sku: "GC-PERENNIAL-SHASTA-DAISY-1G", name: "Shasta Daisy 1G", cat: "plant_perennial_flowering" },
            { sku: "GC-PERENNIAL-BEEBALM-1G", name: "Bee Balm (Monarda) 1G", cat: "plant_perennial_flowering" },

            // Moisture
            { sku: "GC-PERENNIAL-ASTILBE-1G", name: "Astilbe 1G", cat: "plant_moisture_loving" },
            { sku: "GC-PERENNIAL-HIBISCUS-HARDY-1G", name: "Hardy Hibiscus 1G", cat: "plant_moisture_loving" },

            // Grasses
            { sku: "GC-GRASS-PENNISETUM-1G", name: "Fountain Grass (Pennisetum) 1G", cat: "plant_ornamental_grass" },
            { sku: "GC-GRASS-PANICUM-1G", name: "Switchgrass (Panicum) 1G", cat: "plant_ornamental_grass" },
            { sku: "GC-GRASS-MISCANTHUS-1G", name: "Miscanthus 1G", cat: "plant_ornamental_grass" },
            { sku: "GC-GRASS-CAREX-1G", name: "Sedge (Carex) 1G", cat: "plant_ornamental_grass" },

            // Groundcover
            { sku: "GC-GCOVER-VINCA-4IN", name: "Vinca Minor 4-inch", cat: "plant_groundcover" },
            { sku: "GC-GCOVER-CREEPING-THYME-4IN", name: "Creeping Thyme 4-inch", cat: "plant_groundcover" },
            { sku: "GC-GCOVER-PACHYSANDRA-4IN", name: "Pachysandra 4-inch", cat: "plant_groundcover" },
            { sku: "GC-GCOVER-AJUGA-4IN", name: "Ajuga 4-inch", cat: "plant_groundcover" },
            { sku: "GC-GCOVER-SEDUM-GROUNDCOVER-4IN", name: "Sedum Groundcover 4-inch", cat: "plant_groundcover" },

            // Herbs (Container)
            { sku: "GC-HERB-BASIL-4IN", name: "Basil 4-inch", cat: "plant_herb_container" },
            { sku: "GC-HERB-PARSLEY-4IN", name: "Parsley 4-inch", cat: "plant_herb_container" },
            { sku: "GC-HERB-CILANTRO-4IN", name: "Cilantro 4-inch", cat: "plant_herb_container" },
            { sku: "GC-HERB-MINT-4IN", name: "Mint 4-inch", cat: "plant_herb_container" },
            { sku: "GC-HERB-THYME-4IN", name: "Thyme 4-inch", cat: "plant_herb_container" },
            { sku: "GC-HERB-SAGE-4IN", name: "Sage 4-inch", cat: "plant_herb_container" },
            { sku: "GC-HERB-OREGANO-4IN", name: "Oregano 4-inch", cat: "plant_herb_container" },
            { sku: "GC-HERB-CHIVES-4IN", name: "Chives 4-inch", cat: "plant_herb_container" },

            // Herb Inground
            { sku: "GC-HERB-ROSEMARY-1G", name: "Rosemary 1G", cat: "plant_herb_inground" },

            // Vegetables
            { sku: "GC-VEG-TOMATO-BETTERBOY-4IN", name: "Tomato 'Better Boy' 4-inch", cat: "plant_vegetable_start" },
            { sku: "GC-VEG-TOMATO-EARLYGIRL-4IN", name: "Tomato 'Early Girl' 4-inch", cat: "plant_vegetable_start" },
            { sku: "GC-VEG-TOMATO-CHERRY-4IN", name: "Tomato (Cherry) 4-inch", cat: "plant_vegetable_start" },
            { sku: "GC-VEG-PEPPER-BELL-4IN", name: "Bell Pepper 4-inch", cat: "plant_vegetable_start" },
            { sku: "GC-VEG-PEPPER-JALAPENO-4IN", name: "Jalapeño Pepper 4-inch", cat: "plant_vegetable_start" },
            { sku: "GC-VEG-CUCUMBER-4IN", name: "Cucumber 4-inch", cat: "plant_vegetable_start" },
            { sku: "GC-VEG-ZUCCHINI-4IN", name: "Zucchini 4-inch", cat: "plant_vegetable_start" },
            { sku: "GC-VEG-SQUASH-YELLOW-4IN", name: "Yellow Squash 4-inch", cat: "plant_vegetable_start" },
            { sku: "GC-VEG-LETTUCE-ROMAINE-6PK", name: "Romaine Lettuce 6-pack", cat: "plant_vegetable_start" },
            { sku: "GC-VEG-KALE-6PK", name: "Kale 6-pack", cat: "plant_vegetable_start" },
            { sku: "GC-VEG-BROCCOLI-6PK", name: "Broccoli 6-pack", cat: "plant_vegetable_start" },
            { sku: "GC-VEG-CABBAGE-6PK", name: "Cabbage 6-pack", cat: "plant_vegetable_start" },
        ];

        // 4. Upsert SKUs
        let successCount = 0;
        let failCount = 0;

        for (const item of skuMappings) {
            const catId = categoryMap.get(item.cat);
            if (!catId) {
                console.error(`Category UUID not found for ${item.cat}`);
                failCount++;
                continue;
            }

            const { error } = await supabase
                .from('store_skus')
                .upsert({
                    sku: item.sku,
                    store_id: 'store_123', // Assuming single store for now
                    display_name: item.name,
                    care_category_id: catId,
                    is_active: true
                }, { onConflict: 'sku' });

            if (error) {
                console.error(`Error saving SKU ${item.sku}:`, error);
                failCount++;
            } else {
                successCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Synced ${categories.length} categories. Processed ${skuMappings.length} SKUs.`,
            stats: { success: successCount, failed: failCount },
            categories: Object.fromEntries(categoryMap)
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
