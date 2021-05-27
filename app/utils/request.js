/**
 * 封装请求  
 *  使用：
 *   http.get(url, data?, header? = {'Content-Type': 'application/json'}, hideLoading? = false, notCheck? = true)
 *        .success(data => {})
 *        .error(error => {})
 *
 *   http.post(url, data?, header? = {'Content-Type': 'application/x-www-form-urlencoded'}, hideLoading? = false, notCheck? = true)
 *        .success(data => {})
 *        .error(error => {})
 * 
 *   upload(url, params, header? = {}, hideLoading? = true, notCheck? = true)
 *      .success(data => {})
 *      .error(error => {})
 * 
 *   download(url, header? = {}, hideLoading? = false, notCheck? = true)
 *      .success(data => {})
 *      .error(error => {})
 */

import {
  API,
  PATH,
  Storage,
  CHANNEL,
  APPID,
  LOGIN_TYPE,
  WHITE_LIST,
  Monitor,
  updateEnv,
  saveOnGoingRequest,
} from '../module.js';

/** 微信登录 */
let loginByCodeUrl;
/** 控制同时进行的loginByCode */
let loginByCodePromise;
/** 控制 checkSession 调用间隔为 120s */
let checkSessionTimer;
// 刷新token的promise
let refreshPromise;

/**
 * 请求类型常量
 */
const TYPE = {
  OPTIONS: "OPTIONS",
  GET: "GET",
  HEAD: "HEAD",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  TRACE: "TRACE",
  CONNECT: "CONNECT",
};

/**
 * 状态码常量
 */
const ERR_MSG = {
  '404': '404 请求不存在',
  '405': '405 服务器拒绝请求',
  '500': '500 服务器繁忙',
  '503': '503 服务器连接失败',
};

/**
 * 处理微信下的请求成功回调
 *    微信在 http 404，500 等状态依然触发 success 回调
 *
 * @param res 微信 api 的回调传入的参数
 * @param resolve Promise 的方法
 * @param reject Promise 的方法
 */
class HandleWxRequest {

  /**
   * 检测session_key是否过期
   * @return {Promise<any>}
   */
  checkSession(header) {

    return new Promise(resolve => {
      if (!checkSessionTimer) {
        wx.checkSession({
          success: function(res) {
            // 控制调用间隔为两分钟
            checkSessionTimer = setTimeout(() => {
              if (checkSessionTimer) {
                clearTimeout(checkSessionTimer);
                checkSessionTimer = null;
              }
            }, 120000);
            resolve(!!header.oi);
          },
          fail: function(err) {
            resolve(false);
          }
        })
      } else {
        resolve(!!header.oi);
      }
    })
  }

  /**
   * 根据session_key过期检测结果获取wxCode
   * @param flag
   * @return {Promise<any>}
   */
  handleWxLogin(flag) {
    if (flag) {
      return Promise.resolve(true)
    } else {
      // console.info(flag);
      return new Promise((resolve) => {
        wx.login({
          success: function(res) {
            // console.info(res.code);
            resolve(res.code);
          },
          fail: function(err) {
            wx.showToast({
              title: "调取微信接口失败,请重启一下微信",
              icon: "none",
            });
            resolve(false);
          }
        })
      });
    }
  }

  /**
   * 根据wx.login获取的code登录
   * @param codeFlag
   * @return {*}
   */
  handleLoginByCode(codeFlag) {

    loginByCodeUrl = '';

    if (typeof codeFlag === 'string') {
      if (loginByCodePromise) {
        return loginByCodePromise;
      } else {
        loginByCodePromise = http.get(loginByCodeUrl, {
            weCode: codeFlag
          }, {}, false, true).toPromise()
          .then((res) => {

            Storage.set("miniUser", res.data.miniUser);
            Storage.set("user", res.data.user);
            // 用户类型 1.中介员工  2: 普通用户(客户) 。
            let app = getApp();

            app.setGlobalData({
              openId: res.data.miniUser.openId
            });
            loginByCodePromise = null;
            return true;
          })
          .catch(() => {
            loginByCodePromise = null;
          });
        return loginByCodePromise;
      }
    } else {
      return Promise.resolve(codeFlag)
    }
  }

  /**
   * 根据条件连接websocket
   * @param app
   * @param res
   */
  connectSocket() {
    let app = getApp();
    let user = Storage.get('miniUser')
    // websocket未开启时，开启
    if (
      (!app.globalData.socketTask.readyState && app.globalData.socketTask.readyState != 0) ||
      app.globalData.socketTask.readyState == app.globalData.socketTask.CLOSED
    ) {
      app.globalData.isInitiativeCloseSocket = false;
      app.connectSocket(user.openId);
    }
  }

  /**
   * 处理业务成功
   * @param res
   * @param resolve
   * @param reject
   */
  handleBusinessSuccess(res, resolve, reject) {
    // 判断业务是否成功
    if (res.data.success || res.data.status === 'success') {
      resolve(res.data);
    } else {
      // 客户端错误
      reject(res.data);
    }
  }

  /**
   * 处理微信 request 请求成功
   * @param res
   * @param resolve
   * @param reject
   */
  handleWxSuccess(res, resolve, reject) {
    if (res.statusCode === 200) {
      this.handleBusinessSuccess(res, resolve, reject);
    } else {
      this.handleHttpError(res, reject);
    }
  }

  /**
   * 处理微信上传请求成功
   * @param res
   * @param resolve
   * @param reject
   */
  handleWxUploadSuccess(res, resolve, reject) {
    if (res.statusCode === 200) {
      // 目前上传接口没有status和success参数返回，直接返回{fileId: String}格式
      resolve(res.data);
    } else {
      this.handleHttpError(res, reject);
    }
  }

  /**
   * 处理请求失败
   * @param res
   * @param reject
   */
  handleHttpError(res, reject) {
    // 服务端接口异常
    reject({
      msg: "好像出了点问题，请稍候再试",
      status: 'fail',
      success: false
    })
  }

  /**
   * 统一处理头部
   * @param header
   * @param url
   */
  handleHeader(header = {}, url = '') {

    header.channel = CHANNEL;

    if (WHITE_LIST.includes(url)) {
      return header;
    };

    const {
      token,
      userName,
      unionid
    } = wx.getStorageSync('header');

    // 取出Cookie
    const cookie = wx.getStorageSync('cookieKey');

    if (cookie) header.Cookie = cookie;
    if (token) header.token = token;
    if (userName) header.userName = userName;
    if (unionid) header.unionid = unionid;

    return header;

  }

}

/**
 * 基础请求任务类
 */
class BaseTask extends HandleWxRequest {

  /** 请求方式 */
  method = '';
  /** 请求地址 */
  url = '';
  /** 请求头 */
  header = {};
  /** 请求参数 */
  data = null;
  /** 是否验证 session 是否过期 */
  notCheck = false;
  /** 微信请求接口返回的请求任务 task */
  wxRequestTask = null;
  /** promise 对象 */
  requestPromise = null;
  /** 请求成功的回调 */
  successCallback = null;
  /** 请求失败的回调 */
  errorCallback = null;
  /** 请求完成的回调 */
  completeCallback = null;
  /** 是否隐藏 loading */
  hideLoading = false;
  /** 请求成功之后数据处理管道|列表 */
  pipeList = [];

  constructor() {
    super();
  }

  /**
   * 执行验证
   * @param notCheck 是否需要校验session是否过期
   * @return {Promise} 返回一个promise，接收到的值如果为true则可以正常请求，false则直接进入处理错误流程
   */
  executeCheck() {

    if (this.notCheck) {

      return Promise.resolve(true);

    } else {

      return this.checkSession(this.header)
        .then(res => {
          // 处理wx.login
          return this.handleWxLogin(res);
        })
        .then(res => {
          // 处理loginByCode接口
          return this.handleLoginByCode(res);
        })

    }

  }

  /**
   * 成功回调
   */
  success(cb) {
    this.successCallback = cb;
    return this;
  }

  /**
   * 错误回调
   */
  error(cb) {
    this.errorCallback = cb;
    return this;
  }

  /**
   * 完成回调
   */
  complete(cb) {
    this.completeCallback = cb;
    return this;
  }

  /**
   * 返回 promise
   */
  toPromise() {
    return this.requestPromise;
  }

  /**
   * 添加数据处理管道
   */
  pipe(cb) {
    if (!cb) return this;
    if (this.pipeList) {
      this.pipeList.push(cb);
    } else {
      this.pipeList = [cb];
    }
    return this;
  }

  /**
   * 调用管道处理数据
   * @param data
   */
  mapPipe(data) {
    let result = data;
    if (this.pipeList) {
      for (let func of this.pipeList) {
        if (typeof func === 'function') {
          result = func(result);
        }
      }
    }
    return result;
  }

  /**
   * 中断请求
   */
  abort() {
    this.successCallback = this.errorCallback = this.completeCallback = null;
    this.wxRequestTask.abort();
  }

  /**
   *  实时日志
   */
  addMonitor(type, res) {

    let {
      // openId = '',
      unionid = ''
    } = Storage.get('header');

    let {
      companyList,
      currentIndex,
    } = getApp().globalData;

    if (type === 'err') {
      Monitor.error(`--->`, JSON.stringify(this.data));
      Monitor.error(JSON.stringify(res));
    } else {
      Monitor.info(`--->`, JSON.stringify(this.data));
      Monitor.info(JSON.stringify(res));
    }

    let api = this.url.split('/');
    Monitor.addFilterMsg(`phone:${this.header.userName || ''}`);
    Monitor.addFilterMsg(`unionId:${unionid}`);
    // Monitor.addFilterMsg(`openId:${openId}`);
    Monitor.addFilterMsg(`comp:${companyList && companyList[currentIndex] || ''}`);
    Monitor.addFilterMsg(`api:${api[api.length-1]}`);
    Monitor.addFilterMsg(`env:${wx.getAccountInfoSync && wx.getAccountInfoSync().miniProgram.envVersion || ''}`);

  }

  /*
   * token过期去刷新
   */
  async refreshToken(cb) {

    let header = Storage.get('header') || {};

    let result;
    if (!refreshPromise) {
      refreshPromise = new Promise((resolve, reject) => {
        getApp().getCode((code) => {
          API.authenticationByUnionId({
            appid: APPID,
            code,
            unionid: header.unionid || '',
          }).success(res => {
            resolve(res);
          }).error(err => {
            resolve(err);
          });
        });
      });
    }
    result = await refreshPromise;

    if (refreshPromise) {

      if (result.success) {

        let {
          userstate,
          token,
          mobilePhone,
          mtNo,
          curuserId,
          unionid,
          openId,
        } = result.data;

        if (userstate === '1') {

          // 更新token
          token ? header.token = token : '';
          mobilePhone ? header.userName = mobilePhone : '';
          mtNo ? header.mtNo = mtNo : '';
          curuserId ? header.curuserId = curuserId : '';
          unionid ? header.unionid = unionid : '';
          openId ? header.openId = openId : '';
          Storage.set('header', header);

          Storage.set('loginType', LOGIN_TYPE.AUTO_LOGIN);

          cb && cb();

        } else {
          // 登录失败
          wx.navigateTo({
            url: PATH.EXCEPTION,
          });
        }

      } else {
        // 接口异常
        wx.navigateTo({
          url: PATH.EXCEPTION,
        });
      }

      refreshPromise = null;

    } else {
      if (result.success && result.data.userstate === '1') {
        cb && cb();
      }
    }

  }

}

/**
 * 请求任务对象
 */
class HttpTask extends BaseTask {

  constructor(method, url, data, header = {}, hideLoading = false, notCheck = false, tip = '加载中...') {
    super();
    this.method = method;
    this.url = url;
    this.data = data;
    this.header = this.handleHeader(header, url);
    this.hideLoading = hideLoading;
    this.notCheck = notCheck;
    this.tip = tip;

    this.execute();
  }

  /**
   * 执行请求
   */
  execute() {

    this.executeCheck()
      .then(flag => {
        // 判断并调用接口
        if (flag) {
          // this.connectSocket();
          this.init();
        } else {
          console.groupEnd();
          new Promise((resolve, reject) => {
            this.handleHttpError('900001', reject)
          })
        }
      })

  }

  /** 
   * 初始化
   */
  init() {
    this.header = this.handleHeader(this.header, this.url);
    this.requestPromise = this.request(this.url, this.method, this.data, this.header);
    this.requestPromise
      .then(data => {
        let result = data;
        result = this.mapPipe(result);
        // 添加接口实时监控
        this.addMonitor('info', result);
        this.successCallback && this.successCallback(result);
      })
      .catch(err => {

        // 添加接口实时监控
        this.addMonitor('err', err);

        if (err.errCode === '00020000005' || err.message === '令牌不能为空') {
          // 自动刷新token
          this.refreshToken(() => {
            this.init();
          });
        } else {
          if (this.errorCallback) {
            this.errorCallback(err)
          } else {
            // msg属于服务端接口异常，message属于客户端错误返回的接口提示
            (err.msg || err.message) && wx.showToast({
              title: err.msg || err.message,
              icon: 'none'
            })
          }
        }
      });
  }

  /**
   * 调用微信 api 发起请求
   */
  request(url, method, data, header) {
    let _this = this;
    if (!this.hideLoading) {
      wx.showLoading({
        title: _this.tip,
        mask: true
      });
    }
    return new Promise((resolve, reject) => {
      _this.wxRequestTask = wx.request({
        url,
        method,
        data,
        header,
        success: function(res) {
          if (res.header['Set-Cookie']) {
            Storage.set("cookieKey", res.header['Set-Cookie']);
          }
          console.info('wx request success data:', res);
          _this.handleWxSuccess(res, resolve, reject);
        },
        fail: function(error) {
          console.info('wx request fail data:', error);
          reject({
            // 微信请求失败可能是网络问题或请求url问题（链接不存在，服务端发版），此类错误不提示
            errMsg: error.errMsg,
            status: 'fail',
            success: false,
          });
        },
        complete: function(cp) {
          if (!_this.hideLoading) wx.hideLoading();
          _this.completeCallback && _this.completeCallback(cp);
          console.groupEnd();
        }
      })
    });
  }

}

const http = {
  /**
   * get请求
   * @param url         请求路径
   * @param data        请求参数 [hideLoading]如果需要屏蔽loading需传入true，可不传
   * @param header      请求头
   * @param hideLoading 是否隐藏loading
   * @param notCheck    不检测登录状态
   */
  get: function(url, data, header = {}, hideLoading = false, notCheck = true, tip) {
    console.group('==============> 新请求 <==============');
    url = updateEnv(url);
    console.info(url, data, header);
    let req = new HttpTask(TYPE.GET, url, data, {
      'Content-Type': 'application/json',
      ...header
    }, hideLoading, notCheck, tip);
    saveOnGoingRequest(req);
    return req;
  },
  /**
   * post请求，参数同上
   */
  post: function(url, data, header = {}, hideLoading = false, notCheck = true, tip) {
    console.group('==============> 新请求 <==============');
    url = updateEnv(url);
    console.info(url, data, header);
    let req = new HttpTask(TYPE.POST, url, data, {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...header
    }, hideLoading, notCheck, tip);
    saveOnGoingRequest(req);
    return req;
  }
};

/**
 * 上传任务对象
 */
class UploadTask extends BaseTask {

  // 需上传的文件路径
  filePath = '';
  // 上传文件的 name 相当于 input 的 name 值
  name = '';
  // 其他参数
  formData = null;
  // 上传进度回调
  progressCallback = () => {};

  constructor(url, params, header = {}, hideLoading = true, notCheck = false) {
    super();
    if (!params || !params.filePath || !params.name) {
      throw ('上传接口参数缺失');
    }
    this.url = url;
    this.filePath = params.filePath;
    this.name = params.name;
    delete params.filePath;
    delete params.name;
    this.formData = params;
    this.header = this.handleHeader(header, url);
    this.hideLoading = hideLoading;
    this.notCheck = notCheck;

    this.execute();
  }

  // 开始执行请求
  execute() {

    this.executeCheck()
      .then(flag => {
        // 判断并调用接口
        if (flag) {
          // this.connectSocket();
          this.init();
        } else {
          console.groupEnd();
          new Promise((resolve, reject) => {
            this.handleHttpError('900001', reject)
          })
        }
      })

  }

  init() {
    this.header = this.handleHeader(this.header, this.url);
    this.requestPromise = this.request(this.url, this.filePath, this.name, this.formData, this.header)
      .then(data => {
        let result = data;
        result = this.mapPipe(result);
        this.successCallback && this.successCallback(result);
      })
      .catch(err => {
        this.errorCallback && this.errorCallback(err);
      });
  }

  request(url, filePath, name, formData, header) {
    if (!this.hideLoading) {
      wx.showLoading({
        title: '上传中...',
        mask: true
      });
    }
    return new Promise((resolve, reject) => {
      this.wxRequestTask = wx.uploadFile({
        url,
        filePath,
        name,
        formData,
        header,
        success: (res) => {
          console.info('wx uploadFile success data: ', res);
          this.handleWxUploadSuccess(res, resolve, reject);
        },
        fail: (err) => {
          console.info('wx uploadFile fail data:', err);
          reject({
            msg: err,
            status: 'fail',
            success: false,
          });
        },
        complete: (cp) => {
          if (!this.hideLoading) wx.hideLoading();
          console.groupEnd();
          this.completeCallback && this.completeCallback(cp);
        }
      });
      if (this.wxRequestTask.onProgressUpdate) {
        this.wxRequestTask.onProgressUpdate((progress, totalBytesSent, totalBytesExpectedToSend) => {
          this.progressCallback(progress);
        })
      }
    })
  }

  progress(cb) {
    this.progressCallback = cb;
    return this;
  }

}

/**
 * 上传接口
 * 
 * @param {String} url 请求路径
 * @param {Object} params 请求参数，其中 filePath 和 name 为必传参数
 *    filePath 文件路径
 *    name 相当于 input 的 name 值
 *    hideLoading 如果需要屏蔽loading需传入true，可不传
 * @param header 请求头
 * @param hideLoading 是否隐藏loading
 */
function upload(url, params, header = {}, hideLoading = true, notCheck = true) {
  console.group('==============> 上传请求 <==============');
  url = updateEnv(url);
  console.info(url, params);
  let req = new UploadTask(url, params, header, hideLoading, notCheck);
  saveOnGoingRequest(req);
  return req;
}


/**
 * 下载任务对象
 */
class DownloadTask extends BaseTask {

  constructor(url, header = {}, hideLoading = false, notCheck = false) {
    super();
    this.url = url;
    this.header = this.handleHeader(header, url);
    this.hideLoading = hideLoading;
    this.notCheck = notCheck;

    this.execute();
  }

  // 开始执行请求
  execute() {

    this.executeCheck()
      .then(flag => {
        // 判断并调用接口
        if (flag) {
          // this.connectSocket();
          this.init();
        } else {
          console.groupEnd();
          new Promise((resolve, reject) => {
            this.handleHttpError('900001', reject)
          })
        }
      })

  }

  init() {
    this.header = this.handleHeader(this.header, this.url);
    if (!this.hideLoading) {
      wx.showLoading({
        title: '下载中...',
        mask: true
      });
    }
    this.requestPromise = this.download()
      .then(res => {
        let result = res;
        result = this.mapPipe(result);
        this.successCallback && this.successCallback(result);
        return result;
      })
      .catch(err => {
        this.errorCallback && this.errorCallback(err);
        return err;
      });
  }

  download() {
    return new Promise((resolve, reject) => {
      this.wxRequestTask = wx.downloadFile({
        url: this.url,
        header: this.header,
        success: (res) => {
          console.info('wx downloadFile success data:', res);
          if (res.statusCode === 200) {
            resolve(res.tempFilePath);
          } else {
            this.handleHttpError(res, reject);
          }
        },
        fail: (err) => {
          console.info('wx downloadFile fail data:', err);
          reject({
            msg: err,
            status: 'fail',
            success: false,
          });
        },
        complete: (res) => {
          if (!this.hideLoading) wx.hideLoading();
          console.groupEnd();
          this.completeCallback && this.completeCallback(res);
        }
      })
    });
  }

}

/**
 * 下载文件, 默认不填写存储路径，使用微信返回的临时路径
 * @param url 下载的路径
 * @param header 请求头
 * @param hideLoading 是否隐藏 loading
 * @return {DownloadTask}
 */
function download(url, header = {}, hideLoading = false, notCheck = true) {
  console.group('==============> 下载请求 <==============');
  url = updateEnv(url);
  console.info(url);
  let req = new DownloadTask(url, header, hideLoading, notCheck);
  saveOnGoingRequest(req);
  return req;
}

module.exports = {
  http,
  upload,
  download,
};
