/**
 * 环境配置
 */

let {
  miniProgram: {
    envVersion
  }
} = wx.getAccountInfoSync();
console.log(envVersion);

let env;
switch (envVersion) {
  // 开发环境 
  case 'develop':
    env = 'testc';
    break;
    // 体验版环境
  case 'trial':
    env = 'pre';
    break;
    // 生产环境
  case 'release':
  default:
    env = 'prod';
    break;
}

// 如需本地调试，请在这设置本地ip
// const localUrl = '10.10.1.172:8888';
const localUrl = '';

const config = localUrl ? {
  // 服务器域名
  baseUrl: `http://${localUrl}/api`,
  // socket域名(未使用到)
  socketUrl: `ws://${localUrl}/`,
  // 网络资源路径
  assetsBasePath: `http://${localUrl}/mini-huisuanzhang/hsz-assets`
} : {
  // 服务器域名
  baseUrl: `https://ftsp${env === 'prod'?'':env}.kungeek.com/api`,
  // socket域名(未使用到)
  socketUrl: `wss://crm${env === 'prod'?'':env}.kungeek.com/`,
  // 网络资源路径
  assetsBasePath: `https://sap${env === 'prod'?'':env}.kungeek.com/mini-huisuanzhang/hsz-assets`
};

module.exports = {
  environment: env,
  ...config,
};
