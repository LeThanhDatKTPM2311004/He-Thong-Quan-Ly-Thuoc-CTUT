package student.ctuet.edu.vn.hethongquanlythuoc.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import student.ctuet.edu.vn.hethongquanlythuoc.domain.Account;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.Notification;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.notification.NotificationResponse;
import student.ctuet.edu.vn.hethongquanlythuoc.repository.NotificationRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // ========================= GỬI THÔNG BÁO =========================
    @Transactional
    public void send(Account account, String title, String message,
            String type, Long batchId) {
        Notification notification = new Notification();
        notification.setAccount(account);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setBatchId(batchId);
        notificationRepository.save(notification);
    }

    // ========================= LẤY DANH SÁCH =========================
    public List<NotificationResponse> getNotifications(long accountId) {
        return notificationRepository
                .findByAccountIdOrderByCreatedAtDesc(accountId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ========================= HELPER =========================
    private NotificationResponse mapToResponse(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getTitle(),
                n.getMessage(),
                n.getType(),
                n.getBatchId(),
                n.getCreatedAt());
    }
}