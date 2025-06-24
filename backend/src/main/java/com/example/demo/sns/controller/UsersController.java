package com.example.demo.sns.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
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

import com.example.demo.sns.entity.Follows;
import com.example.demo.sns.entity.Users;
import com.example.demo.sns.repository.FollowsRepository;
import com.example.demo.sns.repository.UsersRepository;

import lombok.RequiredArgsConstructor;

/*
 * ユーザ管理用のコントローラ
*/
@CrossOrigin
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UsersController {

	//	@Autowired
	//	private final PostsRepository postsrepository;
	@Autowired
	private final UsersRepository usersrepository;
	@Autowired
	private final FollowsRepository followsrepository;

	// 1ユーザの情報を取得
	@GetMapping("/{id}")
	public Users getOne(@PathVariable Long id) {
		Users user = usersrepository.findById(id).orElse(null);
		if (user == null || user.getDelFlag() == true) {
			return null;
		}
		System.out.println(user);
		return user;
	}

	// 全ユーザの情報を取得
	@GetMapping("/{id}/follow")
	public List<Follows> getAll(@PathVariable Long id) {
		List<Follows> follows = followsrepository.findByFromUserId(id);
		return follows;
	}

	// ユーザ新規登録
	@PostMapping("/register")
	public Users register(@RequestBody Users user) {
		//		ソルトを加えることで同じパスワードでも保存時は違う文字列となる。
		//		一致判定時にデータベースからそのユーザのソルトを加えることで、一致するか判定を行う。

		String salt = generateSalt(16);
		String hashedPassword = hashWithSalt(user.getPassword(), salt);
		user.setSalt(salt);
		user.setPassword(hashedPassword);
		usersrepository.save(user);
		//		System.out.println(user);
		return user;
	}

	// ログイン認証
	@PostMapping("/login")
	public Users login(@RequestBody UsersRequest request) {
		Users user;
		//		入力に@が入っている場合始はメールアドレスとしてみなす
		if (request.getUserNameOrMailAddress().contains("@")) {
			user = usersrepository.findByEmail(request.getUserNameOrMailAddress()).orElse(null);
			//		入力に@がない場合はユーザ名としてみなす
		} else {
			user = usersrepository.findByUserName(request.getUserNameOrMailAddress()).orElse(null);
		}
		if (user == null) {
			System.out.println("This user is not exist.");
			return null;
		}
		System.out.println(1);
		//		データベースからパスワード(ハッシュ化済み)を受け取り一致判定を行う
		//		ソルトをデータベースから受け取り、それを判定するパスワードに加えて登録時と同じ文字列になるか確認する
		String hashedPassword = hashWithSalt(request.getPassword(), user.getSalt());
		if (hashedPassword.equals(user.getPassword())) {
			System.out.println("login sccess");
			return user;
		} else {
			System.out.println("login failed");
			return null;
		}
	}

	// フォロー
	@PutMapping("/{id}/follow/{to_id}")
	public ResponseEntity<?> follow(@PathVariable Long id, @PathVariable("to_id") Long toId) {

		// 自分自身のフォローは禁止
		if (id.equals(toId)) {
			return ResponseEntity.badRequest().body("自分自身はフォローできません");
		}

		// ユーザー存在チェック
		Optional<Users> fromUserOpt = usersrepository.findById(id);
		Optional<Users> toUserOpt = usersrepository.findById(toId);

		if (fromUserOpt.isEmpty() || toUserOpt.isEmpty()) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("ユーザーが見つかりません");
		}

		Users fromUser = fromUserOpt.get();
		Users toUser = toUserOpt.get();

		// すでにフォロー済みか確認
		Optional<Follows> existingFollow = followsrepository.findByFromUserIdAndToUserId(id, toId);
		if (existingFollow.isPresent()) {
			return ResponseEntity.status(HttpStatus.CONFLICT).body("すでにフォローしています");
		}

		// フォローを作成して保存
		Follows newFollow = new Follows();
		newFollow.setFromUser(fromUser);
		newFollow.setToUser(toUser);
		followsrepository.save(newFollow);
		System.out.println("フォローしました");

		return ResponseEntity.ok(toUser);
	}

	// フォロー解除
	@DeleteMapping("/{fromId}/unfollow/{toId}")
	public ResponseEntity<String> unfollow(
			@PathVariable Long fromId,
			@PathVariable Long toId) {

		Optional<Follows> follow = followsrepository.findByFromUserIdAndToUserId(fromId, toId);

		if (follow.isPresent()) {
			followsrepository.delete(follow.get());
			return ResponseEntity.ok("フォローを解除しました");
		} else {
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
					.body("指定されたフォロー関係が見つかりません");
		}
	}

	// プロフィール変更
	@PatchMapping("/{id}/edit")
	public Users edit(
			@PathVariable Long id, @RequestParam String fullName, @RequestParam String userName,
			@RequestParam String Introduction, @RequestParam("image") MultipartFile icon) throws IOException {

		// ファイルの保存
		String uploadDir = "./uploads/";
		File dir = new File(uploadDir);
		if (!dir.exists()) {
			dir.mkdirs();
		}
		String fileName = System.currentTimeMillis() + "_" + icon.getOriginalFilename();
		Path filePath = Paths.get(uploadDir, fileName);
		Files.copy(icon.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

		Users user;
		user = usersrepository.findById(id).orElse(null);
		user.setFullName(fullName);
		user.setUserName(userName);
		user.setSelfIntroduction(Introduction);
		user.setUrlIcon(fileName);
		usersrepository.save(user);
		return user;
	}

	// ランダムなソルトを生成
	private String generateSalt(int length) {
		SecureRandom random = new SecureRandom();
		StringBuilder salt = new StringBuilder();

		String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		for (int i = 0; i < length; i++) {
			salt.append(chars.charAt(random.nextInt(chars.length())));
		}

		return salt.toString();
	}

	// パスワード + ソルトでハッシュ
	private String hashWithSalt(String password, String salt) {
		try {
			MessageDigest md = MessageDigest.getInstance("SHA-256");
			String saltedPassword = password + salt;
			byte[] hash = md.digest(saltedPassword.getBytes());

			StringBuilder sb = new StringBuilder();
			for (byte b : hash) {
				sb.append(String.format("%02x", b));
			}

			return sb.toString();
		} catch (NoSuchAlgorithmException e) {
			throw new RuntimeException("ハッシュ化失敗", e);
		}
	}
}
