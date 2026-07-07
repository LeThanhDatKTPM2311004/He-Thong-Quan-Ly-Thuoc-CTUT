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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "chi_tiet_don_thuoc")
public class PrescriptionDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_chi_tiet")
    private long id;

    @ManyToOne
    @JoinColumn(name = "ma_don_thuoc", nullable = false)
    private Prescription prescription;

    @ManyToOne
    @JoinColumn(name = "ma_thuoc", nullable = false)
    private Medicine medicine;

    @ManyToOne
    @JoinColumn(name = "ma_lo_thuoc")
    private MedicineBatch batch;

    @Column(name = "so_luong", nullable = false)
    private int quantity;

    @Column(name = "don_vi_tinh")
    private String unit;

    @Column(name = "ghi_chu", length = 255)
    private String note;

    @Column(name = "thoi_diem_tao", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "thoi_diem_cap_nhat", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}