package student.ctuet.edu.vn.hethongquanlythuoc.specification;

import org.springframework.data.jpa.domain.Specification;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.Prescription;

public class PrescriptionSpecification {

    public static Specification<Prescription> hasKeyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank())
                return null;
            String pattern = "%" + keyword.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("prescriptionCode")), pattern),
                    cb.like(cb.lower(root.join("student").get("lastName")), pattern), 
                    cb.like(cb.lower(root.join("student").get("firstName")), pattern), 
                    cb.like(cb.lower(root.join("student").get("studentCode")), pattern), 
                    cb.like(cb.lower(root.join("student").get("insuranceCode")), pattern)
            );
        };
    }

    public static Specification<Prescription> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank())
                return null;
            return cb.equal(root.join("status").get("statusName"), status);
        };
    }
}