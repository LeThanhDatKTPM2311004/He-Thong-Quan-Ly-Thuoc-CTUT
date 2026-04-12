package student.ctuet.edu.vn.hethongquanlythuoc.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByAccountIdOrderByCreatedAtDesc(long accountId);
}
