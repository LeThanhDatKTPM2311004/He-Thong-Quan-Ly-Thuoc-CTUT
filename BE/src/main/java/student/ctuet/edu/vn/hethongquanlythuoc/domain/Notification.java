package student.ctuet.edu.vn.hethongquanlythuoc.domain;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "thong_bao")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_thong_bao")
    private long id;

    @ManyToOne
    @JoinColumn(name = "ma_tai_khoan", nullable = false)
    private Account account;

    @Column(name = "tieu_de")
    private String title;

    @Column(name = "noi_dung")
    private String message;

    @Column(name = "loai")
    private String type; 

    @Column(name = "ma_lo_thuoc")
    private Long batchId; 

    @Column(name = "thoi_diem_tao", updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}