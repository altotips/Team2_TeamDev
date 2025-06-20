package com.example.demo.sns.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.sns.entity.Users;

public interface UserRepository extends JpaRepository<Users, Long> {

}
