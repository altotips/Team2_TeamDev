package com.example.demo.sns.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.sns.entity.Posts;
import com.example.demo.sns.entity.Users;

public interface UsersRepository extends JpaRepository<Users, Long> {
	List<Posts> findByDelFlagFalse();
	
//	Optional<Users> findById(String userId);

	Optional<Users> findByUserName(String userName);
	
	Optional<Users> findByEmail(String email);
}
