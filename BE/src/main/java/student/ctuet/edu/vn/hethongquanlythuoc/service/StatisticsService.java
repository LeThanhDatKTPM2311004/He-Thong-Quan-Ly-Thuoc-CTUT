package student.ctuet.edu.vn.hethongquanlythuoc.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import student.ctuet.edu.vn.hethongquanlythuoc.domain.Medicine;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.MedicineBatch;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.MedicineHistory;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.Prescription;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.statistics.ExpiryWarningResponse;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.statistics.MedicineImportExportResponse;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.statistics.OverviewResponse;
import student.ctuet.edu.vn.hethongquanlythuoc.repository.MedicineBatchRepository;
import student.ctuet.edu.vn.hethongquanlythuoc.repository.MedicineHistoryRepository;
import student.ctuet.edu.vn.hethongquanlythuoc.repository.MedicineRepository;
import student.ctuet.edu.vn.hethongquanlythuoc.repository.PrescriptionRepository;

@Service
public class StatisticsService {

    private final MedicineRepository medicineRepository;
    private final MedicineHistoryRepository historyRepository;
    private final MedicineBatchRepository batchRepository;
    private final PrescriptionRepository prescriptionRepository;

    public StatisticsService(MedicineRepository medicineRepository,
            MedicineHistoryRepository historyRepository,
            MedicineBatchRepository batchRepository,
            PrescriptionRepository prescriptionRepository) {
        this.medicineRepository = medicineRepository;
        this.historyRepository = historyRepository;
        this.batchRepository = batchRepository;
        this.prescriptionRepository = prescriptionRepository;
    }

    // ========================= OVERVIEW =========================
    public OverviewResponse getOverview(int month, int year) {

        // Tháng này
        LocalDate startOfMonth = LocalDate.of(year, month, 1);
        LocalDate endOfMonth = startOfMonth.withDayOfMonth(startOfMonth.lengthOfMonth());
        Instant from = startOfMonth.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant to = endOfMonth.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        // Tháng trước
        LocalDate startOfLastMonth = startOfMonth.minusMonths(1);
        LocalDate endOfLastMonth = startOfLastMonth.withDayOfMonth(startOfLastMonth.lengthOfMonth());
        Instant fromLast = startOfLastMonth.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant toLast = endOfLastMonth.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        // ── Card 1: Thuốc xuất nhiều nhất ──
        String topMedicineName = "-";
        String topMedicineUnit = "-";
        int topMedicineExported = 0;
        int topMedicineTotalStock = 0;

        for (Medicine medicine : medicineRepository.findAll()) {
            List<MedicineHistory> histories = historyRepository
                    .findByMedicineIdAndDateRange(medicine.getId(), from, to);

            int exported = histories.stream()
                    .filter(h -> h.getType() == MedicineHistory.HistoryType.EXPORT)
                    .mapToInt(MedicineHistory::getQuantity).sum();

            if (exported > topMedicineExported) {
                topMedicineExported = exported;
                topMedicineName = medicine.getName();
                topMedicineUnit = medicine.getUnit();
                topMedicineTotalStock = batchRepository.findByMedicineId(medicine.getId())
                        .stream().mapToInt(MedicineBatch::getRemainingQuantity).sum();
            }
        }

        // ── Card 2: Danh sách chẩn đoán ──
        List<Prescription> prescriptions = prescriptionRepository
                .findByCreatedAtBetween(from, to);

        List<OverviewResponse.DiagnosisCount> diagnosisList = prescriptions.stream()
                .filter(p -> p.getDiagnosis() != null && !p.getDiagnosis().isBlank())
                .collect(Collectors.groupingBy(Prescription::getDiagnosis, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(e -> new OverviewResponse.DiagnosisCount(e.getKey(), e.getValue()))
                .toList();

        // ── Card 3: Tổng ca bệnh ──
        long totalCasesThisMonth = prescriptions.size();
        long totalCasesLastMonth = prescriptionRepository
                .findByCreatedAtBetween(fromLast, toLast).size();

        return new OverviewResponse(
                topMedicineName, topMedicineUnit,
                topMedicineExported, topMedicineTotalStock,
                diagnosisList, totalCasesThisMonth,
                totalCasesThisMonth, totalCasesLastMonth);
    }

    // ========================= NHẬP/XUẤT THEO THUỐC =========================
    public List<MedicineImportExportResponse> getMedicineImportExport(
            LocalDate from, LocalDate to) {

        Instant fromInstant = from.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant toInstant = to.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        return medicineRepository.findAll().stream().map(medicine -> {
            List<MedicineHistory> histories = historyRepository
                    .findByMedicineIdAndDateRange(medicine.getId(), fromInstant, toInstant);

            int totalImport = histories.stream()
                    .filter(h -> h.getType() == MedicineHistory.HistoryType.IMPORT)
                    .mapToInt(MedicineHistory::getQuantity).sum();

            int totalExport = histories.stream()
                    .filter(h -> h.getType() == MedicineHistory.HistoryType.EXPORT)
                    .mapToInt(MedicineHistory::getQuantity).sum();

            return new MedicineImportExportResponse(
                    medicine.getId(),
                    medicine.getName(),
                    totalImport,
                    totalExport);
        })
        .filter(r -> r.totalImport() > 0 || r.totalExport() > 0)
        .toList();
    }

    // ========================= LÔ SẮP HẾT HẠN =========================
    public List<ExpiryWarningResponse> getExpiryWarning() {
        LocalDate today = LocalDate.now();
        LocalDate deadline = today.plusDays(30);

        return batchRepository.findAll().stream()
                .filter(b -> b.getExpiryDate() != null
                        && b.getRemainingQuantity() > 0
                        && !b.getExpiryDate().isAfter(deadline))
                .sorted(Comparator.comparing(MedicineBatch::getExpiryDate))
                .map(b -> new ExpiryWarningResponse(
                        b.getId(),
                        b.getBatchNumber(),
                        b.getMedicine().getName(),
                        b.getExpiryDate(),
                        b.getRemainingQuantity(),
                        ChronoUnit.DAYS.between(today, b.getExpiryDate())))
                .toList();
    }
}
