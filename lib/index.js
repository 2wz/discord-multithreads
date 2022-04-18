

var threadsPool = require("./pool");

module.exports = function () {
    return new Main();
}();


function Main() {
    this.pool = threadsPool();
    this.pool.on("error", function (thread, error) {
            if (!!!error) {
                console.error("thread number:" + thread.slave.pid + ",no error");
            } else {
                console.error("thread number:" + thread.slave.pid + ",err detected. Error:" + error);
            }
        });
}

/**

 * 
 * @param {number} func 延时执行的方法
 * @param {number} duration 延时时间，毫秒（默认为1秒）
 */
Main.prototype.startTimeOut = function (handle, duration = 1000) {

    if (!handle || typeof handle != "function") throw Error("请指定要延时执行的方法!");

    var thread = this.pool.run((input, handle) => {
        setTimeout(function () {
            this.notifyMainProcess();// 通知主进程
        }.bind(this), input.duration);
    }, { "duration": duration }, handle);

    // 注册事件和主进程通信
    thread.once("notify", function () {
        handle();
    });

    return thread.slave.pid;
}

/**
 * 清除一个计时器
 * 
 * @param {number} pid 当前计时器ID
 */
Main.prototype.stopTimeOut = function (pid) {
    return this.pool.killOneById(pid);
}

/**
 * 开启一个定时器,指定间隔时间循环执行
 * 
 * @param {number} handle 延时执行的方法
 * @param {number} duration 延时时间，毫秒（默认为1秒）
 */
Main.prototype.startInterval = function (handle, duration = 1000) {
   
    if (!handle || typeof handle != "function") throw Error("请指定要延时执行的方法!");

    var thread = this.pool.run((input, handle) => {
        setInterval(function () {
            this.notifyMainProcess();// 通知主进程
        }.bind(this), input.duration);
    }, { "duration": duration }, handle);

    // 注册事件和主进程通信
    thread.on("notify", function () {
        handle();
    });

    return thread.slave.pid;
}

/**
 * 清除一个循环计时器计时器
 * 
 * @param {number} pid 当前计时器ID
 */
Main.prototype.stopInterval = function (pid) {
    return this.pool.killOneById(pid);
}

/**
 * 清除所有定时器
 * 
 * @return {Boolean} 是否成功
 */
Main.prototype.clearAll = function () {
    this.pool.killAll();
    return true;
}