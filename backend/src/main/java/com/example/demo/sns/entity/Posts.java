package com.example.demo.sns.entity;

import java.util.ArrayList; // 初期化のために追加
import java.util.List;

import jakarta.persistence.CascadeType; // 必要に応じて追加 (コメントの保存・削除時に投稿も連動させる場合)
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany; // ★★★ 追加 ★★★
import jakarta.persistence.Table;
// import jakarta.persistence.Transient; // ★★★ 削除 ★★★
import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/*
 * 投稿のデータベーステーブル
 * * 主キー
 * ユーザの外部キー
 * 内容
 * */

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

	@Column(columnDefinition = "BOOLEAN DEFAULT FALSE")
	private Boolean delFlag = false;

	// ★★★ 修正点: @Transient を削除し、@OneToMany 関連を追加 ★★★
	// mappedBy は Comment エンティティ内で Posts を参照しているフィールド名 ("posts") を指定
	// cascade = CascadeType.ALL: Postsを保存/削除する際に、関連するコメントも一緒に操作されるように設定
	// orphanRemoval = true: commentListからコメントを削除した際に、データベースからもそのコメントを削除するように設定
	// fetchタイプはデフォルトのLAZYのままでOK。@EntityGraphでEAGERロードを制御します。
	@OneToMany(mappedBy = "posts", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Comment> comments = new ArrayList<>(); // nullPointerExceptionを防ぐために初期化
}