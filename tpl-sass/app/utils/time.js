/**
 * @method formatTime
 * @description 将时间戳转化为后端需要的时间格式
 * @param {string} time 时间戳
 * @param {string} fmt  转化的时间格式
 */
exports.formatTime = function(time, fmt = 'yyyy-MM-dd HH:mm:ss') {

  let date = null;
  if (typeof time === 'number') {
    date = new Date(time);
  } else if (typeof time === 'string') {
    date = new Date(time.replace(new RegExp('\\-', 'g'), '/'));
  } else {
    date = new Date();
  }

  var o = {
    "M+": date.getMonth() + 1, //月份   
    "d+": date.getDate(), //日   
    "H+": date.getHours(), //小时   
    "m+": date.getMinutes(), //分   
    "s+": date.getSeconds(), //秒   
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度   
    "S": date.getMilliseconds() //毫秒   
  };

  if (new RegExp('(y+)').test(fmt))
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));

  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  }
  return fmt;

};

/**
 * @method getToday
 * @description 获取今日零点的时间戳
 * @param {Date} now  当前日期对象
 */
exports.getToday = function(now) {
  let year = now.getFullYear();
  let month = now.getMonth();
  let day = now.getDate();
  return new Date(year, month, day, 0, 0, 0).getTime();
};

/**
 * @method getYesterDay
 * @description 获取距离当前24小时前的时间戳
 * @param {Date} now 当前日期对象
 */
exports.getYesterDay = function(now) {
  let year = now.getFullYear();
  let month = now.getMonth();
  let day = now.getDate();
  let hour = now.getHours();
  let minute = now.getMinutes();
  let second = now.getSeconds();

  let yesterday = -1;
  if (day === 1) {
    if (month === 0) {
      yesterday = new Date(year - 1, 11, this.getLastDay(year - 1, 11), hour, minute, second).getTime();
    } else {
      yesterday = new Date(year, month - 1, this.getLastDay(year, month - 1), hour, minute, second).getTime();
    }
  } else {
    yesterday = new Date(year, month, day - 1, hour, minute, second).getTime();
  }
  return yesterday;
};

/**
 * @method getLastWeek
 * @description  获取距离当前一周前的时间戳
 * @param {Date} now 当前日期对象
 */
exports.getLastWeek = function(now) {

  let year = now.getFullYear();
  let month = now.getMonth();
  let day = now.getDate();
  let hour = now.getHours();
  let minute = now.getMinutes();
  let second = now.getSeconds();

  let lastWeek = -1;
  if (day <= 7) {
    if (month === 0) {
      lastWeek = new Date(year - 1, 11, this.getLastDay(year - 1, 11) -
        (7 - day), hour, minute, second).getTime();
    } else {
      lastWeek = new Date(year, month - 1, this.getLastDay(year, month - 1) - (7 - day), hour, minute, second).getTime();
    }
  } else {
    lastWeek = new Date(year, month, day - 7, hour, minute, second).getTime();
  }
  return lastWeek;
};

/**
 * @method getWeekDay
 * @description 映射对应的星期几
 * @param {number} num  日期对象getDay方法返回值
 */
exports.getWeekDay = function(num) {
  switch (num) {
    case 0:
      return "日";
    case 1:
      return "一";
    case 2:
      return "二";
    case 3:
      return "三";
    case 4:
      return "四";
    case 5:
      return "五";
    case 6:
      return "六";
    default:
      break;
  }
};

/**
 * @method getLastDay
 * @description 获取某年某月的最后一天是几号
 * @param {number} year
 * @param {number} month 
 */
// 
exports.getLastDay = function(year, month) {
  // 判断是哪一月
  // 1，3，5，7，8，10，12  最后一天是31号
  // 4，6，9，11           最后一天是30号
  // 2                    若为闰年则29号，若为平年则28号
  switch (month) {
    case 0:
    case 2:
    case 4:
    case 6:
    case 7:
    case 9:
    case 11:
      return 31;
    case 3:
    case 5:
    case 8:
    case 10:
      return 30;
    case 1:
      return this.isLeapYear(year) ? 29 : 28;
  }
};

/**
 * @method isLeapYear
 * @description 判断某年是否是闰年
 * @param {number} year
 */
exports.isLeapYear = function(year) {
  return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
};
