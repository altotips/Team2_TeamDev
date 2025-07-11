package com.example.demo.sns.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonIgnore; // ★★★ 追加 ★★★

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "comment")
public class Comment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotNull
	@ManyToOne
	@JoinColumn(name = "userId", nullable = false)
	private Users user;

	@NotBlank
	private String content;

	@NotNull
	@ManyToOne
	@JoinColumn(name = "postsId", nullable = false)
	@JsonIgnore // ★★★ 追加: CommentがJSON化されるときに、関連するPostsを除外する ★★★
	private Posts posts;
}