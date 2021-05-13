//app.js
import {
  loadingAndToastFix,
  PATH,
  Storage,
  formatTime,
  Monitor,
} from './module.js';

App({

  globalData: {
    requestArr: null, // 处于正在请求中的任务数组
  },

  onLaunch: function() {

    loadingAndToastFix();

    // 动态设置体验版连接环境
    this.setTrialEnv();

    // 强制更新小程序
    this.forceUpdateVersion();

  },

  setTrialEnv() {
    let {
      miniProgram: {
        envVersion = '',
      } = {},
    } = wx.getAccountInfoSync && wx.getAccountInfoSync() || {};

    let envs = ['testc', 'pre', 'prod'];

    if (envVersion === 'trial') {
      let self = this;
      wx.showActionSheet({
        itemList: envs,
        success: (result) => {
          for (let reqPromise of self.globalData.requestArr) {
            reqPromise && reqPromise.abort();
          }
          self.globalData.requestArr = [];
          Storage.remove('logs');
          Storage.set('env', envs[result.tapIndex]);
          wx.reLaunch({
            url: PATH.INDEX,
          });
        },
      });
    } else {
      Storage.remove('env');
    }

  },

  // 获取微信code
  getCode(cb) {
    let self = this;
    wx.login({
      success(res) {
        cb && cb(res.code);
      },
      error(err) {
        self.getCode(cb);
      }
    });
  },

  // 强制更新小程序
  forceUpdateVersion() {
    if (wx.canIUse('getUpdateManager')) {
      let manager = wx.getUpdateManager();
      manager.onCheckForUpdate(function(res) {
        if (res.hasUpdate) {
          wx.showLoading({
            title: '更新下载中...',
          })
          const {
            miniProgram: {
              version,
            }
          } = wx.getAccountInfoSync();
          const {
            model = '',
              system = '',
          } = wx.getSystemInfoSync && wx.getSystemInfoSync() || {};
          manager.onUpdateReady(function() {
            wx.hideLoading();
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              showCancel: false,
              success: function(res) {
                if (res.confirm) {
                  manager.applyUpdate();
                }
              }
            })
            Monitor.warn(`status:success,cur-online-ver:${version},device-info:${model} ${system}`);
            Monitor.addFilterMsg('version');
          });

          manager.onUpdateFailed(function() {
            wx.hideLoading();
            wx.showModal({
              title: '发现新版本',
              content: '请您删除当前小程序，重新搜索打开。',
              showCancel: false,
              confirmText: '关闭',
            })
            Monitor.warn(`status:failed,cur-online-ver:${version},device-info:${model} ${system}`);
            Monitor.addFilterMsg('version');
          });
        }
      });
    }
  },

  // 本地暂存日志埋点
  saveLog(page, type, code, moreParams) {

    let logs = Storage.get('logs') || [];

    let {
      unionid = '',
        openId = '',
    } = Storage.get('header') || {};

    const {
      miniProgram: {
        version,
        envVersion,
      }
    } = wx.getAccountInfoSync();

    const {
      brand = '',
        model = '',
        system = '',
        pixelRatio = '',
        windowHeight = '',
        windowWidth = '',
    } = wx.getSystemInfoSync && wx.getSystemInfoSync() || {};

    logs.push({
      logType: type,
      logTime: formatTime(new Date()),
      content: JSON.stringify({
        page,
        code,
        appVersion: version,
        brand,
        model,
        osVersion: system,
        resolution: `${pixelRatio * windowWidth}*${pixelRatio * windowHeight}`,
        unionid,
        openId,
        ...moreParams,
        // seq: '',
        // deviceId: '',
        // cpu: '',
        // browser: '',
        // mac: '',
        // memory: '',
        // ztxxId: '',
        // zjxxId: ''
      }),
    });

    Storage.set('logs', logs);

  },
})
