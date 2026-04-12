package student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.prescription;

import java.time.Instant;
import java.util.List;

public record PrescriptionResponse(
        String prescriptionCode,
        String studentCode,
        String fullName,
        String classCode,
        String insuranceCode,
        String diagnosis,
        String note,
        String medicalStaff,
        String status,
        Instant createdAt,
        List<DetailResponse> details) {
    public record DetailResponse(
            long id,
            long medicineId,
            String medicineName,
            String unit,
            int quantity) {
    }
}