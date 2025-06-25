package com.example.demo.sns.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.sns.entity.Comment;
import com.example.demo.sns.entity.Follows;
import com.example.demo.sns.entity.Posts;
import com.example.demo.sns.entity.Users;
import com.example.demo.sns.repository.CommentRepository;
import com.example.demo.sns.repository.FollowsRepository;
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
	@Autowired
	private final CommentRepository commentrepository;
	@Autowired
	private final FollowsRepository followsrepository;

	//	すべての投稿を取得
	@GetMapping
	public List<Posts> getAll() {
		List<Posts> response = postsrepository.findByDelFlagFalse();
		if (response == null) {
			System.out.println(1);
		}

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
	@GetMapping("users/{id}/follow")
	public List<Posts> follwersPosts(@PathVariable Long id) {
		Users me = usersrepository.findById(id).orElse(null);
		if (me == null || me.getDelFlag() == true) {
			return null;
		}
		List<Follows> follows = followsrepository.findByFromUserId(id);
		List<Posts> posts = new ArrayList<>();
		for (Follows follow : follows) {
			Users user = follow.getToUser();
			List<Posts> userPosts = postsrepository.findByUser(user);
			posts.addAll(userPosts);
		}
		return posts;
	}

	//	コメントのを登録
	@PostMapping("/{id}")
	public Posts post(@PathVariable Long id,
			@RequestParam("image") MultipartFile photo,
			@RequestParam("content") String content) throws IOException {

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
		Posts post = new Posts();
		Users user = usersrepository.findById(id).orElse(null);
		post.setUser(user);
		post.setUrlPhoto(fileName);
		post.setContent(content);
		postsrepository.save(post);
		return post;
	}

	// いいねする
	@PatchMapping("/{id}/good")
	public Posts good(@PathVariable Long id) {
		Posts post = postsrepository.findById(id).orElse(null);
		post.setGood(post.getGood() + 1);
		postsrepository.save(post);
		return post;
	}

	// いいね解除
	@PutMapping("/{id}/unGood")
	public Posts unGood(@PathVariable Long id) {
		Posts post = postsrepository.findById(id).orElse(null);
		post.setGood(post.getGood() - 1);
		postsrepository.save(post);
		return post;
	}

	// コメント投稿
	@PostMapping("/{postId}/comments/{userId}") // 投稿IDとユーザーIDをパス変数で受け取る
	public Comment addCommentWithoutDto(
			@PathVariable Long postId,
			@PathVariable Long userId, // ユーザーIDもパス変数で受け取る (一時的な措置)
			@RequestBody String content // リクエストボディでコメント内容（文字列）のみを受け取る
	) {
		// 1. 投稿を取得（見つからない場合は404エラー）
		Posts post = postsrepository.findById(postId).orElse(null);

		// 2. ユーザーを取得（見つからない場合は400エラー）
		// !!! 注意 !!!: この方法はセキュリティリスクがあります。
		//               本来は認証されたユーザーのIDを自動で取得すべきです。
		Users user = usersrepository.findById(userId).orElse(null);

		// 3. 新しいコメントエンティティを作成
		Comment newComment = new Comment();
		newComment.setContent(content); // リクエストボディから受け取った文字列を設定
		newComment.setUser(user); // 取得したユーザーエンティティを設定
		newComment.setPosts(post); // 取得した投稿エンティティを設定

		// 4. コメントを保存
		commentrepository.save(newComment);

		// 5. 成功レスポンスを返す (HTTPステータス 201 Created)
		return newComment;
	}

	//	@PostMapping("/{id}/comment")
	//	public Comment comment(@PathVariable Long id,@RequestBody String comment,@RequestBody Users user) {
	//		Comment newComment = new Comment();
	//		newComment.setContent(comment);
	//		newComment.setUser(user);
	//		Posts post = postsrepository.findById(id).orElse(null);
	//		newComment.setPosts(post);
	//		
	//		commentrepository.save(newComment);
	//		
	//		return newComment;
	//	}

}
