<template>
  <header class="header">
    <h1 class="title">Hexagram</h1>
    <span class="username">username</span>
  </header>
</template>

<script>
export default {
  name: 'Header'
}
</script>

<style>
.header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between; /* 左右に要素を振り分け */
  background-color: #f5f5f5;
  border-bottom: 1px solid #ccc;
  padding: 0 20px; /* 左右に余白をつける */
}

/* 左端に配置 */
.title {
  font-family: 'Dancing Script', cursive;
  font-size: 30px;
  font-weight: bold;
  margin-left: 30px;  /* 左に隙間 */
}

.username {
  font-size: 18px;
  color: #333;
  margin-right: 30px; /* 右に隙間 */
}
</style>