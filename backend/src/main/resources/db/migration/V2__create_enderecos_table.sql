CREATE TABLE enderecos (
    id           BIGSERIAL PRIMARY KEY,
    usuario_id   BIGINT         NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    cep          VARCHAR(8)     NOT NULL,
    numero       VARCHAR(20)    NOT NULL,
    complemento  VARCHAR(100),
    logradouro   VARCHAR(150)   NOT NULL,
    bairro       VARCHAR(100)   NOT NULL,
    cidade       VARCHAR(100)   NOT NULL,
    estado       VARCHAR(2)     NOT NULL,
    principal    BOOLEAN        NOT NULL DEFAULT FALSE
);

CREATE INDEX ix_enderecos_usuario_id ON enderecos (usuario_id);

-- Garante um único endereço principal por usuário na raiz (constraint), não só via lógica de aplicação.
CREATE UNIQUE INDEX uq_enderecos_usuario_principal
    ON enderecos (usuario_id)
    WHERE principal = TRUE;
