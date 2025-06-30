import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from '@/utils/axios' // axiosのインポートパスが正しいことを確認してください
import { useToast } from '@/composables/useToast.js'

export const useUserStore = defineStore(
  'user',
  () => {
    const { showToastMessage } = useToast()


    const id = ref(null) // ユーザのID(主キー)
    const urlIcon = ref(null) // ユーザアイコンのurl
    const fullName = ref(null) // フルネーム
    const userName = ref(null) // ユーザ名
    const email = ref(null) // メールアドレス
    const selfIntroduction = ref(null) // 自己紹介文
    const follows = ref(null) // フォローユーザ一覧
    const likes = ref([]) // ★追加: ユーザーがいいねした投稿のリスト
    const authId = ref(null) // 管理権限
   
    // 新規追加：全ユーザー一覧
    const allUsers = ref([])

    // ログイン判定 (idがあればログイン中とみなす)
    const isLoggedIn = computed(() => !!id.value)

    async function fetchAllUsers() {
      try {
        const res = await axios.get('/users')
        allUsers.value = res.data
      } catch (error) {
        console.error("ユーザー取得エラー:", error)
      }
    }


    // ログイン処理
    async function login(userData) {
      try {
        const res = await axios.post('users/login', userData)
        if (!res.data) {
          showToastMessage('ログインに失敗しました')
          return false
        }

        id.value = res.data.id
        urlIcon.value = res.data.urlIcon
        fullName.value = res.data.fullName
        userName.value = res.data.userName
        email.value = res.data.email
        selfIntroduction.value = res.data.selfIntroduction

        await followers() // フォローリストの取得
        await fetchLikes() // ★追加: ログイン時にいいねリストも取得

        showToastMessage('ログインしました')
        return true
      } catch (error) {
        console.error('ログイン失敗', error)
        showToastMessage('ログインに失敗しました')
        return false
      }
    }

    // ログアウト処理
    async function logout() {
      try {
        id.value = null
        urlIcon.value = null
        fullName.value = null
        userName.value = null
        urlIcon.value = null // 既に初期化されているが念のため
        email.value = null
        selfIntroduction.value = null
        follows.value = null
        likes.value = [] // ★追加: ログアウト時にいいねリストをクリア
        authId.value = null
        showToastMessage('ログアウトしました')
        return true
      } catch (error) {
        console.error('ログアウト失敗', error)
        showToastMessage('ログアウトに失敗しました')
        return false
      }
    }

    // ユーザ登録処理
    async function register(userData) {
      try {
        await axios.post('users/register', userData) // res変数への代入は不要であれば削除
        showToastMessage('ユーザ登録をしました')
        return true
      } catch (error) {
        console.error('ユーザ登録失敗', error)
        showToastMessage('ユーザ登録に失敗しました')
        return false
      }
    }

    // フォロー
    async function follow(followId) {
      try {
        const res = await axios.put(`users/${id.value}/follow/${followId}`)
        if (!res.data) {

          showToastMessage('フォローに失敗しました')
          // throw new Error('ログイン失敗')
          return false
        }

        // id.value = res.data.id
        // urlIcon.value = res.data.urlIcon
        // fullName.value = res.data.fullName
        // userName.value = res.data.userName
        // email.value = res.data.email
        // selfIntroduction.value = res.data.selfIntroduction

        followers()
        // res = await axios.get('users/' + id.value + '/follow')
        // follows.value = res.data

        //   console.log('id : ' + id.value)
        //   console.log('userName : ' + userName.value)
        //   console.log('userId : ' + userId.value)

        // showToastMessage('ログインしました')
        // alert('ログインしました')
        showToastMessage('フォローしました')

        return true
      } catch (error) {
        console.error('フォロー失敗', error)
        return false
      }
    }

    // フォロー解除
    async function unfollow(unfollowId) {
      try {
        const res = await axios.delete(`users/${id.value}/unfollow/${unfollowId}`)
        if (!res.data) {

          showToastMessage('フォロー解除に失敗しました')
          // showToastMessage('ログインに失敗しました')
          // throw new Error('ログイン失敗')
          return false
        }

        // id.value = res.data.id
        // urlIcon.value = res.data.urlIcon
        // fullName.value = res.data.fullName
        // userName.value = res.data.userName
        // email.value = res.data.email
        // selfIntroduction.value = res.data.selfIntroduction

        followers()
        // res = await axios.get('users/' + id.value + '/follow')
        // follows.value = res.data.follows

        //   console.log('id : ' + id.value)
        //   console.log('userName : ' + userName.value)
        //   console.log('userId : ' + userId.value)

        // showToastMessage('ログインしました')
        // alert('ログインしました')
        showToastMessage('フォロー解除しました')

        return true
      } catch (error) {
        console.error('フォロー解除失敗', error)
        return false
      }
    }

    // ログインユーザーのフォローユーザ一覧を取得
    async function followers() {
      try {
        const res = await axios.get(`users/${id.value}/follow`)
        follows.value = res.data
        if (!res.data) {
          return false // データがない場合もfalseを返す
        }
        return true
      } catch (error) {
        console.error('フォローリスト取得失敗', error)
        return false
      }
    }

    // 特定のユーザーのフォローユーザ一覧を取得
    async function userFollowers(userId) {
      try {
        const res = await axios.get(`users/${userId}/follow`)
        return res.data
      } catch (error) {
        console.error('ユーザーのフォローリスト取得失敗', error)
        return null // エラー時はnullを返すなど適切に処理してください
      }
    }

    // プロフィール変更
    async function changeProfile(userData) {
      try {
        const res = await axios.patch(`users/${id.value}/edit`, userData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        //   console.log('res: ' + res.data)
        if (res.status !== 200 && res.status !== 204){
        showToastMessage('プロフィール変更に失敗しました')
          return false
        }

        // id.value = res.data.id

        urlIcon.value = res.data.urlIcon
        fullName.value = res.data.fullName
        userName.value = res.data.userName
        email.value = res.data.email
        selfIntroduction.value = res.data.selfIntroduction

        // res = await axios.get('users/'+id.value+'/follow')
        // follows.value = res.data.follows

        //   console.log('id : ' + id.value)
        //   console.log('userName : ' + userName.value)
        //   console.log('userId : ' + userId.value)

        // showToastMessage('ログインしました')
        // alert('ログインしました')
        showToastMessage('プロフィール変更しました')

        return true
      } catch (error) {
        console.error('プロフィール変更失敗', error)
        showToastMessage('プロフィール変更に失敗しました')
        return false
      }
    }

    // ユーザ取得処理（特定のユーザーの詳細情報）
    async function getUser(userId) {
      try {
        const res = await axios.get(`users/${userId}`)
        if (!res.data) {
          return null
        }
        return res
      } catch (error) {
        console.error('ユーザー取得失敗', error)
        return null
      }
    }

    // ★ユーザーがいいねした投稿のリストを取得するアクション
    async function fetchLikes() {
      if (!id.value) {
        console.warn('ユーザーがログインしていません。いいね情報を取得できません。');
        likes.value = [];
        return;
      }
      try {
        // バックエンドのLikesControllerのパスと一致させているか再確認
        const res = await axios.get(`likes/user/${id.value}`);
        // バックエンドが返すすべてのLiked Postオブジェクトをlikes.valueに代入
        likes.value = res.data; 
        console.log('取得したユーザーのいいね情報:', likes.value);
      } catch (error) {
        console.error('ユーザーのいいね情報の取得中にエラーが発生しました:', error);
        likes.value = [];
      }
    }

    // ★追加: いいねのトグル操作を行うPiniaアクション
    // このアクションはLikesControllerのPOST /api/likes/{postId}/user/{userId} を呼び出します
    async function toggleLikeApi(postId) {
      if (!id.value) {
        console.error('ユーザーIDがありません。いいねできません。');
        throw new Error('User not logged in');
      }
      try {
        // LikesControllerの新しいエンドポイントを呼び出す
        // バックエンドからは更新された投稿オブジェクト（goodカウントなど）が返されることを想定
        const response = await axios.post(`likes/${postId}/user/${id.value}`);
        
        // ローカルの likes (Piniaストアの状態) を更新
        // APIが成功し、いいねが追加された場合はlikes配列にpostIdを追加
        if (response.status === 200) { // または201など、APIが成功したステータスコード
          // 返されたデータに基づいてlikes配列を更新
          // 例: response.data.liked (boolean) や response.data.isLiked (boolean)
          // あるいは、response.dataがLikesオブジェクトの場合
          const isCurrentlyLiked = response.data.liked; // バックエンドのレスポンスにlikedステータスが含まれる場合
          
          if (likes.value.some(like => like.id === postId)) { // いいね済みだった場合 (解除された)
            likes.value = likes.value.filter(like => like.id !== postId);
            console.log("いいね解除：", postId);
          } else { // いいねされてなかった場合 (追加された)
            // ここで追加するlikesの要素の形式は、fetchLikesで取得する形式と合わせる
            // fetchLikesが`{ id: postId, post: { ... } }`のようなLikesオブジェクトの配列を返すなら、それに合わせる
            likes.value.push({ id: postId }); // 簡単な例：{ id: postId }を格納
            console.log("いいね追加：", postId);
          }
        }
        return response.data; // 更新された投稿データを返す
      } catch (error) {
        console.error("いいねAPI呼び出し中にエラー:", error);
        throw error; // エラーを呼び出し元に伝える
      }
    }

    // ★追加: いいねの状態をローカルで更新するヘルパーアクション
    // toggleLikeApi内で更新するため、直接外部から呼び出すことは少なくなるかもしれません
    function updateLikes(postId, isLiked) {
      if (isLiked) {
        // いいねした場合、まだリストになければ追加する
        // likes.valueの要素が `Likes` エンティティ（{id, user, post}）の形式の場合
        if (!likes.value.some(like => like.id === postId)) { // likes.id が post.id と一致すると仮定
          likes.value.push({ id: postId }); // 例: いいねした投稿のIDのみを保持
        }
      } else {
        // いいねを取り消した場合、リストから削除する
        likes.value = likes.value.filter(like => like.id !== postId);
      }
      console.log('ローカルいいね情報更新：', likes.value);
    }

    // 使用できる変数やメソッドの指定
    return {
      id,
      urlIcon,
      fullName,
      userName,
      email,
      selfIntroduction,
      follows,
      likes, // ★追加: likesを公開
      authId,
      isLoggedIn,
      login,
      logout,
      register,
      getUser,
      follow,
      unfollow,
      followers,
      userFollowers,
      changeProfile,
      fetchLikes, // ★追加: fetchLikesを公開
      toggleLikeApi, // ★追加: toggleLikeApiを公開
      updateLikes, // ★追加: updateLikesを公開

      // 追加
      allUsers,
      fetchAllUsers,
    }
  },
  {
    persist: {
      storage: sessionStorage,
      paths: [
        'id',
        'urlIcon',
        'fullName',
        'userName',
        'email',
        'selfIntroduction',
        'follows',
        'likes', // ★追加: likesも永続化対象に含める
        'authId',
      ],
    },
  },
)