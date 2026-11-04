CREATE TABLE cities (
                        id     BIGSERIAL PRIMARY KEY,
                        name   VARCHAR(100) NOT NULL,
                        region VARCHAR(100) NOT NULL,
                        CONSTRAINT uq_cities_name_region UNIQUE (name, region)
);

CREATE TABLE categories (
                            id        BIGSERIAL PRIMARY KEY,
                            name      VARCHAR(100) NOT NULL,
                            slug      VARCHAR(100) NOT NULL UNIQUE,
                            parent_id BIGINT REFERENCES categories (id)
);