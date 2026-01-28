-- Example Analytics Query: Neem Outcomes vs Cold Nights
-- Purpose: Analyze if "Neem Oil" treated plants suffered more cold damage outcome events 
-- when exposed to temp <= 50F in the first 28 days.

SELECT 
    cs.care_category_id,
    -- Was Neem used? (Simplified check on logs or category metadata)
    -- Assuming 'Neem' might be a recurring task or noted in logs. 
    -- For this example, we group by Category as a proxy for "Type of Care".
    
    COUNT(DISTINCT cs.id) as total_plants,
    
    -- Count Outcomes
    COUNT(DISTINCT CASE WHEN co.outcome_type = 'cold_damage' THEN cs.id END) as cold_damaged_plants,
    
    -- Weather Exposure: Check if they experienced <= 50F in first 28 days
    COUNT(DISTINCT CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM public.weather_observations_daily w
            WHERE w.store_id = cs.store_id
              AND w.zip = cs.zip
              AND w.date >= (cs.received_at::DATE)
              AND w.date <= (cs.received_at::DATE + INTERVAL '28 days')
              AND w.temp_min_f <= 50
        ) THEN cs.id 
    END) as exposed_to_cold_50f

FROM public.care_sessions cs
LEFT JOIN public.care_outcomes co ON co.care_session_id = cs.id
WHERE cs.received_at IS NOT NULL -- Only valid established plants
GROUP BY 1
ORDER BY 2 DESC;
