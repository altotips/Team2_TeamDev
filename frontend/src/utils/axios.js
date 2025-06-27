import axios from 'axios'

// ここでbaseURLと通信するオブジェクトがjsonであることを設定している。
// 使うときはaxios.get('/posts')で http://localhost:8080/api/posts になる。
const instance = axios.create({
  // baseURL: 'http://localhost:8080/api', // Spring Bootのエンドポイントに合わせて
  baseURL: 'http://192.168.137.1:8080/api', // Spring Bootのエンドポイントに合わせて
  headers: {
    'Content-Type': 'application/json',
  },
})

export default instance
