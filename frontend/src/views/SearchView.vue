<template>
  <div class="search-view">
    <div class="search-bar">
      <input type="text" v-model="searchQuery" @input="handleInput" @keyup.enter="handleSearch" placeholder="検索"
        class="search-input" />
      <div v-if="showSuggestions && searchQuery" class="suggestions">
        <div v-if="suggestedUsers.length > 0">
          <div class="suggestion-category">ユーザー</div>
          <div v-for="user in suggestedUsers" :key="user.id" @click="selectSuggestion(user.userName, 'user')"
            class="suggestion-item">
            <img :src="getImageUrl(user.urlIcon, 'user')" alt="User Icon" class="profile-thumbnail">
            <span>{{ user.userName }}</span>
          </div>
        </div>
        <div v-if="suggestedPosts.length > 0">
          <div class="suggestion-category">投稿</div>
          <div v-for="post in suggestedPosts" :key="post.id" @click="selectSuggestion(post.content, 'post')"
            class="suggestion-item">
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
        <div class="user-list">
          <div v-for="user in searchedUsers" :key="user.id" class="user-list-item" @click="goToUserProfile(user.id)">
            <div class="icon-container">
              <img :src="getImageUrl(user.urlIcon, 'user')" alt="User Icon" class="user-icon">
            </div>
            <div class="text-info">
              <span class="username">{{ user.userName }}</span>
              <span class="fullname">{{ user.fullName }}</span>
            </div>
          </div>
        </div>
        </div>
      <div v-if="searchedPosts.length > 0">
        <h2>投稿検索結果</h2>
        <div class="post-results-grid">
          <div v-for="post in searchedPosts" :key="post.id" class="post-card" @click="openPostModal(post)">
            <img :src="getImageUrl(post.urlPhoto, 'post')" :alt="post.content" class="post-image">
          </div>
        </div>
      </div>
      <div v-if="searchedUsers.length === 0 && searchedPosts.length === 0 && searchPerformed" class="no-results">
        検索結果が見つかりませんでした。
      </div>
    </div>

    <div v-if="!showResults && !searchQuery" class="initial-display">
    </div>

    <ModalUserPostsView :show="showModal" :postData="selectedPost" @close="closePostModal" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePostStore } from '@/stores/postStore'
import ModalUserPostsView from '@/views/ModalUserPostsView.vue'

const postStore = usePostStore()
const router = useRouter()

const searchQuery = ref('')
const showSuggestions = ref(false)
const suggestedUsers = ref([])
const suggestedPosts = ref([])

const showResults = ref(false)
const searchedUsers = ref([])
const searchedPosts = ref([])
const searchPerformed = ref(false)

const showModal = ref(false)
const selectedPost = ref(null)

let debounceTimer = null

const getImageUrl = (path, type) => {
  if (!path) {
    return type === 'user' ? '/images/default_profile_icon.png' : '/images/default_post_image.png';
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `http://localhost:8080/uploads/${path}`;
};

const handleInput = async () => {
  showResults.value = false;
  searchPerformed.value = false;

  if (searchQuery.value.length > 0) {
    showSuggestions.value = true;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        const userRes = await postStore.searchUsers(searchQuery.value);
        suggestedUsers.value = userRes.data || [];
      } catch (error) {
        console.error("ユーザー検索候補の取得に失敗:", error);
        suggestedUsers.value = [];
      }

      try {
        const postRes = await postStore.searchPosts(searchQuery.value);
        suggestedPosts.value = postRes.data || [];
      } catch (error) {
        console.error("投稿検索候補の取得に失敗:", error);
        suggestedPosts.value = [];
      }
    }, 300);
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

  showSuggestions.value = false;
  searchPerformed.value = true;

  try {
    const userRes = await postStore.searchUsers(searchQuery.value);
    searchedUsers.value = userRes.data || [];
    // デバッグ用ログを追加: 検索結果のユーザーデータを確認
    console.log('検索結果のユーザーデータ (searchedUsers):', searchedUsers.value);


    const postRes = await postStore.searchPosts(searchQuery.value);
    searchedPosts.value = postRes.data || [];

    showResults.value = true;
  } catch (error) {
    console.error("検索に失敗:", error);
    searchedUsers.value = [];
    searchedPosts.value = [];
    showResults.value = true;
  }
};

const selectSuggestion = (text, type) => {
  searchQuery.value = text;
  handleSearch();
};

watch(searchQuery, (newValue) => {
  if (newValue === '') {
    showResults.value = false;
    searchPerformed.value = false;
  }
});

const openPostModal = (post) => {
  selectedPost.value = post;
  showModal.value = true;
};

const closePostModal = () => {
  showModal.value = false;
  selectedPost.value = null;
};

// ★ ユーザープロフィールへの遷移 - ここを修正しました！
const goToUserProfile = (userId) => {
  // userId が null, undefined, または空文字列でないかを確認
  if (userId === null || userId === undefined || userId === '') {
    console.error('goToUserProfile: Received an invalid userId. Navigation aborted.', userId);
    // 必要であればユーザーにフィードバック
    alert('ユーザー情報が不完全なため、プロフィールを表示できません。');
    return;
  }

  // Vue Routerのルート定義で 'UserProfile' ルートが 'userId' パラメータを期待している場合、
  // ここでも 'userId' というキー名で渡す必要があります。
  router.push({ name: 'UserProfile', params: { userId: userId } });
  console.log('ユーザープロフィールへ移動:', userId);
};
</script>

<style scoped>
/* スタイルは変更なし */
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
  padding-bottom: 100%;
  /* 1:1のアスペクト比を維持 */
  background-color: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #ddd;
  box-sizing: border-box;
  font-size: 1.2em;
  color: #666;
  position: relative;
  /* 子要素の配置のため */
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

/* user-results-grid のスタイルを削除し、user-list に置き換える */
.user-list {
  display: flex;
  flex-direction: column; /* ユーザーを縦に並べる */
  gap: 10px; /* 各ユーザー間のスペース */
  margin-bottom: 30px;
}

.user-list-item {
  display: flex; /* アイコンとテキスト情報を横並びにする */
  align-items: center; /* 垂直方向の中央揃え */
  gap: 15px; /* アイコンとテキスト間のスペース */
  padding: 10px 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.user-list-item:hover {
  background-color: #f0f0f0;
}

/* 既存の .icon-container, .user-icon, .text-info, .username, .fullname はそのまま使用 */
.icon-container {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.user-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.text-info {
  display: flex;
  flex-direction: column; /* ユーザーネームとフルネームを縦に並べる */
  /* ここで flex-grow: 1 を追加すると、テキストが残りのスペースを占有し、
     右端に寄るように見えますが、テキストが長すぎるとellipsisが効きます。*/
  flex-grow: 1;
}

.username {
  font-weight: bold;
  font-size: 16px;
  color: #262626;
  white-space: nowrap; /* 1行で表示 */
  overflow: hidden; /* はみ出た部分を非表示 */
  text-overflow: ellipsis; /* はみ出た部分を...で表示 */
}

.fullname {
  font-size: 14px;
  color: #8e8e8e;
  white-space: nowrap; /* 1行で表示 */
  overflow: hidden; /* はみ出た部分を非表示 */
  text-overflow: ellipsis; /* はみ出た部分を...で表示 */
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
  cursor: pointer;
  /* クリック可能であることを示す */
}

.post-card .post-image {
  width: 100%;
  height: 200px;
  /* 固定の高さ、またはobject-fit: contain/cover を使う */
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