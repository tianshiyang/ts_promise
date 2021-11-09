class MyPromise {
  status = undefined
  value = undefined
  reason = undefined
  successCallBack = []
  failCallBack = []
  constructor(executor) {
    this.status = 'pending'
    try {
      executor(this.resolve, this.reject)
    } catch (err) {
      this.reject(err)
    }
  }
  resolve = (value) => {
    if (this.status !== 'pending') return
    this.status = 'fulfilled'
    this.value = value
    while (this.successCallBack.length) {
      this.successCallBack.shift()()
    }
  }
  reject = (reason) => {
    if (this.status !== 'pending') return
    this.status = 'rejected'
    this.reason = reason
    while (this.failCallBack.length) {
      this.failCallBack.shift()()
    }
  }
  then(successCallBack, failCallBack) {
    // successCallback || failCallBack 不存在
    successCallBack = successCallBack ? successCallBack : value => value
    failCallBack = failCallBack ? failCallBack : reason => reason
    let p2 = new MyPromise((resolve, reject) => {
      if (this.status === 'fulfilled') {
        let x = successCallBack(this.value)
        resolvePromise(p2, x, resolve, reject)
      } else if (this.status === 'rejected') {
        let x = failCallBack(this.reason)
        resolvePromise(p2, x, resolve, reject)
      } else if (this.status === "pending") {
        this.successCallBack.push(() => {
          let x = successCallBack(this.value)
          resolvePromise(p2, x, resolve, reject)
        })
        this.failCallBack.push(() => {
          let x = failCallBack(this.reason)
          resolvePromise(p2, x, resolve, reject)
        })
      }
    })
    return p2
  }
}

function resolvePromise(promise, x, resolve, reject) {
  if (promise === x) {
    console.log("相同promise")
    return
  }
  if (x instanceof MyPromise) {
    // 传递的是一个new promise类型
    x.then(resolve, reject) // 目的是储存当前传递promise的value值，resolve，reject都是当前promise的实例对象的resolve和reject
  } else {
    resolve(x)
  }
}
export { MyPromise }