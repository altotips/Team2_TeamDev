<script setup>
import { ref, reactive } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast.js'

const userStore = useUserStore()
const router = useRouter()
const { showToastMessage } = useToast()

const form = reactive({
  email: '',
  password: '',
  fullName: '',
  userName: '',
})

const submitRegister = async () => {
  try {
    const res = await userStore.register(form)
    if (res) {
      showToastMessage('登録できました！ログインしてください')
      router.push('/')
    } else {
      showToastMessage('登録に失敗しました')
    }
  } catch (error) {
    showToastMessage('登録に失敗しました')
    console.log(error)
  }
}
</script>

<template>
  <div>
    <h1>Hexagram</h1>
    <br />
    <h2>新規登録画面</h2>
    <br />

    <h4>登録して友達の写真や動画をチェックしよう</h4>
    <br />
    <form @submit.prevent="submitRegister" class="register-form">
      <div>
        <input v-model="form.email" type="email" placeholder="＠メールアドレス" />
      </div>
      <div>
        <input v-model="form.password" type="password" placeholder="パスワード" required />
      </div>
      <div>
        <input v-model="form.fullName" type="text" placeholder="フルネーム" required />
      </div>
      <div>
        <input v-model="form.userName" type="text" placeholder="ユーザーネーム" required />
      </div>

      <div class="button-wrapper">
        <button type="submit">登録する</button>
      </div>

      <br />
      <div class="link">
        <span>アカウントをお持ちの場合</span>
        <router-link to="/"> ログインする </router-link>
      </div>
    </form>
  </div>
</template>

<style scoped>
div {
  text-align: center;
}

.abc {
  justify-self: center;
  align-items: center;
  margin: 0 auto;
}

h1 {
  text-align: center;
  font-family: 'Dancing Script', cursive;
}

h2 {
  text-align: center;
}

h4 {
  color: gray;
}

.register-form div {
  margin-bottom: 12px;
  /* テキストボックスの間にスペース */
}

.register-form input {
  width: 300px;
  /* テキストボックスの幅を統一 */
  padding: 8px;
  box-sizing: border-box;
}

.register-form button {
  display: block;
  /* ブロックにして幅指定を効かせる */
  width: 100px;
  /* テキストボックスと同じ幅に */
  justify-content: center;
  margin: 0 auto;
  /* 左右の余白自動で中央寄せ */
  padding: 8px;
  cursor: pointer;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
}

.register-form button:hover {
  background-color: #66b1ff;
}

::placeholder {
  text-align: center;
}

.link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
}

/* register-form {
        max-width: 400px;
        margin: 0 auto;
        フォーム自体も中央にしたい場合
        display: flex;
        flex-direction: column;
        gap: 1rem;
        入力欄の間を少し開ける
    }

    .register-form button {
        display: flex;
        justify-content: center;
        ボタンを横方向に中央
    } */
</style>
