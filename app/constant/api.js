/**
 * 接口路径和方法调用
 */
import {
  baseUrl
} from '../environment/environment.js';
import {
  http,
  upload,
} from '../utils/request.js';
import {
  CHANNEL
} from "./config.js";
import {
  Storage
} from "../utils/util.js";

/**
 * 主包或公共URL、API
 */
const COMMON_URL = {

  /**
   * 日志接口
   */
  LOG: baseUrl + '/sdp/stxx/jcxx/insertlog',

  /**
   * 文件上传下载接口
   */
  // 上传文件
  UPLOAD: baseUrl + '/sdp/wjxx/wjgl/upload',
  // 文件下载
  DOWNLOAD: baseUrl + "/sdp/wjxx/wjgl/download",

  /**
   * 中转调用AI接口
   */
  CALL_AI: baseUrl + "/sap/util/aiBaseServer/callAIServer",

  /**
   * 登录模块
   */
  // 获取验证码
  GET_CAPTCHA: baseUrl + '/sdp/sms/vcode/getfwhloginvcode',
  // GET_CAPTCHA: baseUrl + '/sdp/sms/vcode/getvcode',
  // 校验验证码
  VALIDATE_CAPTCHA: baseUrl + '/sdp/sms/vcode/checkvcode',
  // 内部系统手机号登录
  LOGIN_BY_SYSPHONE: baseUrl + '/sdp/yhxx/yhgl/userauthenticationByPhoneAndVcodeId',
};

const COMMON_API = {

  /**
   * 日志接口
   */
  log(params) {
    return http.post(COMMON_URL.LOG, params);
  },

  /**
   * 文件上传下载接口
   */
  upload(params) {
    return upload(COMMON_URL.UPLOAD, params);
  },

  download(params) {
    let {
      token,
      userName
    } = Storage.get('header');
    wx.showLoading({
      title: '加载中',
      mask: true,
    });
    return new Promise((resolve, reject) => {
      wx.request({
        url: COMMON_URL.DOWNLOAD,
        header: {
          "content-type": "image/*",
          "channel": CHANNEL,
          token,
          userName,
        },
        data: params,
        dataType: '',
        responseType: "arraybuffer",
        success: function(res) {
          resolve(res);
        },
        fail: function(error) {
          reject(error);
        },
        complete: function() {
          wx.hideLoading();
        }
      });
    });
  },

  /** 
   * 登录模块
   */
  getCaptcha(mobilePhone) {
    return http.post(COMMON_URL.GET_CAPTCHA, {
      mobilePhone
    });
  },

  validateCaptcha(params) {
    return http.post(COMMON_URL.VALIDATE_CAPTCHA, params);
  },

  loginByPhone(params) {
    return http.post(COMMON_URL.LOGIN_BY_SYSPHONE, params);
  },

};

/**
 * 业务确认分包URL、API
 */
const YWQR_URL = {

  /**
   * 工资模块
   */
  // 获取工资信息
  GET_SALARY_LIST: baseUrl + '/sap/kh/ywqr/pagedQueryYgHmcByWxid',

};

const YWQR_API = {

  /**
   * 工资模块
   */
  getSalaryList(params) {
    return http.post(YWQR_URL.GET_SALARY_LIST, params);
  },

};


// 接口白名单
const WHITE_LIST = [
  COMMON_URL.GET_CAPTCHA,
  COMMON_URL.VALIDATE_CAPTCHA,
  COMMON_URL.LOGIN_BY_SYSPHONE,
];

module.exports = {
  API: {
    ...COMMON_API,
    ...YWQR_API,
  },
  URL: {
    ...COMMON_URL,
    ...YWQR_URL,
  },
  WHITE_LIST,
}
