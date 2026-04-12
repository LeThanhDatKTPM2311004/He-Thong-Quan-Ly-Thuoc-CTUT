package student.ctuet.edu.vn.hethongquanlythuoc.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import student.ctuet.edu.vn.hethongquanlythuoc.domain.Account;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.LoginHistory;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.account.AccountResponse;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.auth.LoginRequest;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.auth.LoginResponse;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.auth.LogoutRequest;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.auth.RefreshTokenRequest;
import student.ctuet.edu.vn.hethongquanlythuoc.exception.AppException;
import student.ctuet.edu.vn.hethongquanlythuoc.exception.ErrorCode;
import student.ctuet.edu.vn.hethongquanlythuoc.repository.AccountRepository;
import student.ctuet.edu.vn.hethongquanlythuoc.repository.LoginHistoryRepository;
import student.ctuet.edu.vn.hethongquanlythuoc.security.JwtUtils;

@Service
public class AuthService {

    @Value("${jwt.access-expiration}")
    private long accessExpiration;

    private final AuthenticationManager authenticationManager;
    private final AccountRepository accountRepository;
    private final JwtUtils jwtUtils;
    private final TokenBlacklistService tokenBlacklistService;
    private final NotificationService notificationService;
    private final LoginHistoryRepository loginHistoryRepository;

    public AuthService(AuthenticationManager authenticationManager,
            AccountRepository accountRepository,
            JwtUtils jwtUtils,
            TokenBlacklistService tokenBlacklistService,
            NotificationService notificationService, 
        LoginHistoryRepository loginHistoryRepository) {
        this.authenticationManager = authenticationManager;
        this.accountRepository = accountRepository;
        this.jwtUtils = jwtUtils;
        this.tokenBlacklistService = tokenBlacklistService;
        this.notificationService = notificationService;
        this.loginHistoryRepository = loginHistoryRepository;
    }

    // ===================== LOGIN =====================
    public LoginResponse login(LoginRequest request) {
        try {

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.usernameOrEmail(),
                            request.password()));

            String username = authentication.getName();
            Account account = accountRepository.findByUsername(username)
                    .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));

                    saveHistory(account, "SUCCESS");

            notificationService.send(
                    account,
                    "Đăng nhập thành công!",
                    "Bạn vừa đăng nhập lúc " + LocalDateTime.now()
                            .format(DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy")),
                    "SUCCESS",
                    null);

            String accessToken = jwtUtils.generateAccessToken(authentication, account.getId());
            String refreshToken = jwtUtils.generateRefreshToken(authentication, account.getId());

            return new LoginResponse(
                    accessToken,
                    refreshToken,
                    "Bearer",
                    accessExpiration,
                    mapToResponse(account));

        } catch (DisabledException e) {

            throw new AppException(ErrorCode.ACCOUNT_LOCKED);

        } catch (BadCredentialsException e) {

            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }
    }

    // ===================== REFRESH TOKEN =====================
    public LoginResponse refreshToken(RefreshTokenRequest request) {

        String refreshToken = request.refreshToken();

        if (!jwtUtils.isTokenValid(refreshToken) || !jwtUtils.isRefreshToken(refreshToken)) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }

        String jti = jwtUtils.extractJti(refreshToken);
        if (tokenBlacklistService.isBlacklisted(jti)) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }

        String username = jwtUtils.extractUsername(refreshToken);
        String role = jwtUtils.extractRole(refreshToken);
        long userId = jwtUtils.extractUserId(refreshToken);

        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));

        if (account.getStatusAccount().getId() == 2) {
            throw new AppException(ErrorCode.ACCOUNT_LOCKED);
        }

        var authentication = new UsernamePasswordAuthenticationToken(
                username, null,
                List.of(new SimpleGrantedAuthority(role)));

        String newAccessToken = jwtUtils.generateAccessToken(authentication, userId);

        long remaining = jwtUtils.getRemainingExpiration(refreshToken); // rotation
        tokenBlacklistService.blacklist(jti, remaining);

        String newRefreshToken = jwtUtils.generateRefreshToken(authentication, userId);

        return new LoginResponse(
                newAccessToken,
                newRefreshToken,
                "Bearer",
                accessExpiration,
                mapToResponse(account));
    }

    // ===================== LOGOUT =====================
    public void logout(LogoutRequest request) {
        revokeToken(request.accessToken());
        revokeToken(request.refreshToken());
    }

    private void revokeToken(String token) {
        if (jwtUtils.isTokenValid(token)) {
            String jti = jwtUtils.extractJti(token);
            long remaining = jwtUtils.getRemainingExpiration(token);
            if (remaining > 0) {
                tokenBlacklistService.blacklist(jti, remaining);
            }
        }
    }

    // ===================== HELPER =====================
    private AccountResponse mapToResponse(Account account) {
        return new AccountResponse(
                account.getId(),
                account.getFullname(),
                account.getUsername(),
                account.getEmail(),
                account.getRole().getRoleName(),
                account.getStatusAccount().getStatusAccountName(),
                account.getCreatedAt(),
                account.getUpdatedAt());
    }


    private void saveHistory(Account account, String status) {
        LoginHistory history = new LoginHistory();
        history.setAccount(account);
        history.setLoginTime(LocalDateTime.now());
        history.setDeviceName("Không biết làm");
        history.setStatus(status);
        loginHistoryRepository.save(history);
    }
}
