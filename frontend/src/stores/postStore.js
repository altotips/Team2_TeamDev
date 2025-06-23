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

    // 1ユーザのフォローしているすべてのユーザの投稿をすべて取得し、followersPostsに保存
    async function fetchFollowersPosts(id) {
      try {
        const res = await axios.get('/posts/users/'+id+'follow')
        // console.log('ret : ' + res)
        // console.log('ret : ' + res.data.length)
        if (followersPosts.value.length != res.data.length) {
          // 最新の投稿を上に表示するため、逆順にする
          followersPosts.value = res.data.reverse()
        }
        // console.log('followers : ' + followersPosts.value)
      } catch (err) {
        console.error('全投稿の取得に失敗:', err)
      }
    }

    // 自分の投稿をすべて取得し、myPostsに保存
    async function fetchMyPosts(id) {
      try {
        if (!id) {
          if (myPosts.value.length > 0) {
            myPosts.value = []
          }
          return
        }
        const res = await axios.get('/posts/users/'+id)
        // console.log('ret : ' + res)
        // console.log('ret : ' + res.data.length)
        if (myPosts.value.length != res.data.length) {
          // 最新の投稿を上に表示するため、逆順にする
          myPosts.value = res.data.reverse()
        }
        // console.log('all : ' + allPosts.value)
      } catch (err) {
        console.error('全投稿の取得に失敗:', err)
      }
    }

    // ある自分以外の1ユーザの投稿をすべて取得し、userPostsに保存
    async function fetchUserPosts(id) {
      try {
        if (!id) {
          if (userPosts.value.length > 0) {
            userPosts.value = []
          }
          return
        }
        const res = await axios.get(`/posts/users/${id}`)
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
      if (myPosts.value.length > 0) {
        myPosts.value = []
      }
    }

    // 投稿する
    async function post(id, postData) {
      // 未完成
      try {
        if (!id) {
          return
        }
        const res = await axios.post(`/posts/${id}`, {
          image: postData.image,
          content: postData.content,
        })
      } catch (err) {
        console.error('ユーザーの投稿に失敗:', err)
      }
    }

    return { allPosts, followersPosts, myPosts, userPosts, fetchAllPosts, fetchFollowersPosts, fetchMyPosts, fetchUserPosts, logout, post }
  },
  // {
  //   persist: {
  //     storage: sessionStorage, // セッション中だけ保存
  //     paths: [], // 保存するキーの指定
  //   },
  // },
)
