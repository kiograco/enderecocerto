package com.kiograco.enderecocerto.security;

import com.kiograco.enderecocerto.entity.TipoUsuario;
import com.kiograco.enderecocerto.entity.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtService {

    private final SecretKey chave;
    private final long expiracaoMinutos;

    public JwtService(
            @Value("${security.jwt.secret}") String secret,
            @Value("${security.jwt.expiration-minutes}") long expiracaoMinutos
    ) {
        this.chave = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiracaoMinutos = expiracaoMinutos;
    }

    public String gerarToken(Usuario usuario) {
        Instant agora = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(usuario.getId()))
                .claim("cpf", usuario.getCpf())
                .claim("tipo", usuario.getTipo().name())
                .issuedAt(Date.from(agora))
                .expiration(Date.from(agora.plus(expiracaoMinutos, ChronoUnit.MINUTES)))
                .signWith(chave)
                .compact();
    }

    public UsuarioAutenticado extrairUsuarioAutenticado(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(chave)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        Long id = Long.valueOf(claims.getSubject());
        String cpf = claims.get("cpf", String.class);
        TipoUsuario tipo = TipoUsuario.valueOf(claims.get("tipo", String.class));
        return new UsuarioAutenticado(id, cpf, tipo);
    }
}
