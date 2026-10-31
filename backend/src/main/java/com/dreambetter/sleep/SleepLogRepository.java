package com.dreambetter.sleep;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SleepLogRepository extends JpaRepository<SleepLog, String> {
    List<SleepLog> findByUserIdOrderBySleepDateDesc(String userId);
    Optional<SleepLog> findByIdAndUserId(String id, String userId);
    Optional<SleepLog> findByUserIdAndSleepDate(String userId, String sleepDate);
}
