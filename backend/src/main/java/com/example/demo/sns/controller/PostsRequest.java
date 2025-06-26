package com.example.demo.sns.controller;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;

@Data
public class PostsRequest {
	MultipartFile image;
	private String content;
	private List<String> tags;
}