package student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.notification;

import java.time.Instant;

public record NotificationResponse(
        long id,
        String title,
        String message,
        String type, 
        Long batchId, 
        Instant createdAt) {
}
