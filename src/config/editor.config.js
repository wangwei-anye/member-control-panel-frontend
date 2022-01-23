import { API_BASE } from 'constants';

// 富文本组件配置
export default {
  uploader: {
    action: `${API_BASE}fileupload`, // 上传地址
    additionData: { file_type: 1 }, // 表单附加数据
    fileSizeLimitMB: 3, // 文件大小限制（单位MB）
    localPicture: true, // 使用本地图片
    onlinePicture: true, // 使用网络图片
    responseUrlField: 'data.fullpath', // 响应报文中图片地址所在字段
  },
  toolbar: [
    'font', 'size', 'bold', 'italic', 'underline', 'strike', 'color', 'background',
    'align', 'direction', 'indent', 'script', 'blockquote', 'code-block', 'list', 'link',
    'image', 'video', 'clean',
  ],
};
