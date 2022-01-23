import React from 'react';
import Loadable from 'react-loadable';
import { BrowserRouter, Router, Route, Switch, Redirect } from 'dva/router';
import { LocaleProvider } from 'antd';
import Page404 from 'routes/404';
import Auth from 'routes/Auth/Auth';
import Login from 'routes/Auth/Login';
import Logout from 'routes/Auth/Logout';
import PageDev from 'routes/Dev/Dev';
import CommonLayout from 'components/CommonLayout';
import Loading from 'components/Loading';
import zhTW from 'antd/lib/locale-provider/zh_TW';
import { routeGrantor } from 'utils/routeGrantor';

const loadedModels = new Set();

// 创建路由
const createRoute = (route, index) => (
  <Route key={index} {...route}>
    {route.routes ? route.routes.map((c, i) => createRoute(c, i)) : null}
  </Route>
);

// 用于更新routes的组件
class RouteComponent extends React.PureComponent {
  componentWillMount() {
    this.props.dispatch({
      type: 'system/updateRoutes',
      payload: this.props.routes,
    });
    this.props.dispatch({
      type: 'system/updatePageLoading',
      payload: false,
    });
  }
  render() {
    return this.props.children;
  }
}

// 异步加载model
const loadModel = async (asynModel, app) => {
  if (asynModel && !asynModel.promise) {
    // 导入model
    try {
      const { default: model } = await asynModel;
      if (!loadedModels.has(model.namespace)) {
        app.model(model);
        loadedModels.add(model.namespace);
      } else {
        console.log(`Cannot use existing namespace '${model.namespace}'`);
      }
    } catch (err) {}
  }
};

const loadableCommon = (route, routeStack, app) => {
  return Loadable({
    loader: async () => {
      if (!routeGrantor(route, app)) return null;
      app._store.dispatch({
        type: 'system/updatePageLoading',
        payload: true,
      });
      await loadModel(route.model, app);
      if (Array.isArray(route.models)) {
        for (const i in route.models) {
          await loadModel(route.models[i], app);
        }
      }
      return route.component;
    },
    loading: Loading,
    delay: 300,
    render: (loaded, props) => {
      const Component = loaded.default;
      return (
        <RouteComponent dispatch={app._store.dispatch} routes={routeStack}>
          <Component {...props} />
        </RouteComponent>
      );
    },
  });
};

// 解析路由
const parseRoutes = (app, routes, routeStack = []) => {
  let ret = [];
  routes.map((route) => {
    const stack = [...routeStack].concat([
      {
        path: route.path,
        breadcrumbName: route.breadcrumbName,
      },
    ]);

    const routeItem = {
      ...route,
      component: loadableCommon(route, stack, app),
      exact: route.exact || true,
    };
    delete routeItem.routes;
    ret.push(routeItem);
    if (Array.isArray(route.routes)) {
      ret = ret.concat(parseRoutes(app, route.routes, stack));
    }
  });
  return ret;
};

function getRoutesByFiles(files, app) {
  let routes = [];
  files.keys().forEach((key) => {
    const configs = files(key).default;
    if (configs) {
      routes = routes.concat(parseRoutes(app, configs));
    }
  });
  return routes;
}

// function getUserConfirmation(dialogKey, callback) {
//   const dialogTrigger = window[Symbol.for(dialogKey)];

//   if (dialogTrigger) {
//     return dialogTrigger(callback);
//   }

//   callback(true);
// }

function RouterConfig({ history, app }) {
  const routeFiles = require.context('./routes', true, /route\.js$/);
  const routes = getRoutesByFiles(routeFiles, app);
  const env = process.env.environment;
  if (env !== 'production') {
    routes.push({
      breadcrumbName: '开发测试专用（prod环境没有该页面）',
      path: '/mcp/dev',
      component: PageDev,
    });
  }
  return (
    <Router history={history}>
      <LocaleProvider locale={zhTW}>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/logout" component={Logout} />
          <Route path="/auth" component={Auth} />
          <Route path="/404" component={Page404} />
          <CommonLayout>
            <Switch>
              {routes.map((route, i) => createRoute(route, i))}
              <Redirect to={{ pathname: '/404' }} />
            </Switch>
          </CommonLayout>
        </Switch>
      </LocaleProvider>
    </Router>
  );
}

export default RouterConfig;
