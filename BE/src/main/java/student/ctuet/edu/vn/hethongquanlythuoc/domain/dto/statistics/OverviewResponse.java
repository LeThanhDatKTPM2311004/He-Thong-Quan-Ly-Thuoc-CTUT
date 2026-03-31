package student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.statistics;
import java.util.List;
public record OverviewResponse(
                // Card 1
                String topMedicineName,
                String topMedicineUnit,
                int topMedicineExported,
                int topMedicineTotalStock,

                // Card 2
                List<DiagnosisCount> diagnosisList,
                long totalCases,

                // Card 3
                long totalCasesThisMonth,
                long totalCasesLastMonth) {
        public record DiagnosisCount(String diagnosis, long count) {
        }
}