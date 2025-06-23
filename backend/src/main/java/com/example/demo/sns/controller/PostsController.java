package com.example.demo.sns.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.sns.entity.Posts;
import com.example.demo.sns.entity.Users;
import com.example.demo.sns.repository.PostsRepository;
import com.example.demo.sns.repository.UsersRepository;

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
	public Posts getOne(@PathVariable Long id) {
		Posts post = postsrepository.findById(id).orElse(null);
		if (post == null || post.getDelFlag() == true) {
			return null;
		}
		return post;
	}

//	1ユーザの全投稿を取得
	@GetMapping("users/{id}")
	public List<Posts> getUserPosts(@PathVariable Long id) {
		Users user = usersrepository.findById(id).orElse(null);
		if (user == null || user.getDelFlag() == true) {
			return null;
		}
		List<Posts> posts = postsrepository.findByUser(user);
		return posts;
	}

//	フォローユーザ全員の全投稿を取得
//	@GetMapping("users/{id}")
//	public List<Posts> getUserPosts(@PathVariable Long id) {
//		Users user = usersrepository.findById(id).orElse(null);
//		if (user == null || user.getDelFlag() == true) {
//			return null;
//		}
//		List<Posts> posts = postsrepository.findByUsers(user);
//		return posts;
//	}

//	投稿を登録
//	postするオブジェクトは
//	{
//		content : String
//	}
	@PostMapping("/{id}")
	public Posts post(@PathVariable Long id, @RequestParam("image") MultipartFile photo, @RequestParam("content") String content) throws IOException {

		// オブジェクトのテストが必要
		// 
		// 
		// 
//		System.out.println(postRequest);

		// ファイルの保存
		String uploadDir = "./uploads/";
		File dir = new File(uploadDir);
		if (!dir.exists()) {
			dir.mkdirs();
		}

		String fileName = System.currentTimeMillis() + "_" + photo.getOriginalFilename();
		Path filePath = Paths.get(uploadDir, fileName);
//		System.out.println(filePath);

		Files.copy(photo.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

		// ここからデータべースにファイル名を保存
		Posts post = postsrepository.findById(id).orElse(null);
		post.setUrlPhoto(fileName);
		postsrepository.save(post);
		return post;
	}
}
