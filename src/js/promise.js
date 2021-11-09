const PENDING = 'pending' // 等待
const FULFILLED = 'fulfilled'  // 成功
const REJECTED = 'rejected' // 失败 
class MyPromise {
  constructor(executor) {
    // 构造器函数接受两个参数：resolve、reject这两个方法
    try {
      executor(this.resolve, this.reject)
    } catch (e) {
      this.reject(e)
    }
  }
  status = PENDING
  value = undefined
  reason = undefined
  successCallBack = []  // then方法多次调用时且执行器里面是异步时需将then方法里面的回调函数依此存储在该数组中
  failCallBack = []   // 同上
  resolve = (val) => {
    if (this.status !== PENDING) return
    this.status = FULFILLED
    // 将成功调用传递的值传给this.value保存起来方便后续使用
    this.value = val
    // 判断下this.successCallBack是否存在，如果存在则调用
    while (this.successCallBack.length) this.successCallBack.shift()()
  }

  reject = (reason) => {
    if (this.status !== PENDING) return
    this.status = REJECTED
    this.reason = reason
    while (this.failCallBack.length) this.failCallBack.shift()()
  }

  then(successCallBack, failCallBack) {
    /****then方法不传递回调函数时 */
    successCallBack = successCallBack ? successCallBack : value => value
    failCallBack = failCallBack ? failCallBack : reason => { throw reason }
    /***then方法实现链式调用 */
    let promise2 = new MyPromise((resolve, reject) => {
      // then方法里面的回调函数仍需要立即执行，所以我们将他们放在 promise2的执行器函数中
      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            let x = successCallBack(this.value)
            // 需要判断下 x 是普通值还是promise对象，
            // 如果是普通值直接调用resolve方法，
            // 如果是 Promise对象则需要查看promise对象返回的结果
            // 再根据promise对象返回的结果，决定调用resolve 还是reject
            // 此时还获取不到promise2, 因为promise2需要等到new MyPromise执行完毕之后才会获取到，需加个异步代码
            newPromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0);
        // resolve(x)
        // 调用成功回调函数，并传递成功时的值
        //successCallBack(this.value)   // then方法被多次调用时，同步情况无需处理，直接调用即可
      } else if (this.status === REJECTED) {
        // 调用失败回调函数，并传递失败的原因
        //failCallBack(this.reason)     // 同上
        setTimeout(() => {
          try {
            let x = failCallBack(this.reason)
            newPromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0);
      } else { // 当执行器中时异步代码时并没有立即调用resolve 或reject,所以status状态既不是fulfilled也不是 rejected，而是还处于pending状态
        // this.successCallBack = successCallBack
        // 此时将then的回调函数存起来当status状态改变后再去调用回调函数
        // this.successCallBack.push(successCallBack)  
        // 捕获错误
        this.successCallBack.push(() => {
          setTimeout(() => {
            try {
              let x = successCallBack(this.value)
              newPromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0);
        })
        // this.failCallBack = failCallBack
        // this.failCallBack.push(failCallBack)
        this.failCallBack.push(() => {
          setTimeout(() => {
            try {
              let x = failCallBack(this.reason)
              newPromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0);
        })
      }
    })
    return promise2;
  }

  /***finally 无论该Promise对象是成功还是失败都会执行 接受一个回调函数作为参数 */
  finally(callBack) {
    // finally最终返回Promise对象，而then方法返回的就时Promise对象
    return this.then(value => {
      return MyPromise.resolve(callBack()).then(() => value);
    }, reason => {
      return MyPromise.resolve(callBack()).then(() => { throw reason })
    })
  }

  /****catch方法 */
  catch(failCallBack) {
    return this.then(undefined, failCallBack)
  }

  // 静态方法all,接受参数是一个数组
  static all(arr) {
    // all方法的then方法的回调返回值是一个数组，定义一个数组来接收
    let result = []
    let index = 0
    // 返回值是一个peomise对象
    return new MyPromise((resolve, reject) => {
      function addData(k, v) {
        result[k] = v
        index++
        if (index === result.length) {
          resolve(result)
        }
      }
      for (let i = 0; i < arr.length; i++) {
        let current = arr[i]
        if (current instanceof MyPromise) {
          current.then(res => {
            addData(i, res)
          }, reason => reject(reason))
        } else {
          addData(i, arr[i])
        }
      }
    })
  }

  /**  静态方法 resolve，返回值是一个Promise对象，接受一个参数，当这个参数是Promise对象时
   *   就将该对象作为 resolve方法的返回值，如果是个普通值，则将该值包裹在一个Promise对象中作为
   *   resolve方法的返回值 
  */
  static resolve(value) {
    if (value instanceof MyPromise) return value
    return new MyPromise((resolve) => resolve(value))
  }
}


function newPromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    console.log("循环返回相同的promise对象")
    return reject(new TypeError('循环返回相同的peomise对象'))  //加return 阻止代码往下进行
  }
  if (x instanceof MyPromise) {
    x.then(resolve, reject)
  } else {
    resolve(x)
  }
}
export { MyPromise }