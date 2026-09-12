package com.kiograco.enderecocerto.dto;

import com.kiograco.enderecocerto.entity.TipoUsuario;

public record LoginResponse(String token, TipoUsuario tipo) {
}
