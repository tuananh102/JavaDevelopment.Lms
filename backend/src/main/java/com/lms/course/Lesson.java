package com.lms.course;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "lessons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    private Section section;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type;

    @Column(name = "content_url", length = 1024)
    private String contentUrl;

    @Column(name = "content_text", columnDefinition = "TEXT")
    private String contentText;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    public enum Type {
        VIDEO, ARTICLE
    }
}
