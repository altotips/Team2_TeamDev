package com.example.demo.sns.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/*
 * 投稿のデータベーステーブル
 * 
 * 主キー
 * ユーザの外部キー
 * 内容
 * 
*/
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Posts {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

//	@NotNull
//	@ManyToOne
//	@JoinColumn(name = "usersId", nullable = false)
//	private Users user;

	@NotNull
	private String urlPhoto;

	private String content;

	private Long good;

//	@ManyToOne
//	@JoinColumn(name = "commentsId", nullable = false)
//	private Comments comments;

	@Column(columnDefinition = "BOOLEAN DEFAULT 0")
	private Boolean delFlag;
}
