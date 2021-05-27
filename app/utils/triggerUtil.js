/**
 * @desc 函数防抖
 * @param func 函数
 * @param time 延迟执行毫秒数
 * @param immediate true 表立即执行，false 表非立即执行
 */
function debounce(func, time, immediate) {
  let timeout;
  time = time || 300;

  return function () {
    let context = this;
    let args = arguments;

    if (timeout) clearTimeout(timeout);
    if (immediate) {
      var callNow = !timeout;
      if (callNow) {
        func.apply(context, args);
        timeout = setTimeout(function () {
          timeout = null;
        }, time);
      } else {
        timeout = setTimeout(function () {
          func.apply(context, args);
        }, time);
      }
    }
    else {
      timeout = setTimeout(function () {
        func.apply(context, args)
      }, time);
    }
  }
}

/**
 * @desc 函数节流
 * @param func 函数
 * @param time 延迟执行毫秒数
 * @param type 1 表时间戳版，2 表定时器版
 */
function throttle(func, time, type) {
  type = type || 2;
  time = time || 500;
  let previous = 0;
  let timeout;
  if (type === 1) {
    previous = 0;
  } else if (type === 2) {

  }
  return function () {
    let context = this;
    let args = arguments;
    if (type === 1) {
      let now = Date.now();

      if (now - previous > time) {
        func.apply(context, args);
        previous = now;
      }
    } else if (type === 2) {
      if (!timeout) {
        timeout = setTimeout(() => {
          timeout = null;
          func.apply(context, args)
        }, time)
      }
    }
  }
}

module.exports = {
  debounce,
  throttle
}