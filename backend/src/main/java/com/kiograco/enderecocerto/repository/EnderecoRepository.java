package com.kiograco.enderecocerto.repository;

import com.kiograco.enderecocerto.entity.Endereco;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnderecoRepository extends JpaRepository<Endereco, Long> {

    List<Endereco> findByUsuarioIdOrderByIdAsc(Long usuarioId);

    Optional<Endereco> findByUsuarioIdAndPrincipalTrue(Long usuarioId);

    Optional<Endereco> findFirstByUsuarioIdOrderByIdAsc(Long usuarioId);
}
