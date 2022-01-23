import qs from 'qs';
import { HEADER_TOKEN_NAME, API_BASE } from 'constants';
import { getUserSession } from './session';

/**
 * 下载文件
 * @param  {string} url    文件/接口地址
 * @param  {String} method 请求方式，缺省为GET，也可用POST
 * @param  {object} data   要额外发送的表单数据
 */
export default (url, data = {}, method = 'GET') => {
  data = Object.assign({}, { action: 'export' }, data);
  const oldIframe = document.getElementById('__downloadfile_iframe__');
  const iframe = oldIframe ? oldIframe : document.createElement('iframe');
  const form = document.createElement('form');
  // 解出url中的data
  url = API_BASE + url;
  const pathname = url.replace(/\?.*$|#.*$/g, '');
  const query =
    url.indexOf('?') > -1 ? qs.parse(url.replace(/^.+\?|#.*$/g, '')) : {};
  const session = getUserSession();
  if (session && session.jwt) {
    query[HEADER_TOKEN_NAME] = session.jwt;
  }
  const formData = Object.assign(method === 'GET' ? query : {}, data);
  iframe.setAttribute('id', '__downloadfile_iframe__');
  iframe.setAttribute('style', 'display:none');
  form.setAttribute('method', method);
  form.setAttribute('action', pathname + '?' + qs.stringify(query));
  Object.keys(formData).forEach(key => {
    const input = document.createElement('input');
    input.setAttribute('name', key);
    input.setAttribute('value', formData[key]);
    form.appendChild(input);
  });
  if (!oldIframe) document.body.appendChild(iframe);
  iframe.contentDocument.body.appendChild(form);
  form.submit();
};
