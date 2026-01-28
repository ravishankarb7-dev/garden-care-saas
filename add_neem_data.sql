DO $$
DECLARE
    new_store_id uuid;
    new_category_id uuid;
BEGIN
    -- 1. Create 'Tropical Evergreen' Category (Generalized)
    -- This covers Neem, Mango, Avocado, etc.
    INSERT INTO care_categories (key, label, is_active)
    VALUES ('tropical_evergreen', 'Tropical Evergreen Tree', true)
    ON CONFLICT (key) DO UPDATE SET label = 'Tropical Evergreen Tree'
    RETURNING id INTO new_category_id;

    -- Fallback if it existed and RETURNING didn't catch it
    IF new_category_id IS NULL THEN
        SELECT id INTO new_category_id FROM care_categories WHERE key = 'tropical_evergreen';
    END IF;

    -- 2. Create 'Neem Tree Farms' Store
    INSERT INTO stores (name, timezone)
    VALUES ('Neem Tree Farms', 'America/New_York')
    RETURNING id INTO new_store_id;

    -- 3. Insert SKUs (Mapped to the generalized category)
    -- Neem Tree ($36.99)
    INSERT INTO store_skus (store_id, sku, display_name, care_category_id, default_variant, is_active)
    VALUES (new_store_id, 'NTF-NEEM-TREE', 'Neem Tree', new_category_id, '{"price": 36.99, "type": "tree", "sub_type": "neem"}'::jsonb, true);

    -- Neem Seedlings - 4 Pack ($59.99)
    INSERT INTO store_skus (store_id, sku, display_name, care_category_id, default_variant, is_active)
    VALUES (new_store_id, 'NTF-NEEM-SEED-4PK', 'Neem Seedlings – 4 Pack', new_category_id, '{"price": 59.99, "type": "seedling", "pack_size": 4, "sub_type": "neem"}'::jsonb, true);

END $$;
