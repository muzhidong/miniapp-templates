/**
 * 日志埋点
 */

//  日志类型
export const LOG_TYPES = {
  // 登录
  LOGIN: '01010001',
  // 打开页面(小程序这里包含转发操作)
  OPEN_PAGE: '01020006',
  // 点击广告
  CLICK_AD: '01020004',
}

// 日志码
export const LOG_CODES = {
  // 打开验证码登录页面
  LOGIN: '20010000000002',
  // 打开分包主页页面
  MAIN: '20010000000003',
  // 转发行为
  SHARE: "20010000000005",
  // 手机登录行为
  PHONE_LOGIN: "20010000000010",
}
