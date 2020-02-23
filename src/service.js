import axios from 'axios';
import {message} from 'antd';

axios.defaults.baseURL = '/api';

axios.interceptors.request.use(config => {
  console.log(localStorage.getItem('$FUSION_TOKEN'));
  config.headers['Api-Token'] = localStorage.getItem('$FUSION_TOKEN');
  return config;
}, error => {
  return Promise.reject(error);
});

axios.interceptors.response.use(r => r, e => {
  switch (e.response.status) {
    case 422:
      message.error('填写错误: ' + e.response.data.message);
      break;
    case 500:
      message.error('服务器错误');
      break;
    case 504:
      message.error('服务器未响应');
      break;
    default:
      message.error(e.response.data.message || '未知错误');
      break;
  }
  return Promise.reject(e)
});

export default axios;