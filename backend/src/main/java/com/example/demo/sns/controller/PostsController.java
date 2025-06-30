package com.example.demo.sns.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.sns.entity.Comment;
import com.example.demo.sns.entity.Follows;
import com.example.demo.sns.entity.Posts;
import com.example.demo.sns.entity.Tags;
import com.example.demo.sns.entity.Users;
import com.example.demo.sns.repository.CommentRepository;
import com.example.demo.sns.repository.FollowsRepository;
import com.example.demo.sns.repository.PostsRepository;
import com.example.demo.sns.repository.TagsRepository;
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
	@Autowired
	private final TagsRepository tagsrepository;

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

		posts.addAll(postsrepository.findByUser(me));
		List<Posts> sortedPosts = posts.stream()
				.sorted(Comparator.comparing(Posts::getId)) // 昇順
				.collect(Collectors.toList());
		return sortedPosts;
		//		return posts;
	}

	// 投稿を登録
	@PostMapping("/{id}")
	public Posts post(@PathVariable Long id,
			@RequestParam("image") MultipartFile photo,
			@RequestParam("content") String content,
			@RequestParam("tags") List<String> tagsReq) throws IOException {

		System.out.println(2);
		// ファイルの保存
		String uploadDir = "./uploads/";
		File dir = new File(uploadDir);
		if (!dir.exists()) {
			dir.mkdirs();
		}

		String fileName = System.currentTimeMillis() + "_" + photo.getOriginalFilename();
		Path filePath = Paths.get(uploadDir, fileName);
		Files.copy(photo.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

		// ここからデータべースにファイル名を保存
		Posts post = new Posts();
		Users user = usersrepository.findById(id).orElse(null);
		post.setUser(user);
		post.setUrlPhoto(fileName);
		post.setContent(content);
		//		postsrepository.save(post);

		//		System.out.println(tagsReq);
		//		List<Posts> posts = new ArrayList<>();
		//		posts.add(post);
		// タグを取得または作成
		List<Tags> tags = new ArrayList<>();
		if (tagsReq != null && !tagsReq.isEmpty()) {
			tags = tagsReq
					.stream()
					.map(tagName -> tagsrepository.findByName(tagName)
							.orElseGet(() -> {
								Tags tag = new Tags(tagName);
								return tagsrepository.save(tag);
							}))
					.collect(Collectors.toList());
		}
		post.setTags(tags);
		postsrepository.save(post);
		return post;
	}

	/**
	 * 投稿に「いいね」を追加する。
	 * ユーザーがすでにいいねしている場合は、投稿は更新されずに現在の状態が返される。
	 * @param postId いいねする投稿のID
	 * @param userId いいねするユーザーのID
	 * @return 更新された投稿オブジェクト、またはエラーレスポンス (投稿/ユーザーが見つからない場合)
	 */
	@PatchMapping("/{postId}/good/{userId}")
	@Transactional
	public Posts good(@PathVariable Long postId, @PathVariable Long userId) {
		// 1. 投稿を取得
		Posts post = postsrepository.findById(postId).orElse(null);
		if (post == null) {
			// 投稿が見つからない場合は404 Not Foundを返す
			return null;
		}

		// 2. いいねするユーザーを取得
		Users likingUser = usersrepository.findById(userId).orElse(null);
		if (likingUser == null) {
			// ユーザーが見つからない場合は404 Not Foundを返す
			return null;
		}

		// 3. ユーザーがすでにいいねしているかチェック
		List<Users> currentLikedUsers = post.getGoodUsers();
		boolean alreadyLiked = false;
		for (Users user : currentLikedUsers) {
			if (user != null && user.getId().equals(userId)) {
				alreadyLiked = true;
				break;
			}
		}

		// 4. いいねしていなければ更新、すでにしていれば何もしない
		if (!alreadyLiked) {
			// いいね数をインクリメント
			post.setGood(post.getGood() + 1);
			// goodUsers リストにユーザーを追加
			currentLikedUsers.add(likingUser);
			// データベースに保存 (更新)
			postsrepository.save(post);
		}
		// else の場合、postは更新されないが、現在の状態を返す

		// 成功した場合は、更新された（または変更がなかった）投稿を返す (200 OK)
		return post;
	}

	/**
	 * 投稿の「いいね」を取り消す。
	 * ユーザーがまだいいねしていない場合は、投稿は更新されずに現在の状態が返される。
	 * @param postId いいねを取り消す投稿のID
	 * @param userId いいねを取り消すユーザーのID
	 * @return 更新された投稿オブジェクト、またはエラーレスポンス (投稿/ユーザーが見つからない場合)
	 */
	@PatchMapping("/{postId}/ungood/{userId}")
	@Transactional
	public Posts unGood(@PathVariable Long postId, @PathVariable Long userId) {
		// 1. 投稿を取得
		Posts post = postsrepository.findById(postId).orElse(null);
		if (post == null) {
			return null;
		}

		// 2. いいねを取り消すユーザーを取得
		Users unlikingUser = usersrepository.findById(userId).orElse(null);
		if (unlikingUser == null) {
			return null;
		}

		// 3. ユーザーがまだいいねしているかチェック
		List<Users> currentLikedUsers = post.getGoodUsers();
		boolean currentlyLiked = false;
		Users userToRemove = null;
		for (Users user : currentLikedUsers) {
			if (user != null && user.getId().equals(userId)) {
				currentlyLiked = true;
				userToRemove = user;
				break;
			}
		}

		// 4. いいねしていれば更新、そうでなければ何もしない
		if (currentlyLiked) {
			// いいね数をデクリメント (最小値は0)
			post.setGood(Math.max(0L, post.getGood() - 1));
			// goodUsers リストからユーザーを削除
			if (userToRemove != null) { // 念のためnullチェック
				currentLikedUsers.remove(userToRemove);
			}
			// データベースに保存 (更新)
			postsrepository.save(post);
		}
		// else の場合、postは更新されないが、現在の状態を返す

		// 成功した場合は、更新された（または変更がなかった）投稿を返す (200 OK)
		return post;
	}

	// ユーザ検索
	@GetMapping("/search/users")
	public List<Users> saerchUsers(@RequestParam String searchStr) {
		List<Users> users = usersrepository.findByUserNameContaining(searchStr);
		return users;
	}

	// 投稿検索
	@GetMapping("/search/posts")
	public List<Posts> saerchPosts(@RequestParam String searchStr) {
		List<Posts> posts = postsrepository.findByContentContaining(searchStr);
		return posts;
	}

	// 全タグ一覧
	@GetMapping("/search/tags")
	public List<Posts> saerchTags(@RequestParam String searchStr) {
		List<Posts> posts = postsrepository.findByTagsNameContaining(searchStr);
		return posts;
	}

	// タグ一覧取得
	@GetMapping("/tags")
	public List<String> getTags() {
		List<Tags> tags = tagsrepository.findAll();
		List<String> tagsStr = tags.stream()
				.map(Tags::getName)
				.collect(Collectors.toList());
		return tagsStr;
	}

	// タグ追加(テスト用)
	@PostMapping("/tags")
	public Tags postTags(@RequestParam String str) {
		Tags tag = new Tags();
		tag.setName(str);
		tagsrepository.save(tag);
		return tag;
	}

	// コメント投稿
	@PostMapping("/{postId}/comments/{userId}") // 投稿IDとユーザーIDをパス変数で受け取る
	public Comment addCommentWithoutDto(
			@PathVariable Long postId,
			@PathVariable Long userId, // ユーザーIDもパス変数で受け取る (一時的な措置)
			@RequestBody Map<String, String> requestBody // リクエストボディでコメント内容（文字列）のみを受け取る
	) {
		// 1. 投稿を取得（見つからない場合は404エラー）
		Posts post = postsrepository.findById(postId).orElse(null);

		// 2. ユーザーを取得（見つからない場合は400エラー）
		// !!! 注意 !!!: この方法はセキュリティリスクがあります。
		//               本来は認証されたユーザーのIDを自動で取得すべきです。
		Users user = usersrepository.findById(userId).orElse(null);

		// 3. 新しいコメントエンティティを作成
		Comment newComment = new Comment();
		String content = requestBody.get("content");
		newComment.setContent(content); // リクエストボディから受け取った文字列を設定
		newComment.setUser(user); // 取得したユーザーエンティティを設定
		newComment.setPosts(post); // 取得した投稿エンティティを設定

		// 4. コメントを保存
		commentrepository.save(newComment);

		// 5. 成功レスポンスを返す (HTTPステータス 201 Created)
		return newComment;
	}

}
