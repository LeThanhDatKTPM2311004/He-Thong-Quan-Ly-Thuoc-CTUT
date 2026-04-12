package student.ctuet.edu.vn.hethongquanlythuoc.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.Account;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.LoginHistory;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.account.ChangePasswordRequest;
import student.ctuet.edu.vn.hethongquanlythuoc.exception.AppException;
import student.ctuet.edu.vn.hethongquanlythuoc.exception.ErrorCode;
import student.ctuet.edu.vn.hethongquanlythuoc.repository.AccountRepository;
import student.ctuet.edu.vn.hethongquanlythuoc.repository.LoginHistoryRepository;

import java.util.List;

@Service
public class ProfileService {

    private final AccountRepository accountRepository;
    private final LoginHistoryRepository loginHistoryRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfileService(AccountRepository accountRepository,
            LoginHistoryRepository loginHistoryRepository,
            PasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.loginHistoryRepository = loginHistoryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ========================= GET PROFILE =========================
    public Account getProfile(long id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));
    }

    // ========================= GET LOGIN HISTORY =========================
    public List<LoginHistory> getLoginHistory(long id) {
        accountRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));

        return loginHistoryRepository.findByAccountIdOrderByLoginTimeDesc(id);
    }

    // ========================= CHANGE PASSWORD =========================
    public Account changePassword(long id, ChangePasswordRequest request) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));

        if (!passwordEncoder.matches(request.oldPassword(), account.getPassword())) {
            throw new AppException(ErrorCode.OLD_PASSWORD_INCORRECT);
        }

        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new AppException(ErrorCode.PASSWORD_NOT_MATCH);
        }

        account.setPassword(passwordEncoder.encode(request.newPassword()));
        return accountRepository.save(account);
    }
}