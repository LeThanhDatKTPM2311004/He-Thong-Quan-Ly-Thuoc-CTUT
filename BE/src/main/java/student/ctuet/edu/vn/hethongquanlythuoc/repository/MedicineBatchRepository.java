package student.ctuet.edu.vn.hethongquanlythuoc.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.MedicineBatch;

public interface MedicineBatchRepository extends JpaRepository<MedicineBatch, Long> {

    int countByMedicineId(long medicineId);

    List<MedicineBatch> findByMedicineId(long medicineId);

    List<MedicineBatch> findByExpiryDateAndRemainingQuantityGreaterThan(
            LocalDate expiryDate, int quantity);

    List<MedicineBatch> findByExpiryDateBeforeAndRemainingQuantityGreaterThan(
            LocalDate expiryDate, int quantity);
}