"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyPromise = void 0;
var Status;
(function (Status) {
    Status["PENDING"] = "pending";
    Status["FULFILLED"] = "fulfilled";
    Status["REJECTED"] = "rejected";
})(Status || (Status = {}));
var MyPromise = /** @class */ (function () {
    // executor接受两个参数： resolve， reject，返回值void
    function MyPromise(executor) {
        var _this = this;
        // 定义变量
        this.status = undefined;
        this.value = undefined;
        this.reason = undefined;
        this.successCallBackArr = [];
        this.failCallBackArr = [];
        this.resolve = function (value) {
            if (_this.status !== Status.PENDING)
                return;
            _this.status = Status.FULFILLED;
            _this.value = value;
            while (_this.successCallBackArr.length) {
                /**
                 * 不能 this.successCallBackArr.shift()(), 报错
                 */
                var successCallBackFn = _this.successCallBackArr.shift();
                if (successCallBackFn) {
                    successCallBackFn();
                }
            }
        };
        this.reject = function (reason) {
            if (_this.status !== Status.PENDING)
                return;
            _this.status = Status.REJECTED;
            _this.reason = reason;
            while (_this.failCallBackArr.length) {
                var failCallBack = _this.failCallBackArr.shift();
                if (failCallBack) {
                    failCallBack();
                }
            }
        };
        this.status = Status.PENDING;
        try {
            executor(this.resolve, this.reject);
        }
        catch (e) {
            this.reject(e);
        }
    }
    // 传递回调函数，有默认值，是个函数
    MyPromise.prototype.then = function (successCallBack, failCallBack) {
        var _this = this;
        if (successCallBack === void 0) { successCallBack = function (value) { return value; }; }
        if (failCallBack === void 0) { failCallBack = function (reason) { return reason; }; }
        var p2 = new MyPromise(function (resolve, reject) {
            if (resolve === void 0) { resolve = _this.resolve; }
            if (reject === void 0) { reject = _this.reject; }
            if (_this.status === Status.FULFILLED) {
                resolve(successCallBack(_this.value));
            }
            else if (_this.status === Status.REJECTED) {
                resolve(failCallBack(_this.reason));
            }
            else if (_this.status === Status.PENDING) {
                _this.successCallBackArr.push(function () { return resolve(successCallBack(_this.value)); });
                _this.failCallBackArr.push(function () { return resolve(failCallBack(_this.reason)); });
            }
        });
        return p2;
    };
    MyPromise.prototype.catch = function (failCallBack) {
        return this.then(undefined, failCallBack);
    };
    return MyPromise;
}());
exports.MyPromise = MyPromise;
