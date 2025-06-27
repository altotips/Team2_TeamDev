import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from '@/utils/axios'
import { useUserStore } from '@/stores/userStore'

import { useToast } from '@/composables/useToast.js'


// 投稿一覧の取得や投稿などをまとめる
export const usePostStore = defineStore(
  'post',
  () => {
    const userStore = useUserStore()

    const { showToastMessage } = useToast()
    const allPosts = ref([])
    const followersPosts = ref([])
    const myPosts = ref([])
    const userPosts = ref([])
    const tags = ref([])


    // すべての投稿を取得し、allPostsに保存
    async function fetchAllPosts() {
      try {
        const res = await axios.get('/posts')
        // 最新の投稿を上に表示するため、逆順にする
        // 長さ比較だけでなく、内容の変更も考慮して常に更新する方が安全な場合もある
        allPosts.value = res.data.reverse()
      } catch (err) {
        console.error('全投稿の取得に失敗:', err)
      }
    }

    // 1ユーザのフォローしているすべてのユーザの投稿をすべて取得し、followersPostsに保存
    async function fetchFollowersPosts() {
      try {
        if (!userStore.id) {
          console.warn('ユーザーIDが取得できませんでした。ログイン済みか確認してください。')
          return
        }

        const res = await axios.get(`/posts/users/${userStore.id}/follow`)

        // 最新の投稿を上に表示するため、逆順にする
        // 差分がある場合のみ更新ではなく、常に最新のデータをセットする方が一般的
        followersPosts.value = res.data.reverse()
      } catch (err) {
        console.error('フォロー投稿の取得に失敗:', err)
      }
    }

    // 自分の投稿をすべて取得し、myPostsに保存
    async function fetchMyPosts(id) {
      try {
        if (!id) {
          if (myPosts.value.length > 0) {
            myPosts.value = []
          }
          console.log('idがないため、マイ投稿をクリアします。')
          return
        }

        const res = await axios.get(`/posts/users/${id}`)
        // 最新の投稿を上に表示するため、逆順にする
        myPosts.value = res.data.reverse()
      } catch (err) {
        console.error('マイ投稿の取得に失敗:', err)
      }
    }

    // ある自分以外の1ユーザの投稿をすべて取得し、userPostsに保存
    async function fetchUserPosts(id) {
      try {
        if (!id) {
          if (userPosts.value.length > 0) {
            userPosts.value = []
          }
          console.log('idがないため、ユーザー投稿をクリアします。')
          return
        }

        const res = await axios.get(`/posts/users/${id}`)
        userPosts.value = res.data.reverse()
      } catch (err) {
        console.error('ユーザーの投稿取得に失敗:', err)
      }
    }

    // logout時の処理
    async function logout() {
      // 投稿があるときだけ、リセット
      if (myPosts.value.length > 0) {
        myPosts.value = []
      }
      if (allPosts.value.length > 0) {
        allPosts.value = [];
      }
      if (followersPosts.value.length > 0) {
        followersPosts.value = [];
      }
      if (userPosts.value.length > 0) {
        userPosts.value = [];
      }
    }

    // 投稿する
    async function post(postData) {
      try {
        if (!userStore.id) {
          showToastMessage('ログインしてね。')
          // alert('ログインしてね。')
          return false
        }
        if (!postData.image) {
          showToastMessage('写真を選択してね。')
          // alert('写真を選択してね。')
          return false
        }

        const res = await axios.post(`/posts/${userStore.id}`, postData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })


        // 新しい投稿が成功したら、関連する投稿リストを更新（例: 自分の投稿リストを再フェッチ）
        // 必要に応じて、他のリストも更新
        await fetchMyPosts(userStore.id); 
        await fetchFollowersPosts();
        await fetchAllPosts();

        return !!res

      } catch (err) {
        console.error('投稿に失敗:', err)
        return false
      }
    }

    //コメント追加
    async function addComment(postId, { content: text }) {
      console.log("コメント追加メソッド呼び出し")
      try {
        if (!userStore.id) {
          alert('ログインしていません。コメントできません。');
          return;
        }
        if (!postId) {

          showToastMessage('どの投稿かわからないよ')
          // alert('どの投稿かわからないよ')
          return false
        }

        const res = await axios.patch(`/posts/${postId}/good/${userStore.id}`)
        console.log('いいねしたよ')


        // ★ コメント追加後、関連する投稿リスト内のコメント数を更新
        // ここで返されたコメントデータを使ってストアを更新することもできるが、
        // 今回は`updatePostInStore`と`updateUserPostInStore`に任せる
        return response; // 成功レスポンスを返す
      } catch (error) {
        console.error('コメントの追加に失敗:', error)
        throw error; // エラーを再スローして呼び出し元で処理させる
      }
    }


    /**
     * Piniaストア内の投稿を更新する汎用アクション
     * allPosts, followersPosts, myPosts のいずれかに存在する投稿を更新します。
     * @param {number} postId - 更新する投稿のID
     * @param {object} updates - 更新するプロパティを持つオブジェクト (例: { good: 10, comments: [...], liked: true })
     */
    function updatePostInStore(postId, updates) {
      // allPosts を更新
      const postInAllPosts = allPosts.value.find(p => p.id === postId);
      if (postInAllPosts) {
        Object.assign(postInAllPosts, updates);
        console.log(`postStore: allPosts内の投稿ID ${postId} を更新しました。`, updates);
      }


      // followersPosts を更新
      const postInFollowersPosts = followersPosts.value.find(p => p.id === postId);
      if (postInFollowersPosts) {
        Object.assign(postInFollowersPosts, updates);
        console.log(`postStore: followersPosts内の投稿ID ${postId} を更新しました。`, updates);
      }

      // myPosts を更新 (自分の投稿ページ用)
      const postInMyPosts = myPosts.value.find(p => p.id === postId);
      if (postInMyPosts) {
        Object.assign(postInMyPosts, updates);
        console.log(`postStore: myPosts内の投稿ID ${postId} を更新しました。`, updates);
      }

      // userPosts を更新 (他ユーザーのプロフィールページ用)
      const postInUserPosts = userPosts.value.find(p => p.id === postId);
      if (postInUserPosts) {
        Object.assign(postInUserPosts, updates);
        console.log(`postStore: userPosts内の投稿ID ${postId} を更新しました。`, updates);
      }
    }

    //コメント追加
    async function addComment(postId, {content:text}) {
      console.log("メソッド")
      await axios.post(`/posts/${postId}/comments/${userStore.id}`, {content:text})
      console.log("メソッド２")
      // "/{postId}/comments/{userId}"
      // ここで fetchAllPosts() は呼ばない
    }

    // ユーザ検索
    async function searchUsers(searchStr) {
      try {
        const res = await axios.get(`/posts/search/users`, {
          params: {
            searchStr: searchStr
          }
        });
        return res;
      } catch (error) {
        console.error('ユーザー検索に失敗:', error);
        throw error;
      }
    }

    // 投稿検索
    async function searchPosts(searchStr) {
      try {
        const res = await axios.get(`/posts/search/posts`, {
          params: {
            searchStr: searchStr
          }
        });
        return res;
      } catch (error) {
        console.error('投稿検索に失敗:', error);
        throw error;
      }
    }

    // タグ検索
    async function searchTags(searchStr) {
      const res = await axios.post(`/api/posts/search/tags?searchStr=${searchStr}`)
      return res
    }


    // 全タグ一覧取得
    async function getTags() {
      const res = await axios.post(`/api/posts/tags`)
      tags.value = res.data
      return res
    }



    return {
      allPosts,
      followersPosts,
      myPosts,
      userPosts, // 追加
      fetchAllPosts,
      fetchFollowersPosts,
      fetchMyPosts,
      fetchUserPosts, // 追加
      logout,
      post,
      addComment,
      updatePostInStore, // 追加
      searchUsers,
      searchPosts,
      searchTags,
      getTags,
    }
  },
  // 必要であればPinia persistの設定を再検討
  // {
  //   persist: {
  //     storage: sessionStorage, // セッション中だけ保存
  //     paths: [], // 保存するキーの指定。投稿リストは永続化しないのが一般的
  //   },
  // },
)