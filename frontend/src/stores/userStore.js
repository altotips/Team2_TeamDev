import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from '@/utils/axios'
// import { useToast } from '@/composables/useToast.js'

// ユーザ情報やログインなどをまとめる
export const useUserStore = defineStore(
  'user',
  () => {
    // トースト表示のため使用
    // const { showToastMessage } = useToast()

    const id = ref(null) // ユーザのID(主キー)
    const urlIcon = ref(null) // ユーザアイコンのurl
    const fullName = ref(null) // フルネーム
    const userName = ref(null) // ユーザ名
    const email = ref(null) // メールアドレス
    const selfIntroduction = ref(null) // 自己紹介文
    const follows = ref(null) // フォローユーザ一覧
    const authId = ref(null) // 管理権限

    // ログイン処理
    async function login(userData) {
      try {
        //   console.log('ログイン')
        //   console.log('ユーザ名かユーザID : ' + userData.userNameOrId)
        //   console.log('パスワード : ' + userData.password)
        console.log(userData)

        // データベースでログイン判定処理
        const res = await axios.post('users/login', userData)
        // console.log('res: ' + res.data)
        if (!res.data) {
          // showToastMessage('ログインに失敗しました')
          // throw new Error('ログイン失敗')
          return false
        }

        id.value = res.data.id
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
        return true
      } catch (error) {
        console.error('ログイン失敗', error)
        // showToastMessage('ログインに失敗しました')
        // alert('ログインに失敗しました')
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
        email.value = null
        selfIntroduction.value = null
        follows.value = null
        // showToastMessage('ログアウトしました')
        // alert('ログアウトしました')
        return true
      } catch (error) {
        console.error('ログアウト失敗', error)
        // showToastMessage('ログアウトに失敗しました')
        // alert('ログアウトに失敗しました')
        return false
      }
    }

    // ユーザ登録処理
    async function register(userData) {
      try {
        // showToastMessage('登録処理')
        // console.log('登録')
        // console.log('ユーザ名 : ' + userData.userName)
        // console.log('ユーザID : ' + userData.userId)
        // console.log('パスワード : ' + userData.password)

        // ユーザIDが@から始まっているか判定
        // if (!userData.userId.startsWith('@')) {
        //   showToastMessage('ユーザIDは@から始めてください')
        //   // alert('ユーザIDは@から始めてください')
        //   return false
        // }

        // データベースで登録判定・登録処理
        const res = await axios.post('users/register', userData)

        // console.log('id : ' + res.data.id)
        // console.log('userName : ' + res.data.userName)
        // console.log('userId : ' + res.data.userId)

        // showToastMessage('ユーザ登録をしました')
        // alert('ユーザ登録をしました')
        return true
      } catch (error) {
        console.error('ユーザ登録失敗', error)
        // showToastMessage('ユーザ登録に失敗しました')
        // alert('ユーザ登録に失敗しました')
        return false
      }
    }

    // フォロー
    async function follow(followId) {
      try {
        //   console.log('ログイン')
        //   console.log('ユーザ名かユーザID : ' + userData.userNameOrId)
        //   console.log('パスワード : ' + userData.password)

        // データベースでログイン判定処理
        const res = await axios.put(`users/${id.value}/follow/${followId}`)
        //   console.log('res: ' + res.data)
        if (!res.data) {
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

        res = await axios.get('users/'+id.value+'/follow')
        follows.value = res.data.follows

        //   console.log('id : ' + id.value)
        //   console.log('userName : ' + userName.value)
        //   console.log('userId : ' + userId.value)

        // showToastMessage('ログインしました')
        // alert('ログインしました')
        return true
      } catch (error) {
        console.error('ログイン失敗', error)
        // showToastMessage('ログインに失敗しました')
        // alert('ログインに失敗しました')
        return false
      }
    }

    // フォロー解除
    async function unfollow(unfollowId) {
      try {
        //   console.log('ログイン')
        //   console.log('ユーザ名かユーザID : ' + userData.userNameOrId)
        //   console.log('パスワード : ' + userData.password)

        // データベースでログイン判定処理
        const res = await axios.delete(`users/${id.value}/unfollow/${unfollowId}`)
        //   console.log('res: ' + res.data)
        if (!res.data) {
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
        
        res = await axios.get('users/'+id.value+'/follow')
        follows.value = res.data.follows

        //   console.log('id : ' + id.value)
        //   console.log('userName : ' + userName.value)
        //   console.log('userId : ' + userId.value)

        // showToastMessage('ログインしました')
        // alert('ログインしました')
        return true
      } catch (error) {
        console.error('ログイン失敗', error)
        // showToastMessage('ログインに失敗しました')
        // alert('ログインに失敗しました')
        return false
      }
    }

    // フォローユーザ一覧
    async function followers() {
      try {
        //   console.log('ログイン')
        //   console.log('ユーザ名かユーザID : ' + userData.userNameOrId)
        //   console.log('パスワード : ' + userData.password)

        // データベースでログイン判定処理
        const res = await axios.get(`users/${id.value}/follow`)
        follows.value = res.data.follows
        //   console.log('res: ' + res.data)
        if (!res.data) {
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
        
        // res = await axios.get('users/'+id.value+'/follow')
        // follows.value = res.data.follows

        //   console.log('id : ' + id.value)
        //   console.log('userName : ' + userName.value)
        //   console.log('userId : ' + userId.value)

        // showToastMessage('ログインしました')
        // alert('ログインしました')
        return true
      } catch (error) {
        console.error('ログイン失敗', error)
        // showToastMessage('ログインに失敗しました')
        // alert('ログインに失敗しました')
        return false
      }
    }

    // プロフィール変更
    async function changeProfile(userData) {
      try {
        //   console.log('ログイン')
        //   console.log('ユーザ名かユーザID : ' + userData.userNameOrId)
        //   console.log('パスワード : ' + userData.password)

        // データベースでログイン判定処理
        const res = await axios.patch(`users/${id.value}/edit`, userData)
        //   console.log('res: ' + res.data)
        if (!res.data) {
          // showToastMessage('ログインに失敗しました')
          // throw new Error('ログイン失敗')
          return false
        }

        // id.value = res.data.id
        urlIcon.value = res.data.urlIcon
        fullName.value = res.data.fullName
        userName.value = res.data.userName
        // email.value = res.data.email
        selfIntroduction.value = res.data.selfIntroduction

        // res = await axios.get('users/'+id.value+'/follow')
        // follows.value = res.data.follows

        //   console.log('id : ' + id.value)
        //   console.log('userName : ' + userName.value)
        //   console.log('userId : ' + userId.value)

        // showToastMessage('ログインしました')
        // alert('ログインしました')
        return true
      } catch (error) {
        console.error('ログイン失敗', error)
        // showToastMessage('ログインに失敗しました')
        // alert('ログインに失敗しました')
        return false
      }
    }

    // ユーザ取得処理
    async function getUser(userId) {
      try {
        //   console.log('ログイン')
        //   console.log('ユーザ名かユーザID : ' + userData.userNameOrId)
        //   console.log('パスワード : ' + userData.password)

        // データベースから1ユーザの情報取得
        const res = await axios.get(`users/${userId}`)
        // console.log('res: ' + res.data.userName)
        // console.log('res: ' + res.data.userId)
        if (!res.data) {
          // console.log('エラー')
          // throw new Error('ユーザ取得失敗')
          return null
        }

        // console.log(res.data)
        // alert('ログインしました')
        return res
      } catch (error) {
        console.error('ユーザ取得失敗', error)
        // alert('ログインに失敗しました')
        return null
      }
    }

    // 使用できる変数やメソッドの指定
    return { id, urlIcon, fullName, userName, email, selfIntroduction, follows, authId, 
             login, logout, register, getUser, follow, unfollow, followers, changeProfile  }
  },
  {
    // ローカルストレージやセッションストレージに保存するデータを選択
    // ローカルストレージは同じウィンドウなら
    // セッションストレージは同じブラウザのタブ内なら
    // ログインが維持される。
    persist: {
      storage: sessionStorage, // セッション中だけ保存
      paths: ['id', 'urlIcon', 'fullName','userName', 'email', 'salfIntroduction','follows','authId'], // 保存するキーの指定
    },
  },
)
