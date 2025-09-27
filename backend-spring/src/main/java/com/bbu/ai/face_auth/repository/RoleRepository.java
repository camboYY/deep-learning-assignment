package com.bbu.ai.face_auth.repository;

    import com.bbu.ai.face_auth.models.EnumRole;
import com.bbu.ai.face_auth.models.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<UserRole, Long> {
    Optional<UserRole> findByName(EnumRole name);
}
