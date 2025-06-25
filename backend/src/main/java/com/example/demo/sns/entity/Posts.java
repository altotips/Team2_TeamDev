package com.example.demo.sns.entity;

import java.util.Optional;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
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
@Table(name = "posts")
public class Posts {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotNull
	@ManyToOne
	@JoinColumn(name = "usersId", nullable = false)
	private Users user;

	@NotNull
	private String urlPhoto;

	@Column(columnDefinition = "VARCHAR DEFAULT ''")
	private String content = "";

	@Column(columnDefinition = "LONG DEFAULT 0")
	private Long good = 0l;

//	@ManyToOne
//	@JoinColumn(name = "commentsId", nullable = false)
//	private Comments comments;

	@Column(columnDefinition = "BOOLEAN DEFAULT 0")
	private Boolean delFlag;
	
	@Transient
	private Optional<Comment> commentList;
}