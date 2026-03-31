package student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.statistics;

public record MedicineImportExportResponse(
        long medicineId,
        String medicineName,
        int totalImport,
        int totalExport) {
}