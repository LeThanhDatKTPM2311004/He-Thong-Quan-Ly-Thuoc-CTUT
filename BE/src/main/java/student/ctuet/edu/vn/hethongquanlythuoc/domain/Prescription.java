package student.ctuet.edu.vn.hethongquanlythuoc.domain;

import java.time.Instant;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "don_thuoc")
public class Prescription {

    @Id
    @Column(name = "ma_don_thuoc")
    private String prescriptionCode;

    @ManyToOne
    @JoinColumn(name = "ma_sinh_vien", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "ma_tai_khoan", nullable = false)
    private Account account;

    @ManyToOne
    @JoinColumn(name = "ma_trang_thai", nullable = false)
    private PrescriptionStatus status;

    @Column(name = "chan_doan")
    private String diagnosis;

    @Column(name = "ghi_chu")
    private String note;

    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PrescriptionDetail> details;

    @Column(name = "thoi_diem_tao", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "thoi_diem_cap_nhat", nullable = false)
    private Instant updatedAt;

    @Column(name = "can_bo_y_te")
    private String medicalStaff;

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