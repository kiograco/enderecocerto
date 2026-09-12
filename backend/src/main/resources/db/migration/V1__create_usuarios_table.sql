CREATE TABLE usuarios (
    id               BIGSERIAL PRIMARY KEY,
    nome             VARCHAR(150)   NOT NULL,
    cpf              CHAR(11)       NOT NULL,
    data_nascimento  DATE           NOT NULL,
    senha_hash       VARCHAR(255)   NOT NULL,
    tipo             VARCHAR(10)    NOT NULL,
    CONSTRAINT uq_usuarios_cpf UNIQUE (cpf),
    CONSTRAINT ck_usuarios_tipo CHECK (tipo IN ('ADMIN', 'COMUM'))
);
