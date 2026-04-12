package student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.person;

import jakarta.validation.constraints.NotBlank;

public record ChangePasswordRequest(
        @NotBlank(message = "Password cũ không được để trống") String oldPassword,

        @NotBlank(message = "Password mới không được để trống") String newPassword,

        @NotBlank(message = "Xác nhận Password không được để trống") String confirmPassword) {
}
