package com.bbu.ai.face_auth.repository;

import com.bbu.ai.face_auth.models.ERole;
import com.bbu.ai.face_auth.models.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(ERole name);
}
