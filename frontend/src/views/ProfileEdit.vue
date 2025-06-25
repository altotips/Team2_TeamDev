<template>
  <div class="edit-page">
    <h2>プロフィール編集</h2>
    
    <form @submit.prevent="handleSubmit" class="edit-form">
      <div class="field">
        <label>フルネーム</label>
        <input v-model="form.fullName" type="text" />
      </div>
      <div class="field">
        <label>ユーザーネーム</label>
        <input v-model="form.userName" type="text" />
      </div>
      <div class="field">
        <label>メールアドレス</label>
        <input v-model="form.email" type="email" />
      </div>
      <div class="field">
        <label>自己紹介</label>
        <textarea v-model="form.selfIntroduction" rows="4" />
      </div>
      <div class="field">
        <label>アイコン画像</label>
        <input type="file" @change="onFileChange" />
        <img v-if="previewIcon" :src="`http://localhost:8080/uploads/${previewIcon}`" class="preview-icon" alt="image" />
      </div>

      <div class="buttons">
        <button type="button" class="cancel" @click="cancel">キャンセル</button>
        <button type="submit">保存</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const router = useRouter()

// ① フォーム用データ初期化
const form = reactive({
  fullName: userStore.fullName || '',
  userName: userStore.userName || '',
  email: userStore.email || '',
  selfIntroduction: userStore.selfIntroduction || '',
  file: null,
})

// プレビュー用アイコン設定
const previewIcon = ref(userStore.urlIcon ? userStore.urlIcon : null)

// ファイル選択時にフォームに保持し、プレビューを更新
function onFileChange(e) {
  const file = e.target.files[0]
  form.file = file || null
  if (form.file) {
    previewIcon.value = URL.createObjectURL(form.file)
  }
}

// フォーム送信時の処理（編集API呼び出し）
async function handleSubmit() {
  const payload = new FormData()
  payload.append('fullName', form.fullName)
  payload.append('userName', form.userName)
  payload.append('email', form.email)
  payload.append('selfIntroduction', form.selfIntroduction)
  payload.append('image', form.file)

  // 👇 追加：FormDataの内容を確認
  for (let [key, value] of payload.entries()) {
    console.log(`${key}:`, value)
  }

  const success = await userStore.changeProfile(payload)
  if (success) {
    router.push('/MyProfile')
  } else {
    alert('更新に失敗しました')
  }
}

// キャンセル時は元のページに戻す
function cancel() {
  router.back()
}
</script>

<style scoped>
.edit-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 30px 20px;
}
h2 {
  text-align: center;
  margin-bottom: 30px;
}
.field {
  margin-bottom: 20px;
}
.field label {
  display: block;
  margin-bottom: 6px;
  font-weight: bold;
}
.field input[type="text"],
.field input[type="email"],
.field textarea {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}
.preview-icon {
  display: block;
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 50%;
  margin-top: 10px;
}
.buttons {
  display: flex;
  justify-content: space-between;
}
.buttons button {
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
}
.buttons .cancel {
  background: #f5f5f5;
  border: 1px solid #ccc;
}
</style>
