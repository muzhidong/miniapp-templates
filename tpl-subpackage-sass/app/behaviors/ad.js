/*
 * @Author: Liu Xiaodong
 * @Date: 2020-09-02 00:49:04
 * @LastEditTime: 2021-03-09 18:09:20
 * @Description: 广告相关
 */
import {
  environment,
  PATH,
  API,
  LOG_TYPES,
  updateEnv,
} from '../module';

let app;

export const ad = Behavior({

  data: {
    // 广告图
    adImage: '',
    // 广告链接
    _adLink: '',
    // 广告名称
    _adName: '',
  },

  lifetimes: {
    attached() {
      app = getApp();
    },
  },

  methods: {

    // 获取一条广告内容
    _getAd(params, defaultHandleCb, successCb) {

      let self = this;
      API.advertising(params).success(res => {

        let list = res.data.list.filter(item => {
          return item.status === '1';
        })

        if (list.length > 0) {

          let {
            imgUrl = '',
            url = '',
            name = '',
          } = list[0];

          if (imgUrl && url) {

            let domain = updateEnv(`https://sap${environment === 'prod'?'':environment}.kungeek.com`);

            self.setData({
              adImage: domain + imgUrl,
              _adLink: url,
              _adName: name,
            }, () => {
              successCb && successCb();
            })
          } else {
            defaultHandleCb && defaultHandleCb();
          }

        } else {
          defaultHandleCb && defaultHandleCb();
        }
      });
    },

    // 获取多条广告内容
    _getAds(params) {

      let self = this;
      API.advertising(params).success(res => {

        let list = res.data.list.filter(item => {
          return item.status === '1';
        })

        if (list.length > 0) {

          let domain = updateEnv(`https://sap${environment === 'prod'?'':environment}.kungeek.com`);

          list = list.map(item=>{
            return {
              adImage: domain + item.imgUrl,
              _adLink: item.url,
              _adName: item.name,
            }
          });
         
          self.setData({
            adImageList:list.splice(0,3),
          });
        }
      });
    },

    // 跳转到广告页
    _toAd(code) {
      let self = this;
      self.data._adLink && wx.navigateTo({
        url: `${PATH.AD}?link=${encodeURIComponent(self.data._adLink)}&title=${encodeURIComponent(self.data._adName)}&cover=${encodeURIComponent(self.data.adImage)}`,
        success() {
          self._getApp().saveLog(self.route, LOG_TYPES.CLICK_AD, code);
        }
      })
    },

    // 跳转到指定广告页
    _toSomeAd(code,index) {
      
      let {
        _adLink,
        _adName,
        adImage,
      } = this.data.adImageList[index];
      let self= this;
      _adLink && wx.navigateTo({
        url: `${PATH.AD}?link=${encodeURIComponent(_adLink)}&title=${encodeURIComponent(_adName)}&cover=${encodeURIComponent(adImage)}`,
        success:()=> {
          self._getApp().saveLog(this.route, LOG_TYPES.CLICK_AD, code);
        }
      })
      
    },

     _getApp() {
      if (!app) {
        app = getApp();
      }
      return app;
    },
  },

});
