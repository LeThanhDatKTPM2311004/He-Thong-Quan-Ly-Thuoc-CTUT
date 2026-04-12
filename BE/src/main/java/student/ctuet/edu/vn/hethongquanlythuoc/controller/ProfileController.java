package student.ctuet.edu.vn.hethongquanlythuoc.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.Account;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.LoginHistory;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.account.AccountResponse;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.account.ChangePasswordRequest;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.person.LoginHistoryResponse;
import student.ctuet.edu.vn.hethongquanlythuoc.service.ProfileService;
import student.ctuet.edu.vn.hethongquanlythuoc.utils.ApiResponse;

import java.util.List;

@RestController
@RequestMapping("/api/v1/profile")
public class ProfileController {

        private final ProfileService profileService;

        public ProfileController(ProfileService profileService) {
                this.profileService = profileService;
        }

        @GetMapping
        public ResponseEntity<ApiResponse<AccountResponse>> getProfile() {
                String username = SecurityContextHolder.getContext().getAuthentication().getName();
                Account account = profileService.getProfile(username);

                AccountResponse response = new AccountResponse(
                                account.getId(),
                                account.getFullname(),
                                account.getUsername(),
                                account.getEmail(),
                                account.getRole().getRoleName(),
                                account.getStatusAccount().getStatusAccountName(),
                                account.getCreatedAt(),
                                account.getUpdatedAt());

                return ResponseEntity.ok(ApiResponse.success("Lấy thông tin cá nhân thành công", response));
        }

        @GetMapping("/login-history")
        public ResponseEntity<ApiResponse<List<LoginHistoryResponse>>> getLoginHistory() {
                String username = SecurityContextHolder.getContext().getAuthentication().getName();
                List<LoginHistory> histories = profileService.getLoginHistory(username);

                List<LoginHistoryResponse> response = histories.stream()
                                .map(h -> new LoginHistoryResponse(
                                                h.getId(),
                                                h.getLoginTime(),
                                                h.getDeviceName(),
                                                h.getStatus()))
                                .toList();

                return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử đăng nhập thành công", response));
        }

        @PutMapping("/change-password")
        public ResponseEntity<ApiResponse<AccountResponse>> changePassword(
                        @Valid @RequestBody ChangePasswordRequest request) {
                String username = SecurityContextHolder.getContext().getAuthentication().getName();
                Account account = profileService.changePassword(username, request);

                AccountResponse response = new AccountResponse(
                                account.getId(),
                                account.getFullname(),
                                account.getUsername(),
                                account.getEmail(),
                                account.getRole().getRoleName(),
                                account.getStatusAccount().getStatusAccountName(),
                                account.getCreatedAt(),
                                account.getUpdatedAt());

                return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công", response));
        }
}