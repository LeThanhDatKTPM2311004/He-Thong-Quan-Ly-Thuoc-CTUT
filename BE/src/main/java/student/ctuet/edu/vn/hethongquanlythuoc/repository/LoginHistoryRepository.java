package student.ctuet.edu.vn.hethongquanlythuoc.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.LoginHistory;
import java.util.List;

public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {
    List<LoginHistory> findByAccountIdOrderByLoginTimeDesc(long accountId);
}