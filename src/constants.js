// api前置地址，方便统一调整
export const API_BASE = process.env.API_BASE;

// 授权接口地址
export const API_AUTH_BASE = process.env.API_AUTH;

// 是否啟用browserHistory模式
export const BROWSER_HISTORY = JSON.parse(process.env.BROWSER_HISTORY);

// 缺省分页大小
export const DEFAULT_PAGE_SIZE = 10;

// header头部token键名
export const HEADER_TOKEN_NAME = 'mc-admin-api-key';

// 缺省未授权按钮/菜单禁用方式(disable/hide)
export const DEFAULT_EMPOWER_DISABLE_TYPE = 'disable';

// inputNumber组件 max
export const INPUT_NUMBER_MAX = 1000000;

export const EXTERNAL_ACTIVITY_LINK = process.env.EXTERNAL_ACTIVITY_LINK;

// 字母列表
const generateBigWord = () => {
  const str = [];
  for (let i = 65; i < 91; i++) { // eslint-disable-line
    str.push(String.fromCharCode(i));
  }
  return str;
};
export const WORD_LIST = generateBigWord();
