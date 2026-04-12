package student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.person;

import java.time.LocalDateTime;

public record LoginHistoryResponse(
        long id,
        LocalDateTime loginTime,
        String deviceName,
        String status) {
}