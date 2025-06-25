import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from '@/utils/axios'
import { useUserStore } from '@/stores/userStore'
// import { useToast } from '@/composables/useToast.js'

// 投稿一覧の取得や投稿などをまとめる
export const usePostStore = defineStore(
  'post',
  () => {
    const userStore = useUserStore()
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
    // async function fetchFollowersPosts(id) {
    //   try {
    //     // if (!id) {
    //     //   console.log('idがない')
    //     //   return
    //     // }

    //     const res = await axios.get('/posts/users/' + id + 'follow')
    //     // console.log('ret : ' + res)
    //     // console.log('ret : ' + res.data.length)
    //     if (followersPosts.value.length != res.data.length) {
    //       // 最新の投稿を上に表示するため、逆順にする
    //       followersPosts.value = res.data.reverse()
    //     }
    //     // console.log('followers : ' + followersPosts.value)
    //   } catch (err) {
    //     console.error('全投稿の取得に失敗:', err)
    //   }
    // }



async function fetchFollowersPosts() {
  try {
    if (!userStore.id) {
      console.warn('ユーザーIDが取得できませんでした。ログイン済みか確認してください。')
      return
    }

    const res = await axios.get(`/posts/users/${userStore.id}/follow`)

    // 差分がある場合のみ更新（パフォーマンス改善にもなる）
    if (followersPosts.value.length !== res.data.length) {
      followersPosts.value = res.data.reverse()
    }

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
          console.log('idがない')
          return
        }

        const res = await axios.get(`/posts/users/${id}`)
        console.log('my posts res : ' + res.data)
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
          console.log('idがない')
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
    async function post(postData) {
      try {
        // console.log(id)
        if (!userStore.id) {
          alert('ログインしてね。')
          return false
        }
        if (!postData.image) {
          alert('写真を選択してね。')
          return false
        }
        // console.log(postData.content)
        // console.log(postData.image)

        const res = await axios.post(`/posts/${userStore.id}`, postData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        if (res) {
          return true
        } else {
          return false
        }
      } catch (err) {
        console.error('ユーザーの投稿に失敗:', err)
      }
    }

    // いいねする
    async function good(postId) {
      try {
        if (!postId) {
          alert('どの投稿わからないよ')
          return false
        }

        const res = await axios.patch(`/posts/${postId}/good`)
        console.log('いいねしたよ')

        return res
        // if (res) {
        //   return true
        // } else {
        //   return false
        // }
      } catch (err) {
        console.error('ユーザーの投稿に失敗:', err)
      }
    }

    // いいね解除
    async function unGood(postId) {
      try {
        if (!postId) {
          alert('どの投稿わからないよ')
          return false
        }

        const res = await axios.put(`/posts/${postId}/unGood`)
        console.log('いいね解除')
        return res
        // if (res) {
        //   return true
        // } else {
        //   return false
        // }
      } catch (err) {
        console.error('ユーザーの投稿に失敗:', err)
      }
    }

  //コメント追加
   async function addComment(postId, user,content) {
    await axios.post(`/api/posts/${postId}/comments`, comment);
    // ここで fetchAllPosts() は呼ばない
}




    return {
      allPosts,
      followersPosts,
      myPosts,
      userPosts,
      fetchAllPosts,
      fetchFollowersPosts,
      fetchMyPosts,
      fetchUserPosts,
      logout,
      post,
      good,
      unGood,
      addComment,
    }
  },
  // {
  //   persist: {
  //     storage: sessionStorage, // セッション中だけ保存
  //     paths: [], // 保存するキーの指定
  //   },
  // },
)
