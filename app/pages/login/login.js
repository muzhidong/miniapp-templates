/*
 * @Author: Liu Xiaodong
 * @Date: 2020-03-02 14:51:55
 * @LastEditTime: 2021-03-01 16:47:21
 * @Description: 登录页
 */
import {
  PATH,
  REGEXPS,
  debounce,
  share,
  log,
  API,
  Storage,
  APPID,
  LOG_CODES,
  LOG_TYPES,
} from '../../module.js';

let timer;
let app = getApp();

Component({

  options: {
    addGlobalClass: true,
    pureDataPattern: new RegExp('^_'),
  },

  behaviors: [share, log],

  data: {
    isPhoneFocus: false,
    isCaptchaFocus: false,
    isLoginBtnDisabled: true,
    hasGotCaptcha: false,
    time: 120,
    _phoneValue: '',
    _captchaValue: '',
    _vcodeId: '',
  },

  methods: {

    _validate(phone, captcha) {

      return new Promise((resolve, reject) => {
        if (!new RegExp(REGEXPS.mobilePhone).test(phone)) {
          wx.showToast({
            title: '手机号不正确',
            icon: 'none',
          });
          resolve(false);
        }
        if (!(new RegExp("\\d{4}")).test(captcha)) {
          wx.showToast({
            title: '验证码不正确',
            icon: 'none',
          });
          resolve(false);
        }
        API.validateCaptcha({
          vcodeId: this.data._vcodeId,
          vcode: captcha,
        }).success(() => {
          resolve(true);
        }).error(() => {
          wx.showToast({
            title: '验证码不正确',
            icon: 'none',
          });
          resolve(false);
        });
      });
    },

    async handleLogin(e) {

      let self = this;

      if (this.data.isLoginBtnDisabled) {
        return;
      }

      let {
        phone,
        captcha
      } = e.detail.value;

      const bool = await this._validate(phone, captcha);

      if (!bool) {
        return;
      }

      let header = Storage.get('header') || {};
      // 手机登录 
      API.loginByPhone({
        mobilePhone: phone,
        vcodeId: this.data._vcodeId,
        unionid: header.unionid || '',
      }).success((res) => {

        let {
          token = '',
            mtNo = '',
            curuserId = ''
        } = res.data;

        Storage.set('header', {
          ...header,
          token,
          userName: phone,
          mtNo,
          curuserId,
          unionid: header.unionid || '',
        }, () => {

          // 记录日志
          app.saveLog(self.route, LOG_TYPES.LOGIN, LOG_CODES.PHONE_LOGIN);

        });
      })

    },

    onGetCaptcha() {

      if (this.data.hasGotCaptcha) {
        return;
      }

      let isFirst = true;

      if (timer) {
        clearInterval(timer);
        timer = null;
      }

      timer = setInterval(() => {
        if (isFirst) {
          isFirst = false;
          // 获取短信验证码
          if (new RegExp(REGEXPS.mobilePhone).test(this.data._phoneValue)) {
            API.getCaptcha(this.data._phoneValue).success((res) => {
              console.log(res);
              this.setData({
                hasGotCaptcha: true,
                time: this.data.time - 1,
                _vcodeId: res.data.vcodeId
              })
            })
          } else {
            wx.showToast({
              title: this.data._phoneValue ? '手机号不正确' : '请输入手机号',
              icon: 'none',
            });
          }
        } else if (this.data.time <= 0) {
          clearInterval(timer);
          this.setData({
            hasGotCaptcha: false,
            time: 120,
          });
        } else {
          this.setData({
            time: this.data.time - 1,
          })
        }
      }, 1000);
    },

    onInput: debounce(function(e) {
      let name = e.target.dataset.name;
      let value = e.detail.value;
      let flag;
      switch (name) {
        case "phone":
          flag = value && value.length === 11 && this.data._captchaValue && this.data._captchaValue.length === 4;
          break;
        case "captcha":
          flag = value && value.length === 4 && this.data._phoneValue && this.data._phoneValue.length === 11;
          break;
        default:
          break;
      }
      this.setData({
        ['_' + name + 'Value']: value,
        isLoginBtnDisabled: !flag,
      });
    }),

    onFocusOrBlur(e) {
      const name = e.target.dataset.name;
      const type = e.type;
      switch (name) {
        case 'phone':
          this.setData({
            isPhoneFocus: type == 'focus' ? true : false,
          })
          break;
        case 'captcha':
          this.setData({
            isCaptchaFocus: type === 'focus' ? true : false,
          })
          break;
        default:
          break;
      }
    },

    toProtocol(e) {
      let {
        type
      } = e.currentTarget.dataset;
      wx.navigateTo({
        url: PATH.PROTOCOL + `?type=${type}`,
      })
    },

  }
});
