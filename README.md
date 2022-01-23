# 运营管理后台

> 谨记先看本文档再进行项目开发
> 谨记先看本文档再进行项目开发
> 谨记先看本文档再进行项目开发

## 开发框架
react + dva + antd

## 项目结构
```
+ mock              # 模拟api文件
+ public            # 公共文件，不会被构建
- src               # 源码目录
  + assets          # 静态资源
  + components      # 公共组件库
  + models          # 公共model
  - routes          # 路由
    + [子系统]/[页面]
  + services        # 接口调用文件
  + utils           # 工具类
    constants.js    # 全局使用的常量
+ test              # 单元测试
.babelrc            # babel配置文件
.justreq.sample     # justreq 模板配置文件，使用见下文
README.md
```

## 安装配置
### 环境要求
- node版本: >v8.10.0
- yarn版本: >v1.15.1

### Node环境安装
首先下载安装[Node.js](https://nodejs.org/en/)，然后运行以下命令安装yarn
```shell
npm install -g yarn
```

### 脚手架安装
运行以下命令安装脚手架及项目依赖
```shell
yarn
```

### justreq安装
运行以下命令安装justreq命令行
```shell
npm install -g justreq-cli

# 进入项目根目录复制 justreq 的配置
cp .justreq.sample .justreq
```

## 启动脚手架

开发使用以下 npm script

```shell
npm start
```

## 开发指引
本框架以路由为单位切分子系统及页面，页面路径`/routes/[子系统]/[页面]`

故，做以下约定：

1. 页面私有组件存放在`/routes/[子系统]/[页面]/components/`即可，不要放入公共组件库
2. 页面私有model也存放在页面路径下，如`/routes/[子系统]/[页面]/model.js`
3. 页面路由统一命名为`route.js`，存入于页面路径`/routes/[子系统]/[页面]/route.js`

### 路由配置
为实现按需加载及路由拦截，路由须统一配置为异步加载。以下是`/routes/User/route.js`示例：
```javascript
export default [
  {
    breadcrumbName: '用户信息管理',
    path: '/users',
    model: Model,
    component: UserList
  },
];
```
如需配置子路由，添加routes节点即可：
```javascript
export default [
  {
    breadcrumbName: '用户信息管理',
    path: '/users',
    model: Model,
    component: UserList,
    routes: [
      {
        breadcrumbName: '用户详情',
        path: '/users/detail',
        component: Detail,
      }
    ]
  },
];
```

### 接口代理
为实现多接口机联调、接口掉线自动使用缓存、接口模拟等功能，采用justreq进行接口代理。其配置如下：
```json
{
  "host": "192.168.1.83", // 测试服
  "port": 80,
  "cacheTime": "20m",
  "cachePath": ".jr/cache/",
  "substitutePath": "mock/",
  "jrPort": 8313,
  "proxyTimeout": "3s",
  "rules": [
    {
      "url": ".+",
      "keepFresh": true
    },
    {
      "url": "/security",
      "host": "192.168.1.119", // 接口机A
      "port": 8080
    },
    {
      "url": "/login", // 模拟登录接口
      "subs": "submitLogin.jrs"
    },
    {
      "url": "/user",
      "host": "192.168.1.200", // 接口机B
      "port": 8181
    }
  ]
}
```

***开发前请在根目录下运行 `cp .justreq.sample .justreq` 生成配置文件***
***开发前请在根目录下运行 `cp .justreq.sample .justreq` 生成配置文件***
***开发前请在根目录下运行 `cp .justreq.sample .justreq` 生成配置文件***

RULES说明

1. url为需要代理的接口路径，支持正则表达式
2. host为接口机地址
3. port为接口机端口
4. subs为本地模拟文件，存放于`/mock`路径

***修改完配置文件后，需要重启项目***

更多用法可[点这里查看](https://github.com/vilien/justreq/blob/master/README-cn.md)

## git commit 指引

关于git commit 的话引入了如下开发依赖：

```json
"commitizen": "^3.1.1", // 规范化commit提交
"cz-conventional-changelog": "^2.1.0", // 更新changelog.md
"cz-customizable": "^6.0.0", // 自定义commit message规范
"standard-version": "^5.0.2" // 生成版本和changelog信息
```

```md
# 规则说明：
wip: 未上线前的开发commit
docs：文档更新
feat：新增功能
fix：bug 修复
refactor：重构代码(既没有新增功能，也没有修复 bug)
style：不影响程序逻辑的代码修改(修改空白字符，格式缩进，补全缺失的分号等，没有改变代码逻辑)
test：新增测试用例或是更新现有测试
revert：回滚某个更早之前的提交
chore：不属于以上类型的其他类型
```

*******************************
*(END)*
