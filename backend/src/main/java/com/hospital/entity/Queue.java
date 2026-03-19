package com.hospital.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "queue")
public class Queue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", nullable = false, unique = true)
    private Appointment appointment;

    @Column(name = "queue_number", nullable = false)
    private Integer queueNumber;

    @Column(name = "priority_level", nullable = false)
    private Integer priorityLevel;

    @Column(name = "estimated_time")
    private Integer estimatedTime;

    public Queue() {}

    public Queue(Long id, Appointment appointment, Integer queueNumber, Integer priorityLevel, Integer estimatedTime) {
        this.id = id;
        this.appointment = appointment;
        this.queueNumber = queueNumber;
        this.priorityLevel = priorityLevel;
        this.estimatedTime = estimatedTime;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Appointment getAppointment() { return appointment; }
    public void setAppointment(Appointment appointment) { this.appointment = appointment; }
    public Integer getQueueNumber() { return queueNumber; }
    public void setQueueNumber(Integer queueNumber) { this.queueNumber = queueNumber; }
    public Integer getPriorityLevel() { return priorityLevel; }
    public void setPriorityLevel(Integer priorityLevel) { this.priorityLevel = priorityLevel; }
    public Integer getEstimatedTime() { return estimatedTime; }
    public void setEstimatedTime(Integer estimatedTime) { this.estimatedTime = estimatedTime; }

    public static QueueBuilder builder() { return new QueueBuilder(); }

    public static class QueueBuilder {
        private Long id;
        private Appointment appointment;
        private Integer queueNumber;
        private Integer priorityLevel;
        private Integer estimatedTime;

        public QueueBuilder id(Long id) { this.id = id; return this; }
        public QueueBuilder appointment(Appointment appointment) { this.appointment = appointment; return this; }
        public QueueBuilder queueNumber(Integer queueNumber) { this.queueNumber = queueNumber; return this; }
        public QueueBuilder priorityLevel(Integer priorityLevel) { this.priorityLevel = priorityLevel; return this; }
        public QueueBuilder estimatedTime(Integer estimatedTime) { this.estimatedTime = estimatedTime; return this; }

        public Queue build() {
            return new Queue(id, appointment, queueNumber, priorityLevel, estimatedTime);
        }
    }
}
