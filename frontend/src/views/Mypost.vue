<script setup>
    import { ref, computed, watch } from 'vue'
    import { usePostStore } from '@/stores/postStore'
    import { useRouter } from 'vue-router'
    // import { preview } from 'vite'
    import { useToast } from '@/composables/useToast.js'
    import { toHiragana } from 'wanakana';


    const postStore = usePostStore()
    const router = useRouter()
    const { showToastMessage } = useToast()


    const selectedFile = ref(null)
    const previewFile = ref(null)

    // 入力キャプションとタグのデータ
    const description = ref('')
    const tags = ref([])

    // 今！入力中の #〇〇 の部分をに反応する（検出して使う）変数
    const searchTag = ref('');

    // タグの候補リスト
    const candidateTags = ref(['いぬ', '犬', 'イッヌ', '筋トレ', 'ひよこ']);
    // toHiragana('イヌ') 
    // toHiragana('犬')    
    // toHiragana('いぬ')  

    // キャプション内の最後の「#」以降の単語を拾って、ひらがなで一致する候補を出す
    const suggestions = computed(() => {
        const keyword = toHiragana(searchTag.value); //ひらがな変換

        return keyword
            ? candidateTags.value.filter(tag =>
                toHiragana(tag).startsWith(keyword) // タグもひらがな変換して比較
            )
            : [];
    });

    // キャプションが変わるたびに、最後の #〇〇 を拾ってくる
    watch(description, (val) => {
        const match = val.match(/#([^\s# ]*)$/);
        searchTag.value = match ? match[1] : '';
    });

    // 候補タグをクリックしたときの処理
    function insertTag(tag) {

        // description 内の最後の #〇〇 を #tag に置き換える
        description.value = description.value.replace(/#([^\s# ]*)$/, `#${tag} `);

        // すでに含まれていなければ tags に追加
        if (!tags.value.includes(tag)) {
            tags.value.push(tag);
        }

        // 候補クリア
        currentTagText.value = '';
    }

    //inputで選んだ画像ファイルを取得
    function onFileChange(event) {
        selectedFile.value = event.target.files[0]
        previewFile.value = URL.createObjectURL(selectedFile.value)
    }

    // 画像とキャプションのデータを投稿
    const submitForm = async () => {

        //写真が選択されていないときにアラートを出す
        if (!selectedFile.value) {
            showToastMessage('画像を選択してください!📸')
            // alert('画像を選択してください!📸')
            return
        }

        try {
            const input = description.value;
            tags.value = input
                .match(/#[^\s# ]+/g) // #付き文字列を全部抜き出す
                ?.map(tag => tag.slice(1)) || []; //#なしの文字列に変換(#のない状態でデータを送ってほしいから)

            console.log(tags.value); // ["楽しい", "カフェ", "日常の記録"]

            const res = await postStore.post({
                image: selectedFile.value,
                content: description.value,
                tags: tags.value
            })
            console.log('レスポンス:', res)

            if (res) {
                showToastMessage('投稿完了！タイムラインに移動します🌟')
                // alert('投稿完了！タイムラインに移動します🌟')
                router.push('/TimeLine')
            } else {
                showToastMessage('投稿失敗！😢')
                // alert('投稿失敗！😢')
            }
        } catch (error) {
            showToastMessage('投稿に失敗しました😢')
            // alert('投稿に失敗しました😢')
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

            <!-- タグ候補があれば表示 -->
            <ul v-if="suggestions.length" class="tag-suggestions">
                <li v-for="tag in suggestions" :key="tag" @click="insertTag(tag)">
                    #{{ tag }}
                </li>
            </ul>
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