package com.example.demo.sns.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.sns.entity.Tag;

public interface TagsRepository extends JpaRepository<Tag, Long> {
	List<Tag> findByName(String tagName);
}
