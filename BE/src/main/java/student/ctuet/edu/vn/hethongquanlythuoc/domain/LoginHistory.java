package student.ctuet.edu.vn.hethongquanlythuoc.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lich_su_dang_nhap")
@Getter
@Setter
public class LoginHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private Account account;

    @Column(name = "login_time")
    private LocalDateTime loginTime;

    @Column(name = "device_name")
    private String deviceName;

    @Column(name = "status")
    private String status;
}