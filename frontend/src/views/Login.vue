<template>
  <h1>Hexagram</h1>
  <br />
  <h2>ログイン画面</h2>
  <form @submit.prevent="handleLogin" class="login-form">
    <div>
      <input v-model="userNameOrMailAddress" placeholder="ユーザーネームか＠メールアドレス" />
    </div>
    <div>
      <input v-model="password" placeholder="パスワード" type="password" />
    </div>
    <br />
    <button>ログイン</button>
  </form>
  <br />
  <br />
  <div>
    <span>アカウントを持ってない場合</span>
    <router-link to="/register">登録する</router-link>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'

const userNameOrMailAddress = ref('')
const password = ref('')

const userStore = useUserStore()
const router = useRouter()

const handleLogin = async () => {
  try {
    const res = await userStore.login({
      userNameOrMailAddress: userNameOrMailAddress.value,
      password: password.value,
    })
    if (!res) {
      alert('ログインできませんでした。')
    } else {
      alert('ログインできました。')
      router.push('/MyProfile')
    }
  } catch (error) {
    alert('ログインできませんでした。')
  }
}
</script>

<style scoped>
h1 {
  font-size: 80px;
  text-align: center;
  font-family: 'Dancing Script', cursive;
  margin-top: 30px;
}
h2 {
  font-size: 30px;
  text-align: center;
  margin-bottom: 50px;
  margin-top: 0;
}
div {
  text-align: center;
}

.login-form {
  margin-top: 0;
}

.login-form div {
  margin-bottom: 20px; /* テキストボックスの間にスペース */
}

.login-form input {
  width: 300px; /* テキストボックスの幅を統一 */
  padding: 8px;
  box-sizing: border-box;
}

.login-form button {
  display: block; /* ブロックにして幅指定を効かせる */
  width: 100px; /* テキストボックスと同じ幅に */

  justify-content: center;
  margin: 0 auto; /* 左右の余白自動で中央寄せ */
  padding: 8px;
  cursor: pointer;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
}
.login-form button:hover {
  background-color: #66b1ff;
}

::placeholder {
  text-align: center;
}
</style>
