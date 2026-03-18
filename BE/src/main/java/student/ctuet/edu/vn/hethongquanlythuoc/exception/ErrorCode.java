package student.ctuet.edu.vn.hethongquanlythuoc.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    // Account
    USERNAME_EXISTED(HttpStatus.BAD_REQUEST, "Tên đăng nhập đã tồn tại"),
    EMAIL_EXISTED(HttpStatus.BAD_REQUEST, "Email đã tồn tại"),
    ACCOUNT_NOT_FOUND(HttpStatus.NOT_FOUND, "Tài khoản không tồn tại"),
    PASSWORD_NOT_MATCH(HttpStatus.BAD_REQUEST, "Mật khẩu xác nhận không khớp"),
    STATUS_NOT_FOUND(HttpStatus.NOT_FOUND, "Trạng thái tài khoản không tồn tại"),

    // Role
    ROLE_NOT_FOUND(HttpStatus.NOT_FOUND, "Vai trò không tồn tại"),

    // Auth
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Tên đăng nhập hoặc mật khẩu không đúng"),
    ACCOUNT_LOCKED(HttpStatus.FORBIDDEN, "Tài khoản đã bị khóa"),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "Token không hợp lệ hoặc đã hết hạn"),

    // Medicine
    MEDICINE_NOT_FOUND(HttpStatus.NOT_FOUND, "Thuốc không tồn tại"),
    MEDICINE_NAME_EXISTED(HttpStatus.BAD_REQUEST, "Tên thuốc đã tồn tại"),
    MEDICINE_STATUS_NOT_FOUND(HttpStatus.NOT_FOUND, "Trạng thái thuốc không tồn tại"),

    // Batch
    BATCH_NOT_FOUND(HttpStatus.NOT_FOUND, "Lô thuốc không tồn tại"),
    BATCH_ALREADY_EXPORTED(HttpStatus.BAD_REQUEST, "Lô thuốc đã được xuất, không thể thực hiện thao tác này"),

    //prescription
    PRESCRIPTION_NOT_FOUND(HttpStatus.NOT_FOUND, "Đơn thuốc không tồn tại"),
    PRESCRIPTION_INVALID_STATUS(HttpStatus.BAD_REQUEST, "Trạng thái đơn thuốc không hợp lệ"),
    MEDICINE_NOT_ENOUGH(HttpStatus.BAD_REQUEST, "Số lượng thuốc trong kho không đủ"),

    // Student
    STUDENT_NOT_FOUND(HttpStatus.NOT_FOUND, "Sinh viên không tồn tại"),

    // Validation
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "Dữ liệu không hợp lệ"),

    // System
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi hệ thống");

    private final HttpStatus httpStatus;
    private final String message;

    ErrorCode(HttpStatus httpStatus, String message) {
        this.httpStatus = httpStatus;
        this.message = message;
    }
}