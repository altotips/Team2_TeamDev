package com.example.demo.sns.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.sns.entity.Posts;
import com.example.demo.sns.entity.Users;

@Repository
public interface PostsRepository extends JpaRepository<Posts, Long> {
	List<Posts> findByDelFlagFalse();

	List<Posts> findByUsers(Users user);
}
