package student.ctuet.edu.vn.hethongquanlythuoc.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import student.ctuet.edu.vn.hethongquanlythuoc.domain.Account;

public interface AccountRepository extends JpaRepository<Account, Long>,JpaSpecificationExecutor<Account> {

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    Optional<Account> findByUsernameOrEmail(String username, String email);

    Optional<Account> findByUsername(String username);

    List<Account> findByRoleRoleName(String roleName);
}
