-- Add buyer table to existing bird database
CREATE TABLE buyer (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    profession VARCHAR(100),
    budget_min NUMERIC(12,2),
    budget_max NUMERIC(12,2),
    preferred_location VARCHAR(100),
    search_criteria JSONB, -- For storing search preferences like room count, features etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE
);

-- Create favorites table to handle many-to-many relationship between buyers and listings
CREATE TABLE buyer_favorites (
    id SERIAL PRIMARY KEY,
    buyer_id INTEGER NOT NULL REFERENCES buyer(id) ON DELETE CASCADE,
    listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    favorited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT, -- Optional notes about why they favorited this listing
    UNIQUE(buyer_id, listing_id) -- Prevent duplicate favorites
);

-- Insert Baran Konuk as the only buyer
INSERT INTO buyer (
    full_name, 
    email, 
    phone, 
    password, 
    date_of_birth, 
    profession, 
    budget_min, 
    budget_max, 
    preferred_location,
    search_criteria,
    is_verified
) VALUES (
    'Baran Konuk',
    'baran.konuk@example.com',
    '05321234567',
    'hashedpassword123', -- In real app, this would be properly hashed
    '1995-03-15',
    'Software Developer',
    4000000, -- 4M TL minimum budget
    8000000, -- 8M TL maximum budget
    'Oran',
    '{"room_count": ["3+1", "4+1"], "has_elevator": true, "parking_type": "Kapalı Otopark", "inside_site": true}',
    true
);

-- Add some favorites for Baran (using listing IDs from the sample data)
-- These correspond to some of the premium properties in Oran
INSERT INTO buyer_favorites (buyer_id, listing_id, notes) VALUES
(1, 2, 'Love the 4+1 layout and furniture included'), -- Oran Royal 4+1 furnished
(1, 9, 'Great investment opportunity with rental income'), -- Oran Park Residence kiracılı
(1, 12, 'Amazing luxury features and location'), -- Oran Vista Evleri 4+1
(1, 16, 'Perfect size and within budget'), -- Oran Elit Residence 3+1
(1, 32, 'Dream penthouse with panoramic views'); -- Oran Hills dubleks

-- Create indexes for better performance
CREATE INDEX idx_buyer_favorites_buyer_id ON buyer_favorites(buyer_id);
CREATE INDEX idx_buyer_favorites_listing_id ON buyer_favorites(listing_id);
CREATE INDEX idx_buyer_email ON buyer(email);
CREATE INDEX idx_buyer_budget ON buyer(budget_min, budget_max);

-- Create a view to easily get buyer favorites with listing details
CREATE VIEW buyer_favorites_detailed AS
SELECT 
    bf.id as favorite_id,
    bf.buyer_id,
    bf.favorited_at,
    bf.notes,
    b.full_name as buyer_name,
    b.email as buyer_email,
    l.id as listing_id,
    l.price,
    l.city,
    l.district,
    l.neighborhood,
    l.property_type,
    l.room_count,
    l.gross_area,
    l.net_area,
    l.site_name,
    l.description,
    l.address,
    l.latitude,
    l.longitude
FROM buyer_favorites bf
JOIN buyer b ON bf.buyer_id = b.id
JOIN listings l ON bf.listing_id = l.id;

-- Example queries to use with the new schema:

-- Get all favorites for Baran
-- SELECT * FROM buyer_favorites_detailed WHERE buyer_email = 'baran.konuk@example.com';

-- Get listings within Baran's budget that he hasn't favorited yet
-- SELECT l.* FROM listings l 
-- LEFT JOIN buyer_favorites bf ON l.id = bf.listing_id AND bf.buyer_id = 1
-- WHERE l.price BETWEEN 4000000 AND 8000000 
-- AND bf.id IS NULL;

-- Get average price of Baran's favorite listings
-- SELECT AVG(price) as avg_favorite_price 
-- FROM buyer_favorites_detailed 
-- WHERE buyer_id = 1;