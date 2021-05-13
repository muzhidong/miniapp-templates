/**
 * 模块统一入口
 */
/** constant */
export {
  API,
  URL,
  WHITE_LIST,
}
from './constant/api.js';

export {
  LOG_CODES,
  LOG_TYPES,
}
from './constant/log.js';

export {
  PATH
}
from './constant/path.js';

export {
  REGEXPS
}
from './constant/regexps.js';

export {
  APPID,
  CHANNEL,
}
from './constant/config.js';

/** environment */
export {
  environment,
  baseUrl,
  socketUrl,
  assetsBasePath,
}
from './environment/environment.js';


/** utils */
export {
  loadingAndToastFix
}
from './utils/loadingAndToastFix.js';

export {
  http,
  upload,
  download,
}
from './utils/request.js';

export {
  debounce,
  throttle
}
from './utils/triggerUtil.js';

export {
  setSizeOfWxAvatar,
  checkIDCard,
  promisify,
  updateEnv,
  saveOnGoingRequest,
}
from './utils/util.js';

export {
  Monitor
}
from './utils/monitor.js';

export {
  toUpperMoney,
  toMoney,
  forceToMoney,
}
from './utils/money';

export {
  formatTime,
  getToday,
  getYesterDay,
  getLastWeek,
  getWeekDay,
  getLastDay,
  isLeapYear,
}
from './utils/time';

export {
  isEmojiCharacter,
}
from './utils/emoji';

export {
  Storage
}
from './utils/storage';

/** behavior */
export {
  share
}
from './behaviors/share';

export {
  log
}
from './behaviors/log';

export {
  ad,
}
from './behaviors/ad';

export {
  subscribe,
}
from './behaviors/subscribe';
