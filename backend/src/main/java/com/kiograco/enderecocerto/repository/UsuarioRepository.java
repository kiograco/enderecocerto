package com.kiograco.enderecocerto.repository;

import com.kiograco.enderecocerto.entity.Usuario;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    boolean existsByCpf(String cpf);

    Optional<Usuario> findByCpf(String cpf);
}
