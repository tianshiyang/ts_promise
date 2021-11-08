import {MyPromise} from "../js/promise.js"
let p = new MyPromise((resolve, reject) => {
  resolve(1)
  return new MyPromise((resolve, reject) => {
    resolve(2)
  })
})
p.then(res => console.log(res)).then(item => console.log(item))