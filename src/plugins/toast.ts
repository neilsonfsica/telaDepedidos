import { createToastInterface, POSITION } from 'vue-toastification'

let _toast: any = null

function getToast() {
  if (!_toast) {
    _toast = createToastInterface({
      position: POSITION.TOP_RIGHT,
      timeout: 3000,
    })
  }
  return _toast
}

const toast = {
  success: (message: string) => getToast().success(message),
  error: (message: string) => getToast().error(message),
  warning: (message: string) => getToast().warning(message),
}

export default toast
