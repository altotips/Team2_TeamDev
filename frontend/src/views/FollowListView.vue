<template>
  <div class="follow-list-page">
    <h1 class="page-title">フォロー一覧</h1>

    <div v-if="isLoading" class="loading-message">
      読み込み中...
    </div>

    <div v-else-if="error" class="error-message">
      エラーが発生しました: {{ error.message }}
    </div>

    <div v-else-if="followedUsers.length === 0" class="no-follows-message">
      まだ誰もフォローしていません。
    </div>

    <ul v-else class="follow-list">
      <li v-for="user in followedUsers" :key="user.id" class="follow-item">
        <div class="user-info">
          <div class="icon-container">
            <img :src="user.userIconUrl || '/images/default_profile_icon.png'" alt="User Icon" class="user-icon">
          </div>
          <div class="text-info">
            <span class="username">{{ user.userName }}</span>
            <span class="fullname">{{ user.fullName }}</span>
          </div>
        </div>
        <button class="unfollow-button" @click="unfollow(user.id)">解除ボタン</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isLoading = ref(false);
const error = ref(null);

const followedUsers = ref([
  {
    id: 1,
    userName: 'user_taro',
    fullName: '山田 太郎',
    userIconUrl: '/images/dummy_icon1.png'
  },
  {
    id: 2,
    userName: 'user_hanako',
    fullName: '鈴木 花子',
    userIconUrl: '/images/dummy_icon2.png'
  },
  {
    id: 3,
    userName: 'user_jiro',
    fullName: '田中 二郎',
    userIconUrl: '/images/dummy_icon3.png'
  },
  {
    id: 4,
    userName: 'user_yumi',
    fullName: '佐藤 友美',
    userIconUrl: '/images/dummy_icon4.png'
  },
  {
    id: 5,
    userName: 'user_ken',
    fullName: '高橋 健太',
    userIconUrl: '/images/dummy_icon5.png'
  },
  {
    id: 6,
    userName: 'user_taro',
    fullName: '山田 太郎',
    userIconUrl: '/images/dummy_icon1.png'
  },
  {
    id: 7,
    userName: 'user_hanako',
    fullName: '鈴木 花子',
    userIconUrl: '/images/dummy_icon2.png'
  },
  {
    id: 8,
    userName: 'user_jiro',
    fullName: '田中 次郎',
    userIconUrl: '/images/dummy_icon3.png'
  },
  {
    id: 9,
    userName: 'user_yumi',
    fullName: '佐藤 友美',
    userIconUrl: '/images/dummy_icon4.png'
  },
  {
    id: 10,
    userName: 'user_ken',
    fullName: '高橋 健太',
    userIconUrl: '/images/dummy_icon5.png'
  }
]);

const unfollow = (userIdToUnfollow) => {
  console.log(`${userIdToUnfollow} 番のユーザーのフォローを解除します。`);
  followedUsers.value = followedUsers.value.filter(user => user.id !== userIdToUnfollow);
  alert(`${userIdToUnfollow} 番のユーザーのフォローを解除しました。`);
};

</script>

<style scoped>
.follow-list-page {
  max-width: 500px;
  margin: 40px auto;
  padding: 20px;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.page-title {
  /* text-align: center;  これを left に変更 */
  text-align: left; /* ★ここを変更 */
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #262626;
}

.loading-message, .error-message, .no-follows-message {
  text-align: center;
  padding: 20px;
  color: #8e8e8e;
}

.follow-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.follow-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.follow-item:last-child {
  border-bottom: none;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

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
  flex-direction: column;
}

.username {
  font-weight: bold;
  font-size: 16px;
  color: #262626;
}

.fullname {
  font-size: 14px;
  color: #8e8e8e;
}

.unfollow-button {
  background-color: #efefef;
  color: #262626;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  padding: 7px 16px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s;
}

.unfollow-button:hover {
  background-color: #e0e0e0;
}
</style>