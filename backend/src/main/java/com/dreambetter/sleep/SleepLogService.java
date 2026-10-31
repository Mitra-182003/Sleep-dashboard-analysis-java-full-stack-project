package com.dreambetter.sleep;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Duration;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SleepLogService {
    private final SleepLogRepository repository;

    public SleepLogService(SleepLogRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public Map<String, Object> save(String userId, SleepLogRequest request) {
        validate(request);
        SleepLog log = repository.findByUserIdAndSleepDate(userId, request.sleepDate())
                .orElseGet(SleepLog::new);
        log.setUserId(userId);
        apply(log, request);
        return toData(repository.save(log));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> list(String userId) {
        return repository.findByUserIdOrderBySleepDateDesc(userId).stream()
                .map(this::toData)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> summary(String userId) {
        List<SleepLog> logs = repository.findByUserIdOrderBySleepDateDesc(userId);
        if (logs.isEmpty()) {
            return Map.of("entryCount", 0, "averageDurationMinutes", 0,
                    "averageQuality", 0, "sleepConsistencyPercent", 0,
                    "sleepDebtMinutes", 0, "latestSleepDate", "");
        }
        long totalMinutes = logs.stream()
                .mapToLong(log -> durationMinutes(log.getBedtime(), log.getWakeTime()))
                .sum();
        double averageQuality = logs.stream().mapToInt(SleepLog::getQuality).average().orElse(0);
        long sleepDebtMinutes = Math.max(0, logs.size() * 8L * 60 - totalMinutes);
        long consistencyPercent = Math.round(logs.stream()
                .mapToLong(log -> durationMinutes(log.getBedtime(), log.getWakeTime()))
                .filter(minutes -> minutes >= 7 * 60 && minutes <= 9 * 60)
                .count() * 100.0 / logs.size());
        return Map.of(
                "entryCount", logs.size(),
                "averageDurationMinutes", Math.round((double) totalMinutes / logs.size()),
                "averageQuality", Math.round(averageQuality * 10) / 10.0,
                "sleepConsistencyPercent", consistencyPercent,
                "sleepDebtMinutes", sleepDebtMinutes,
                "latestSleepDate", logs.get(0).getSleepDate());
    }

    @Transactional
    public Map<String, Object> update(String userId, String id, SleepLogRequest request) {
        validate(request);
        SleepLog log = repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Sleep log was not found."));
        apply(log, request);
        return toData(repository.save(log));
    }

    @Transactional
    public void delete(String userId, String id) {
        SleepLog log = repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Sleep log was not found."));
        repository.delete(log);
    }

    private void apply(SleepLog log, SleepLogRequest request) {
        log.setSleepDate(request.sleepDate());
        log.setBedtime(request.bedtime());
        log.setWakeTime(request.wakeTime());
        log.setQuality(request.quality());
        log.setMood(request.mood());
        log.setNotes(request.notes());
    }

    private void validate(SleepLogRequest request) {
        try {
            LocalDate.parse(request.sleepDate());
            LocalDateTime bedtime = LocalDateTime.parse(request.bedtime());
            LocalDateTime wakeTime = LocalDateTime.parse(request.wakeTime());
            if (bedtime.toLocalTime().equals(wakeTime.toLocalTime())) {
                throw new IllegalArgumentException("Bedtime and wake time must be different.");
            }
        } catch (DateTimeParseException exception) {
            throw new IllegalArgumentException(
                    "Sleep date, bedtime, and wake time must use ISO date/time values.");
        }
    }

    private Map<String, Object> toData(SleepLog log) {
        Map<String, Object> data = new HashMap<>();
        data.put("id", log.getId());
        data.put("sleepDate", log.getSleepDate());
        data.put("bedtime", log.getBedtime());
        data.put("wakeTime", log.getWakeTime());
        data.put("quality", log.getQuality());
        data.put("mood", log.getMood());
        data.put("notes", log.getNotes());
        data.put("createdAt", log.getCreatedAt().toString());
        data.put("updatedAt", log.getUpdatedAt().toString());
        return data;
    }

    private long durationMinutes(String bedtime, String wakeTime) {
        try {
            LocalTime start = LocalDateTime.parse(bedtime).toLocalTime();
            LocalTime end = LocalDateTime.parse(wakeTime).toLocalTime();
            long minutes = Duration.between(start, end).toMinutes();
            return minutes > 0 ? minutes : minutes + 24 * 60;
        } catch (DateTimeParseException exception) {
            return 0;
        }
    }
}
