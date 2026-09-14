package com.kiograco.enderecocerto.dto;

import com.kiograco.enderecocerto.entity.Endereco;

public record EnderecoResponse(
        Long id,
        Long usuarioId,
        String cep,
        String numero,
        String complemento,
        String logradouro,
        String bairro,
        String cidade,
        String estado,
        boolean principal
) {

    public static EnderecoResponse from(Endereco endereco) {
        return new EnderecoResponse(
                endereco.getId(),
                endereco.getUsuario().getId(),
                endereco.getCep(),
                endereco.getNumero(),
                endereco.getComplemento(),
                endereco.getLogradouro(),
                endereco.getBairro(),
                endereco.getCidade(),
                endereco.getEstado(),
                endereco.isPrincipal()
        );
    }
}
