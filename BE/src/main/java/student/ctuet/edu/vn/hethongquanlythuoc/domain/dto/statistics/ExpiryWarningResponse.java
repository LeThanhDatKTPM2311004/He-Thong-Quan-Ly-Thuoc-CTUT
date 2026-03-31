package student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.statistics;

import java.time.LocalDate;

public record ExpiryWarningResponse(
        long batchId,
        String batchNumber,
        String medicineName,
        LocalDate expiryDate,
        int remainingQuantity,
        long daysLeft 
) {
}