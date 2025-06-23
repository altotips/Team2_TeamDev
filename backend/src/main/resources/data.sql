-- 権限テーブル INSERT --
--INSERT INTO authority() VALUES
--('一般'),
--('管理者');

-- 権限テーブル INSERT --
INSERT INTO Users (
    full_name, user_name, email, password, salt
) VALUES
('かんりしゃさん', 'admin_san', 'admin@example.com', 'd3a8ed876ec9c01c6073e5670532b008eb876db669f3741d4c6a26303a7f2c83', '1'),
('たろう', 'taro_yamada', 'taro@example.com', '731d65e0ba8796608b36bc3d317338eb645e2b3dd37f12acb30cf65a0455db33', '2'),
('さくらんぼ🍒', 'cherry_bomb', 'sakurambo@example.com', 'f8192bb671d95229d9bac5a5cba1d2541935d489bac766ce8e429b57784eb694', '3'),
('タケシ🪨', 'takeshi_rock', 'takeshi@example.com', '59aaff349d9085bfdfff6e501664e0da6e56aa8884876bf723c90de67287c454', '4'),
('ゆかり', 'yukari_purple', 'yukari@example.com', 'db9809c98353a819911a56ed811d57b6977a87448d11666477ffbc408c7d7b02', '5'),
('まこ', 'mako_hello', 'mako@example.com', 'b234a74ac4fdeb6777ff530573dc4c11fe8ace4ba253c42957a00bdd69ccef10', '6'),
('しんのすけ', 'shin_chan', 'shinnosuke@example.com', '7027f7b81a9443d29c909f59ccb7476bbeadcb1b2c5968342b90840599d5486c', '7'),
('あゆみ', 'ayumi_walk', 'ayumi@example.com', '88560bc7b2444795bbe9a5e022020db8a1c997f74e704e35fa6ae4ce4af3f937', '8'),
('ひろと', 'hiroto_sky', 'hiroto@example.com', '0bcfaa27d0461a0088a640df4559fbeb9ba52e4311c4e548a84fa1bfc7c7c430', '9'),
('さくら🌸', 'sakura_blossom', 'sakura@example.com', 'ffc900f669443f5d8cbd8165a1dfc49a53830f806cab28f775cd22a09eda7853', '10');

 -- フォローテーブル INSERT --
 -- たろう (ID: 2) → 全員をフォロー
INSERT INTO follows (user_follower_id, user_followee_id) VALUES
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
INSERT INTO follows (user_follower_id, user_followee_id) VALUES
(3, 2),   -- さくらんぼ🍒 → たろう
(3, 4),   -- さくらんぼ🍒 → タケシ🪨
(3, 5);   -- さくらんぼ🍒 → ゆかり

-- タケシ🪨 (ID: 4) → たろうをフォロー
INSERT INTO follows (user_follower_id, user_followee_id) VALUES
(4, 2);   -- タケシ🪨 → たろう

-- ゆかり (ID: 5) → たろうをフォロー
INSERT INTO follows (user_follower_id, user_followee_id) VALUES
(5, 2);   -- ゆかり → たろう

-- まこ (ID: 6) → たろうをフォロー
INSERT INTO follows (user_follower_id, user_followee_id) VALUES
(6, 2);   -- まこ → たろう

-- しんのすけ (ID: 7) → さくら🌸をフォロー
INSERT INTO follows (user_follower_id, user_followee_id) VALUES
(7, 10);  -- しんのすけ → さくら🌸

-- あゆみ (ID: 8) → たろうをフォロー
INSERT INTO follows (user_follower_id, user_followee_id) VALUES
(8, 2);   -- あゆみ → たろう

-- ひろと (ID: 9) → たろうをフォロー
INSERT INTO follows (user_follower_id, user_followee_id) VALUES
(9, 2);   -- ひろと → たろう

-- さくら🌸 (ID: 10) → たろうをフォロー
INSERT INTO follows (user_follower_id, user_followee_id) VALUES
(10, 2);  -- さくら🌸 → たろう

-- 投稿の初期化
INSERT INTO posts (users_id,url_photo) VALUES (1,'./uploads/inu.png');
INSERT INTO posts (users_id,url_photo) VALUES (2,'./uploads/neko.png');
