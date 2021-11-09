// import {MyPromise} from "../js/promise.js"
import {MyPromise} from "../js/index.js"
// import {MyPromise} from "../js/MyPromise.js"
// 同步then
let p = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  })
})
p.then(res => {
  return res * 2
}).then(item => {
  return item * 2
}).then(res => {
  console.log(res)
})

// 异步then
// let p = new MyPromise((resolve, reject) => {
//   setTimeout(() => {
//     resolve(1)
//   })
// })
// p.then(res => {
//   return new MyPromise((resolve, reject) => {
//     console.log(res) // 1
//     setTimeout(() => {
//       resolve(res * 2)
//     })
//   }) 
// }).then(item => {
//   return new MyPromise((resolve, reject) => {
//     console.log(item) // 2
//     setTimeout(() => {
//       resolve(item * 2)
//     })
//   }) 
// }).then(res => {
//   console.log(res) // 4
// })