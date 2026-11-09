CREATE TABLE ads (
    id             BIGSERIAL PRIMARY KEY,
    title          VARCHAR(120) NOT NULL,
    description    TEXT,
    price          NUMERIC(12, 2),
    item_condition VARCHAR(20)  NOT NULL DEFAULT 'USED',
    status         VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    seller_id      BIGINT       NOT NULL REFERENCES users (id),
    city_id        BIGINT       NOT NULL REFERENCES cities (id),
    category_id    BIGINT       NOT NULL REFERENCES categories (id),
    views_count    INTEGER      NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_ads_seller   ON ads (seller_id);
CREATE INDEX idx_ads_city     ON ads (city_id);
CREATE INDEX idx_ads_category ON ads (category_id);
CREATE INDEX idx_ads_status_created ON ads (status, created_at DESC);