package com.kiograco.enderecocerto.security;

import com.kiograco.enderecocerto.exception.AcessoNegadoException;
import org.springframework.stereotype.Component;

@Component
public class AutorizacaoService {

    /**
     * Admin acessa qualquer recurso; usuario comum so acessa o proprio,
     * sempre comparando com o id que veio do token -- nunca com um id
     * que tenha chegado no corpo ou na URL da requisicao sem essa checagem.
     */
    public void garantirAcessoAoRecurso(UsuarioAutenticado logado, Long usuarioIdDoRecurso) {
        boolean donoDoRecurso = logado.id().equals(usuarioIdDoRecurso);
        if (!logado.isAdmin() && !donoDoRecurso) {
            throw new AcessoNegadoException("Acesso negado a recurso de outro usuario");
        }
    }

    public void garantirAdmin(UsuarioAutenticado logado) {
        if (!logado.isAdmin()) {
            throw new AcessoNegadoException("Acesso restrito a administradores");
        }
    }
}
