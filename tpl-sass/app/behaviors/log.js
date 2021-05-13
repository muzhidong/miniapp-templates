/*
 * @Author: Liu Xiaodong
 * @Date: 2020-04-28 16:55:27
 * @LastEditTime: 2021-03-01 17:05:18
 * @Description: 日志埋点
 */
import {
  API,
  PATH,
  LOG_CODES,
  LOG_TYPES,
  Storage,
} from '../module';

let app;
// 页面访问开始和结束时间点
let pageAccessStartTime = 0;
let pageAccessEndTime = 0;

export const log = Behavior({

  lifetimes: {
    attached() {
      app = getApp();
      pageAccessStartTime = Date.now();
    },
    detached() {
      this._handleOpenPageTypeLog();
    }
  },

  methods: {

    // 处理打开页面埋点。根据登录态决定是记录还是记录并提交，登录态以路径作为判断依据。
    _handleOpenPageTypeLog() {

      pageAccessEndTime = Date.now();

      // 确定日志码
      let code = '';
      let route = '/' + this.route;
      switch (route) {
        case PATH.LOGIN:
          code = LOG_CODES.LOGIN;
          break;
        case PATH.EXCEPTION:
          code = LOG_CODES.EXCEPTION;
          break;
        default:
          break;
      }

      // 记录打开页面埋点
      app.saveLog(this.route, LOG_TYPES.OPEN_PAGE, code, {
        stayTime: `${(pageAccessEndTime - pageAccessStartTime) / 1000}s`,
      });

      if (![PATH.LOGIN, PATH.EXCEPTION].includes(route)) {
        // 提交埋点(目前唯一提交埋点时刻)
        let logs = Storage.get('logs') || [];

        // 可以在此处添加日志提交规则，目前少于10条不触发
        if (logs.length < 10) {
          return;
        }

        // 提交埋点(目前唯一提交埋点时刻)
        API.log({
          log: JSON.stringify({
            logs
          }),
        }).success(res => {
          console.log('日志发送成功');
          Storage.set('logs', []);
        }).error(err => {
          console.log('日志发送失败,', err);
        });
      }
    }
  },
})
