INSERT INTO categories (name, slug, parent_id) VALUES
    ('Квартиры', 'apartments', (SELECT id FROM categories WHERE slug = 'real-estate')),
    ('Дома и дачи', 'houses', (SELECT id FROM categories WHERE slug = 'real-estate')),
    ('Мебель', 'furniture', (SELECT id FROM categories WHERE slug = 'home-garden')),
    ('Женская одежда', 'women-clothes', (SELECT id FROM categories WHERE slug = 'clothes')),
    ('Мужская одежда', 'men-clothes', (SELECT id FROM categories WHERE slug = 'clothes')),
    ('Игрушки', 'toys', (SELECT id FROM categories WHERE slug = 'kids'));