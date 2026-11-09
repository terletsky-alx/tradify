CREATE TABLE ad_images (
    id         BIGSERIAL PRIMARY KEY,
    ad_id      BIGINT       NOT NULL REFERENCES ads (id) ON DELETE CASCADE,
    file_name  VARCHAR(255) NOT NULL,
    position   INTEGER      NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_ad_images_ad ON ad_images (ad_id);