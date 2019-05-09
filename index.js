const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');
const {
  parse
} = require('@vue/component-compiler-utils');
const vueCompiler = require('vue-template-compiler');
const diff = require('deep-diff').diff;


class VueAutoRouteWebapckPlugin {
  constructor(options) {
    this.options = Object.assign({
      rootComponent: 'Login.vue',
      indexComponent: 'Index',
      ignoreDir: 'components',
      useFileName: false,
      propsKeyName: '$$route'
    }, options);
    this.options.entry = path.join(options.entry, '/');
    this.files = {};
    this.filesPath = [];
    this.metaOutput = {
      warnings: [],
      errors: []
    };
    this.routes = [];
    this.routesMap = {};
  }

  apply(compiler) {
    this._hook(compiler, 'emit', 'emit', (compilation, cb) => {
      compilation.errors = compilation.errors.concat(this.metaOutput.errors.map(x => '[webpack-auto-vue-router] ' + x));
      compilation.warnings = compilation.warnings.concat(this.metaOutput.warnings.map(x => '[webpack-auto-vue-router] ' + x));
      cb && cb();
    });
    this._hook(compiler, 'done', 'done', (compilation, cb) => {
      if (!this.watcher) {
        this.watcher = chokidar.watch(this.options.entry, {
          ignoreInitial: true
        });
        let changeCb = this._fileChanged.bind(this);
        let removeCb = this._fileRmoved.bind(this);
        this.watcher.on('add', changeCb).on('change', changeCb).on('unlink', removeCb);
      }
      cb && cb();
    })
    this.start();
  }

  _isVue(path) {
    return /\.vue$/g.test(path);
  }

  _fileChanged(file) {
    this._isVue(file) && this._diffConfig(file);
  }

  _fileRmoved(file) {
    this._isVue(file) && this.start();
  }

  _hook(compiler, v3Name, v4Name, cb) {
    if (compiler.hooks && compiler.hooks[v4Name]) {
      compiler.hooks[v4Name].tap('VueAutoRouteWebapckPlugin', cb);
    } else {
      compiler.plugin(v3Name, cb);
    }
  }

  start() {
    let filesPath = this.fetchFiles(this.options.entry);
    this.routes = [];
    this.filesPath = filesPath;
    this.parseFiles();
    this.buildRoute();
  };

  _diffConfig(file) {
    let config = this.parseRouteConfig(file);
    let _config = this.files[file];
    if (_config) {
      let hasDiff = diff(_config, config);
      if (hasDiff) {
        this.files[file] = config;
        this.updateOneRoute(config);
      };
    } else {
      this.files[file] = config;
      this.pushOneRoute(config);
      this.output();
    }
  }

  updateOneRoute(config) {
    let {
      _path,
      name,
      meta,
      lazy,
      redirect,
      alias,
      props,
      path: _path_
    } = config;
    let route = this.routesMap[_path];

    if (name !== undefined) route.name = name;
    if (meta !== undefined) route.meta = meta;
    if (redirect !== undefined) route.redirect = redirect;
    if (alias !== undefined) route.alias = alias;
    if (props !== undefined) route.props = props;
    if (_path_ !== undefined) route.path = _path_;
    route.components.default = lazy ? `${lazy}|lazy|${_path}` : _path;
    this.output();
  }

  parseFiles() {
    this.filesPath.forEach(path => {
      this.files[path] = this.parseRouteConfig(path);
    });
  }

  checkDuplicate() {
    let data = {};
    this.metaOutput.warnings = [];
    for (let _path in this.routesMap) {
      let name = this.routesMap[_path].name;
      if (name) {
        if (data[name]) {
          this.metaOutput.warnings.push(`Duplicate named routes definition: [${_path},${data[name]}]`);
        } else {
          data[name] = _path;
        }
      }
    }
    data = null;
  }
  pushOneRoute(config) {
    let pathItems = config._path.replace(this.options.entry, '').split(path.sep);
    this.touchRoute(this.routes, null, pathItems, config);
  }

  buildRoute() {
    this.filesPath.forEach(path => {
      let routeConfig = this.files[path];
      this.pushOneRoute(routeConfig);
    });
    this.output();
  }

  output() {
    let routes = JSON.stringify(this.routes);
    routes = routes.replace(/"default":(".+?\.vue")/g, (v1, v2) => {
      let _v2 = v2.slice(1, -1).replace(/\\+/g, '/').split('|lazy|');
      if (_v2.length === 1) {
        return `default:require('${_v2[0]}').default`;
      } else if (_v2.length === 2) {
        let webpackChunkName = _v2[0] === 'true' ? '' : `/*webpackChunkName:"${_v2[0]}"*/`;
        return `default:()=>import(${webpackChunkName}"${_v2[1]}")`;
      } else {
        return `default:require('${v2}').default`;
      }
    });
    fs.writeFileSync(this.options.output, `export default ${routes}`);
    this.checkDuplicate();
  }

  touchRoute(route, parentRoute, pathItems, routeConfig) {
    let {
      rootComponent,
      indexComponent,
      useFileName
    } = this.options;
    let {
      _path,
      path: __path__,
      meta,
      name,
      lazy,
      redirect,
      alias,
      props
    } = routeConfig;
    let _reoutes = parentRoute && parentRoute.children || route;
    let pathItem = pathItems.shift();
    let components = {};
    if (this._isVue(pathItem)) {
      let _path_ = lazy ? `${lazy}|lazy|${_path}` : _path;
      pathItem = pathItem.replace('.vue', '');
      // if (routeConfig.view) {
      //   if (parentRoute) {
      //     parentRoute.components[routeConfig.view] = _path_;
      //   } else {
      //     components[routeConfig.view] = _path_;
      //   }
      // } else {
      //   components.default = _path_;
      // }
      // console.log(_path_);
      components.default = _path_;
      if (pathItem === indexComponent) {
        if (parentRoute) {
          parentRoute.name = name ? name : (useFileName && `${parentRoute.path}/${pathItem}`);
          parentRoute.components = Object.assign(parentRoute.components, components);
          parentRoute.meta = meta;
          this.routesMap[_path] = parentRoute;
        }
      } else {
        let _route_ = {
          name: name ? name : (useFileName && pathItem),
          path: __path__ || `${parentRoute?pathItem:pathItem === rootComponent ?'/':'/'+pathItem}`,
          components,
          redirect,
          alias,
          props,
          meta
        };
        this.routesMap[_path] = _route_;
        _reoutes.push(_route_);
      }
    } else {
      let _route = _reoutes.find(r => r.path === pathItem || r.path === '/' + pathItem);
      if (!_route) {
        _route = {
          path: __path__ || `${parentRoute?pathItem:'/'+pathItem}`,
          redirect,
          alias,
          props,
          children: [],
          components: {}
        }
        _reoutes.push(_route);
      }
      this.touchRoute(_route.children, _route, pathItems, routeConfig);
    }
  }

  fetchFiles(dir) {
    let files = [];
    let list = fs.readdirSync(dir);
    list.forEach(file => {
      if (file === this.options.ignoreDir) return;
      let filePath = path.join(dir, file);
      let stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        files = files.concat(this.fetchFiles(filePath));
      } else {
        if (this._isVue(file)) {
          files.push(filePath);
        }
      }
    });
    return files;
  }

  parseRouteConfig(filePath) {
    const descriptor = parse({
      source: fs.readFileSync(filePath, {
        encoding: 'utf8'
      }),
      compiler: vueCompiler,
      filename: path.basename(filePath)
    });
    let route;
    let _config = {
      meta: null,
      lazy: false,
      view: null,
      _path: filePath
    };
    let script = descriptor.script ? descriptor.script.content : null;
    if (script) {
      script = script.replace(/\/\/[\S\s]+?[\r\n]/g, '').replace(/\/\*[\s\S]+?\*\//g, '');
      route = this.parseRoute(script);
      if (route) {
        try {
          route = new Function('return ' + route.replace(/[\r\n]+/g, ''))();
          route = Object.assign(_config, route);
        } catch (error) {
          console.error(route);
          throw new Error(error);
        }
      } else {
        route = _config;
      }
    } else {
      route = _config;
    }
    return route;
  }

  parseRoute(txt) {
    let data = txt;
    let mark = this.options.propsKeyName + ':';
    let chart1 = '{';
    let chart2 = '}';
    let startIndex = data.indexOf(mark);
    let count = 0;
    let begingIndex;
    let endingIndex;
    if (startIndex === -1) {
      return '';
    }
    for (let i = startIndex; i < data.length; i++) {
      let w = data.charAt(i);
      if (w === chart1) {
        if (count === 0) begingIndex = i;
        ++count;
      } else if (w === chart2) {
        --count;
        if (count === 0) {
          endingIndex = i + 1;
          break;
        }
      }
    }
    return endingIndex ? data.slice(begingIndex, endingIndex) : '';
  }
}

module.exports = VueAutoRouteWebapckPlugin;