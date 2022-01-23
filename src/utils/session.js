import { encode, decode } from 'base64-utf8';

// 获取用户会话信息
export const getUserSession = () => {
  const session = sessionStorage.getItem('userInfo');
  // console.log(JSON.parse(decode(session)));
  if (session) {
    return JSON.parse(decode(session));
  }
  return null;
};

// 获取token
export const getToken = () => {
  const userInfo = getUserSession();
  if (userInfo) {
    return userInfo.jwt;
  }
  return '';
};

/**
 * 存储用户会话信息
 * @param  {json} userInfo json格式的用户信息
 */
export const saveUserSession = userInfo => {
  const strInfo = JSON.stringify(userInfo);
  sessionStorage.setItem('userInfo', encode(strInfo));
};

// 获取用户本地信息
export const getLocalUser = () => {
  const local = localStorage.getItem('userInfo');
  if (local) {
    return JSON.parse(decode(local));
  }
  return null;
};

/**
 * 存储用户本地信息
 * @param  {json} userInfo json格式的用户信息
 */
export const saveLocalUser = userInfo => {
  const strInfo = JSON.stringify(userInfo);
  localStorage.setItem('userInfo', encode(strInfo));
};

// session跨标签解决方案
/* (function(){
  if (!sessionStorage.length) {
    localStorage.setItem('getSessionStorage', Date.now());
  };

  window.addEventListener('storage', function(event){
    if (event.key == 'getSessionStorage') {
      localStorage.setItem('sessionStorage', JSON.stringify(sessionStorage));
      localStorage.removeItem('sessionStorage');
    } else if (event.key == 'sessionStorage' && !sessionStorage.length) {
      let data = JSON.parse(event.newValue);
      for (let key in data) {
        sessionStorage.setItem(key, data[key]);
      }
    }
  });
})(); */
