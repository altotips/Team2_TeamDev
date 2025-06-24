<script setup>
    import { ref } from 'vue'
    import { usePostStore } from '@/stores/postStore'
    import { useRouter } from 'vue-router'
    // import { preview } from 'vite'

    const postStore = usePostStore()
    const router = useRouter()

    // const selectedFile = ref('/assets/images/hiyoko.jpg')
    const selectedFile = ref(null)
    const previewFile = ref(null)
    const description = ref('')

    //inputで選んだ画像ファイルを取得
    function onFileChange(event) {
        selectedFile.value = event.target.files[0]
        previewFile.value = URL.createObjectURL(selectedFile.value)
    }



    画像とキャプションのデータを投稿
    const submitForm = async () => {

        //写真が選択されていないときにアラートを出す
        if (!selectedFile.value) {
            alert('画像を選択してください!📸')
            return
        }

        try {
            const res = await postStore.post({
                image: selectedFile.value,
                content: description.value,
            })
            console.log('レスポンス:', res)
            if (res) {
                alert('投稿完了！タイムラインに移動します🌟')
                router.push('/TimeLine')
            } else {
                alert('投稿失敗！😢')
            }
        } catch (error) {
            alert('投稿に失敗しました😢')
            console.error(error)
        }
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
            <!-- <img src="/hiyoko.jpg" alt="selectedFile" class="profile-icon"> -->
            <!-- <img :src="`http://localhost:8080/uploads/inu.png`" alt="投稿画像" /> -->
            <!-- <img src="@/assets/images/penguin.png" :src="selectedFile || '@/assets/images/penguin.png'" alt="selectedFile" class="profile-icon"> -->
            <img v-if="previewFile" :src="previewFile" :alt="selectedFile" class="profile-icon" />
        </div>

        <!-- 右カラム：テキスト入力 -->
        <div class="right-column">
            <!-- <input type="text" v-model="description" placeholder="キャプションを入力" class="caption-box" /> -->
            <textarea v-model="description" placeholder="キャプションを入力" class="caption-box"></textarea>
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
        gap: 1rem;
        max-width: 800px;
        margin: 0 auto;
    }

    /* 左カラム */
    .left-column {
        flex: 1 1 45%;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    /* 右カラム */
    .right-column {
        flex: 1 1 45%;
        display: flex;
        flex-direction: column;
        /* justify-content: center; ← これで縦中央寄せ！ */
        gap: 1rem;
        padding-top: 50px;
    }

    /* 画像の大きさ調整 */
    .profile-icon {
        max-width: 100%;
        max-height: 300px;
        object-fit: contain;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    /* ボタンエリアは全幅で下に配置 */
    .button-area {
        display: flex;
        justify-content: space-between;
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
        background-color: #409eff;
        border: none;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
    }

    .caption-box {
        width: 100%;
        height: 245px;
        /* 好きな高さに調整可能 */
        padding: 8px;
        font-size: 14px;
        resize: vertical;
        /* ユーザーが上下にサイズ変更できるように */
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
        margin-top: 21px;
    }

    textarea {
        padding-top: 100px;
    }

    /* 1. ファイル選択ボタンに余白 */
    .left-column input[type='file'] {
        margin-top: 1rem;
        padding: 6px;
        cursor: pointer;
    }

    /* 2. ホバー時のスタイル */
    .left-column input[type='file']:hover {
        background-color: #f0f0f0;
        border-radius: 4px;
    }

    /* 3. フォームを縦中央に置く */
    .post-form {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        max-width: 800px;
        margin: auto;
        /* 横中央寄せ */
        min-height: 80vh;
        /* 画面の80%使う */
        align-items: center;
        /* ←これで中身を縦に中央寄せ */
    }

    .cancel-button:hover {
        background-color: #eee;
        border-color: #999;
    }

    .submit-button:hover {
        background-color: #66b1ff;
    }
</style>