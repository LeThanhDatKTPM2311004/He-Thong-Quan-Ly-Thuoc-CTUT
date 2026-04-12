package student.ctuet.edu.vn.hethongquanlythuoc.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
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
import student.ctuet.edu.vn.hethongquanlythuoc.domain.Prescription;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.PrescriptionDetail;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.PrescriptionStatus;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.Student;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.prescription.CreatePrescriptionRequest;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.prescription.PrescriptionResponse;
import student.ctuet.edu.vn.hethongquanlythuoc.exception.AppException;
import student.ctuet.edu.vn.hethongquanlythuoc.exception.ErrorCode;
import student.ctuet.edu.vn.hethongquanlythuoc.repository.AccountRepository;
import student.ctuet.edu.vn.hethongquanlythuoc.repository.MedicineBatchRepository;
import student.ctuet.edu.vn.hethongquanlythuoc.repository.MedicineHistoryRepository;
import student.ctuet.edu.vn.hethongquanlythuoc.repository.MedicineRepository;
import student.ctuet.edu.vn.hethongquanlythuoc.repository.PrescriptionDetailRepository;
import student.ctuet.edu.vn.hethongquanlythuoc.repository.PrescriptionRepository;
import student.ctuet.edu.vn.hethongquanlythuoc.repository.PrescriptionStatusRepository;
import student.ctuet.edu.vn.hethongquanlythuoc.repository.StudentRepository;
import student.ctuet.edu.vn.hethongquanlythuoc.specification.PrescriptionSpecification;

@Service
public class PrescriptionService {

        private final PrescriptionRepository prescriptionRepository;
        private final PrescriptionDetailRepository detailRepository;
        private final PrescriptionStatusRepository statusRepository;
        private final StudentRepository studentRepository;
        private final AccountRepository accountRepository;
        private final MedicineRepository medicineRepository;
        private final MedicineBatchRepository batchRepository;
        private final MedicineHistoryRepository historyRepository;

        public PrescriptionService(PrescriptionRepository prescriptionRepository,
                        PrescriptionStatusRepository statusRepository,
                        PrescriptionDetailRepository detailRepository,
                        StudentRepository studentRepository,
                        AccountRepository accountRepository,
                        MedicineRepository medicineRepository,
                        MedicineBatchRepository batchRepository,
                        MedicineHistoryRepository historyRepository) {
                this.prescriptionRepository = prescriptionRepository;
                this.statusRepository = statusRepository;
                this.detailRepository = detailRepository;
                this.studentRepository = studentRepository;
                this.accountRepository = accountRepository;
                this.medicineRepository = medicineRepository;
                this.batchRepository = batchRepository;
                this.historyRepository = historyRepository;

        }

        // ========================= TẠO ĐƠN =========================
        @Transactional
        public PrescriptionResponse createPrescription(CreatePrescriptionRequest request) {

                String username = SecurityContextHolder.getContext().getAuthentication().getName();
                Account account = accountRepository.findByUsername(username)
                                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));

                Student student = studentRepository.findByStudentCode(request.studentCode())
                                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_FOUND));

                PrescriptionStatus status = statusRepository.findByStatusName("Chờ thuốc")
                                .orElseThrow(() -> new AppException(ErrorCode.STATUS_NOT_FOUND));

                Prescription prescription = new Prescription();
                prescription.setPrescriptionCode(generateCode());
                prescription.setStudent(student);
                prescription.setAccount(account);
                prescription.setStatus(status);
                prescription.setDiagnosis(request.diagnosis());
                prescription.setNote(request.note());
                prescription.setMedicalStaff(request.medicalStaff());

                List<PrescriptionDetail> details = request.details().stream().map(item -> {

                        Medicine medicine = medicineRepository.findById(item.medicineId())
                                        .orElseThrow(() -> new AppException(ErrorCode.MEDICINE_NOT_FOUND));

                        PrescriptionDetail detail = new PrescriptionDetail();
                        detail.setPrescription(prescription);
                        detail.setMedicine(medicine);
                        detail.setQuantity(item.quantity());
                        detail.setUnit(medicine.getUnit());
                        return detail;
                }).toList();

                prescription.setDetails(details);
                Prescription saved = prescriptionRepository.save(prescription);
                return mapToResponse(saved);
        }

        // ========================= CẤP THUỐC =========================
        @Transactional
        public PrescriptionResponse dispensePrescription(String prescriptionCode) {

                Prescription prescription = prescriptionRepository.findById(prescriptionCode)
                                .orElseThrow(() -> new AppException(ErrorCode.PRESCRIPTION_NOT_FOUND));

                if (!"Chờ thuốc".equals(prescription.getStatus().getStatusName())) {
                        throw new AppException(ErrorCode.PRESCRIPTION_INVALID_STATUS);
                }

                Account account = getCurrentAccount();

                for (PrescriptionDetail detail : prescription.getDetails()) {

                        int soLuongCanCap = detail.getQuantity();

                        int soLuongTrongKho = batchRepository
                                        .findByMedicineId(detail.getMedicine().getId())
                                        .stream()
                                        .mapToInt(MedicineBatch::getRemainingQuantity)
                                        .sum();

                        if (soLuongTrongKho < soLuongCanCap) {
                                throw new AppException(ErrorCode.MEDICINE_NOT_ENOUGH);
                        }
                }

                for (PrescriptionDetail detail : prescription.getDetails()) {

                        int soLuongConPhaiTru = detail.getQuantity();

                        List<MedicineBatch> loTheoFEFO = batchRepository
                                        .findByMedicineId(detail.getMedicine().getId())
                                        .stream()
                                        .filter(lo -> lo.getRemainingQuantity() > 0)
                                        .sorted(Comparator.comparing(
                                                        MedicineBatch::getExpiryDate,
                                                        Comparator.nullsLast(Comparator.naturalOrder())))
                                        .toList();

                        MedicineBatch loTruCuoi = null;

                        for (MedicineBatch lo : loTheoFEFO) {

                                if (soLuongConPhaiTru <= 0)
                                        break;

                                int soLuongLayTuLo = Math.min(soLuongConPhaiTru, lo.getRemainingQuantity());

                                lo.setRemainingQuantity(lo.getRemainingQuantity() - soLuongLayTuLo);
                                batchRepository.save(lo);

                                saveHistory(lo, account, MedicineHistory.HistoryType.EXPORT, soLuongLayTuLo);

                                soLuongConPhaiTru -= soLuongLayTuLo;
                                loTruCuoi = lo;
                        }

                        detail.setBatch(loTruCuoi);
                        detailRepository.save(detail);
                }

                PrescriptionStatus daCapThuoc = statusRepository.findByStatusName("Đã cấp thuốc")
                                .orElseThrow(() -> new AppException(ErrorCode.STATUS_NOT_FOUND));

                prescription.setStatus(daCapThuoc);
                Prescription saved = prescriptionRepository.save(prescription);

                return mapToResponse(saved);
        }

        // ========================= HOÀN THUỐC =========================
        @Transactional
        public PrescriptionResponse returnPrescription(String prescriptionCode) {

                Prescription prescription = prescriptionRepository.findById(prescriptionCode)
                                .orElseThrow(() -> new AppException(ErrorCode.PRESCRIPTION_NOT_FOUND));

                if (!"Đã cấp thuốc".equals(prescription.getStatus().getStatusName())) {
                        throw new AppException(ErrorCode.PRESCRIPTION_INVALID_STATUS);
                }

                Account account = getCurrentAccount();

                for (PrescriptionDetail detail : prescription.getDetails()) {
                        MedicineBatch lo = detail.getBatch();
                        if (lo != null) {
                                lo.setRemainingQuantity(lo.getRemainingQuantity() + detail.getQuantity());
                                batchRepository.save(lo);                
                                historyRepository.deleteByBatchAndType(lo, MedicineHistory.HistoryType.EXPORT);
                        }
                }

                PrescriptionStatus daHoanThuoc = statusRepository.findByStatusName("Đã hoàn thuốc")
                                .orElseThrow(() -> new AppException(ErrorCode.STATUS_NOT_FOUND));

                prescription.setStatus(daHoanThuoc);
                Prescription saved = prescriptionRepository.save(prescription);

                return mapToResponse(saved);
        }

        // ========================= CẬP NHẬT ĐƠN =========================
        @Transactional
        public PrescriptionResponse updatePrescription(String prescriptionCode, CreatePrescriptionRequest request) {

                Prescription prescription = prescriptionRepository.findById(prescriptionCode)
                                .orElseThrow(() -> new AppException(ErrorCode.PRESCRIPTION_NOT_FOUND));

                if (!"Chờ thuốc".equals(prescription.getStatus().getStatusName())) {
                        throw new AppException(ErrorCode.PRESCRIPTION_INVALID_STATUS);
                }

                Student student = studentRepository.findByStudentCode(request.studentCode())
                                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_FOUND));

                prescription.setStudent(student);
                prescription.setDiagnosis(request.diagnosis());
                prescription.setNote(request.note());

                detailRepository.deleteByPrescriptionPrescriptionCode(prescriptionCode);
                detailRepository.flush();

                List<PrescriptionDetail> newDetails = new ArrayList<>();

                for (var item : request.details()) {
                        Medicine medicine = medicineRepository.findById(item.medicineId())
                                        .orElseThrow(() -> new AppException(ErrorCode.MEDICINE_NOT_FOUND));

                        PrescriptionDetail detail = new PrescriptionDetail();
                        detail.setPrescription(prescription);
                        detail.setMedicine(medicine);
                        detail.setQuantity(item.quantity());
                        detail.setUnit(medicine.getUnit());

                        newDetails.add(detail);
                }

                prescription.getDetails().clear();
                prescription.getDetails().addAll(newDetails);

                Prescription saved = prescriptionRepository.save(prescription);
                return mapToResponse(saved);
        }

        // ========================= XÓA ĐƠN =========================
        @Transactional
        public void deletePrescription(String prescriptionCode) {

                Prescription prescription = prescriptionRepository.findById(prescriptionCode)
                                .orElseThrow(() -> new AppException(ErrorCode.PRESCRIPTION_NOT_FOUND));

                if (!"Chờ thuốc".equals(prescription.getStatus().getStatusName())) {
                        throw new AppException(ErrorCode.PRESCRIPTION_INVALID_STATUS);
                }

                prescriptionRepository.delete(prescription);
        }

        // ========================= LẤY THÔNG TIN ĐƠN CỤ THỂ=========================

        public PrescriptionResponse getPrescription(String prescriptionCode) {
                Prescription prescription = prescriptionRepository.findById(prescriptionCode)
                                .orElseThrow(() -> new AppException(ErrorCode.PRESCRIPTION_NOT_FOUND));
                return mapToResponse(prescription);
        }

        // ========================= GET ALL =========================
        public Page<PrescriptionResponse> getPrescriptions(String keyword, String status, Pageable pageable) {
                Specification<Prescription> spec = Specification.allOf(
                                PrescriptionSpecification.hasKeyword(keyword),
                                PrescriptionSpecification.hasStatus(status));
                return prescriptionRepository.findAll(spec, pageable)
                                .map(this::mapToResponse);
        }

        // ==========================LẤY TÀI KHOẢN HIỆN TẠI===========================

        private Account getCurrentAccount() {
                String username = SecurityContextHolder.getContext().getAuthentication().getName();
                return accountRepository.findByUsername(username)
                                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));
        }

        // ========================= GENERATE MÃ ĐƠN =========================
        private String generateCode() {
                String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("ddMMyyyy"));
                String prefix = "CTUT" + dateStr;
                long count = prescriptionRepository.countByCodePrefix(prefix);
                return String.format("%s-%03d", prefix, count + 1);
        }

        // ========================= LƯU LỊCH SỬ =========================
        private void saveHistory(MedicineBatch batch, Account account,
                        MedicineHistory.HistoryType type, int quantity) {
                MedicineHistory history = new MedicineHistory();
                history.setBatch(batch);
                history.setAccount(account);
                history.setType(type);
                history.setQuantity(quantity);
                historyRepository.save(history);
        }

        // ========================= MAP TO RESPONSE =========================
        private PrescriptionResponse mapToResponse(Prescription p) {

                List<PrescriptionResponse.DetailResponse> details = detailRepository
                                .findByPrescriptionPrescriptionCode(p.getPrescriptionCode())
                                .stream()
                                .map(d -> new PrescriptionResponse.DetailResponse(
                                                d.getId(),
                                                d.getMedicine().getId(),
                                                d.getMedicine().getName(),
                                                d.getUnit(),
                                                d.getQuantity()))
                                .toList();

                return new PrescriptionResponse(
                                p.getPrescriptionCode(),
                                p.getStudent().getStudentCode(),
                                p.getStudent().getLastName() + " " + p.getStudent().getFirstName(),
                                p.getStudent().getClassCode(),
                                p.getStudent().getInsuranceCode(),
                                p.getDiagnosis(),
                                p.getNote(),
                                p.getMedicalStaff(),
                                p.getStatus().getStatusName(),
                                p.getCreatedAt(),
                                details);
        }
}
