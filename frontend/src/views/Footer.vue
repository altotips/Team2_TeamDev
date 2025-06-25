<template>
  <footer class="footer-nav">
    <RouterLink to="/TimeLine" class="nav-item">
      <span class="icon">⌂</span>
    </RouterLink>

    <RouterLink to="/Search" class="nav-item">
      <img src="@/assets/images/image.png" alt="検索" class="search_icon" />
    </RouterLink>

    <RouterLink to="/post" class="nav-item">
      <span class="icon">＋</span>
    </RouterLink>

    <RouterLink to="/MyProfile" class="nav-item">
      <span class="icon">〇</span>
    </RouterLink>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style scoped>
.footer-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: #fff;
  border-top: 1px solid #ddd;
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 60px;
  left: 0;
}


.nav-item {
  flex: 1; /* 各ボタンを均等に広げる */
  text-align: center;
  text-decoration: none;
  color: black;
}

.icon {
  font-size: 24px;
}

.search_icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  vertical-align: middle;
}

</style>