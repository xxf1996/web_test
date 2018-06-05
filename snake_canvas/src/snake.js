let main;
let size = 10; // 方块尺寸
let rowNum = 40; // 地图行数
let colNum = 60; // 地图列数
let during = 200; // 蛇前进的间隔时间，时间越短速度越快
let curDirection = [1, 0]; // 蛇的前进方向
let nextDirection = curDirection.slice(0); // 蛇的下一步方向（主要是为了避免在间隔时间内进行多次方向变更）
let snake = [
    [20, 10],
    [20, 11],
    [20, 12],
    [20, 13]
]; // 蛇身方块（元素为x和y坐标，实际上是二维地图的索引）
let food = []; // 食物方块
let prev, cur; // prev为上次更新蛇身的时间，cur代表现在的时间
let play = true; // 是否处于游戏状态，false代表暂停
let gameOver = false; // 是否游戏结束，true代表结束
let mapIndex; // 二维地图的索引，默认元素全为true，true代表为空元素
let score = 0; // 所吃食物数量

function setup() {
    main = createCanvas(colNum * size, rowNum * size);
    background(255);
    getMapIndex(); // 初始化空白地图
    randomFood(5); // 随机出现食物
    showSnake(); // 显示『蛇身』
    showFood(); // 显示『食物』
    prev = new Date().getTime();
}

function draw() {
    cur = new Date().getTime();
    if(cur - prev > during && play && !gameOver){ // 根据时间间隔，游戏状态以及游戏是否结束，来决定是否前进并更新
        prev = cur;
        background(255);
        move();
        showFood();
        showSnake();
    }
}

function move() { // 『蛇身』前进一步操作
    let eat = false; // 表示前进后是否吃到食物

    if(!isSameDirection(curDirection, nextDirection)) curDirection = nextDirection; // 更新前进方向

    let nextX = snake[0][0] + curDirection[0];
    let nextY = snake[0][1] + curDirection[1];
    let next = [nextX, nextY]; // 前进一步后所在位置

    for(let i = 0; i < food.length; i++){ // 判断下一步位置是否为食物
        if(isSameDirection(food[i], next)){ // 若为食物，添加为『蛇身』
            eat = true; // 吃到了
            score++; // 食物数量增加
            snake.unshift(food[i]); // 添加到『蛇身』列表
            food.splice(i, 1); // 从『食物』列表中去除
            randomFood(1); // 随机再补充一块食物
            if(score % 10 === 0){ // 根据分数相应增加食物和速度
                randomFood(1);
                if(during > 60){
                    during -= 20;
                }
            }
            break;
        }
    }

    if(!eat){ // 没吃到的话
        if(isEatSelf(next) || isOut(next)){ // 判断是否咬到自己或『撞墙』
            gameOver = true; // 游戏结束
        }else{ // 否则正常前进
            snake.pop(); // 去尾增头
            snake.unshift(next);
        }
    }
}

function showSnake() { // 根据蛇身列表显示『蛇身』
    snake.forEach(function (elem, idx) {
        rect(elem[0]*size, elem[1]*size, size, size);
        if(idx === 0){
            fill(60, 220, 240);
        }else{
            fill(0);
        }
        rect(elem[0]*size + 2, elem[1]*size + 2, size - 4, size - 4);
        fill(255);
    });
}

function showFood() { // 根据食物列表显示『食物』
    fill(240, 30, 30);
    noStroke();
    food.forEach(function (elem) {
        rect(elem[0]*size, elem[1]*size, size, size);
    });
    fill(255);
    stroke(0);
}

function keyPressed() { // 监听按键按下事件
    // 蛇身不能后退，即不能选择与目前前进方向相反的方向
    switch(keyCode){
        case 37: // left
            if(!isSameDirection(curDirection, [1, 0]) && play) nextDirection = [-1, 0];
            break;
        case 39: // right
            if(!isSameDirection(curDirection, [-1, 0]) && play) nextDirection = [1, 0];
            break;
        case 38: // up
            if(!isSameDirection(curDirection, [0, 1]) && play) nextDirection = [0, -1];
            break;
        case 40: // down
            if(!isSameDirection(curDirection, [0, -1]) && play) nextDirection = [0, 1];
            break;
        case 32: // 空格，按下空格切换游戏状态（暂停或继续）
            play = !play;
            break;
    }
}

function isSameDirection(a, b) { // 判断二维索引是否一致
    return a[0] === b[0] && a[1] === b[1];
}

function isEatSelf(next) { // 判断下一步是否咬到自己
    let result = false;

    for(let i = 0; i < snake.length; i++){
        if(isSameDirection(next, snake[i])){
            result = true;
            break;
        }
    }

    return result;
}

function isOut(next) { // 判断下一步是否撞墙
    return next[0] < 0 || next[1] < 0 || next[0] > colNum - 1 || next[1] > rowNum - 1;
}

function getMapIndex() { // 初始化空白二维地图索引
    mapIndex = [];
    for(let y = 0; y < rowNum; y++){
        let row = [];
        for(let x = 0; x < colNum; x++){
            row.push(true);
        }
        mapIndex.push(row);
    }
}

function randomFood(num) { // 随机出现指定数量的食物
    let idx = mapIndex.slice(0);
    let obj = snake.concat(food); // 非空白元素的索引集合
    let options = []; // 可选的索引，即所有的空白元素的索引集合

    obj.forEach(function (elem) {
        idx[elem[1]][elem[0]] = false; // 标记非空白元素
    });

    for(let y = 0; y < rowNum; y++) {
        for (let x = 0; x < colNum; x++) {
            if(idx[y][x]) options.push([x, y]); // 添加空白元素索引
        }
    }

    for(let i = 0; i < num; i++){
        if(options.length < 1) break;
        let randID = floor(random(0, options.length)); // 从空白元素中随机选择一个
        food.push(options[randID]);
        options.splice(randID, 1); // 将所选空白元素从原数组中删除，避免后面『重复』选择
    }
}