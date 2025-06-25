<template>
  <footer class="footer-nav">

    <div class="footer-inner">
      <RouterLink to="/TimeLine" class="nav-item">
        <span class="icon">⌂</span>
      </RouterLink>

      <RouterLink to="/post" class="nav-item">
        <span class="icon">＋</span>
      </RouterLink>

      <RouterLink to="/MyProfile" class="nav-item">
        <span class="icon">〇</span>
      </RouterLink>
    </div>
  </footer>
</template>

<script>
  export default {
    name: 'Footer'
  }
</script>

<style scoped>
  .footer-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: 100%;
    max-width: 800px;
    /* max-width: 935px; */
    height: 60px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    background-color: #fff;
    border-top: 1px solid #ddd;
    /* 横幅を親（container）に合わせる */
    width: 100%;
  }

  /* .footer-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: 100%;
    max-width: 935px;
    height: 60px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    background-color: #fff;
    border-top: 1px solid #ddd;
  } */

  .footer-inner {
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 100%;
    max-width: 800px;
    padding: 0 1rem;
    box-sizing: border-box;
  }

  .nav-item {
    flex: 1;
    /* 各ボタンを均等に広げる */
    text-align: center;
    text-decoration: none;
    color: black;
  }

  .icon {
    font-size: 24px;
  }
</style>