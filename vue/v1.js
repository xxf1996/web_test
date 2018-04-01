function observer(obj) {
    Object.keys(obj).forEach((key) => {
        let val = obj[key];
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            set: function (newVal) {
                console.log("new Value => " + key + ":" + newVal);
            },
            get: function () {
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

obj1.age = 18;

console.log(obj1.name);