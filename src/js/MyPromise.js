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
   } catch(err) {
     this.reject(err)
   }
 }
 resolve = (value) => {
   if (this.status !== 'pending') return
   this.status = 'fulfilled'
   this.value = value
   while(this.successCallBack.length) {
     this.successCallBack.shift()()
   }
 }
 reject = (reason) => {
   if (this.status !== 'pending') return
   this.status = 'rejected'
   this.reason = reason
   while(this.failCallBack.length) {
    this.failCallBack.shift()()
  }
 }
 then(successCallBack, failCallBack) {
   // successCallback || failCallBack 不存在
   successCallBack = successCallBack? successCallBack : value => value
   failCallBack = failCallBack? failCallBack : reason => reason
   let p2 = new MyPromise((resolve, reject) => {
    if (this.status === 'fulfilled') {
      resolve(successCallBack(this.value))
    } else if (this.status === 'rejected') {
      resolve(failCallBack(this.reason))
    } else if (this.status === "pending") {
      // this.successCallBack.push(() => successCallBack(this.value))
      this.successCallBack.push(() => resolve(successCallBack(this.value)))
      this.failCallBack.push(() => resolve(failCallBack(this.reason)))
    }
   })
   return p2
 }
}