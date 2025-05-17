CREATE DATABASE bird;

CREATE TABLE seller (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    company_name VARCHAR(100),
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE listings (
    id SERIAL PRIMARY KEY,
    price NUMERIC(12,2) NOT NULL,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    neighborhood VARCHAR(100) NOT NULL,
    listing_number BIGINT UNIQUE NOT NULL,
    listing_date DATE NOT NULL,
    property_type VARCHAR(100) NOT NULL,
    gross_area INT,
    net_area INT,
    room_count VARCHAR(20),
    building_age INT,
    floor_number INT,
    total_floors INT,
    heating_type VARCHAR(100),
    bathroom_count INT,
    kitchen_type VARCHAR(50),
    has_balcony BOOLEAN,
    has_elevator BOOLEAN,
    parking_type VARCHAR(100),
    furnished BOOLEAN,
    usage_status VARCHAR(50),
    inside_site BOOLEAN,
    site_name VARCHAR(100),
    dues INT,
    is_loan_eligible BOOLEAN,
    deed_status VARCHAR(50),
    seller_type VARCHAR(100),
    exchange_possible BOOLEAN,
    description TEXT,
    address TEXT,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6)
);



INSERT INTO seller (full_name, email, phone, company_name, password)
VALUES 
('Ayşe Korkmaz', 'ayse.korkmaz@example.com', '05321234567', 'Korkmaz Elektronik', 'hashedpass1'),
('Burak Yıldız', 'burak.yildiz@example.com', '05329871234', NULL, 'hashedpass2'),
('Cemre Özdemir', 'cemre.ozdemir@example.com', '05329998877', 'Cemre Home Design', 'hashedpass3'),
('Deniz Aydın', 'deniz.aydin@example.com', '05327894561', NULL, 'hashedpass4'),
('Emre Aksoy', 'emre.aksoy@example.com', '05324443322', 'Aksoy Yazılım', 'hashedpass5');


INSERT INTO listings (
    price, city, district, neighborhood, listing_number, listing_date, property_type,
    gross_area, net_area, room_count, building_age, floor_number, total_floors,
    heating_type, bathroom_count, kitchen_type, has_balcony, has_elevator,
    parking_type, furnished, usage_status, inside_site, site_name, dues,
    is_loan_eligible, deed_status, seller_type, exchange_possible, description, address, latitude, longitude
) VALUES
-- Oran Royal Konutları (Aynı site içinde 5 daire)
(4650000, 'Ankara', 'Çankaya', 'Oran', 10022568, '2025-04-12', 'Daire',
 165, 150, '3+1', 5, 3, 12,
 'Merkezi Sistem', 2, 'Ankastre', true, true,
 'Kapalı Otopark', false, 'Boş', true, 'Oran Royal Konutları', 850,
 true, 'Kat Mülkiyetli', 'Emlakçı', false, 'Oran Royal Konutlarında ferah ve aydınlık 3+1 daire. Güney-batı cepheli, şehir manzaralı.', 'Oran Mahallesi, Oran Caddesi, No:45, Daire:15, Çankaya/Ankara', 39.883521, 32.816734),

(5250000, 'Ankara', 'Çankaya', 'Oran', 10022569, '2025-04-10', 'Daire',
 185, 170, '4+1', 5, 7, 12,
 'Merkezi Sistem', 2, 'Ankastre', true, true,
 'Kapalı Otopark', true, 'Boş', true, 'Oran Royal Konutları', 950,
 true, 'Kat Mülkiyetli', 'Sahibinden', false, 'Oran Royal Konutlarında geniş, ebeveyn banyolu, ankastre mutfaklı 4+1 daire.', 'Oran Mahallesi, Oran Caddesi, No:45, Daire:35, Çankaya/Ankara', 39.883521, 32.816734),

(6100000, 'Ankara', 'Çankaya', 'Oran', 10022570, '2025-04-15', 'Daire',
 210, 195, '4+1', 5, 10, 12,
 'Merkezi Sistem', 3, 'Ankastre', true, true,
 'Kapalı Otopark', false, 'Kiracılı', true, 'Oran Royal Konutları', 1100,
 true, 'Kat Mülkiyetli', 'Emlakçı', true, 'Oran Royal Konutlarında çatı dubleksi, şehir manzaralı, 3 banyolu lüks daire.', 'Oran Mahallesi, Oran Caddesi, No:45, Daire:48, Çankaya/Ankara', 39.883521, 32.816734),

(4100000, 'Ankara', 'Çankaya', 'Oran', 10022571, '2025-04-11', 'Daire',
 145, 130, '2+1', 5, 2, 12,
 'Merkezi Sistem', 1, 'Ankastre', true, true,
 'Kapalı Otopark', false, 'Boş', true, 'Oran Royal Konutları', 750,
 true, 'Kat Mülkiyetli', 'Sahibinden', false, 'Oran Royal Konutlarında kompakt ve ekonomik 2+1 daire. İdeal yatırım fırsatı.', 'Oran Mahallesi, Oran Caddesi, No:45, Daire:8, Çankaya/Ankara', 39.883521, 32.816734),

(5800000, 'Ankara', 'Çankaya', 'Oran', 10022572, '2025-04-14', 'Dubleks',
 240, 220, '5+1', 5, 11, 12,
 'Merkezi Sistem', 3, 'Ankastre', true, true,
 'Kapalı Otopark', true, 'Boş', true, 'Oran Royal Konutları', 1250,
 true, 'Kat Mülkiyetli', 'Emlakçı', false, 'Oran Royal Konutlarında dubleks, teras kullanımlı, panoramik şehir manzaralı lüks daire.', 'Oran Mahallesi, Oran Caddesi, No:45, Daire:50, Çankaya/Ankara', 39.883521, 32.816734),

-- Oran Park Residence (Aynı site içinde 4 daire)
(3850000, 'Ankara', 'Çankaya', 'Oran', 10022573, '2025-04-09', 'Daire',
 125, 110, '2+1', 2, 4, 15,
 'Merkezi Sistem', 1, 'Ankastre', true, true,
 'Kapalı Otopark', false, 'Boş', true, 'Oran Park Residence', 650,
 true, 'Kat Mülkiyetli', 'Emlakçı', false, 'Oran Park Residence''da ferah 2+1 daire. Spor salonu, havuz ve sosyal alan kullanımlı.', 'Oran Mahallesi, Park Caddesi, No:23, Daire:40, Çankaya/Ankara', 39.885790, 32.819456),

(4950000, 'Ankara', 'Çankaya', 'Oran', 10022574, '2025-04-08', 'Daire',
 155, 140, '3+1', 2, 8, 15,
 'Merkezi Sistem', 2, 'Ankastre', true, true,
 'Kapalı Otopark', true, 'Kiracılı', true, 'Oran Park Residence', 850,
 true, 'Kat Mülkiyetli', 'Sahibinden', false, 'Oran Park Residence''da kiracılı yatırımlık 3+1 daire. Aylık 15.000 TL kira getirisi.', 'Oran Mahallesi, Park Caddesi, No:23, Daire:85, Çankaya/Ankara', 39.885790, 32.819456),

(5400000, 'Ankara', 'Çankaya', 'Oran', 10022575, '2025-04-13', 'Daire',
 170, 155, '3+1', 2, 12, 15,
 'Merkezi Sistem', 2, 'Ankastre', true, true,
 'Kapalı Otopark', false, 'Boş', true, 'Oran Park Residence', 900,
 true, 'Kat Mülkiyetli', 'Emlakçı', true, 'Oran Park Residence''da manzaralı, lüks 3+1 daire. Ebeveyn banyolu, giyinme odalı.', 'Oran Mahallesi, Park Caddesi, No:23, Daire:125, Çankaya/Ankara', 39.885790, 32.819456),

(6900000, 'Ankara', 'Çankaya', 'Oran', 10022576, '2025-04-16', 'Daire',
 200, 185, '4+1', 2, 14, 15,
 'Merkezi Sistem', 3, 'Ankastre', true, true,
 'Kapalı Otopark', true, 'Boş', true, 'Oran Park Residence', 1050,
 true, 'Kat Mülkiyetli', 'Sahibinden', true, 'Oran Park Residence''da teraslı, panoramik manzaralı 4+1 lüks daire. Özel dekorasyonlu.', 'Oran Mahallesi, Park Caddesi, No:23, Daire:140, Çankaya/Ankara', 39.885790, 32.819456),

-- Tek Daireler (Farklı binalarda)
(3250000, 'Ankara', 'Çankaya', 'Oran', 10022577, '2025-04-05', 'Daire',
 115, 100, '2+1', 15, 3, 5,
 'Kombi', 1, 'Set Üstü', true, false,
 'Açık Otopark', false, 'Boş', false, NULL, 350,
 true, 'Kat Mülkiyetli', 'Emlakçı', false, 'Oran''da bakımlı, masrafsız 2+1 daire. Ulaşımı kolay lokasyonda.', 'Oran Mahallesi, Orkide Sokak, No:7, Daire:9, Çankaya/Ankara', 39.882150, 32.814650),

(3750000, 'Ankara', 'Çankaya', 'Oran', 10022578, '2025-04-02', 'Daire',
 130, 120, '3+1', 12, 2, 4,
 'Kombi', 1, 'Set Üstü', true, false,
 'Sokak Parkı', false, 'Kiracılı', false, NULL, 250,
 true, 'Kat Mülkiyetli', 'Sahibinden', true, 'Oran''da kiracılı, bakımlı 3+1. Aylık 12.000 TL kira getirisi. Masrafsız.', 'Oran Mahallesi, Lale Sokak, No:12, Daire:4, Çankaya/Ankara', 39.880956, 32.813200),

-- Oran Vista Evleri (Aynı site içinde 3 daire)
(7800000, 'Ankara', 'Çankaya', 'Oran', 10022579, '2025-04-17', 'Daire',
 220, 200, '4+1', 1, 5, 8,
 'Merkezi Sistem', 3, 'Ankastre', true, true,
 'Kapalı Otopark', true, 'Boş', true, 'Oran Vista Evleri', 1200,
 true, 'Kat Mülkiyetli', 'Emlakçı', false, 'Oran Vista Evleri''nde yeni yapılmış, lüks 4+1 daire. Akıllı ev sistemli, özel peyzajlı.', 'Oran Mahallesi, Vista Caddesi, No:15, Daire:25, Çankaya/Ankara', 39.887530, 32.822100),

(8500000, 'Ankara', 'Çankaya', 'Oran', 10022580, '2025-04-18', 'Dubleks',
 280, 260, '5+1', 1, 7, 8,
 'Merkezi Sistem', 4, 'Ankastre', true, true,
 'Kapalı Otopark', true, 'Boş', true, 'Oran Vista Evleri', 1500,
 true, 'Kat Mülkiyetli', 'Sahibinden', false, 'Oran Vista Evleri''nde dubleks, özel teras alanlı, jakuzili, şömineli lüks daire.', 'Oran Mahallesi, Vista Caddesi, No:15, Daire:35, Çankaya/Ankara', 39.887530, 32.822100),

(7200000, 'Ankara', 'Çankaya', 'Oran', 10022581, '2025-04-15', 'Daire',
 190, 175, '3+1', 1, 3, 8,
 'Merkezi Sistem', 2, 'Ankastre', true, true,
 'Kapalı Otopark', false, 'Boş', true, 'Oran Vista Evleri', 1100,
 true, 'Kat Mülkiyetli', 'Emlakçı', true, 'Oran Vista Evleri''nde bahçe kullanımlı, özel peyzajlı 3+1 lüks daire.', 'Oran Mahallesi, Vista Caddesi, No:15, Daire:10, Çankaya/Ankara', 39.887530, 32.822100),

-- Diğer Daireler
(2950000, 'Ankara', 'Çankaya', 'Oran', 10022582, '2025-04-01', 'Daire',
 90, 80, '1+1', 8, 1, 6,
 'Kombi', 1, 'Set Üstü', false, true,
 'Sokak Parkı', false, 'Boş', false, NULL, 300,
 true, 'Kat Mülkiyetli', 'Sahibinden', false, 'Oran''da giriş katta, bakımlı 1+1 daire. İlk eve ve yatırıma uygun.', 'Oran Mahallesi, Menekşe Sokak, No:5, Daire:1, Çankaya/Ankara', 39.884230, 32.815600),

(4200000, 'Ankara', 'Çankaya', 'Oran', 10022583, '2025-04-03', 'Daire',
 135, 125, '3+1', 10, 4, 5,
 'Kombi', 2, 'Set Üstü', true, false,
 'Açık Otopark', false, 'Kiracılı', false, NULL, 400,
 true, 'Kat Mülkiyetli', 'Emlakçı', true, 'Oran''da köşe konumlu, ferah ve aydınlık 3+1 daire. Bakımlı bina.', 'Oran Mahallesi, Zambak Sokak, No:22, Daire:16, Çankaya/Ankara', 39.881500, 32.817800),

-- Oran Elit Residence (Aynı site içinde 5 daire)
(5100000, 'Ankara', 'Çankaya', 'Oran', 10022584, '2025-04-09', 'Daire',
 150, 135, '3+1', 3, 6, 10,
 'Merkezi Sistem', 2, 'Ankastre', true, true,
 'Kapalı Otopark', true, 'Boş', true, 'Oran Elit Residence', 900,
 true, 'Kat Mülkiyetli', 'Sahibinden', false, 'Oran Elit Residence''da geniş, ferah 3+1 daire. 24 saat güvenlikli, havuzlu site.', 'Oran Mahallesi, Elit Caddesi, No:33, Daire:35, Çankaya/Ankara', 39.886210, 32.824500),

(4800000, 'Ankara', 'Çankaya', 'Oran', 10022585, '2025-04-10', 'Daire',
 140, 125, '2+1', 3, 3, 10,
 'Merkezi Sistem', 1, 'Ankastre', true, true,
 'Kapalı Otopark', false, 'Boş', true, 'Oran Elit Residence', 800,
 true, 'Kat Mülkiyetli', 'Emlakçı', true, 'Oran Elit Residence''da şık ve kullanışlı 2+1 daire. Havuz manzaralı.', 'Oran Mahallesi, Elit Caddesi, No:33, Daire:15, Çankaya/Ankara', 39.886210, 32.824500),

(5500000, 'Ankara', 'Çankaya', 'Oran', 10022586, '2025-04-11', 'Daire',
 160, 145, '3+1', 3, 8, 10,
 'Merkezi Sistem', 2, 'Ankastre', true, true,
 'Kapalı Otopark', true, 'Kiracılı', true, 'Oran Elit Residence', 950,
 true, 'Kat Mülkiyetli', 'Sahibinden', false, 'Oran Elit Residence''da kiracılı 3+1 daire. Aylık 18.000 TL kira getirisi.', 'Oran Mahallesi, Elit Caddesi, No:33, Daire:45, Çankaya/Ankara', 39.886210, 32.824500),

(6300000, 'Ankara', 'Çankaya', 'Oran', 10022587, '2025-04-12', 'Daire',
 180, 165, '4+1', 3, 9, 10,
 'Merkezi Sistem', 2, 'Ankastre', true, true,
 'Kapalı Otopark', false, 'Boş', true, 'Oran Elit Residence', 1000,
 true, 'Kat Mülkiyetli', 'Emlakçı', true, 'Oran Elit Residence''da geniş 4+1 daire. Ebeveyn banyolu, giyinme odalı.', 'Oran Mahallesi, Elit Caddesi, No:33, Daire:50, Çankaya/Ankara', 39.886210, 32.824500),

(7500000, 'Ankara', 'Çankaya', 'Oran', 10022588, '2025-04-14', 'Dubleks',
 250, 230, '5+1', 3, 10, 10,
 'Merkezi Sistem', 3, 'Ankastre', true, true,
 'Kapalı Otopark', true, 'Boş', true, 'Oran Elit Residence', 1300,
 true, 'Kat Mülkiyetli', 'Sahibinden', false, 'Oran Elit Residence''da çatı dubleksi. Özel teras alanlı, panoramik şehir manzaralı.', 'Oran Mahallesi, Elit Caddesi, No:33, Daire:55, Çankaya/Ankara', 39.886210, 32.824500),

-- Oran Yeşil Vadi Konutları (Aynı site içinde 4 daire)
(4200000, 'Ankara', 'Çankaya', 'Oran', 10022589, '2025-04-05', 'Daire',
 140, 125, '3+1', 6, 2, 8,
 'Merkezi Sistem', 1, 'Ankastre', true, true,
 'Açık Otopark', false, 'Boş', true, 'Oran Yeşil Vadi Konutları', 700,
 true, 'Kat Mülkiyetli', 'Emlakçı', false, 'Oran Yeşil Vadi Konutları''nda ferah 3+1 daire. Çocuk parkı ve yeşil alan manzaralı.', 'Oran Mahallesi, Yeşil Vadi Caddesi, No:18, Daire:8, Çankaya/Ankara', 39.882780, 32.819200),

(4550000, 'Ankara', 'Çankaya', 'Oran', 10022590, '2025-04-06', 'Daire',
 150, 135, '3+1', 6, 4, 8,
 'Merkezi Sistem', 2, 'Ankastre', true, true,
 'Açık Otopark', true, 'Kiracılı', true, 'Oran Yeşil Vadi Konutları', 750,
 true, 'Kat Mülkiyetli', 'Sahibinden', true, 'Oran Yeşil Vadi Konutları''nda kiracılı 3+1 daire. Aylık 15.000 TL kira getirisi.', 'Oran Mahallesi, Yeşil Vadi Caddesi, No:18, Daire:19, Çankaya/Ankara', 39.882780, 32.819200),

(5100000, 'Ankara', 'Çankaya', 'Oran', 10022591, '2025-04-07', 'Daire',
 170, 155, '4+1', 6, 6, 8,
 'Merkezi Sistem', 2, 'Ankastre', true, true,
 'Açık Otopark', false, 'Boş', true, 'Oran Yeşil Vadi Konutları', 850,
 true, 'Kat Mülkiyetli', 'Emlakçı', false, 'Oran Yeşil Vadi Konutları''nda geniş 4+1 daire. Ebeveyn banyolu, ferah odalar.', 'Oran Mahallesi, Yeşil Vadi Caddesi, No:18, Daire:30, Çankaya/Ankara', 39.882780, 32.819200),

(5900000, 'Ankara', 'Çankaya', 'Oran', 10022592, '2025-04-08', 'Dubleks',
 220, 200, '4+1', 6, 8, 8,
 'Merkezi Sistem', 3, 'Ankastre', true, true,
 'Açık Otopark', true, 'Boş', true, 'Oran Yeşil Vadi Konutları', 950,
 true, 'Kat Mülkiyetli', 'Sahibinden', true, 'Oran Yeşil Vadi Konutları''nda çatı dubleksi. Özel teras alanlı, manzaralı.', 'Oran Mahallesi, Yeşil Vadi Caddesi, No:18, Daire:40, Çankaya/Ankara', 39.882780, 32.819200),

-- Diğer Daireler
(3300000, 'Ankara', 'Çankaya', 'Oran', 10022593, '2025-04-02', 'Daire',
 110, 95, '2+1', 20, 2, 4,
 'Kombi', 1, 'Set Üstü', true, false,
 'Sokak Parkı', false, 'Boş', false, NULL, 280,
 true, 'Kat Mülkiyetli', 'Emlakçı', true, 'Oran''da bakımlı, 2+1 daire. Ulaşım ağlarına yakın konumda.', 'Oran Mahallesi, Gül Sokak, No:9, Daire:5, Çankaya/Ankara', 39.883450, 32.815100),

(3850000, 'Ankara', 'Çankaya', 'Oran', 10022594, '2025-04-03', 'Daire',
 125, 115, '3+1', 18, 3, 5,
 'Kombi', 1, 'Set Üstü', true, false,
 'Sokak Parkı', false, 'Kiracılı', false, NULL, 350,
 true, 'Kat Mülkiyetli', 'Sahibinden', false, 'Oran''da kiracılı, 3+1 daire. Aylık 13.000 TL kira getirisi.', 'Oran Mahallesi, Papatya Sokak, No:14, Daire:12, Çankaya/Ankara', 39.884700, 32.816300),

-- Oran Panorama Evleri (Aynı site içinde 3 daire)
(6800000, 'Ankara', 'Çankaya', 'Oran', 10022595, '2025-04-15', 'Daire',
 190, 175, '4+1', 4, 7, 10,
 'Merkezi Sistem', 2, 'Ankastre', true, true,
 'Kapalı Otopark', true, 'Boş', true, 'Oran Panorama Evleri', 1100,
 true, 'Kat Mülkiyetli', 'Emlakçı', false, 'Oran Panorama Evleri''nde lüks 4+1 daire. Şehir manzaralı, ebeveyn banyolu.', 'Oran Mahallesi, Panorama Caddesi, No:27, Daire:40, Çankaya/Ankara', 39.888300, 32.825600),

(7200000, 'Ankara', 'Çankaya', 'Oran', 10022596, '2025-04-16', 'Daire',
 200, 185, '4+1', 4, 9, 10,
 'Merkezi Sistem', 3, 'Ankastre', true, true,
 'Kapalı Otopark', true, 'Kiracılı', true, 'Oran Panorama Evleri', 1200,
 true, 'Kat Mülkiyetli', 'Sahibinden', true, 'Oran Panorama Evleri''nde kiracılı 4+1 daire. Aylık 22.000 TL kira getirisi.', 'Oran Mahallesi, Panorama Caddesi, No:27, Daire:50, Çankaya/Ankara', 39.888300, 32.825600),

(8900000, 'Ankara', 'Çankaya', 'Oran', 10022597, '2025-04-17', 'Dubleks',
 280, 260, '5+1', 4, 10, 10,
 'Merkezi Sistem', 4, 'Ankastre', true, true,
 'Kapalı Otopark', true, 'Boş', true, 'Oran Panorama Evleri', 1500,
 true, 'Kat Mülkiyetli', 'Emlakçı', false, 'Oran Panorama Evleri''nde çatı dubleksi. Özel teras alanlı, jakuzili, panoramik manzaralı.', 'Oran Mahallesi, Panorama Caddesi, No:27, Daire:55, Çankaya/Ankara', 39.888300, 32.825600),

-- Diğer Daireler
(3500000, 'Ankara', 'Çankaya', 'Oran', 10022598, '2025-04-01', 'Daire',
 120, 105, '2+1', 15, 4, 5,
 'Kombi', 1, 'Set Üstü', true, false,
 'Sokak Parkı', false, 'Boş', false, NULL, 320,
 true, 'Kat Mülkiyetli', 'Sahibinden', true, 'Oran''da bakımlı, 2+1 daire. Ferah ve aydınlık, köşe konumlu.', 'Oran Mahallesi, Mimoza Sokak, No:11, Daire:18, Çankaya/Ankara', 39.881900, 32.816700),

(4100000, 'Ankara', 'Çankaya', 'Oran', 10022599, '2025-04-02', 'Daire',
 135, 120, '3+1', 14, 2, 4,
 'Kombi', 2, 'Set Üstü', true, false,
 'Açık Otopark', false, 'Kiracılı', false, NULL, 380,
 true, 'Kat Mülkiyetli', 'Emlakçı', false, 'Oran''da kiracılı, 3+1 daire. Aylık 14.000 TL kira getirisi. Bakımlı bina.', 'Oran Mahallesi, Akasya Sokak, No:6, Daire:6, Çankaya/Ankara', 39.885100, 32.817400),

-- Oran Hills (Aynı site içinde 4 daire)
(7500000, 'Ankara', 'Çankaya', 'Oran', 10022600, '2025-04-10', 'Daire',
 195, 180, '4+1', 2, 5, 12,
 'Merkezi Sistem', 3, 'Ankastre', true, true,
 'Kapalı Otopark', true, 'Boş', true, 'Oran Hills', 1250,
 true, 'Kat Mülkiyetli', 'Emlakçı', false, 'Oran Hills''te lüks 4+1 daire. Özel peyzajlı, güvenlikli site içerisinde.', 'Oran Mahallesi, Hills Caddesi, No:42, Daire:30, Çankaya/Ankara', 39.889450, 32.827300),

(8100000, 'Ankara', 'Çankaya', 'Oran', 10022601, '2025-04-11', 'Daire',
 215, 200, '4+1', 2, 8, 12,
 'Merkezi Sistem', 3, 'Ankastre', true, true,
 'Kapalı Otopark', true, 'Kiracılı', true, 'Oran Hills', 1350,
 true, 'Kat Mülkiyetli', 'Sahibinden', true, 'Oran Hills''te kiracılı 4+1 daire. Aylık 25.000 TL kira getirisi. Lüks daire.', 'Oran Mahallesi, Hills Caddesi, No:42, Daire:45, Çankaya/Ankara', 39.889450, 32.827300),

(9500000, 'Ankara', 'Çankaya', 'Oran', 10022602, '2025-04-12', 'Daire',
 240, 225, '5+1', 2, 10, 12,
 'Merkezi Sistem', 4, 'Ankastre', true, true,
 'Kapalı Otopark', true, 'Boş', true, 'Oran Hills', 1500,
 true, 'Kat Mülkiyetli', 'Emlakçı', false, 'Oran Hills''te geniş 5+1 daire. Özel tasarım, akıllı ev sistemli.', 'Oran Mahallesi, Hills Caddesi, No:42, Daire:55, Çankaya/Ankara', 39.889450, 32.827300),

(11500000, 'Ankara', 'Çankaya', 'Oran', 10022603, '2025-04-13', 'Dubleks',
 320, 300, '6+1', 2, 12, 12,
 'Merkezi Sistem', 5, 'Ankastre', true, true,
 'Kapalı Otopark', true, 'Boş', true, 'Oran Hills', 1800,
 true, 'Kat Mülkiyetli', 'Sahibinden', false, 'Oran Hills''te çatı dubleksi. Özel havuzlu, jakuzili, panoramik şehir manzaralı.', 'Oran Mahallesi, Hills Caddesi, No:42, Daire:65, Çankaya/Ankara', 39.889450, 32.827300),

-- Diğer Daireler
(3600000, 'Ankara', 'Çankaya', 'Oran', 10022604, '2025-03-30', 'Daire',
 115, 105, '2+1', 25, 1, 3,
 'Kombi', 1, 'Set Üstü', false, false,
 'Sokak Parkı', false, 'Boş', false, NULL, 300,
 true, 'Kat Mülkiyetli', 'Emlakçı', true, 'Oran''da giriş katta, bakımlı 2+1 daire. Uygun fiyatlı.', 'Oran Mahallesi, Karanfil Sokak, No:4, Daire:1, Çankaya/Ankara', 39.882500, 32.815300),

(4200000, 'Ankara', 'Çankaya', 'Oran', 10022605, '2025-03-31', 'Daire',
 130, 120, '3+1', 22, 3, 4,
 'Kombi', 1, 'Set Üstü', true, false,
 'Sokak Parkı', false, 'Kiracılı', false, NULL, 350,
 true, 'Kat Mülkiyetli', 'Sahibinden', false, 'Oran''da kiracılı, 3+1 daire. Aylık 13.500 TL kira getirisi. Bakımlı.', 'Oran Mahallesi, Nergis Sokak, No:8, Daire:12, Çankaya/Ankara', 39.883600, 32.816800),

-- Oran Prestij Konutları (Aynı site içinde 5 daire)
(5300000, 'Ankara', 'Çankaya', 'Oran', 10022606, '2025-04-05', 'Daire',
 160, 145, '3+1', 7, 3, 14,
 'Merkezi Sistem', 2, 'Ankastre', true, true,
 'Kapalı Otopark', false, 'Boş', true, 'Oran Prestij Konutları', 900,
 true, 'Kat Mülkiyetli', 'Emlakçı', false, 'Oran Prestij Konutları''nda ferah 3+1 daire. 7/24 güvenlikli, sosyal alanlı site.', 'Oran Mahallesi, Prestij Caddesi, No:55, Daire:15, Çankaya/Ankara', 39.886800, 32.820500),

(5900000, 'Ankara', 'Çankaya', 'Oran', 10022607, '2025-04-06', 'Daire',
 175, 160, '3+1', 7, 7, 14,
 'Merkezi Sistem', 2, 'Ankastre', true, true,
 'Kapalı Otopark', true, 'Kiracılı', true, 'Oran Prestij Konutları', 950,
 true, 'Kat Mülkiyetli', 'Sahibinden', true, 'Oran Prestij Konutları''nda kiracılı 3+1 daire. Aylık 19.000 TL kira getirisi.', 'Oran Mahallesi, Prestij Caddesi, No:55, Daire:35, Çankaya/Ankara', 39.886800, 32.820500),

(6400000, 'Ankara', 'Çankaya', 'Oran', 10022608, '2025-04-07', 'Daire',
 190, 175, '4+1', 7, 10, 14,
 'Merkezi Sistem', 3, 'Ankastre', true, true,
 'Kapalı Otopark', true, 'Boş', true, 'Oran Prestij Konutları', 1100,
 true, 'Kat Mülkiyetli', 'Emlakçı', false, 'Oran Prestij Konutları''nda lüks 4+1 daire. Ebeveyn banyolu, giyinme odalı.', 'Oran Mahallesi, Prestij Caddesi, No:55, Daire:50, Çankaya/Ankara', 39.886800, 32.820500),

(7200000, 'Ankara', 'Çankaya', 'Oran', 10022609, '2025-04-08', 'Daire',
 205, 190, '4+1', 7, 12, 14,
 'Merkezi Sistem', 3, 'Ankastre', true, true,
 'Kapalı Otopark', false, 'Boş', true, 'Oran Prestij Konutları', 1250,
 true, 'Kat Mülkiyetli', 'Sahibinden', true, 'Oran Prestij Konutları''nda manzaralı 4+1 daire. Şehir manzaralı, lüks.', 'Oran Mahallesi, Prestij Caddesi, No:55, Daire:60, Çankaya/Ankara', 39.886800, 32.820500),

(8300000, 'Ankara', 'Çankaya', 'Oran', 10022610, '2025-04-09', 'Dubleks',
 270, 250, '5+1', 7, 14, 14,
 'Merkezi Sistem', 4, 'Ankastre', true, true,
 'Kapalı Otopark', true, 'Boş', true, 'Oran Prestij Konutları', 1500,
 true, 'Kat Mülkiyetli', 'Emlakçı', false, 'Oran Prestij Konutları''nda dubleks daire. Özel teras alanlı, panoramik manzaralı.', 'Oran Mahallesi, Prestij Caddesi, No:55, Daire:70, Çankaya/Ankara', 39.886800, 32.820500),

-- Oran Garden (Aynı site içinde 4 daire)
(4900000, 'Ankara', 'Çankaya', 'Oran', 10022611, '2025-04-02', 'Daire',
 155, 140, '3+1', 8, 2, 9,
 'Merkezi Sistem', 2, 'Ankastre', true, true,
 'Kapalı Otopark', false, 'Boş', true, 'Oran Garden', 850,
 true, 'Kat Mülkiyetli', 'Sahibinden', false, 'Oran Garden''da bahçe katı 3+1 daire. Özel bahçe kullanımlı, ferah.', 'Oran Mahallesi, Garden Caddesi, No:37, Daire:5, Çankaya/Ankara', 39.884650, 32.818900),

(5200000, 'Ankara', 'Çankaya', 'Oran', 10022612, '2025-04-03', 'Daire',
 165, 150, '3+1', 8, 5, 9,
 'Merkezi Sistem', 2, 'Ankastre', true, true,
 'Kapalı Otopark', true, 'Kiracılı', true, 'Oran Garden', 900,
 true, 'Kat Mülkiyetli', 'Emlakçı', true, 'Oran Garden''da kiracılı 3+1 daire. Aylık 17.000 TL kira getirisi.', 'Oran Mahallesi, Garden Caddesi, No:37, Daire:25, Çankaya/Ankara', 39.884650, 32.818900),

(5900000, 'Ankara', 'Çankaya', 'Oran', 10022613, '2025-04-04', 'Daire',
 180, 165, '4+1', 8, 7, 9,
 'Merkezi Sistem', 3, 'Ankastre', true, true,
 'Kapalı Otopark', false, 'Boş', true, 'Oran Garden', 1000,
 true, 'Kat Mülkiyetli', 'Sahibinden', false, 'Oran Garden''da geniş 4+1 daire. Ebeveyn banyolu, ferah odalar.', 'Oran Mahallesi, Garden Caddesi, No:37, Daire:35, Çankaya/Ankara', 39.884650, 32.818900),

(6800000, 'Ankara', 'Çankaya', 'Oran', 10022614, '2025-04-05', 'Dubleks',
 240, 220, '4+1', 8, 9, 9,
 'Merkezi Sistem', 3, 'Ankastre', true, true,
 'Kapalı Otopark', true, 'Boş', true, 'Oran Garden', 1200,
 true, 'Kat Mülkiyetli', 'Emlakçı', true, 'Oran Garden''da dubleks 4+1 daire. Teras kullanımlı, panoramik manzaralı.', 'Oran Mahallesi, Garden Caddesi, No:37, Daire:45, Çankaya/Ankara', 39.884650, 32.818900),

-- Oran Konak (Aynı site içinde 3 daire)
(6900000, 'Ankara', 'Çankaya', 'Oran', 10022615, '2025-04-14', 'Daire',
 185, 170, '4+1', 5, 3, 8,
 'Merkezi Sistem', 3, 'Ankastre', true, true,
 'Kapalı Otopark', true, 'Boş', true, 'Oran Konak', 1100,
 true, 'Kat Mülkiyetli', 'Sahibinden', false, 'Oran Konak''ta geniş 4+1 daire. Lüks detaylara sahip, ferah odalar.', 'Oran Mahallesi, Konak Caddesi, No:22, Daire:15, Çankaya/Ankara', 39.887900, 32.823400),

(7500000, 'Ankara', 'Çankaya', 'Oran', 10022616, '2025-04-15', 'Daire',
 200, 185, '4+1', 5, 6, 8,
 'Merkezi Sistem', 3, 'Ankastre', true, true,
 'Kapalı Otopark', false, 'Kiracılı', true, 'Oran Konak', 1250,
 true, 'Kat Mülkiyetli', 'Emlakçı', true, 'Oran Konak''ta kiracılı 4+1 daire. Aylık 23.000 TL kira getirisi.', 'Oran Mahallesi, Konak Caddesi, No:22, Daire:30, Çankaya/Ankara', 39.887900, 32.823400),

(9800000, 'Ankara', 'Çankaya', 'Oran', 10022617, '2025-04-16', 'Dubleks',
 280, 260, '5+1', 5, 8, 8,
 'Merkezi Sistem', 4, 'Ankastre', true, true,
 'Kapalı Otopark', true, 'Boş', true, 'Oran Konak', 1600,
 true, 'Kat Mülkiyetli', 'Sahibinden', false, 'Oran Konak''ta dubleks 5+1 daire. Özel teras, jakuzi, şömine detaylı.', 'Oran Mahallesi, Konak Caddesi, No:22, Daire:40, Çankaya/Ankara', 39.887900, 32.823400);