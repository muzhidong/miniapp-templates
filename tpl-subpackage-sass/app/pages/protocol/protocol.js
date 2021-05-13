/*
 * @Author: Liu Xiaodong
 * @Date: 2019-09-20 11:23:34
 * @LastEditTime: 2020-10-22 14:51:36
 * @Description: 协议页
 */
import {
  share,
} from '../../module';

const serviceUrl = "https://event-h5.huisuanzhang.com/about/app_user_agreement";
const privacyUrl = "https://event-h5.huisuanzhang.com/about/app_user_privacy";

Component({

  behaviors: [share, ],

  data:{
    // 协议地址
    url:'',
  },

  methods:{
    onLoad(options){
      let url;
      switch(options.type){
        case "service":
          url = serviceUrl;
          break;
        case "privacy":
          url = privacyUrl;
          break;
        default:
          break;
      }
      this.setData({
        url,
      })
    },
  }
})