-- 権限テーブル INSERT --
--INSERT INTO authority() VALUES
--('一般'),
--('管理者');

-- ユーザーテーブル INSERT --
INSERT INTO users (
    url_icon, full_name, user_name, email, password, salt, self_introduction
) VALUES
('default_icon.png', 'かんりしゃさん', 'admin_san', 'admin@example.com', 'd3a8ed876ec9c01c6073e5670532b008eb876db669f3741d4c6a26303a7f2c83', '1', 'システムを管理する者です。どうぞよろしくお願いいたします。'),
('default_icon.png', 'たろう', 'taro_yamada', 'taro@example.com', '731d65e0ba8796608b36bc3d317338eb645e2b3dd37f12acb30cf65a0455db33', '2', '野球とゲームが趣味のたろうです！毎日楽しく過ごしています。'),
('default_icon.png', 'しほ🐤', 'shiho_hiyoko', 'sakurambo@example.com', 'f8192bb671d95229d9bac5a5cba1d2541935d489bac766ce8e429b57784eb694', '3', '旅行とカフェ巡りが大好きです☕ 美味しいもの情報交換しましょう！'),
('default_icon.png', 'シミズ🚲', 'simizu_rock', 'simizu@example.com', '59aaff349d9085bfdfff6e501664e0da6e56aa8884876bf723c90de67287c454', '4', '筋トレと自転車が生きがい！🔥日々鍛錬、日々進化！'),
('default_icon.png', 'うっちー', 'uchiuchiucchii', 'yukari@example.com', 'db9809c98353a819911a56ed811d57b6977a87448d11666477ffbc408c7d7b02', '5', 'プログラミングを勉強中です。猫とアニメも好きです🐱'),
('default_icon.png', 'めぐ', 'megu_gu', 'mako@example.com', 'b234a74ac4fdeb6777ff530573dc4c11fe8ace4ba253c42957a00bdd69ccef10', '6', '読書と映画鑑賞が趣味です。新しい知識や感動を求めています。'),
('default_icon.png', 'なゆ', 'nayu_spiritual', 'shinnosuke@example.com', '7027f7b81a9443d29c909f59ccb7476bbeadcb1b2c5968342b90840599d5486c', '7', '毎日氣付き生活！🎇'),
('default_icon.png', 'こーすけ', 'yokoyoko', 'ayumi@example.com', '88560bc7b2444795bbe9a5e022020db8a1c997f74e704e35fa6ae4ce4af3f937', '8', 'お散歩大好き！自然の中でリフレッシュするのが日課です。'),
('default_icon.png', 'ひろと', 'hiroto_sky', 'hiroto@example.com', '0bcfaa27d0461a0088a640df4559fbeb9ba52e4311c4e548a84fa1bfc7c7c430', '9', '星空を眺めるのが好きです🌌 いつか宇宙に行ってみたい！'),
('default_icon.png', 'さくら🌸', 'sakura_blossom', 'sakura@example.com', 'ffc900f669443f5d8cbd8165a1dfc49a53830f806cab28f775cd22a09eda7853', '10', 'お花と可愛いものが大好きです。最近は手芸にハマっています🧶');

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

-- タグテーブル　INSERT --
INSERT INTO tags (name) VALUES
('犬'),
('ご飯'),
('愛犬'),
('散歩'),
('冒険'),
('花見'),
('春'),
('カフェ'),
('癒し'),
('ランニング'),
('朝活'),
('ファッション'),
('DIY'),
('プログラミング'),
('日常'),
('動画'),
('こんにちは'),
('可愛い'),
('本'),
('あるある'),
('お昼寝'),
('リラックス'),
('アニメ'),
('共感'),
('公園'),
('グッズ'),
('おしゃれ'),
('ジャンプ'),
('青空'),
('ドライブ'),
('風'),
('クッキー'),
('手作り'),
('猫'),
('日向ぼっこ'),
('おもちゃ'),
('監視中'),
('甘えん坊'),
('寝顔'),
('肉球'),
('帽子'),
('キーボード'),
('いぬ'),
('ねこ'),
('邪魔可愛い');

-- 投稿の初期化
INSERT INTO posts (users_id,url_photo) VALUES (2,'inu.png');
INSERT INTO posts (users_id,url_photo) VALUES (3,'neko.png');
INSERT INTO posts (users_id,url_photo) VALUES (4,'penguin.png');


-- 投稿テーブル INSERT --
INSERT INTO posts (
    users_id, url_photo, content, good
) VALUES
-- taro_yamada (id=2) の投稿
(2, 'inu1.jpg', 'うちの犬、今日もモリモリご飯食べてた！ #犬 #ご飯 #愛犬', 13),
(2, 'inu2.jpg', '犬と一緒に散歩コースを開拓中🐾 #犬 #散歩 #冒険', 2),

-- cherry_bomb (id=3) の投稿
(3, 'neko1.jpg', '🌸桜の下で犬とお花見してきたよ！ #犬 #花見 #春', 34),
(3, 'inu4.jpg', 'カフェのテラス席で犬とまったり☕ #犬 #カフェ #癒し', 26),

-- takeshi_rock (id=4) の投稿
(4, 'inu5.jpg', '犬と一緒に朝ラン！いい汗かいた💪 #犬 #ランニング #朝活', 45),
(4, 'inu6.jpg', 'ロックな犬用Tシャツ作ってみた🔥 #犬 #ファッション #DIY', 52),

-- yukari_purple (id=5) の投稿
(5, 'inu7.jpg', '犬にプログラミング見せたら寝た😂 #犬 #プログラミング #日常', 3),
(5, 'inu8.jpg', 'この犬の動画、何回見ても癒される🐶💜 #犬 #動画 #癒し', 5),

-- mako_hello (id=6) の投稿
(6, 'inu9.jpg', '犬に「こんにちは」って言ったら首かしげた😊 #犬 #こんにちは #可愛い', 34),
(6, 'inu10.jpg', '犬が本の上に座ってきて読めなかった📚 #犬 #本 #あるある', 42),

-- shin_chan (id=7) の投稿
(7, 'inu11.jpg', '犬と一緒にお昼寝してたら時間が溶けた😪 #犬 #お昼寝 #リラックス', 23),
(7, 'inu12.jpg', '犬もアニメ見てた気がする…たぶん。 #犬 #アニメ #共感', 11),

-- ayumi_walk (id=8) の投稿
(8, 'inu13.jpg', '犬と公園をのんびりお散歩👟 #犬 #散歩 #公園', 23),
(8, 'inu14.jpg', '新しい犬用スニーカー風ブーツ買ったよ！ #犬 #グッズ #おしゃれ', 12),

-- hiroto_sky (id=9) の投稿
(9, 'inu15.jpg', '青空の下で犬がジャンプしてた🐾 #犬 #ジャンプ #青空', 23),
(9, 'inu16.jpg', '犬とドライブしたら窓に耳ぴたってなってた🚗 #犬 #ドライブ #風', 66),

-- sakura_blossom (id=10) の投稿
(2, 'neko1.jpg', '🌸犬と春の風を感じてきた！ #犬 #春 #風', 34),
(2, 'neko2.jpg', '犬型クッキー焼いてみた🍪 #犬 #クッキー #手作り', 23),

-- sakura_blossom (id=10) の投稿
(3, 'neko3.jpg', '今日も猫が窓辺で日向ぼっこしてた☀️ #猫 #日向ぼっこ', 28),
(3, 'neko4.jpg', '猫がテレビの前を占領して動かない😂 #猫 #あるある', 15),

-- riku_catlover (id=12) の投稿
(4, 'neko5.jpg', '新しいキャットタワーに夢中🐾 #猫 #おもちゃ', 44),
(4, 'neko6.jpg', '猫と一緒にお昼寝最高😴 #猫 #癒し', 39),

-- haruna_meow (id=13) の投稿
(5, 'neko7.jpg', '猫がタンスの上からずっと見てくる👀 #猫 #監視中', 21),
(5, 'neko8.jpg', '膝の上に乗ってくる猫、尊い…💕 #猫 #甘えん坊', 33),

-- ken_chan (id=14) の投稿
(6, 'neko9.jpg', '猫の寝顔ってなんであんなに平和なんだろう☺️ #猫 #寝顔', 18),
(6, 'neko10.jpg', '肉球ぷにぷにして怒られたw #猫 #肉球', 26),

-- eri_furball (id=15) の投稿
(7, 'neko9.jpg', '猫用の帽子作ってみたけど秒で取られた🧢 #猫 #ファッション', 11),
(7, 'neko10.jpg', '猫がキーボードの上でくつろいでる💻 #猫 #邪魔可愛い', 37);
INSERT INTO comment (
    user_id,content,posts_id
) VALUES
(1,'かわいい！！',1),
(1,'かわいい！！',1),
(1,'かわいい！！',1),
(1,'かわいい！！',1),
(1,'かわいい！！',1),
(1,'かわいい！！',1),
(1,'かわいい！！',2),
(1,'かわいい！！',2),
(1,'かわいい！！',2),
(1,'かわいい！！',2),
(1,'かわいい！！',2),
(1,'かわいい！！',2),
(1,'かわいい！！',2),
(1,'かわいい！！',2),
(1,'かわいい！！',3),
(1,'かわいい！！',3),
(1,'かわいい！！',3),
(1,'かわいい！！',3),
(1,'かわいい！！',3),
(1,'かわいい！！',3),
(1,'かわいい！！',4),
(1,'かわいい！！',4),
(1,'かわいい！！',4),
(1,'かわいい！！',4),
(1,'かわいい！！',4),
(1,'かわいい！！',4),
(1,'かわいい！！',4),
(1,'かわいい！！',4),
(1,'かわいい！！',5),
(1,'かわいい！！',5),
(1,'かわいい！！',6),
(1,'かわいい！！',6),
(1,'かわいい！！',7),
(1,'かわいい！！',7),
(1,'かわいい！！',8),
(1,'かわいい！！',8),
(1,'かわいい！！',9),
(1,'かわいい！！',9),
(1,'かわいい！！',10),
(1,'かわいい！！',11),
(1,'かわいい！！',12),
(1,'かわいい！！',13),
(1,'かわいい！！',14),
(1,'かわいい！！',15),
(1,'かわいい！！',16),
(1,'かわいい！！',17),
(1,'かわいい！！',18);
