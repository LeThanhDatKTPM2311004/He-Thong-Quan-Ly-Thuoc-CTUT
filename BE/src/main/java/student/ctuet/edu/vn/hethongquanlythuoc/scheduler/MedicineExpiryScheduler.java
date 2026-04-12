package student.ctuet.edu.vn.hethongquanlythuoc.scheduler;

import java.time.LocalDate;
import java.util.List;

import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import student.ctuet.edu.vn.hethongquanlythuoc.domain.Account;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.MedicineBatch;
import student.ctuet.edu.vn.hethongquanlythuoc.repository.AccountRepository;
import student.ctuet.edu.vn.hethongquanlythuoc.repository.MedicineBatchRepository;
import student.ctuet.edu.vn.hethongquanlythuoc.service.NotificationService;

@Component
@EnableScheduling
public class MedicineExpiryScheduler {

        private final MedicineBatchRepository batchRepository;
        private final AccountRepository accountRepository;
        private final NotificationService notificationService;

    public MedicineExpiryScheduler(MedicineBatchRepository batchRepository,
            AccountRepository accountRepository,
            NotificationService notificationService) {
        this.batchRepository = batchRepository;
        this.accountRepository = accountRepository;
        this.notificationService = notificationService;
    }

    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void checkExpiry() {

        LocalDate today = LocalDate.now();
        List<Account> admins = accountRepository.findByRoleRoleName("ADMIN");

        int[] warningDays = { 30, 14, 7, 3 };
        for (int days : warningDays) {
                LocalDate targetDate = today.plusDays(days);

                List<MedicineBatch> batches = batchRepository
                                .findByExpiryDateAndRemainingQuantityGreaterThan(targetDate, 0);

                for (MedicineBatch batch : batches) {
                        for (Account admin : admins) {
                                notificationService.send(
                                                admin,
                                                "Lô thuốc sắp hết hạn!",
                                                String.format("Lô %s - %s còn %d ngày hết hạn (ngày %s)",
                                                                batch.getBatchNumber(),
                                                                batch.getMedicine().getName(),
                                                                days,
                                                                batch.getExpiryDate()),
                                                "WARNING",
                                                batch.getId());
                        }
                }
        }


                // Lấy các lô đã hết hạn nhưng vẫn còn hàng
                List<MedicineBatch> expiredBatches =
                        batchRepository.findByExpiryDateBeforeAndRemainingQuantityGreaterThan(today, 0);

                
                for (MedicineBatch batch : expiredBatches) {

                
                batch.setRemainingQuantity(0);
                batchRepository.save(batch);

                
                for (Account admin : admins) {
                        notificationService.send(
                                admin,
                                "Lô thuốc đã hết hạn!",
                                String.format("Lô %s - %s đã hết hạn ngày %s, đã xóa khỏi kho khả dụng",
                                        batch.getBatchNumber(),
                                        batch.getMedicine().getName(),
                                        batch.getExpiryDate()),
                                "WARNING",
                                batch.getId()
                        );
                }
                }
                }
}
