-- =============================================
-- MAONI 100.04 - SEED DATA
-- =============================================

-- Insert demo proposals (requires users to exist first)
-- These are example proposals for testing

INSERT INTO proposals (user_id, subject, one_sentence, content, category, status) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'Renforcement de la décentralisation',
  'Donner plus d''autonomie aux provinces pour leur développement',
  'La Constitution actuelle centralise trop le pouvoir à Kinshasa...',
  'decentralization',
  'published'
),
(
  '00000000-0000-0000-0000-000000000001',
  'Réforme du système électoral',
  'Instaurer un système proportionnel pour plus de représentativité',
  'Le système actuel ne reflète pas la diversité politique...',
  'electoral',
  'published'
),
(
  '00000000-0000-0000-0000-000000000001',
  'Protection des ressources naturelles',
  'Inscrire la protection du Bassin du Congo dans la Constitution',
  'Nos ressources naturelles sont un patrimoine national...',
  'constitutional',
  'published'
);

-- Insert province data
INSERT INTO province_stats (province_name, population) VALUES
('Kinshasa', 14565700),
('Nord-Kivu', 6655000),
('Sud-Kivu', 5772000),
('Ituri', 3650000),
('Haut-Uélé', 1864000),
('Tshopo', 2352000),
('Bas-Uélé', 1138000),
('Équateur', 1628000),
('Sud-Ubangi', 2458000),
('Nord-Ubangi', 1269000),
('Mongala', 1740000),
('Tshuapa', 1329000),
('Maniema', 2333000),
('Kasaï', 2801000),
('Kasaï-Central', 2817000),
('Kasaï-Oriental', 3145000),
('Lomami', 2443000),
('Sankuru', 2110000),
('Tanganyika', 2982000),
('Haut-Lomami', 2957000),
('Lualaba', 2570000),
('Haut-Katanga', 4617000),
('Kwango', 2152000),
('Kwilu', 5490000),
('Mai-Ndombe', 1852000),
('Kongo Central', 5575000);