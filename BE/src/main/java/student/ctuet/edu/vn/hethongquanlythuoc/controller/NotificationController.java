package student.ctuet.edu.vn.hethongquanlythuoc.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import student.ctuet.edu.vn.hethongquanlythuoc.domain.Account;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.notification.NotificationResponse;
import student.ctuet.edu.vn.hethongquanlythuoc.exception.AppException;
import student.ctuet.edu.vn.hethongquanlythuoc.exception.ErrorCode;
import student.ctuet.edu.vn.hethongquanlythuoc.repository.AccountRepository;
import student.ctuet.edu.vn.hethongquanlythuoc.service.NotificationService;
import student.ctuet.edu.vn.hethongquanlythuoc.utils.ApiResponse;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final AccountRepository accountRepository;

    public NotificationController(NotificationService notificationService,
            AccountRepository accountRepository) {
        this.notificationService = notificationService;
        this.accountRepository = accountRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications() {
        Account account = getCurrentAccount();
        return ResponseEntity.ok(ApiResponse.success(
                "Lấy thông báo thành công",
                notificationService.getNotifications(account.getId())));
    }

    private Account getCurrentAccount() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return accountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));
    }
}