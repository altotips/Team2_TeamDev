package com.example.demo.sns.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.sns.entity.Follows;

public interface FollowsRepository extends JpaRepository<Follows, Long> {
	Optional<Follows> findByFromUserIdAndToUserId(Long fromUserId, Long toUserId);

	List<Follows> findByFromUserId(Long fromUserId);
}