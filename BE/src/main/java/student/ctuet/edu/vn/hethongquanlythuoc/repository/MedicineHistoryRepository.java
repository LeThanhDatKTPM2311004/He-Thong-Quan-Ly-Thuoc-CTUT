package student.ctuet.edu.vn.hethongquanlythuoc.repository;

import java.time.Instant;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.MedicineBatch;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.MedicineHistory;

public interface MedicineHistoryRepository extends JpaRepository<MedicineHistory, Long> {

    @Query("""
                SELECT h FROM MedicineHistory h
                WHERE h.batch.medicine.id = :medicineId
                AND h.createdAt BETWEEN :from AND :to
                ORDER BY h.createdAt DESC
            """)
    List<MedicineHistory> findByMedicineIdAndDateRange(
            @Param("medicineId") long medicineId,
            @Param("from") Instant from,
            @Param("to") Instant to);

    @Modifying
    @Query("DELETE FROM MedicineHistory h WHERE h.batch.id = :batchId")
    void deleteByBatchId(Long batchId);

    void deleteByBatchAndType(MedicineBatch batch, MedicineHistory.HistoryType type);
}