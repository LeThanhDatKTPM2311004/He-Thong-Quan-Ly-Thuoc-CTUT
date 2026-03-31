package student.ctuet.edu.vn.hethongquanlythuoc.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.statistics.ExpiryWarningResponse;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.statistics.MedicineImportExportResponse;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.statistics.OverviewResponse;
import student.ctuet.edu.vn.hethongquanlythuoc.service.StatisticsService;
import student.ctuet.edu.vn.hethongquanlythuoc.utils.ApiResponse;

@RestController
@RequestMapping("/api/v1/statistics")
public class StatisticsController {

    private final StatisticsService statisticsService;

    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    @GetMapping("/overview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OverviewResponse>> getOverview(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {

        int m = (month != null) ? month : LocalDate.now().getMonthValue();
        int y = (year != null) ? year : LocalDate.now().getYear();

        return ResponseEntity.ok(ApiResponse.success(
                "Lấy tổng quan thành công",
                statisticsService.getOverview(m, y)));
    }

    @GetMapping("/medicine-import-export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<MedicineImportExportResponse>>> getMedicineImportExport(
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to) {

        LocalDate fromDate = (from != null) ? from : LocalDate.now().withDayOfYear(1);
        LocalDate toDate = (to != null) ? to : LocalDate.now();

        return ResponseEntity.ok(ApiResponse.success(
                "Lấy thống kê nhập xuất thành công",
                statisticsService.getMedicineImportExport(fromDate, toDate)));
    }

    @GetMapping("/expiry-warning")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ExpiryWarningResponse>>> getExpiryWarning() {

        return ResponseEntity.ok(ApiResponse.success(
                "Lấy danh sách sắp hết hạn và đã hết hạn thành công ( Lấy tất cả lô có expiryDate <= 30 ngày kể từ hôm nay — bao gồm cả lô đã hết hạn (daysLeft âm))",
                statisticsService.getExpiryWarning()));
    }
}