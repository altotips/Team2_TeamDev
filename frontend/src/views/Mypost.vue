<script setup>
    import { ref } from 'vue'
    // import { usePostStore } from '@/stores/postStore'
    import { useRouter } from 'vue-router'
    // const postStore = usePostStore

    const router = useRouter()

    const selectedFile = ref(null)
    const description = ref('')

    //inputで選んだ画像ファイルを取得
    function onFileChange(event) {
        selectedFile.value = event.target.files[0]
    }

    function submitForm() {
        postStore.post({
            image: selectedFile.value,
            description: description.value
        })
    }

    const cancel = () => {
        router.push('/TimeLine')
    }

</script>

<template>
    <form @submit.prevent="submitForm" class="post-form">
        <!-- 左カラム：写真アップローダー -->
        <div class="left-column">
            <input type="file" @change="onFileChange" />
        </div>
          <img :src="selectedFile" alt="User Icon" class="profile-icon">

        <!-- 右カラム：テキスト入力 -->
        <div class="right-column">
            <input type="text" v-model="description" placeholder="説明文" />
        </div>

        <!-- ボタンエリア -->
        <div class="button-area">
            <button type="button" @click="cancel" class="cancel-button">キャンセル</button>
            <button type="submit" class="submit-button">投稿する</button>
        </div>
    </form>
</template>

<style scoped>
    .post-form {
        display: flex;
        flex-wrap: wrap;
        /* 下のボタンを改行して下に置く */
        gap: 1rem;
        max-width: 800px;
        margin: 0 auto;
    }

    /* 左右カラム */
    .left-column,
    .right-column {
        flex: 1 1 45%;
        /* 横幅45%ずつで2カラム */
    }

    /* ボタンエリアは全幅で下に配置 */
    .button-area {
        display: flex;
        justify-content: space-between;
        /* 左右端にボタンを配置 */
        width: 100%;
        margin-top: auto;
        padding-top: 1rem;
        border-top: 1px solid #ccc;
    }

    /* ボタンのスタイル */
    .cancel-button {
        background-color: transparent;
        border: 1px solid #ccc;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
    }

    .submit-button {
        background-color: #409EFF;
        border: none;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
    }
</style>