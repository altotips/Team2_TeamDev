package com.example.demo.sns.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.sns.entity.Likes;
import com.example.demo.sns.entity.Posts; // Postsエンティティをインポート
import com.example.demo.sns.entity.Users; // Usersエンティティをインポート

@Repository
public interface LikesRepository extends JpaRepository<Likes, Long> {
    // 特定のユーザーがいいねしたLikesエンティティを全て取得
    List<Likes> findByUser(Users user); // findByUserId(Long userId) の代わりにこちらがより適切

    // ★ここを追加または修正してください★
    // 特定のユーザーが特定の投稿をいいねしているか確認
    Optional<Likes> findByUserAndPost(Users user, Posts post);

    // 必要であれば、いいねしたユーザーIDに基づいて取得するメソッドも維持できます
    List<Likes> findByUserId(Long userId);
}