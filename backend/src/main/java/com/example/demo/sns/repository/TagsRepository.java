package com.example.demo.sns.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.sns.entity.Tags;

public interface TagsRepository extends JpaRepository<Tags, Long> {
	Optional<Tags> findByName(String name);
}
