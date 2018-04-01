『知其然而不知其所以然』这会使我们只看到事物的表面结果，而不知道事物为什么会得到这样的结果；`vue.js`框架确实是上手容易，但是想要更深一步的了解为什么这么用，为什么这样用就能得到所需的效果，实在很难一下就想到。框架作为程序中得力的助手，用起来确实使编程效率大大提高，也不需要总是自己从0开始造轮子，但有时候框架背后的**设计思想和机制**更值得去玩味一下，就如同『庖丁解牛』一样洞穿其内部结构，这样用起来的时候就轻松许多，对以后自己的编码也是多一些选择。



## 响应式更新机制

在对某一数据进行绑定后，如果其值发生改变，那么依赖该值的`V`（视图）也会立即进行更新，实际上就是对该数据的值进行了某种『监听』，即发生改变时通知依赖该数据的视图进行更新，这种更新机制其实就是**发布-订阅（观察者）模式**；

发布订阅模式的基本形式：一个发布者（Publisher）有多个订阅者（Subscriber），一旦发布者的内容有所改变就会立马通知所有的订阅者进行『更新』；

因此，在这里发布者就是『被监听』的数据，而订阅者就是那些依赖这个数据的视图（即与该数据进行绑定的视图）；



### v1：如何『监听』数据的改变？

使用`js`内置的函数`Object.defineProperty`即可实现对对象的某一属性值进行『监听』：

```js
/*
    obj: 目标对象
    prop: 需要操作的目标对象的属性名
    descriptor: 描述符
    
    return value 传入对象
*/
Object.defineProperty(obj, prop, descriptor)
```

参数`descriptor`是一个`js`对象，其中可用的属性有`enumerable`（可枚举）、`configurable`（可修改）、`set`（setter访问器）、`get`（getter访问器）；其中`enumerable`和`configurable`的值默认为`false`。而`set`属性则代表设置该属性值时触发的函数，`get`属性则代表访问该属性值时触发的函数；

```js
Object.defineProperty(obj, key, {
    enumerable: true, // 设置为可枚举
    configurable: true, // 设置为可修改
    set: function (newVal) { // setter
        console.log("new Value => " + key + ":" + newVal);
    },
    get: function () { // getter
        console.log("get key => " + key);
        return val;
    }
});
```

因此，可以通过设置`setter`访问器来触发视图更新的操作！



### V2：如何进行『依赖收集』？

在数据改变的时候，到底需要通知哪些视图进行更新呢？所以需要在发布者的内部增加一个订阅者的列表（也就是依赖收集），以便在数据改变时准确的进行通知更新。

```js
class Dep{// 订阅者列表，依赖收集
    constructor(){
        this.subs = [];
    }

    addSub(s){ // 增加订阅者
        this.subs.push(s);
    }

    notify(){ // 通知订阅者更新
        this.subs.forEach((sub) => {
            sub.update();
        });
    }
}
```

关键是在于如何识别『依赖关系』，即哪个视图对这个数据有依赖。



## 参考文档

1. [js中的Object.defineProperty()和defineProperties() - web前端的成长之路 - SegmentFault 思否](https://segmentfault.com/a/1190000011294519)
2. [剖析 Vue.js 内部运行机制 - 染陌同学 - 掘金小册](https://juejin.im/book/5a36661851882538e2259c0f)