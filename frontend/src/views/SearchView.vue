<template>
  <div class="search-view">
    <div class="search-bar-container">
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          placeholder="検索" 
          v-model="searchText"
          @keyup.enter="performSearch"
          class="search-input"
        />
      </div>
    </div>

    <div class="results-grid">
      <div 
        v-for="photo in displayedPhotos" 
        :key="photo.id" 
        class="photo-item"
        @click="goToPostDetail(photo.id)"
      >
        <img :src="photo.url" :alt="photo.alt" class="photo-thumbnail" />
        <div class="photo-overlay">
          <span class="overlay-icon">❤️ {{ photo.likes }}</span>
          <span class="overlay-icon">💬 {{ photo.comments }}</span>
        </div>
      </div>
      
      <div v-if="displayedPhotos.length === 0 && searchPerformed" class="no-results-message">
        検索結果が見つかりませんでした。
      </div>
      <div v-else-if="displayedPhotos.length === 0 && !searchPerformed" class="initial-message">
        人気の投稿やおすすめの投稿が表示されます。
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 検索バーのテキスト
const searchText = ref('');
// 検索が実行されたかどうかを示すフラグ
const searchPerformed = ref(false);

// ダミーデータとして写真のリストを用意
// 実際にはAPIから取得します
const allPhotos = ref([
  { id: 1, url: 'https://via.placeholder.com/200?text=写真①', alt: '写真①', tags: ['風景', '自然'], likes: 15, comments: 3 },
  { id: 2, url: 'https://via.placeholder.com/200?text=写真②', alt: '写真②', tags: ['動物', '可愛い'], likes: 22, comments: 5 },
  { id: 3, url: 'https://via.placeholder.com/200?text=写真③', alt: '写真③', tags: ['食べ物', 'ランチ'], likes: 18, comments: 2 },
  { id: 4, url: 'https://via.placeholder.com/200?text=写真④', alt: '写真④', tags: ['都市', '夜景'], likes: 30, comments: 7 },
  { id: 5, url: 'https://via.placeholder.com/200?text=写真⑤', alt: '写真⑤', tags: ['旅行', '海'], likes: 25, comments: 4 },
  { id: 6, url: 'https://via.placeholder.com/200?text=写真⑥', alt: '写真⑥', tags: ['アート', '美術館'], likes: 12, comments: 1 },
  // さらに写真を追加できます
]);

// 検索結果として表示する写真のリスト
const displayedPhotos = computed(() => {
  if (!searchPerformed.value || searchText.value.trim() === '') {
    // 検索が実行されていないか、検索テキストが空の場合は全ての写真をそのまま表示
    // Instagramのように、通常時は「おすすめ」や「人気」の投稿を表示する想定
    return allPhotos.value; // または、人気順などにソートしたリスト
  }
  
  const query = searchText.value.toLowerCase().trim();
  // タグやキャプションなどに基づいて検索を実装
  return allPhotos.value.filter(photo => 
    photo.alt.toLowerCase().includes(query) || 
    (photo.tags && photo.tags.some(tag => tag.toLowerCase().includes(query)))
    // 将来的には post.content など、実際の投稿データに基づいて検索
  );
});

// 検索実行関数
const performSearch = () => {
  searchPerformed.value = true;
  // ここで実際のAPI呼び出しを行う
  // 例: await postStore.fetchSearchResults(searchText.value);
  // 現時点ではダミーデータをフィルタリングするのみ
  console.log('検索実行:', searchText.value);
};

// 写真クリック時の詳細画面への遷移
const goToPostDetail = (postId) => {
  // 実際の投稿詳細ページへのルーティングを設定
  // 例: router.push({ name: 'PostDetail', params: { id: postId } });
  console.log('投稿詳細へ移動:', postId);
  alert(`投稿ID ${postId} の詳細ページに遷移する想定です。`);
};
</script>

<style scoped>
.search-view {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px 15px;
  background-color: #fafafa;
  min-height: 100vh; /* 画面いっぱいに広がるように */
  box-sizing: border-box;
}

.search-bar-container {
  margin-bottom: 20px;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background-color: #efefef;
  border-radius: 8px;
  padding: 8px 12px;
}

.search-icon {
  font-size: 18px;
  color: #8e8e8e;
  margin-right: 8px;
}

.search-input {
  flex-grow: 1;
  border: none;
  background: none;
  font-size: 16px;
  padding: 0;
  outline: none;
}

.search-input::placeholder {
  color: #8e8e8e;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3列グリッド */
  gap: 5px; /* 写真間の余白 */
}

.photo-item {
  position: relative;
  width: 100%;
  padding-bottom: 100%; /* アスペクト比1:1を維持 */
  overflow: hidden;
  background-color: #f0f0f0; /* ロード中のプレースホルダー */
  cursor: pointer;
}

.photo-thumbnail {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* 画像がボックスに合わせてトリミングされる */
  display: block;
}

.photo-item:hover .photo-overlay {
  opacity: 1; /* ホバーでオーバーレイを表示 */
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4); /* 半透明の黒 */
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
  font-size: 16px;
  opacity: 0; /* 通常は非表示 */
  transition: opacity 0.3s ease;
}

.overlay-icon {
  margin: 0 10px;
  display: flex;
  align-items: center;
}

.overlay-icon span {
  margin-left: 5px;
}

.no-results-message,
.initial-message {
  grid-column: 1 / -1; /* グリッド全体に広がる */
  text-align: center;
  padding: 40px 20px;
  color: #8e8e8e;
  font-size: 18px;
}
</style>