<template>
  <div class="follow-list-page">
    <div class="header">
      <button class="back-button" @click="$router.go(-1)">
        ＜
      </button>
      <h2 class="followed-user-name">{{ currentUserName }}</h2>
    </div>

    <h1 class="page-title">{{ listType === 'following' ? 'フォロー中一覧' : 'フォロワー一覧' }}</h1>

    <div v-if="isLoading" class="loading-message">
      読み込み中...
    </div>

    <div v-else-if="error" class="error-message">
      エラーが発生しました: {{ error.message }}
    </div>

    <div v-else-if="usersInList.length === 0" class="no-follows-message">
      {{ listType === 'following' ? 'まだ誰もフォローしていません。' : 'まだフォロワーがいません。' }}
    </div>

    <ul v-else class="follow-list">
      <li v-for="user in usersInList" :key="user.id" class="follow-item">
        <div class="user-info" @click="goToUserProfile(user.id)">
          <div class="icon-container">
            <img :src="user.urlIcon || '/images/default_profile_icon.png'" alt="User Icon" class="user-icon">
          </div>
          <div class="text-info">
            <span class="username">{{ user.userName }}</span>
            <span class="fullname">{{ user.fullName }}</span>
          </div>
        </div>
        <button v-if="userStore.id && userStore.id === currentListOwnerId && listType === 'following'"
                class="unfollow-button" @click="unfollow(user.id)">解除</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore.js';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const isLoading = ref(false);
const error = ref(null);
const usersInList = ref([]); // フォローユーザー または フォロワーユーザー のリスト
const currentUserName = ref(''); // 現在表示しているリストの所有者名
const currentListOwnerId = ref(null); // 現在表示しているリストの所有者のID
const listType = ref(''); // 'following' (フォロー中) または 'followers' (フォロワー)

// プロフィールページへの遷移
const goToUserProfile = (userId) => {
  // 現在表示しているプロフィールのユーザーと、クリックしたユーザーが同じであれば遷移しない
  // これは主に /user/:userId パスで直接アクセスした場合を考慮
  if (route.params.userId && parseInt(route.params.userId) === userId) {
    return;
  }
  router.push(`/user/${userId}`);
};

// フォローリストのデータを取得する関数 (fetchUsersList にリネーム済)
const fetchUsersList = async () => {
  isLoading.value = true;
  error.value = null; // エラーをリセット
  usersInList.value = []; // 表示リストをクリア

  // URLクエリパラメータから userId と type を取得
  const routeUserId = parseInt(route.query.userId); // ★ route.params.userId ではなく route.query.userId を使う
  const routeListType = route.query.type; // 'following' or 'followers'

  try {
    let targetId = null;

    // URLクエリパラメータに userId があればそれを使用
    if (!isNaN(routeUserId)) {
      targetId = routeUserId;
      listType.value = routeListType || 'following'; // typeが指定されていなければデフォルトでfollowing
    } 
    // URLクエリパラメータに userId がなく、ログインしている場合は自分のリスト
    else if (userStore.id) {
      targetId = userStore.id;
      listType.value = 'following'; // 自分のページから遷移する際はフォロー中リストを想定
    } 
    // どちらのIDも特定できない場合
    else {
      error.value = new Error('表示するユーザー情報が特定できません（ログインが必要です）。');
      currentUserName.value = '不明なユーザー';
      return;
    }

    currentListOwnerId.value = targetId; // リストの所有者IDを保持

    // ユーザー情報とリストを取得
    const res = await userStore.getUser(targetId); // ユーザー情報を取得するAPIコール
    if (res && res.data) {
      // ★ ここで currentUserName を取得
      currentUserName.value = res.data.userName || 'ユーザー';

      // listType に応じて適切なリストを割り当てる
      if (listType.value === 'following') {
        // APIレスポンスに targetId のユーザーがフォローしているリストが含まれる前提
        // 例: res.data.follows が Follows エンティティの配列の場合、toUser をマッピング
        // もしAPIが直接ユーザーの配列を返すなら、res.data.follows など
        usersInList.value = res.data.follows?.map(f => f.toUser) || []; // APIのレスポンス構造に合わせて調整
      } else if (listType.value === 'followers') {
        // APIレスポンスに targetId のユーザーのフォロワーリストが含まれる前提
        usersInList.value = res.data.followers?.map(f => f.fromUser) || []; // APIのレスポンス構造に合わせて調整
      } else {
        error.value = new Error(`不明なリストタイプ: ${listType.value}`);
      }
    } else {
      error.value = new Error(`ユーザーID ${targetId} の情報が見つかりませんでした。`);
      currentUserName.value = 'ユーザー不明';
    }
  } catch (err) {
    console.error('ユーザーリストのフェッチ中にエラー:', err);
    error.value = err;
  } finally {
    isLoading.value = false;
  }
};

// フォロー解除処理
const unfollow = async (userIdToUnfollow) => {
  if (!userStore.id) {
    alert('ログインしていません。フォロー解除できません。');
    return;
  }
  if (!confirm(`${userIdToUnfollow} 番のユーザーのフォローを解除しますか？`)) {
    return;
  }

  const success = await userStore.unfollow(userIdToUnfollow);
  if (success) {
    alert(`${userIdToUnfollow} 番のユーザーのフォローを解除しました。`);
    // フォロー解除後、表示しているリストが自分のフォローリストであれば再フェッチして更新
    if (userStore.id === currentListOwnerId.value && listType.value === 'following') {
      await fetchUsersList(); // 現在のリストを再フェッチ
    }
  } else {
    alert('フォロー解除に失敗しました。');
  }
};

// コンポーネントがマウントされた時、またはURLパラメータが変更された時にリストをフェッチ
watch(
  () => [route.query.userId, route.query.type], // ★ route.params.userId ではなく route.query.userId を監視
  async ([newUserId, newType], oldValues = []) => {
    const [oldUserId, oldType] = oldValues;

    // パラメータが実際に変更された場合にのみ再フェッチ
    if (newUserId !== oldUserId || newType !== oldType) {
      console.log("Watch triggered by query change. Fetching list...");
      await fetchUsersList();
    }
  },
  { immediate: true } // コンポーネントが作成された直後にもウォッチャーを実行
);
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