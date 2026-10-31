package com.dreambetter.sleep;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "sleep_logs", indexes = @Index(name = "idx_sleep_logs_user_date", columnList = "user_id,sleep_date"))
public class SleepLog {
    @Id
    @Column(length = 36, nullable = false, updatable = false)
    private String id;

    @Column(name = "user_id", nullable = false, length = 128)
    private String userId;

    @Column(name = "sleep_date", nullable = false, length = 40)
    private String sleepDate;

    @Column(nullable = false, length = 40)
    private String bedtime;

    @Column(name = "wake_time", nullable = false, length = 40)
    private String wakeTime;

    @Column(nullable = false)
    private Integer quality;

    @Column(length = 80)
    private String mood;

    @Column(length = 2000)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getSleepDate() { return sleepDate; }
    public void setSleepDate(String sleepDate) { this.sleepDate = sleepDate; }
    public String getBedtime() { return bedtime; }
    public void setBedtime(String bedtime) { this.bedtime = bedtime; }
    public String getWakeTime() { return wakeTime; }
    public void setWakeTime(String wakeTime) { this.wakeTime = wakeTime; }
    public Integer getQuality() { return quality; }
    public void setQuality(Integer quality) { this.quality = quality; }
    public String getMood() { return mood; }
    public void setMood(String mood) { this.mood = mood; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
