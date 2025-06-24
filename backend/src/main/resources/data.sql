-- 権限テーブル INSERT --
--INSERT INTO authority() VALUES
--('一般'),
--('管理者');

-- ユーザーテーブル INSERT --
INSERT INTO Users (
    url_icon, full_name, user_name, email, password, salt, self_introduction
) VALUES
('http://localhost:8080/uploads/default_icon.png', 'かんりしゃさん', 'admin_san', 'admin@example.com', 'd3a8ed876ec9c01c6073e5670532b008eb876db669f3741d4c6a26303a7f2c83', '1', 'システムを管理する者です。どうぞよろしくお願いいたします。'),
('http://localhost:8080/uploads/default_icon.png', 'たろう', 'taro_yamada', 'taro@example.com', '731d65e0ba8796608b36bc3d317338eb645e2b3dd37f12acb30cf65a0455db33', '2', '野球とゲームが趣味のたろうです！毎日楽しく過ごしています。'),
('http://localhost:8080/uploads/default_icon.png', 'さくらんぼ🍒', 'cherry_bomb', 'sakurambo@example.com', 'f8192bb671d95229d9bac5a5cba1d2541935d489bac766ce8e429b57784eb694', '3', '旅行とカフェ巡りが大好きです☕ 美味しいもの情報交換しましょう！'),
('http://localhost:8080/uploads/default_icon.png', 'シミズ🚲', 'simizu_rock', 'simizu@example.com', '59aaff349d9085bfdfff6e501664e0da6e56aa8884876bf723c90de67287c454', '4', '筋トレと自転車が生きがい！🔥日々鍛錬、日々進化！'),
('http://localhost:8080/uploads/default_icon.png', 'ゆかり', 'yukari_purple', 'yukari@example.com', 'db9809c98353a819911a56ed811d57b6977a87448d11666477ffbc408c7d7b02', '5', 'プログラミングを勉強中です。猫とアニメも好きです🐱'),
('http://localhost:8080/uploads/default_icon.png', 'まこ', 'mako_hello', 'mako@example.com', 'b234a74ac4fdeb6777ff530573dc4c11fe8ace4ba253c42957a00bdd69ccef10', '6', '読書と映画鑑賞が趣味です。新しい知識や感動を求めています。'),
('http://localhost:8080/uploads/default_icon.png', 'しんのすけ', 'shin_chan', 'shinnosuke@example.com', '7027f7b81a9443d29c909f59ccb7476bbeadcb1b2c5968342b90840599d5486c', '7', 'ゲームと美味しいご飯があれば幸せ！Zzz...'),
('http://localhost:8080/uploads/default_icon.png', 'あゆみ', 'ayumi_walk', 'ayumi@example.com', '88560bc7b2444795bbe9a5e022020db8a1c997f74e704e35fa6ae4ce4af3f937', '8', 'お散歩大好き！自然の中でリフレッシュするのが日課です。'),
('http://localhost:8080/uploads/default_icon.png', 'ひろと', 'hiroto_sky', 'hiroto@example.com', '0bcfaa27d0461a0088a640df4559fbeb9ba52e4311c4e548a84fa1bfc7c7c430', '9', '星空を眺めるのが好きです🌌 いつか宇宙に行ってみたい！'),
('http://localhost:8080/uploads/default_icon.png', 'さくら🌸', 'sakura_blossom', 'sakura@example.com', 'ffc900f669443f5d8cbd8165a1dfc49a53830f806cab28f775cd22a09eda7853', '10', 'お花と可愛いものが大好きです。最近は手芸にハマっています🧶');

 -- フォローテーブル INSERT --
 -- たろう (ID: 2) → 全員をフォロー
INSERT INTO follows (user_from_id, user_to_id) VALUES
(2, 1),   -- たろう → かんりしゃさん
(2, 3),   -- たろう → さくらんぼ🍒
(2, 4),   -- たろう → タケシ🪨
(2, 5),   -- たろう → ゆかり
(2, 6),   -- たろう → まこ
(2, 7),   -- たろう → しんのすけ
(2, 8),   -- たろう → あゆみ
(2, 9),   -- たろう → ひろと
(2, 10);  -- たろう → さくら🌸

-- さくらんぼ🍒 (ID: 3) → 一部をフォロー
INSERT INTO follows (user_from_id, user_to_id) VALUES
(3, 2),   -- さくらんぼ🍒 → たろう
(3, 4),   -- さくらんぼ🍒 → タケシ🪨
(3, 5);   -- さくらんぼ🍒 → ゆかり

-- タケシ🪨 (ID: 4) → たろうをフォロー
INSERT INTO follows (user_from_id, user_to_id) VALUES
(4, 2);   -- タケシ🪨 → たろう

-- ゆかり (ID: 5) → たろうをフォロー
INSERT INTO follows (user_from_id, user_to_id) VALUES
(5, 2);   -- ゆかり → たろう

-- まこ (ID: 6) → たろうをフォロー
INSERT INTO follows (user_from_id, user_to_id) VALUES
(6, 2);   -- まこ → たろう

-- しんのすけ (ID: 7) → さくら🌸をフォロー
INSERT INTO follows (user_from_id, user_to_id) VALUES
(7, 10);  -- しんのすけ → さくら🌸

-- あゆみ (ID: 8) → たろうをフォロー
INSERT INTO follows (user_from_id, user_to_id) VALUES
(8, 2);   -- あゆみ → たろう

-- ひろと (ID: 9) → たろうをフォロー
INSERT INTO follows (user_from_id, user_to_id) VALUES
(9, 2);   -- ひろと → たろう

-- さくら🌸 (ID: 10) → たろうをフォロー
INSERT INTO follows (user_from_id, user_to_id) VALUES
(10, 2);  -- さくら🌸 → たろう

-- 投稿の初期化
INSERT INTO posts (users_id,url_photo) VALUES (2,'http://localhost:8080/uploads/inu.png');
INSERT INTO posts (users_id,url_photo) VALUES (3,'http://localhost:8080/uploads/neko.png');
INSERT INTO posts (users_id,url_photo) VALUES (4,'http://localhost:8080/uploads/penguin.png');


-- 投稿テーブル INSERT --
INSERT INTO posts (
    users_id, url_photo, content, good
) VALUES
-- taro_yamada (id=2) の投稿
(2, 'http://localhost:8080/uploads/inu1.jpg', '今日のランチは美味しかった！', 13),
(2, 'http://localhost:8080/uploads/inu2.jpg', '新しいプロジェクトが始まったよ。がんばるぞ！', 2),

-- cherry_bomb (id=3) の投稿
(3,'http://localhost:8080/uploads/inu3.jpg', '🌸桜が満開です！', 34),
(3, 'http://localhost:8080/uploads/inu4.jpg', 'お気に入りのカフェで一息😊', 26),

-- takeshi_rock (id=4) の投稿
(4,'http://localhost:8080/uploads/inu5.jpg', '筋トレ終了！💪',45),
(4, 'http://localhost:8080/uploads/inu6.jpg', 'ロックミュージック最高！', 52),

-- yukari_purple (id=5) の投稿
(5, 'http://localhost:8080/uploads/inu7.jpg', 'プログラミング楽しいな！', 3),
(5, 'http://localhost:8080/uploads/inu8.jpg', '猫の動画を共有します🐱', 5),

-- mako_hello (id=6) の投稿
(6, 'http://localhost:8080/uploads/inu9.jpg', 'こんにちは世界！',34),
(6, 'http://localhost:8080/uploads/inu10.jpg', '最近読んだ本が面白かった。', 42),

-- shin_chan (id=7) の投稿
(7, 'http://localhost:8080/uploads/inu11.jpg', 'お昼寝最高～', 23),
(7, 'http://localhost:8080/uploads/inu12.jpg', 'アニメ見てるなう！', 11),

-- ayumi_walk (id=8) の投稿
(8, 'http://localhost:8080/uploads/inu13.jpg', '散歩日和です👟', 23),
(8, 'http://localhost:8080/uploads/inu14.jpg', '新しいスニーカー買ったよ！', 12),

-- hiroto_sky (id=9) の投稿
(9, 'http://localhost:8080/uploads/inu15.jpg', '空がきれいだね。', 23),
(9, 'http://localhost:8080/uploads/inu16.jpg', 'ドライブに行きたいな。',66),

-- sakura_blossom (id=10) の投稿
(10, 'http://localhost:8080/uploads/inu17.jpg', '🌸春が来た！', 34),
(10, 'http://localhost:8080/uploads/inu18.jpg', '手作りクッキー焼きました🍪', 23);

-- 中間テーブル INSERT --
