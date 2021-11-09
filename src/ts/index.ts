enum Status {
  PENDING = "pending",
  FULFILLED = "fulfilled",
  REJECTED = "rejected"
}

class MyPromise {
  // 定义变量
  status: string | undefined = undefined
  value: any | undefined = undefined
  reason: any | undefined = undefined
  successCallBackArr: Array<() => void> = []
  failCallBackArr: Array<() => void> = []
  // executor接受两个参数： resolve， reject，返回值void
  constructor(executor: (resolve?: (value?: any) => void, reject?: () => void) => void) {
    this.status = Status.PENDING
    try {
      executor(this.resolve, this.reject)
    } catch (e) {
      this.reject(e)
    }
  }

  resolve = (value?: any): void => {
    if (this.status !== Status.PENDING) return
    this.status = Status.FULFILLED
    this.value = value
    while (this.successCallBackArr.length) {
      /**
       * 不能 this.successCallBackArr.shift()(), 报错
       */
      let successCallBackFn = this.successCallBackArr.shift()
      if (successCallBackFn) {
        successCallBackFn()
      }
    }
  }

  reject = (reason?: any): void => {
    if (this.status !== Status.PENDING) return
    this.status = Status.REJECTED
    this.reason = reason
    while (this.failCallBackArr.length) {
      let failCallBack = this.failCallBackArr.shift()
      if (failCallBack) {
        failCallBack()
      }
    }
  }

  // 传递回调函数，有默认值，是个函数
  then(successCallBack: (value: any) => void = value => value, failCallBack: (reason: any) => void = reason => reason): MyPromise {
    let p2 = new MyPromise((resolve: (value: any) => void = this.resolve, reject: (reason: any) => void = this.reject) => {
      if (this.status === Status.FULFILLED) {
        resolve(successCallBack(this.value))
      } else if (this.status === Status.REJECTED) {
        resolve(failCallBack(this.reason))
      } else if (this.status === Status.PENDING) {
        this.successCallBackArr.push(() => resolve(successCallBack(this.value)))
        this.failCallBackArr.push(() => resolve(failCallBack(this.reason)))
      }
    })
    return p2
  }

  catch(failCallBack: (reason: any) => void) {
    return this.then(undefined, failCallBack)
  }
}

export { MyPromise }