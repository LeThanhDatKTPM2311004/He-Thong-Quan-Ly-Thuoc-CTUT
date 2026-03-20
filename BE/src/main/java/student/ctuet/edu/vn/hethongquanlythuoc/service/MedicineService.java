package student.ctuet.edu.vn.hethongquanlythuoc.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import student.ctuet.edu.vn.hethongquanlythuoc.domain.Account;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.Medicine;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.MedicineBatch;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.MedicineHistory;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.medicine.CreateMedicineRequest;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.medicine.ImportBatchRequest;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.medicine.MedicineResponse;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.medicine.TraceResponse;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.medicine.UpdateBatchRequest;
import student.ctuet.edu.vn.hethongquanlythuoc.exception.AppException;
import student.ctuet.edu.vn.hethongquanlythuoc.exception.ErrorCode;
import student.ctuet.edu.vn.hethongquanlythuoc.repository.AccountRepository;
import student.ctuet.edu.vn.hethongquanlythuoc.repository.MedicineBatchRepository;
import student.ctuet.edu.vn.hethongquanlythuoc.repository.MedicineHistoryRepository;
import student.ctuet.edu.vn.hethongquanlythuoc.repository.MedicineRepository;
import student.ctuet.edu.vn.hethongquanlythuoc.repository.MedicineStatusRepository;
import student.ctuet.edu.vn.hethongquanlythuoc.repository.PrescriptionDetailRepository;
import student.ctuet.edu.vn.hethongquanlythuoc.specification.MedicineSpecification;

@Service
public class MedicineService {

        private final PrescriptionDetailRepository prescriptionDetailRepository;
        private final MedicineRepository medicineRepository;
        private final MedicineBatchRepository batchRepository;
        private final MedicineStatusRepository medicineStatusRepository;
        private final MedicineHistoryRepository medicineHistoryRepository;
        private final AccountRepository accountRepository;

        public MedicineService(
                        MedicineRepository medicineRepository,
                        MedicineBatchRepository batchRepository,
                        MedicineStatusRepository medicineStatusRepository,
                        MedicineHistoryRepository medicineHistoryRepository,
                        AccountRepository accountRepository,
                        PrescriptionDetailRepository prescriptionDetailRepository) {
                this.medicineRepository = medicineRepository;
                this.batchRepository = batchRepository;
                this.medicineStatusRepository = medicineStatusRepository;
                this.medicineHistoryRepository = medicineHistoryRepository;
                this.accountRepository = accountRepository;
                this.prescriptionDetailRepository = prescriptionDetailRepository;
        }

        // ========================= CREATE =========================
        @Transactional
        public MedicineResponse createMedicine(CreateMedicineRequest request) {

                if (medicineRepository.existsByName(request.name())) {
                        throw new AppException(ErrorCode.MEDICINE_NAME_EXISTED);
                }

                var status = medicineStatusRepository.findById(1)
                                .orElseThrow(() -> new AppException(ErrorCode.MEDICINE_STATUS_NOT_FOUND));

                Medicine medicine = new Medicine();
                medicine.setName(request.name());
                medicine.setUnit(request.unit());
                medicine.setStatus(status);
                medicine = medicineRepository.save(medicine);

                String prefix = request.name().length() >= 3
                                ? request.name().substring(0, 3).toUpperCase()
                                : request.name().toUpperCase();

                String date = LocalDate.now().format(DateTimeFormatter.ofPattern("ddMMyyyy"));

                int batchCount = batchRepository.countByMedicineId(medicine.getId());
                String batchNumber = String.format("%s-%s-%03d", prefix, date, batchCount + 1);

                MedicineBatch batch = new MedicineBatch();
                batch.setMedicine(medicine);
                batch.setBatchNumber(batchNumber);
                batch.setQuantity(request.quantity());
                batch.setRemainingQuantity(request.quantity());
                batch.setExpiryDate(request.expiryDate());
                batchRepository.save(batch);

                Account account = getCurrentAccount();
                saveHistory(batch, account, MedicineHistory.HistoryType.IMPORT, batch.getQuantity());

                return maptoResponse(medicine);
        }

        // ========================= IMPORT BATCH =========================
        @Transactional
        public MedicineResponse importBatch(long medicineId, ImportBatchRequest request) {

                Medicine medicine = medicineRepository.findById(medicineId)
                                .orElseThrow(() -> new AppException(ErrorCode.MEDICINE_NOT_FOUND));

                String prefix = medicine.getName().length() >= 3
                                ? medicine.getName().substring(0, 3).toUpperCase()
                                : medicine.getName().toUpperCase();

                String date = LocalDate.now().format(DateTimeFormatter.ofPattern("ddMMyyyy"));

                int batchCount = batchRepository.countByMedicineId(medicineId);
                String batchNumber = String.format("%s-%s-%03d", prefix, date, batchCount + 1);

                MedicineBatch batch = new MedicineBatch();
                batch.setMedicine(medicine);
                batch.setBatchNumber(batchNumber);
                batch.setQuantity(request.quantity());
                batch.setRemainingQuantity(request.quantity());
                batch.setExpiryDate(request.expiryDate());
                batchRepository.save(batch);

                Account account = getCurrentAccount();
                saveHistory(batch, account, MedicineHistory.HistoryType.IMPORT, batch.getQuantity());

                return maptoResponse(medicine);
        }

        // ========================= UPDATE BATCH =========================
        @Transactional
        public MedicineResponse updateBatch(long medicineId, long batchId, UpdateBatchRequest request) {

                Medicine medicine = medicineRepository.findById(medicineId)
                                .orElseThrow(() -> new AppException(ErrorCode.MEDICINE_NOT_FOUND));

                MedicineBatch batch = batchRepository.findById(batchId)
                                .orElseThrow(() -> new AppException(ErrorCode.BATCH_NOT_FOUND));

                if (batch.hasBeenExported()) {
                        throw new AppException(ErrorCode.BATCH_ALREADY_EXPORTED);
                }

                medicine.setName(request.name());
                medicine.setUnit(request.unit());
                medicineRepository.save(medicine);

                batch.setQuantity(request.quantity());
                batch.setRemainingQuantity(request.quantity());
                batch.setExpiryDate(request.expiryDate());
                batchRepository.save(batch);

                return maptoResponse(medicine);
        }

        // ========================= DELETE BATCH =========================
        @Transactional
        public void deleteBatch(long batchId) {

                MedicineBatch batch = batchRepository.findById(batchId)
                                .orElseThrow(() -> new AppException(ErrorCode.BATCH_NOT_FOUND));

                if (batch.hasBeenExported()) {
                        throw new AppException(ErrorCode.BATCH_ALREADY_EXPORTED);
                }

                medicineHistoryRepository.deleteByBatchId(batchId);
                prescriptionDetailRepository.deleteByBatchId(batchId);

                batchRepository.delete(batch);
        }

        // ========================= LOCK =========================
        @Transactional
        public MedicineResponse lockMedicine(long medicineId) {
                Medicine medicine = medicineRepository.findById(medicineId)
                                .orElseThrow(() -> new AppException(ErrorCode.MEDICINE_NOT_FOUND));

                var lockedStatus = medicineStatusRepository.findById(2)
                                .orElseThrow(() -> new AppException(ErrorCode.MEDICINE_STATUS_NOT_FOUND));

                medicine.setStatus(lockedStatus);
                medicineRepository.save(medicine);

                return maptoResponse(medicine);
        }

        // ========================= UNLOCK =========================
        @Transactional
        public MedicineResponse unlockMedicine(long medicineId) {
                Medicine medicine = medicineRepository.findById(medicineId)
                                .orElseThrow(() -> new AppException(ErrorCode.MEDICINE_NOT_FOUND));

                var activeStatus = medicineStatusRepository.findById(1)
                                .orElseThrow(() -> new AppException(ErrorCode.MEDICINE_STATUS_NOT_FOUND));

                medicine.setStatus(activeStatus);
                medicineRepository.save(medicine);

                return maptoResponse(medicine);
        }

        // ========================= TRACE =========================
        public TraceResponse traceMedicine(long medicineId, LocalDate from, LocalDate to) {

                Medicine medicine = medicineRepository.findById(medicineId)
                                .orElseThrow(() -> new AppException(ErrorCode.MEDICINE_NOT_FOUND));

                Instant fromInstant = from.atStartOfDay(ZoneId.systemDefault()).toInstant();
                Instant toInstant = to.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

                List<MedicineHistory> histories = medicineHistoryRepository
                                .findByMedicineIdAndDateRange(medicineId, fromInstant, toInstant);

                int totalImport = histories.stream()
                                .filter(h -> h.getType() == MedicineHistory.HistoryType.IMPORT)
                                .mapToInt(MedicineHistory::getQuantity).sum();

                int totalExport = histories.stream()
                                .filter(h -> h.getType() == MedicineHistory.HistoryType.EXPORT)
                                .mapToInt(MedicineHistory::getQuantity).sum();

                int remaining = batchRepository.findByMedicineId(medicineId).stream()
                                .mapToInt(MedicineBatch::getRemainingQuantity).sum();

                List<TraceResponse.HistoryItem> items = histories.stream()
                                .map(h -> new TraceResponse.HistoryItem(
                                                h.getCreatedAt(),
                                                h.getQuantity(),
                                                medicine.getUnit(),
                                                h.getType().name()))
                                .toList();

                return new TraceResponse(
                                medicine.getName(),
                                medicine.getUnit(),
                                remaining,
                                totalImport,
                                totalExport,
                                items);
        }

        // ========================= GET MEDICINE BY BATCH ID =========================
        public MedicineResponse getMedicineByBatchId(long batchId) {
                MedicineBatch batch = batchRepository.findById(batchId)
                                .orElseThrow(() -> new AppException(ErrorCode.BATCH_NOT_FOUND));
                return maptoResponse(batch.getMedicine());
        }

        // ========================= GET ALL =========================
        public Page<MedicineResponse> getMedicines(String keyword, String status, Pageable pageable) {
                Specification<Medicine> spec = Specification.allOf(
                                MedicineSpecification.hasKeyword(keyword),
                                MedicineSpecification.hasStatus(status));
                return medicineRepository.findAll(spec, pageable)
                                .map(this::maptoResponse);
        }

        // ========================= HELPER =========================
        private MedicineResponse maptoResponse(Medicine medicine) {
                List<MedicineResponse.MedicineBatch> batches = batchRepository
                                .findByMedicineId(medicine.getId())
                                .stream()
                                .map(b -> new MedicineResponse.MedicineBatch(
                                                b.getId(),
                                                b.getBatchNumber(),
                                                b.getQuantity(),
                                                b.getRemainingQuantity(),
                                                b.getExpiryDate(),
                                                b.getCreatedAt(),
                                                b.getUpdatedAt(),
                                                b.hasBeenExported()))
                                .toList();

                int totalQuantity = batches.stream()
                                .mapToInt(MedicineResponse.MedicineBatch::remainingQuantity)
                                .sum();

                return new MedicineResponse(
                                medicine.getId(),
                                medicine.getName(),
                                medicine.getUnit(),
                                medicine.getStatus().getName(),
                                totalQuantity,
                                medicine.getCreatedAt(),
                                medicine.getUpdatedAt(),
                                batches);
        }

        private Account getCurrentAccount() {
                String username = SecurityContextHolder.getContext().getAuthentication().getName();
                return accountRepository.findByUsername(username)
                                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));
        }

        private void saveHistory(MedicineBatch batch, Account account, MedicineHistory.HistoryType type, int quantity) {
                MedicineHistory history = new MedicineHistory();
                history.setBatch(batch);
                history.setAccount(account);
                history.setType(type);
                history.setQuantity(quantity);
                medicineHistoryRepository.save(history);
        }
}