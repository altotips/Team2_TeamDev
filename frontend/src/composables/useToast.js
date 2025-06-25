// useToast.js
import { ref, nextTick } from 'vue'

const toastMessage = ref('')
const showToast = ref(false)

// トースト表示(上に出てくる、エラーのポップアップのようなもの)を制御する
export function useToast() {
  // トースト表示する関数
  function show(message, duration = 1000) {
    // 一度非表示にする
    showToast.value = false
    // タイマー
    let toastTimeout = null

    // nextTick : DOM やリアクティブな値の更新が反映される「次の描画タイミング」で処理を実行する
    // refなどの値が変化したとVueが認識するちょっとの間を待つ。
    nextTick(() => {
      toastMessage.value = message
      showToast.value = true

      // タイマーリセット
      if (toastTimeout) clearTimeout(toastTimeout)

      // 少ししたらトースト表示を消す
      toastTimeout = setTimeout(() => {
        toastMessage.value = ''
        showToast.value = false
        toastTimeout = null
      }, duration)
    })
  }

  return {
    toastMessage,
    showToast,
    showToastMessage: show, // 関数だけ名前変えて外に出す
  }
}