[TOC]

## 前言

虽然qiankun这个框架表面看似使用路由来作为障眼法来进行不同微应用的加载，但是仔细思考其背后的沙箱隔离及脚本执行等等，还是有很多细节可以关注的；

## 可以关注的细节

- 脚本沙箱隔离
- 样式隔离和匹配
- 资源文件加载策略
- 脚本执行策略
- with的应用
- qiankun-head到底是不自定义元素？

### `script`沙箱执行

总体上就是对主应用的`window`进行一个代理（`proxy`沙箱模式[^12]），然后把代理的对象作为微应用作用域`global`对象。

#### `with`的作用

在对`window`完成代理后，可以用`with`将代理对象挂载到当前作用域链[^13][^14]，然后再执行子应用的脚本，这样就可以有效避免不同应用之间对其他应用`window`对象的污染；

![image-20220629165041906](http://pic.xiexuefeng.cc/markdown/image-20220629165041906.png?imageslim)

当然，从上面源码也不难看出，也可以直接覆盖当前作用域内的`window`变量，以达到对`window`的劫持；

#### (0, eval)(...)

在源码中发现一个奇怪的写法[^15]：

![image-20220629165505216](http://pic.xiexuefeng.cc/markdown/image-20220629165505216.png?imageslim)

一查，才发现这也是有点历史的写法了——[(1, eval)('this') vs eval('this') in JavaScript? - Stack Overflow](https://stackoverflow.com/questions/9107240/1-evalthis-vs-evalthis-in-javascript/9107367#9107367)；简言之括号中用逗号分隔的语句，其实<font color=#f00>会返回最后一个语句的值</font>。

#### 特殊元素的代理

- `style/link`：可以理解为内联样式和外链样式，这个按照样式的逻辑进行；
- `script`：分为内联脚本和外链脚本，外链脚本则是利用`fetch`进行源码请求进而变成一个内联的脚本，然后进行沙箱模式的执行（依靠`import-html-entry`包的`execScripts`函数[^8]）；

- `document/body`：目前只是看到基于对`document`的节点创建/移除相关操作[^5][^6][^7]进行一个劫持操作，但是像`query`这类操作并没发现进行劫持，按理说`query`也要严格限制在各自的子应用容器内才比较好，不然就会造成查询外溢（比如在子应用内通过`document.getElementById`查询一个元素，但是外层应用存在同名`id`时）？



#### window的代理

- 首先从顶层`window`复制**不可配置**的属性到**代理**`window`对象上[^9]；

  <img src="http://pic.xiexuefeng.cc/markdown/image-20220629154657228.png?imageslim" alt="image-20220629154657228" style="zoom:50%;" />

- 对于一些需要在顶层作用域执行的函数属性，直接返回顶层对象原属性[^10]；

  <img src="http://pic.xiexuefeng.cc/markdown/image-20220629154509703.png?imageslim" alt="image-20220629154509703" style="zoom:50%;" />

- 至于`set`的代理就很简单了[^11]，也很清晰：

  <img src="http://pic.xiexuefeng.cc/markdown/image-20220629155902357.png?imageslim" alt="image-20220629155902357" style="zoom:50%;" />



### 样式隔离

从源码可以看出目前`qiankun`对于微应用样式有两种模式：

- 从加载`html`一开始就存在的`style`样式（静态），直接在所有`rule`的选择器前加上一个微应用容器的父级选择器[^1]即可；

- 而异步加载的`style/link`（动态），则是合并所有的`rule`到一个`style`[^2][^3]中（一般来说就在`<qiankun-head>`里面）：

  <img src="http://pic.xiexuefeng.cc/markdown/image-20220624152229724.png?imageslim" alt="image-20220624152229724" style="zoom:50%;" />

  令人感到疑惑的是貌似没看到对这些`rule`增加父级选择器的操作，这样不就会**让微应用内的样式污染到外部**吗？

除了上述这些样式隔离的方法，还有其他的方法可以做到样式隔离吗？这里倒是摸到了一些历史。

#### 已故的style scoped属性

曾经的`style`标签有个`scoped`属性，其作用就是让当前`style`下的样式声明只对其父级元素下面的子元素进行作用（想必在`Vue`里面的`style scoped`用法就是继承了这种语法）：

```html
<div class="some">
  <p>1111</p>
</div>
<div class="scoped">
  <!-- 曾经style有个scoped的属性，可以使得带scoped属性的style只作用于其父级元素下的子级元素 -->
  <style scoped>
    .some {
      background-color: coral;
    }
  </style>
  <!-- 也就是说，这种语法可以使得上面的style只对下面的元素作用；-->
  <div class="some">
    <p>1111</p>
  </div>
</div>
```

但不知为何这个`scoped`属性居然被废弃了[^4]。但是社区里有对[这个属性的`polyfill`](https://github.com/samthor/scoped)，因此引入这个`polyfill`就能继续使用了：

<img src="http://pic.xiexuefeng.cc/markdown/image-20220624154233019.png?imageslim" alt="image-20220624154233019" style="zoom:50%;" />

这个`polyfill`的原理就跟`qiankun`那种差不多，首先对`scoped style`标签的父元素加一个自定义属性，然后再对`style`下的所有`rule`增加这个自定义属性作为父级选择器；

<img src="http://pic.xiexuefeng.cc/markdown/image-20220624154536271.png?imageslim" alt="image-20220624154536271" style="zoom:50%;" />

<img src="http://pic.xiexuefeng.cc/markdown/image-20220624154649774.png?imageslim" alt="image-20220624154649774" style="zoom:50%;" />

目前也有人推动这个语法从新进入`CSS`规范，但是应该更加全面，不过该提案目前进展缓慢：

- [CSS Scoping Module Level 1](https://www.w3.org/TR/css-scoping-1/)
- [[css-scoping] Please bring back scoped styles · Issue #3547 · w3c/csswg-drafts](https://github.com/w3c/csswg-drafts/issues/3547)



#### 如何隔离父级样式

说到底，上面讨论的本质上无非就是相当于设置某个区域的样式，而不让其污染到更外层的元素；但是根据样式天然的继承关系就可以知道，父级应用的样式可以很轻易的污染到子级应用的样式。

其实根据原理也很简单，只需要对父级应用样式所有的`rule`都增加对子级应用容器元素的`not`伪类选择器即可，如：

```css
.css-rule-xxx:not(.child-app-1 *, .child-app-n *) {
  /* 样式 */
}
```

这种方法**固然暴力**，但是可用。

#### 一个相关的——`:scope`伪类

- [:scope - CSS（层叠样式表） | MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/:scope)



[^1]: https://github.com/umijs/qiankun/blob/9f345509dc08ef042b24991873b17e301093b62a/src/sandbox/patchers/css.ts#L210
[^2]: https://github.com/umijs/qiankun/blob/9f345509dc08ef042b24991873b17e301093b62a/src/sandbox/patchers/dynamicAppend/common.ts#L110
[^3]: https://github.com/umijs/qiankun/blob/9f345509dc08ef042b24991873b17e301093b62a/src/sandbox/patchers/dynamicAppend/common.ts#L136
[^4]: https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/style#attr-scoped
[^5]: https://github.com/umijs/qiankun/blob/9f345509dc08ef042b24991873b17e301093b62a/src/sandbox/patchers/dynamicAppend/common.ts#L166
[^6]: https://github.com/umijs/qiankun/blob/9f345509dc08ef042b24991873b17e301093b62a/src/sandbox/patchers/dynamicAppend/common.ts#L301
[^7]: https://github.com/umijs/qiankun/blob/9f345509dc08ef042b24991873b17e301093b62a/src/sandbox/patchers/dynamicAppend/forStrictSandbox.ts#L37
[^8]: https://github.com/kuitos/import-html-entry/blob/09cc30adb60317556ac35b2d58e08a8398d75007/src/index.js#L151
[^9]: https://github.com/umijs/qiankun/blob/9f345509dc08ef042b24991873b17e301093b62a/src/sandbox/proxySandbox.ts#L95
[^10]: https://github.com/umijs/qiankun/blob/9f345509dc08ef042b24991873b17e301093b62a/src/sandbox/proxySandbox.ts#L255-L290
[^11]: https://github.com/umijs/qiankun/blob/9f345509dc08ef042b24991873b17e301093b62a/src/sandbox/proxySandbox.ts#L212-L249
[^12]: https://github.com/umijs/qiankun/blob/9f345509dc08ef042b24991873b17e301093b62a/src/sandbox/proxySandbox.ts#L145
[^13]: https://github.com/kuitos/import-html-entry/blob/09cc30adb60317556ac35b2d58e08a8398d75007/src/index.js#L62
[^14]: [with - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/with#performance_pro_contra)
[^15]: https://github.com/kuitos/import-html-entry/blob/09cc30adb60317556ac35b2d58e08a8398d75007/src/index.js#L59
