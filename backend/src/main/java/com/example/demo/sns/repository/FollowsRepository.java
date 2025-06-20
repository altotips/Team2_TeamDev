package com.example.demo.sns.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.sns.entity.Follows;

public interface FollowsRepository extends JpaRepository<Follows, Long> {
	

}
