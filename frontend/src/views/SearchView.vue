<!-- 検索したときに候補が出るようにする -->
<template>
  <div class="search-view">
    <div class="search-bar">
      <input
        type="text"
        v-model="searchQuery"
        @input="handleInput"
        @keyup.enter="handleSearch"
        placeholder="検索"
        class="search-input"
      />
      <div v-if="showSuggestions && searchQuery" class="suggestions">
        <div v-if="suggestedUsers.length > 0">
          <div class="suggestion-category">ユーザー</div>
          <div
            v-for="user in suggestedUsers"
            :key="user.id"
            @click="selectSuggestion(user.name, 'user')"
            class="suggestion-item"
          >
            <img :src="user.profileImage || 'default-profile.png'" alt="プロフィール画像" class="profile-thumbnail" />
            <span>{{ user.name }}</span>
          </div>
        </div>
        <div v-if="suggestedPosts.length > 0">
          <div class="suggestion-category">投稿</div>
          <div
            v-for="post in suggestedPosts"
            :key="post.id"
            @click="selectSuggestion(post.content, 'post')"
            class="suggestion-item"
          >
            <span>{{ post.content.substring(0, 50) }}{{ post.content.length > 50 ? '...' : '' }}</span>
          </div>
        </div>
        <div v-if="suggestedUsers.length === 0 && suggestedPosts.length === 0" class="no-suggestions">
          検索候補がありません
        </div>
      </div>
    </div>

    <div v-if="showResults" class="search-results">
      <div v-if="searchedUsers.length > 0">
        <h2>ユーザー検索結果</h2>
        <div class="user-results-grid">
          <div v-for="user in searchedUsers" :key="user.id" class="user-card">
            <img :src="user.profileImage || 'default-profile.png'" alt="プロフィール画像" class="profile-image" />
            <p>{{ user.name }}</p>
            <p class="user-bio">{{ user.bio || '自己紹介がありません' }}</p>
            </div>
        </div>
      </div>
      <div v-if="searchedPosts.length > 0">
        <h2>投稿検索結果</h2>
        <div class="post-results-grid">
          <div v-for="post in searchedPosts" :key="post.id" class="post-card">
            <img :src="post.image" alt="投稿画像" class="post-image" />
            <p class="post-content">{{ post.content }}</p>
            <p class="post-user">By: {{ post.userName }}</p>
            </div>
        </div>
      </div>
      <div v-if="searchedUsers.length === 0 && searchedPosts.length === 0 && searchPerformed" class="no-results">
        検索結果が見つかりませんでした。
      </div>
    </div>

    <div v-if="!showResults && !searchQuery" class="initial-display">
      <!-- <div class="image-grid">
        <div class="image-placeholder">写真①</div>
        <div class="image-placeholder">写真②</div>
        <div class="image-placeholder">写真③</div>
        <div class="image-placeholder">写真④</div>
        <div class="image-placeholder">写真⑤</div>
        <div class="image-placeholder">写真⑥</div>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { usePostStore } from '@/stores/postStore' // usePostStoreのパスを適切に修正してください

const postStore = usePostStore()

const searchQuery = ref('')
const showSuggestions = ref(false)
const suggestedUsers = ref([])
const suggestedPosts = ref([])

const showResults = ref(false)
const searchedUsers = ref([])
const searchedPosts = ref([])
const searchPerformed = ref(false) // 検索が実行されたかどうかを追跡する

let debounceTimer = null

const handleInput = async () => {
  showResults.value = false; // 入力があるたびに検索結果を非表示にする
  searchPerformed.value = false; // 新しい入力があったら検索実行フラグをリセット

  if (searchQuery.value.length > 0) {
    showSuggestions.value = true;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      // ユーザーと投稿の検索候補を取得
      try {
        const userRes = await postStore.searchUsers(searchQuery.value);
        suggestedUsers.value = userRes.data || []; // APIの戻り値に合わせて調整
      } catch (error) {
        console.error("ユーザー検索候補の取得に失敗:", error);
        suggestedUsers.value = [];
      }

      try {
        const postRes = await postStore.searchPosts(searchQuery.value);
        suggestedPosts.value = postRes.data || []; // APIの戻り値に合わせて調整
      } catch (error) {
        console.error("投稿検索候補の取得に失敗:", error);
        suggestedPosts.value = [];
      }
    }, 300); // 300msのデバウンス
  } else {
    showSuggestions.value = false;
    suggestedUsers.value = [];
    suggestedPosts.value = [];
  }
};

const handleSearch = async () => {
  if (searchQuery.value.length === 0) {
    showResults.value = false;
    searchPerformed.value = false;
    return;
  }

  showSuggestions.value = false; // エンターで検索結果を表示するので、サジェストは非表示
  searchPerformed.value = true; // 検索が実行されたことをマーク

  try {
    // ユーザー検索
    const userRes = await postStore.searchUsers(searchQuery.value);
    searchedUsers.value = userRes.data || [];

    // 投稿検索
    const postRes = await postStore.searchPosts(searchQuery.value);
    searchedPosts.value = postRes.data || [];

    showResults.value = true;
  } catch (error) {
    console.error("検索に失敗:", error);
    searchedUsers.value = [];
    searchedPosts.value = [];
    showResults.value = true; // エラー時でも結果エリアを表示（何も表示されない状態）
  }
};

const selectSuggestion = (text, type) => {
  searchQuery.value = text;
  handleSearch(); // サジェストを選択したら即座に検索を実行
};

// 検索クエリが空になったら初期表示に戻す
watch(searchQuery, (newValue) => {
  if (newValue === '') {
    showResults.value = false;
    searchPerformed.value = false;
  }
});
</script>

<style scoped>
.search-view {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.search-bar {
  position: relative;
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 15px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 16px;
  box-sizing: border-box;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="%23888" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>');
  background-repeat: no-repeat;
  background-position: calc(100% - 15px) center;
  background-size: 24px;
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #eee;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 300px;
  overflow-y: auto;
}

.suggestion-category {
  font-weight: bold;
  padding: 8px 15px;
  color: #555;
  border-bottom: 1px solid #eee;
}

.suggestion-item {
  padding: 10px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
}

.suggestion-item:hover {
  background-color: #f0f0f0;
}

.profile-thumbnail {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}

.no-suggestions {
  padding: 10px 15px;
  color: #888;
}

.initial-display .image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.initial-display .image-placeholder {
  width: 100%;
  padding-bottom: 100%; /* 1:1のアスペクト比を維持 */
  background-color: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #ddd;
  box-sizing: border-box;
  font-size: 1.2em;
  color: #666;
  position: relative; /* 子要素の配置のため */
}

.search-results {
  margin-top: 20px;
}

.search-results h2 {
  font-size: 1.5em;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}

.user-results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.user-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  background-color: #fff;
}

.user-card .profile-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 10px;
}

.user-card p {
  margin: 5px 0;
  font-weight: bold;
}

.user-card .user-bio {
  font-size: 0.9em;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.post-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  background-color: #fff;
}

.post-card .post-image {
  width: 100%;
  height: 200px; /* 固定の高さ、またはobject-fit: contain/cover を使う */
  object-fit: cover;
  display: block;
}

.post-card .post-content {
  padding: 10px;
  font-size: 0.95em;
  color: #333;
  word-break: break-word;
}

.post-card .post-user {
  padding: 0 10px 10px;
  font-size: 0.85em;
  color: #777;
  text-align: right;
}

.no-results {
  text-align: center;
  color: #888;
  padding: 40px;
  font-size: 1.1em;
}
</style>