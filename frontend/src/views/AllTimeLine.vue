<template>
    <div class="timeline">
        <div v-for="post in posts" :key="post.id" class="post-card">
            <div class="post-header">
                <img class="user-icon" :src="`http://localhost:8080/uploads/${post.user.urlIcon}`" alt="User Icon" />
                <router-link :to="{ name: 'UserProfile', params: { userId: post.user.id } }" class="user-name">
                    {{ post.user.userName }}
                </router-link>
            </div>

            <img :src="`http://localhost:8080/uploads/${post.urlPhoto}`" class="post-image" alt="image" />

            <div class="post-actions">
                <button @click="toggleLike(post)" class="icon-button"
                    :class="{ liked: post.liked, animate: post.animateHeart }">
                    <span :style="{ color: post.liked ? 'red' : '#aaa' }">
                        {{ post.liked ? '❤️' : '♡' }}
                    </span>
                </button>
                <p>{{ post.good }} </p>
                <button @click="toggleComment(post.id)" class="icon-button">💬</button>
                <p v-if="Array.isArray(post.comments)">
                    {{ post.comments.length }}
                </p>
            </div>

            <!-- メンション＆テキスト表示
            <p class="post-content">
                <template v-for="(word, index) in parseContent(post.content)" :key="index">
                    <router-link v-if="word.isMention && word.user"
                        :to="{ name: 'UserProfile', params: { userId: word.user.id } }" class="mention-link">
                        {{ word.text }}
                    </router-link>
                    <span v-else>{{ word.text }}</span>
                </template>
            </p>

            ハッシュタグ表示（まとめて）
            <p class="post-content">
                <template v-for="(word, index) in parseContent(post.content)" :key="index">
                    <router-link v-if="word.isTag && word.tag"
                        :to="{ name: 'Search', params: { userId: word.user.id } }" class="mention-link">
                        {{ word.text }}
                    </router-link>
                    <span v-else>{{ word.text }}</span>
                </template>
            </p> -->

            <p class="post-content">
                <template v-for="(word, index) in parseContent(post.content)" :key="index">
                    <router-link v-if="word.isMention && word.user"
                        :to="{ name: 'UserProfile', params: { userId: word.user.id } }" class="mention-link">
                        {{ word.text }}
                    </router-link>
                    <router-link v-else-if="word.isHashtag" :to="{ name: 'Search', query: { q: word.tag } }"
                        class="hashtag">
                        {{ word.text }}
                    </router-link>
                    <span v-else>{{ word.text }}</span>
                </template>
            </p>



            <!-- <div class="hashtags">
                <router-link v-for="tag in post.tags" :key="tag" :to="{ name: 'Search', params: { tag } }"
                    class="hashtag">
                    #{{ tag }}
                </router-link>
            </div> -->


            <!-- コメントセクション -->
            <div v-if="showComment[post.id]" class="comment-section">
                <div v-for="comment in post.comments" :key="comment.id" class="comment">
                    <strong>{{ comment.user.userName }}:</strong> {{ comment.content }}
                </div>
                <form @submit.prevent="submitComment(post.id)" class="comment-form">
                    <input v-model="newComments[post.id]" type="text" placeholder="コメント..." />
                    <button type="submit">送信</button>
                </form>
            </div>

        </div>

        <div v-if="postStore.isLoading" class="loading-message">読み込み中...</div>
        <div v-else-if="postStore.error" class="error-message">エラー: {{ postStore.error.message }}</div>
        <div v-else-if="posts.length === 0" class="no-posts-message">投稿がありません。</div>
    </div>
</template>

<script setup>
    import { ref, reactive, computed, onUnmounted } from 'vue'
    import { usePostStore } from '@/stores/postStore'
    import { useUserStore } from '@/stores/userStore'
    import { useRouter } from 'vue-router'
    // import { showToastMessage } from '@/utils/toast' // トースト関数（なければ alert に置き換えてOK）
    import { onMounted, watch } from 'vue'
    import { useRoute } from 'vue-router'

    const route = useRoute()
    const searchQuery = ref('')

    onMounted(() => {
        if (route.params.tag) {
            searchQuery.value = route.params.tag
            handleSearch()  // 既存の検索処理を呼び出す
        }
    })

    watch(() => route.params.tag, (newTag) => {
        if (newTag) {
            searchQuery.value = newTag
            handleSearch()
        }
    })


    const postStore = usePostStore()
    const userStore = useUserStore()
    const router = useRouter()
    let intervalId

    const posts = computed(() => postStore.allPosts)
    const showComment = reactive({})
    const newComments = reactive({})

    onMounted(async () => {
        await postStore.fetchAllPosts()

        intervalId = setInterval(async () => {
            await postStore.fetchAllPosts()
        }, 5000)

        if (userStore.id) {
            await userStore.fetchAllUsers()
            await postStore.fetchAllPosts()
        }
    })

    onUnmounted(() => {
        clearInterval(intervalId)
    })


    // メンションテキストを解析
    function parseContent(text) {
        if (!text) return []

        // 半角スペース or @ または # の直前で分割し、空文字を除去
        const parts = text.split(/(\s|(?=[@#]))+/).filter(Boolean)

        return parts.map(part => {
            if (part.startsWith('@')) {
                const username = part.slice(1)
                const user = userStore.allUsers.find(u => u.userName === username)
                return { text: part, isMention: true, user: user || null }
            }
            if (part.startsWith('#')) {
                const tag = part.slice(1)
                return { text: part, isHashtag: true, tag }
            }
            return { text: part, isMention: false, isHashtag: false }
        })
    }



    // いいね処理
    const toggleLike = async (post) => {
        if (!userStore.id) {
            showToastMessage('ログインしていません。')
            return
        }
        try {
            post.animateHeart = true
            if (post.liked) {
                post.good = Math.max(0, post.good - 1)
                await postStore.unGood(post.id)
            } else {
                post.good += 1
                await postStore.good(post.id)
            }
            post.liked = !post.liked
        } catch (error) {
            console.error('いいねエラー:', error)
            showToastMessage('いいねに失敗しました')
            post.liked = !post.liked
        } finally {
            setTimeout(() => (post.animateHeart = false), 500)
        }
    }

    // コメント表示切り替え
    const toggleComment = (postId) => {
        showComment[postId] = !showComment[postId]
    }

    // コメント投稿
    const submitComment = async (postId) => {
        if (!userStore.id) {
            showToastMessage('ログインしてください')
            return
        }

        const text = (newComments[postId] || '').trim()
        if (!text) {
            showToastMessage('コメントを入力してください')
            return
        }

        try {
            await postStore.addComment(postId, { content: text })

            const post = posts.value.find(p => p.id === postId)
            if (post) {
                if (!Array.isArray(post.comments)) post.comments = []
                post.comments.push({
                    content: text,
                    user: {
                        id: userStore.id,
                        userName: userStore.userName,
                        urlIcon: userStore.urlIcon || ''
                    }
                })
            }

            newComments[postId] = ''
            showToastMessage('コメントを送信しました！')
        } catch (error) {
            console.error('コメント送信エラー:', error)
            showToastMessage('コメント送信に失敗しました')
        }
    }
</script>

<style scoped>
    /* ★ 必要なCSSだけ再掲 */

    .liked {
        animation: pop 0.5s ease;
    }

    @keyframes pop {
        0% {
            transform: scale(1);
        }

        50% {
            transform: scale(1.8);
        }

        100% {
            transform: scale(1);
        }
    }

    .post-card {
        border: 1px solid #ddd;
        border-radius: 8px;
        max-width: 500px;
        margin: 10px auto;
        background: white;
        padding: 12px;
    }

    .user-icon {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        margin-right: 8px;
    }

    .user-name {
        font-weight: bold;
        text-decoration: none;
        /* 👈 下線を消す！ */
        color: inherit;
        /* 👈 親と同じ色にする（青リンクを打ち消す） */
        cursor: pointer;
        /* 👈 手のマークはちゃんと出る！ */
        font-size: 15px;
    }

    .post-image {
        width: 100%;
        border-radius: 4px;
        margin-bottom: 8px;
    }

    .post-actions {
        display: flex;
        gap: 12px;
        padding: 0 8px;
        margin-bottom: 8px;
    }

    .icon-button {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
    }

    .comment-section {
        margin-top: 10px;
        padding: 10px;
        background: #f9f9f9;
        border-radius: 4px;
    }

    .comment-form {
        display: flex;
        gap: 8px;
        margin-top: 10px;
    }

    .comment-form input {
        flex: 1;
        padding: 4px 8px;
    }

    .comment-form button {
        padding: 4px 10px;
    }

    .hashtag {
        color: #3b82f6;
        font-weight: bold;
        text-decoration: none;
    }

    .hashtag:hover {
        text-decoration: underline;
    }

    .mention-link {
        color: #10b981;
        font-weight: bold;
        text-decoration: none;
    }

    .mention-link:hover {
        text-decoration: underline;
    }
</style>