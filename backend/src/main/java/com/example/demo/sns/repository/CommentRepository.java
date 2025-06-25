package com.example.demo.sns.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.sns.entity.Comment;
import com.example.demo.sns.entity.Posts; // Postsエンティティをインポート

public interface CommentRepository extends JpaRepository<Comment, Long> {

	// ★★★ 修正点: findByPostId(int postId) を findByPosts(Posts posts) または findByPostsId(Long postId) に変更 ★★★
	// Option A: Postsエンティティを引数にとる
	List<Comment> findByPosts(Posts posts);

	// Option B: PostsのIDを引数にとる (こちらのほうが汎用性が高いことが多い)
	List<Comment> findByPostsId(Long postId); 
}