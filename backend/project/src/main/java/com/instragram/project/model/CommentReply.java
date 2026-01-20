package com.instragram.project.model;

import java.time.LocalDateTime;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = { "appUser", "comment" })
public class CommentReply {

   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;

   @NotBlank(message = "Content is required")
   private String content;

   @ManyToOne
   @JoinColumn(name = "app_user_id", nullable = false)
   private AppUser appUser;

   @ManyToOne(cascade = CascadeType.ALL)
   @JoinColumn( //
         name = "comment_id", //
         nullable = false, //
         foreignKey = @ForeignKey(//
               name = "fk_comment_reply_comment", //
               foreignKeyDefinition = "FOREIGN KEY (comment_id) REFERENCES comment(id) ON DELETE CASCADE"//
         ))
   private Comment comment;

   private LocalDateTime createdAt;

   @PrePersist
   public void onCreate() {
      createdAt = LocalDateTime.now();
   }
}
