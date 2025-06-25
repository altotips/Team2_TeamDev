package com.example.demo.sns.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.sns.entity.Posts;
import com.example.demo.sns.entity.Users;

public interface PostsRepository extends JpaRepository<Posts, Long> {

    // ★★★ 修正点: "commentList.user" を追加 ★★★
    @EntityGraph(attributePaths = {"comments", "user", "comments.user"}) 
    List<Posts> findByDelFlagFalse();

    @EntityGraph(attributePaths = {"comments", "user", "comments.user"})
    List<Posts> findByUser(Users user);
}