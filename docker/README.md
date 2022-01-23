###  Description                                                                                                                                                                             
  
由于devops在新环境使用docker进行部署，所以提供dockerfile。
 
命令方式（注意替换"<>"的内容）：
 
```bash
# 在项目根目录下
# node 默认版本 8.15.1
docker build --build-arg NODE_VERSION=<your-version(^8.10.*)> -t <project-image-name> -f docker/nodejs/Dockerfile .
