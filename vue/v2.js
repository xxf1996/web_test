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

class Watcher{ // 相当于一个订阅者？
    constructor(name){
        Dep.target = this;
        this.name = name;
    }

    update(){ // 更新操作
        console.log("Watcher => " + this.name + " 更新了");
    }
}

function observer(obj) { // 对指定对象obj的每个属性进行『监听』
    Object.keys(obj).forEach((key) => {
        const val = obj[key];
        const dep = new Dep(); // 该对象某一属性的『订阅者列表』
        Object.defineProperty(obj, key, { // 对对象的某一属性进行控制
            enumerable: true, // 可枚举
            configurable: true, // 可修改
            set: function setter(newVal) { // setter
                if(newVal !== val){
                    dep.notify();
                    // console.log(dep.subs);
                    console.log("new Value => " + key + ":" + newVal);
                }
            },
            get: function getter() { // getter
                dep.addSub(Dep.target);
                console.log(dep.subs);
                console.log("get key => " + key);
                return val;
            }
        });
    });
}

let obj1 = {
    name: "xxf",
    age: 22
};

observer(obj1);

new Watcher("w1");

console.log(obj1.name);

obj1.name = "xyz";