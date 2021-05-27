/**
 * @method setSizeOfWxAvatar
 * @description 设置微信头像图片大小
 * @param {string} url
 * @param {number} size
 * @return {string|*}
 */
exports.setSizeOfWxAvatar = function(url, size = 64) {
  if (url && url.indexOf('wx.qlogo.cn') > -1) {
    let arr = url.split('/');
    arr[arr.length - 1] = size;
    return arr.join('/');
  } else {
    return url;
  }
};

// 校验身份证（公司内部专有检验）
exports.checkIDCard = function(str) {
  var s = false;
  var numArray = str.split('');
  if (numArray.length !== 18) {
    return s;
  }
  var yzgzArray = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  var lastGzArray = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
  var numTotal = null;
  for (var a = 0; a < numArray.length - 1; a++) {
    numTotal += numArray[a] * yzgzArray[a];
  }
  var ys = numTotal % 11;
  for (var b = 0; b < 11; b++) {
    if (ys == b && numArray[17] == lastGzArray[b]) {
      s = true;
      break;
    }
  }
  return s;
};

// api promise化
exports.promisify = function(apiFn, ...params) {
  return new Promise((resolve, reject) => {
    apiFn(...params).success((res) => {
      resolve(res);
    }).error((err) => {
      wx.showToast({
        title: err.msg || err.message,
        icon: 'none',
        success() {
          reject(false);
        }
      })
    })
  })
}

// 修改环境
exports.updateEnv = function(url) {
  try {
    let env = wx.getStorageSync('env');
    if (env) {
      let reg = new RegExp('^(https:\\/\\/(ftsp|sap)).*(\\.kungeek\\.com.*)');
      let strArr = url.match(reg);
      url = `${strArr[1]}${env === 'prod'?'':env}${strArr[3]}`;
    }
  } catch (e) {
    console.log(e);
  } finally {
    return url;
  }
}

// 存储进行中的请求
exports.saveOnGoingRequest = function(req) {

  let {
    miniProgram: {
      envVersion = '',
    } = {},
  } = wx.getAccountInfoSync && wx.getAccountInfoSync() || {};

  if (envVersion !== 'trial') return;

  let app = getApp();
  if (!app.globalData.requestArr) {
    app.globalData.requestArr = [];
  }
  app.globalData.requestArr.push(req);
}
