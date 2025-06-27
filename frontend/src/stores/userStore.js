import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from '@/utils/axios'
import { useToast } from '@/composables/useToast.js'

export const useUserStore = defineStore(
  'user',
  () => {
    const { showToastMessage } = useToast()

    // 既存のstate
    const id = ref(null)
    const urlIcon = ref(null)
    const fullName = ref(null)
    const userName = ref(null)
    const email = ref(null)
    const selfIntroduction = ref(null)
    const follows = ref(null)
    const authId = ref(null)

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
        //   console.log('ログイン')
        //   console.log('ユーザ名かユーザID : ' + userData.userNameOrId)
        //   console.log('パスワード : ' + userData.password)
        // console.log(userData)

        // データベースでログイン判定処理
        const res = await axios.post('users/login', userData)
        // console.log('res: ' + res.data)
        if (!res.data) {
          showToastMessage('ログインに失敗しました')
          // throw new Error('ログイン失敗')
          return false
        }

        id.value = res.data.id
        urlIcon.value = res.data.urlIcon
        fullName.value = res.data.fullName
        userName.value = res.data.userName
        email.value = res.data.email
        selfIntroduction.value = res.data.selfIntroduction

        followers()
        // res = await axios.get(`users/${id.value}/follow`)
        // follows.value = res.data

        // console.log('id : ' + id.value)
        // console.log('urlIcon : ' + urlIcon.value)
        // console.log('fullName : ' + fullName.value)
        // console.log('userName : ' + userName.value)
        // console.log('email : ' + email.value)
        // console.log('selfIntroduction : ' + selfIntroduction.value)
        // console.log('follows : ' + follows.value)

        showToastMessage('ログインしました')
        // alert('ログインしました')
        return true
      } catch (error) {
        console.error('ログイン失敗', error)
        showToastMessage('ログインに失敗しました')
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
        showToastMessage('ログアウトしました')
        // alert('ログアウトしました')
        return true
      } catch (error) {
        console.error('ログアウト失敗', error)
        showToastMessage('ログアウトに失敗しました')
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

        showToastMessage('ユーザ登録をしました')
        // alert('ユーザ登録をしました')
        return true
      } catch (error) {
        console.error('ユーザ登録失敗', error)
        showToastMessage('ユーザ登録に失敗しました')
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

        followers()
        // res = await axios.get('users/' + id.value + '/follow')
        // follows.value = res.data

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

        followers()
        // res = await axios.get('users/' + id.value + '/follow')
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

    // フォローユーザ一覧
    async function followers() {
      try {
        //   console.log('ログイン')
        //   console.log('ユーザ名かユーザID : ' + userData.userNameOrId)
        //   console.log('パスワード : ' + userData.password)

        // データベースでログイン判定処理
        const res = await axios.get(`users/${id.value}/follow`)
        follows.value = res.data
        // console.log('follows res.data : ' + res)
        // console.log('follows res.data : ' + res.data)
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

    // 他人のフォローユーザ一覧
    async function userFollowers(userId) {
      try {
        //   console.log('ログイン')
        //   console.log('ユーザ名かユーザID : ' + userData.userNameOrId)
        //   console.log('パスワード : ' + userData.password)

        // データベースでログイン判定処理
        const res = await axios.get(`users/${userId}/follow`)
        return res.data;
        // console.log('follows res.data : ' + res)
        // console.log('follows res.data : ' + res.data)
        // if (!res.data) {
          // showToastMessage('ログインに失敗しました')
          // throw new Error('ログイン失敗')
        //   return false
        // }

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
        // return true
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
        const res = await axios.patch(`users/${id.value}/edit`, userData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        //   console.log('res: ' + res.data)
        if (res.status !== 200 && res.status !== 204) return false


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
        return true
      } catch (error) {
        console.error('プロフィール変更失敗', error)
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
    return {
      id,
      urlIcon,
      fullName,
      userName,
      email,
      selfIntroduction,
      follows,
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
      // 追加
      allUsers,
      fetchAllUsers,
    }
  },
  {
    // ローカルストレージやセッションストレージに保存するデータを選択
    // ローカルストレージは同じウィンドウなら
    // セッションストレージは同じブラウザのタブ内なら
    // ログインが維持される。
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
        'authId',
      ],
    },
  },
)
