package com.example.demo.sns.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.sns.entity.Likes; // Likesエンティティがあるか確認
import com.example.demo.sns.entity.Posts;
import com.example.demo.sns.entity.Users;
import com.example.demo.sns.repository.LikesRepository; // LikesRepositoryがあるか確認
import com.example.demo.sns.repository.PostsRepository; // PostsRepositoryも必要ならDI
import com.example.demo.sns.repository.UsersRepository; // UsersRepositoryもDI

import lombok.RequiredArgsConstructor;

@CrossOrigin
@RestController
@RequestMapping("/api/likes") // フロントエンドが期待する /api/likes をここに設定
@RequiredArgsConstructor // finalフィールドのコンストラクタインジェクションを自動生成
public class LikesController {

    // ★LikesRepositoryのDIを追加
    @Autowired
    private final LikesRepository likesRepository;

    // ★UsersRepositoryのDIを追加
    @Autowired
    private final UsersRepository usersRepository;

    // ★PostsRepositoryのDIを追加 (LikesエンティティからPostを取得する際に必要になることも)
    @Autowired
    private final PostsRepository postsRepository;


    /**
     * 特定のユーザーがいいねした投稿のリストを取得します。
     * GET /api/likes/user/{userId}
     */
    @GetMapping("/user/{userId}") // フロントエンドが期待する /user/{userId} をここに設定
    public List<Posts> getUserLikedPosts(@PathVariable Long userId) {
        Optional<Users> userOptional = usersRepository.findById(userId);
        if (!userOptional.isPresent() || userOptional.get().getDelFlag()) {
            return new ArrayList<>(); // ユーザーが見つからないか、削除済みの場合、空のリストを返す
        }
        Users user = userOptional.get();

        // ユーザーがいいねしたLikesエンティティのリストを取得
        List<Likes> userLikes = likesRepository.findByUser(user); // findByUserId(user.getId()) でも良いですが、findByUser(Users user)の方が良い場合も

        // Likesエンティティから対応する投稿を取得し、リストとして返します
        List<Posts> likedPosts = userLikes.stream()
            .map(Likes::getPost) // LikesエンティティにgetPost()メソッドがあることを想定
            .filter(post -> post != null && !post.getDelFlag()) // 投稿が存在し、削除されていないことを確認
            .collect(Collectors.toList());

        return likedPosts;
    }

    // ★追加：いいねを作成（トグル）するエンドポイント
    // フロントエンドの toggleLike 関数と連携します
    @PostMapping("/{postId}/user/{userId}")
    public Posts toggleLike(@PathVariable Long postId, @PathVariable Long userId) {
        Optional<Users> userOptional = usersRepository.findById(userId);
        Optional<Posts> postOptional = postsRepository.findById(postId);

        if (!userOptional.isPresent() || !postOptional.isPresent()) {
            // ユーザーまたは投稿が見つからない場合は適切なエラーハンドリング
            // 例: throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User or Post not found");
            return null; // またはnullを返さずに例外をスロー
        }

        Users user = userOptional.get();
        Posts post = postOptional.get();

        Optional<Likes> existingLike = likesRepository.findByUserAndPost(user, post);

        if (existingLike.isPresent()) {
            // 既にいいねがある場合、いいねを解除
            likesRepository.delete(existingLike.get());
            post.setGood(Math.max(0, post.getGood() - 1)); // いいね数を減らす
            postsRepository.save(post);
            return post; // 更新された投稿オブジェクトを返す
        } else {
            // いいねがない場合、新しくいいねを追加
            Likes newLike = new Likes();
            newLike.setUser(user);
            newLike.setPost(post);
            likesRepository.save(newLike);
            post.setGood(post.getGood() + 1); // いいね数を増やす
            postsRepository.save(post);
            return post; // 更新された投稿オブジェクトを返す
        }
    }


    // いいねしたかの確認（Optional）
    @GetMapping("/{postId}/user/{userId}/exists")
    public boolean checkIfLiked(@PathVariable Long postId, @PathVariable Long userId) {
        Optional<Users> userOptional = usersRepository.findById(userId);
        Optional<Posts> postOptional = postsRepository.findById(postId);

        if (!userOptional.isPresent() || !postOptional.isPresent()) {
            return false; // ユーザーまたは投稿が見つからない場合はfalse
        }

        Users user = userOptional.get();
        Posts post = postOptional.get();

        return likesRepository.findByUserAndPost(user, post).isPresent();
    }
}