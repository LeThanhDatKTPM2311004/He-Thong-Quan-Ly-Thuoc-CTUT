package student.ctuet.edu.vn.hethongquanlythuoc.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.prescription.CreatePrescriptionRequest;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.prescription.PrescriptionResponse;
import student.ctuet.edu.vn.hethongquanlythuoc.service.PrescriptionService;
import student.ctuet.edu.vn.hethongquanlythuoc.utils.ApiResponse;

@RestController
@RequestMapping("/api/v1/prescriptions")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> createPrescription(
            @RequestBody CreatePrescriptionRequest request) {

        PrescriptionResponse response = prescriptionService.createPrescription(request);

        return ResponseEntity.ok(ApiResponse.success(
                "Tạo đơn thuốc thành công",
                response));
    }

    @PatchMapping("/{prescriptionCode}/dispense")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> dispensePrescription(
            @PathVariable String prescriptionCode) {

        PrescriptionResponse response = prescriptionService.dispensePrescription(prescriptionCode);

        return ResponseEntity.ok(ApiResponse.success(
                "Cấp thuốc thành công",
                response));
    }

}