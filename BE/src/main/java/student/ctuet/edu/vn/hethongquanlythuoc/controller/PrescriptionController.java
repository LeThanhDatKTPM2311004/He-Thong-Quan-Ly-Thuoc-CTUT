package student.ctuet.edu.vn.hethongquanlythuoc.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.prescription.CreatePrescriptionRequest;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.prescription.PrescriptionResponse;
import student.ctuet.edu.vn.hethongquanlythuoc.service.PrescriptionDocxExportService;
import student.ctuet.edu.vn.hethongquanlythuoc.service.PrescriptionPdfExportService;
import student.ctuet.edu.vn.hethongquanlythuoc.service.PrescriptionService;
import student.ctuet.edu.vn.hethongquanlythuoc.utils.ApiResponse;

@RestController
@RequestMapping("/api/v1/prescriptions")
public class PrescriptionController {

        private final PrescriptionService prescriptionService;
        private final PrescriptionDocxExportService prescriptionDocxExportService;
        private final PrescriptionPdfExportService prescriptionPdfExportService;

        public PrescriptionController(PrescriptionService prescriptionService,
                        PrescriptionDocxExportService prescriptionDocxExportService,
                        PrescriptionPdfExportService prescriptionPdfExportService) {
                this.prescriptionService = prescriptionService;
                this.prescriptionDocxExportService = prescriptionDocxExportService;
                this.prescriptionPdfExportService = prescriptionPdfExportService;
        }

        @PostMapping
        @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
        public ResponseEntity<ApiResponse<PrescriptionResponse>> createPrescription(
                        @RequestBody CreatePrescriptionRequest request) {

                PrescriptionResponse response = prescriptionService.createPrescription(request);

                return ResponseEntity.ok(ApiResponse.success(
                                "Tạo đơn thuốc thành công",
                                response));
        }

        @PatchMapping("/{prescriptionCode}/dispense")
        @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
        public ResponseEntity<ApiResponse<PrescriptionResponse>> dispensePrescription(
                        @PathVariable String prescriptionCode) {

                PrescriptionResponse response = prescriptionService.dispensePrescription(prescriptionCode);

                return ResponseEntity.ok(ApiResponse.success(
                                "Cấp thuốc thành công",
                                response));
        }

        @PatchMapping("/{prescriptionCode}/return")
        @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
        public ResponseEntity<ApiResponse<PrescriptionResponse>> returnMedicine(
                        @PathVariable String prescriptionCode) {

                PrescriptionResponse response = prescriptionService.returnPrescription(prescriptionCode);

                return ResponseEntity.ok(ApiResponse.success(
                                "Hoàn thuốc thành công",
                                response));
        }

        @PutMapping("/{prescriptionCode}")
        @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
        public ResponseEntity<ApiResponse<PrescriptionResponse>> updatePrescription(
                        @PathVariable String prescriptionCode,
                        @RequestBody CreatePrescriptionRequest request) {

                PrescriptionResponse response = prescriptionService.updatePrescription(prescriptionCode, request);

                return ResponseEntity.ok(ApiResponse.success(
                                "Cập nhật đơn thuốc thành công",
                                response));
        }

        @DeleteMapping("/{prescriptionCode}")
        @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
        public ResponseEntity<ApiResponse<Void>> deletePrescription(
                        @PathVariable String prescriptionCode) {

                prescriptionService.deletePrescription(prescriptionCode);

                return ResponseEntity.ok(ApiResponse.success("Xóa đơn thuốc thành công", null));
        }

        @GetMapping("/{prescriptionCode}")
        @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
        public ResponseEntity<ApiResponse<PrescriptionResponse>> getPrescription(
                        @PathVariable String prescriptionCode) {

                PrescriptionResponse response = prescriptionService.getPrescription(prescriptionCode);

                return ResponseEntity.ok(ApiResponse.success(
                                "Lấy thông tin đơn thuốc thành công",
                                response));
        }

        @GetMapping
        @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
        public ResponseEntity<ApiResponse<Page<PrescriptionResponse>>> getPrescriptions(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size,
                        @RequestParam(defaultValue = "createdAt") String sortBy,
                        @RequestParam(defaultValue = "desc") String sortDir,
                        @RequestParam(required = false) String keyword,
                        @RequestParam(required = false) String status) {

                Pageable pageable = PageRequest.of(page, size,
                                sortDir.equalsIgnoreCase("desc")
                                                ? Sort.by(sortBy).descending()
                                                : Sort.by(sortBy).ascending());

                return ResponseEntity.ok(ApiResponse.success(
                                "Lấy danh sách đơn thuốc thành công",
                                prescriptionService.getPrescriptions(keyword, status, pageable)));
        }

        // ========================= IN ĐƠN THUỐC =========================

        @GetMapping("/{prescriptionCode}/export/word")
        @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
        public ResponseEntity<byte[]> exportPrescriptionWord(@PathVariable String prescriptionCode) throws Exception {

                byte[] data = prescriptionDocxExportService.exportPrescription(prescriptionCode);

                return ResponseEntity.ok()
                                .contentType(MediaType.parseMediaType(
                                                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                                .header(HttpHeaders.CONTENT_DISPOSITION,
                                                "attachment; filename=\"don-thuoc-" + prescriptionCode + ".docx\"")
                                .body(data);
        }

        @GetMapping("/{prescriptionCode}/export/pdf")
        @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
        public ResponseEntity<byte[]> exportPrescriptionPdf(@PathVariable String prescriptionCode) throws Exception {

                byte[] data = prescriptionPdfExportService.exportPrescription(prescriptionCode);

                return ResponseEntity.ok()
                                .contentType(MediaType.APPLICATION_PDF)
                                .header(HttpHeaders.CONTENT_DISPOSITION,
                                                "attachment; filename=\"don-thuoc-" + prescriptionCode + ".pdf\"")
                                .body(data);
        }
}