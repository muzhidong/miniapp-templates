/**
 * 页面路径管理
 */
// 各模块前缀
const BUSINESS_CONFIRM = '/ywqr';

export const PATH = {

  // 手机登录页
  LOGIN: "/pages/login/login",
  // 协议页
  PROTOCOL: "/pages/protocol/protocol",
  // 异常页
  EXCEPTION: "/pages/exception/exception",
  // 首页
  INDEX: "/pages/index/index",
  // 无网络
  NO_NETWORK: "/pages/noNetWork/noNetWork",

  // 业务确认模块
  YWQR: {
    // 主页
    MAIN: BUSINESS_CONFIRM + "/pages/main/main",
  },
}
