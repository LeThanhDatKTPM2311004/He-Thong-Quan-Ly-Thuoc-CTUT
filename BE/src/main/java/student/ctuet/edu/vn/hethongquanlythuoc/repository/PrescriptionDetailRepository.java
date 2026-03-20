package student.ctuet.edu.vn.hethongquanlythuoc.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import student.ctuet.edu.vn.hethongquanlythuoc.domain.PrescriptionDetail;

public interface PrescriptionDetailRepository extends JpaRepository<PrescriptionDetail, Long> {
    List<PrescriptionDetail> findByPrescriptionPrescriptionCode(String prescriptionCode);

    void deleteByPrescriptionPrescriptionCode(String prescriptionCode);

    @Modifying
    @Query("DELETE FROM PrescriptionDetail c WHERE c.batch.id = :batchId")
    void deleteByBatchId(@Param("batchId") Long batchId);
}