import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from '@/utils/axios'
// import { useToast } from '@/composables/useToast.js'

// 投稿一覧の取得や投稿などをまとめる
export const usePostStore = defineStore(
  'post',
  () => {
    // const { showToastMessage } = useToast()
    const allPosts = ref([])
    const followersPosts = ref([])
    const myPosts = ref([])
    const userPosts = ref([])

    // すべての投稿を取得し、allPostsに保存
    async function fetchAllPosts() {
      try {
        const res = await axios.get('/posts')
        // console.log('ret : ' + res)
        // console.log('ret : ' + res.data.length)
        if (allPosts.value.length != res.data.length) {
          // 最新の投稿を上に表示するため、逆順にする
          allPosts.value = res.data.reverse()
        }
        // console.log('all : ' + allPosts.value)
      } catch (err) {
        console.error('全投稿の取得に失敗:', err)
      }
    }

    // 1ユーザの投稿をすべて取得し、userPostsに保存
    async function fetchfollowersPosts(id) {
      try {
        const res = await axios.get('/posts/users/'+id+'follow')
        // console.log('ret : ' + res)
        // console.log('ret : ' + res.data.length)
        if (allPosts.value.length != res.data.length) {
          // 最新の投稿を上に表示するため、逆順にする
          allPosts.value = res.data.reverse()
        }
        // console.log('all : ' + allPosts.value)
      } catch (err) {
        console.error('全投稿の取得に失敗:', err)
      }
    }

    // 1ユーザの投稿をすべて取得し、userPostsに保存
    async function fetchmyPosts(id) {
      try {
        const res = await axios.get('/posts')
        // console.log('ret : ' + res)
        // console.log('ret : ' + res.data.length)
        if (allPosts.value.length != res.data.length) {
          // 最新の投稿を上に表示するため、逆順にする
          allPosts.value = res.data.reverse()
        }
        // console.log('all : ' + allPosts.value)
      } catch (err) {
        console.error('全投稿の取得に失敗:', err)
      }
    }

    // 1ユーザの投稿をすべて取得し、userPostsに保存
    async function fetchPostsByUser(userId) {
      try {
        if (!userId) {
          if (userPosts.value.length > 0) {
            userPosts.value = []
          }
          return
        }
        const res = await axios.get(`/posts/users/${userId}`)
        // console.log(res.data.reverse())
        // console.log(1)
        userPosts.value = res.data.reverse()
        // console.log(2)
      } catch (err) {
        console.error('ユーザーの投稿取得に失敗:', err)
      }
    }

    // logout時の処理
    async function logout() {
      // 投稿があるときだけ、リセットif文なくすと多分無限ループする
      if (userPosts.value.length > 0) {
        userPosts.value = []
      }
    }

    // 投稿する
    async function post(userId, content) {
      try {
        if (!userId) {
          return
        }
        const res = await axios.post(`/posts/${userId}`, {
          content: content,
        })
        showToastMessage('投稿しました')
      } catch (err) {
        console.error('ユーザーの投稿に失敗:', err)
      }
    }

    return { allPosts, followersPosts, myPosts, userPosts, fetchAllPosts,fetchfollowersPosts,fetchmyPosts, fetchPostsByUser, logout, post }
  },
  // {
  //   persist: {
  //     storage: sessionStorage, // セッション中だけ保存
  //     paths: [], // 保存するキーの指定
  //   },
  // },
)
