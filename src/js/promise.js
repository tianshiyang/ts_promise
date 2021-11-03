// class myPromise {
//   status = undefined
//   value = undefined
//   reason = undefined
//   onFulfilledCallbacks = []
//   onRejectedCallbacks = []
//   constructor(excutor) {
//     this.status = "pending"
//     this.value = undefined
//     this.reason = undefined
//     excutor(this.resolve, this.reject)
//     try {
//       excutor(this.resolve, this.reject)
//     } catch(err) {
//       this.reject(err)
//     }
//   }

//   then = (onFulfilled, onRejected) => {
//     if (this.status === "pending") {
//       this.onFulfilledCallbacks.push(onFulfilled)
//       this.onRejectedCallbacks.push(onRejected)
//     }
//     // onFulfilled = typeof onFulfilled === "function" ? onFulfilled : data => this.resolve(data)
//     // onRejected = typeof onRejected === "function" ? onRejected : err => { throw err } 
//   }
//   resolve = value => {
//     if (this.status === "pending") {
//       this.value = value
//       this.status = "fulfilled"
//       this.onFulfilledCallbacks.forEach(item => item(value))
//     }
//   }
//   reject = reason => {
//     if (this.status === "pending") {
//       this.reason = reason
//       this.status = "rejected"
//     }
//   }
// }



// ==========================
 // 定义好MyPromise的三种状态，用三个常量来接收
      const   PENDING = 'pending' // 等待
      const   FULFILLED = 'fulfilled'  // 成功
      const   REJECTED = 'rejected' // 失败 
  class MyPromise {

    // MyPromise接收一个参数，这个参数是构造器函数，并且在创建MyPromise的实例对象时，这个构造器函数会立即执行
    constructor(executor) {
      // 构造器函数接受两个参数：resolve、reject这两个方法
      // 捕获执行器错误
      try {
        executor(this.resolve, this.reject)
      } catch (e) {
        this.reject(e)
      }
    }
    // MyPromise 有三种状态 分别是：pending、fulfilled、rejected,一开始是pending状态
    status = PENDING
    value = undefined   // resolve传递的值
    reason = undefined// reject传递的错误信息
    // successCallBack = undefined  
    successCallBack = []  // then方法多次调用时且执行器里面是异步时需将then方法里面的回调函数依此存储在该数组中
    // failCallBack = undefined
    failCallBack = []   // 同上
    resolve = (val) => {
      if (this.status !== PENDING) return   // 如果不是pending 状态则阻止往下执行，因为状态一旦改变，便不可更改
      // 执行resolve方法时 状态status修改为fulfilled
      this.status = FULFILLED
      // 将成功调用传递的值传给this.value保存起来方便后续使用
      this.value = val
      // 判断下this.successCallBack是否存在，如果存在则调用
      // this.successCallBack && this.successCallBack(this.value)

      // 从this.successCallBack中一个个取出成功回调函数调用并从数组中删除
      // for (let i = this.successCallBack.length; i > 0; i--) {
      //   // this.successCallBack.shift()(this.value)
      //   this.successCallBack.shift()()
      // }
      while(this.successCallBack.length) this.successCallBack.shift()()
    }

    reject = (reason) => {
      if (this.status !== PENDING) return
      // 执行resolve方法时 状态status修改为rejected
      this.status = REJECTED
      // 将成功调用传递的值传给this.value保存起来方便后续使用
      this.reason = reason
      // 同理，同上
      // this.failCallBack && this.failCallBack(this.reason)

      // 同上
      // for (let i = this.failCallBack.length; i > 0; i--) {
      //   // this.failCallBack.shift()(this.reason)
      //   this.failCallBack.shift()()
      // }
      while(this.failCallBack.length) this.failCallBack.shift()()
    }

    then(successCallBack, failCallBack) {
      /****then方法不传递回调函数时 */
      successCallBack = successCallBack ? successCallBack : value => value
      failCallBack = failCallBack ? failCallBack : reason => { throw reason }
      /***then方法实现链式调用 */
      // 能够让then方法实现链式调用，说明then方法返回的还是一个 Promise对象,我们现在就再创建个 Promise对象 promise2,并将其返回
      let promise2 = new MyPromise((resolve, reject) => {
        /**** then方法里面的回调函数仍需要立即执行，所以我们将他们放在 promise2的执行器函数中*/

        // 根据status的状态判断该调用哪个回调函数，fulfilled则调用成功回调函数，rejected则调用failCallBack回调函数
        if (this.status === FULFILLED) {
          // then方法返回的 promise2需要执行 resolve 方法将当前 then方法回调函数的返回值传递给下一个then方法的回调函数中 
          setTimeout(() => {
            // 捕获回调函数错误
            try {
              let x = successCallBack(this.value)
              // 需要判断下 x 是普通值还是promise对象，
              // 如果是普通值直接调用resolve方法，
              // 如果是 Promise对象则需要查看promise对象返回的结果
              // 再根据promise对象返回的结果，决定调用resolve 还是reject
              // 此时还获取不到promise2, 因为promise2需要等到new MyPromise执行完毕之后才会获取到，需加个异步代码
              newPromise(promise2, x, resolve, reject)  // 将then方法返回的promise对象promise2也传递过去用于判断 then方法return的x是否相同
            } catch(e) {
              reject(e)
            }
          }, 0);
          // resolve(x)
          // 调用成功回调函数，并传递成功时的值
          //successCallBack(this.value)   // then方法被多次调用时，同步情况无需处理，直接调用即可
        } else if(this.status === REJECTED) {
          // 调用失败回调函数，并传递失败的原因
          //failCallBack(this.reason)     // 同上
          setTimeout(() => {
            try {
              let x = failCallBack(this.reason)
              newPromise(promise2, x, resolve, reject)
            } catch(e) {
              reject(e)
            }
          }, 0);
        } else { // 当执行器中时异步代码时并没有立即调用resolve 或reject,所以status状态既不是fulfilled也不是 rejected，而是还处于pending状态
          
          // this.successCallBack = successCallBack
          // 此时将then的回调函数存起来当status状态改变后再去调用回调函数
            // this.successCallBack.push(successCallBack)  
          // 捕获错误
          this.successCallBack.push(() =>{
            setTimeout(() => {
              try {
                let x = successCallBack(this.value)
                newPromise(promise2, x, resolve, reject)
              } catch(e) {
                reject(e)
              }
            }, 0);
          })
          // this.failCallBack = failCallBack
          // this.failCallBack.push(failCallBack)
          this.failCallBack.push(() => {
            setTimeout(() => {
              try {
                let x = failCallBack(this.reason)
                newPromise(promise2, x, resolve, reject)
              } catch(e) {
                reject(e)
              }
            }, 0);
          })
        }
      })
      return promise2;
    }

    /***finally 无论该Promise对象是成功还是失败都会执行 接受一个回调函数作为参数 */
    finally(callBack) {
      // finally最终返回Promise对象，而then方法返回的就时Promise对象
      return this.then(value => {
        return MyPromise.resolve(callBack()).then(() => value);
      }, reason => {
        return MyPromise.resolve(callBack()).then(() => { throw reason })
      })
    }

    /****catch方法 */
    catch (failCallBack) {
      return this.then(undefined, failCallBack)
    }

    // 静态方法all,接受参数是一个数组
    static all(arr) {
      // all方法的then方法的回调返回值是一个数组，定义一个数组来接收
      let result = []
      let index = 0
      // 返回值是一个peomise对象
      return new MyPromise((resolve, reject) => {
        function addData(k, v) {
          result[k] = v
          index++
          if (index === result.length) {
            resolve(result)
          }
        }
        for(let i=0; i<arr.length; i++) {
          let current = arr[i]
          if(current instanceof MyPromise) {
            current.then(res => {
              addData(i, res)
            }, reason => reject(reason))
          } else {
            addData(i, arr[i])
          }
        }
      })
    }

    /**  静态方法 resolve，返回值是一个Promise对象，接受一个参数，当这个参数是Promise对象时
     *   就将该对象作为 resolve方法的返回值，如果是个普通值，则将该值包裹在一个Promise对象中作为
     *   resolve方法的返回值 
    */
    static resolve(value) {
      if (value instanceof MyPromise) return value
      return new MyPromise((resolve) => resolve(value)) 
    }
   }


  function newPromise(promise2, x, resolve, reject) {
      if (promise2 === x) {
        return reject(new TypeError('循环返回相同的peomise对象'))  //加return 阻止代码往下进行
      } 
      if (x instanceof MyPromise) {
        x.then(resolve, reject)
      } else {
        resolve(x)
    }
  }
