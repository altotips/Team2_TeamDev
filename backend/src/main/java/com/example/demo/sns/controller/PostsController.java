package com.example.demo.sns.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.sns.entity.Posts;
import com.example.demo.sns.repository.PostsRepository;

import lombok.RequiredArgsConstructor;

/*
 * 投稿管理用のコントローラ
*/
@CrossOrigin
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostsController {
	@Autowired
	private final PostsRepository postsrepository;
	@Autowired
	private final UsersRepository usersrepository;

//	すべての投稿を取得
	@GetMapping
	public List<Posts> getAll() {
		List<Posts> response = postsrepository.findByDelFlagFalse();
		return response;
	}

//	1投稿を取得
	@GetMapping("{id}")
	public Posts List<Posts>(
	@PathVariable
	Long id)
	{
		Posts post = postsrepository.findById(id).orElse(null);
		if (post == null || post.getDelFlag() == true) {
			return null;
		}
		return post;
	}

//	1ユーザの投稿を取得
	@GetMapping("users/{id}")
	public Posts getUserPosts(@PathVariable Long id) {
		Users User = usersrepository.findById(id).orElse(null);
		if (user == null || user.getDelFlag() == true) {
			return null;
		}
		List<Posts> posts = postsrepository.findById(id).orElse(null);
		return posts;
	}
}
