package student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.prescription;

import java.util.List;

public record CreatePrescriptionRequest(
        String studentCode,
        String diagnosis,
        String note,
        String medicalStaff,
        List<DetailItem> details) {
    public record DetailItem(
            long medicineId,
            int quantity) {
    }
}
