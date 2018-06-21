let ballList = []; // trailBall列表
let colorList = [
    '#cc6f3f',
    '#3cf',
    '#f36',
    '#fccf56',
    '#78f523'
]; // 颜列表
const p5V = p5.Vector; // 二维向量对象（p5.js）

class trailBall{ // 拖尾球类
    constructor(c, size, px, py){
        this.c = c; // 球的颜色
        this.r = random(50, 120); // 球的围绕半径
        this.size = size; // 球自身的半径
        this.cur = createVector(px, py); // 球目前位置
        this.next = createVector(px, py); // 球下一步位置
        this.speed = random(2, 5); // 速度
        this.speedX = random(1.5, 3); // 速度倍率
        this.target = createVector(px, py); // 围绕目标点

        return this;
    }

    move() { // 距离过远时按照弧形路径靠近目标点
        let head = this.cur;
        let center = p5V.sub(head, this.target);
        center.rotate(this.speed / 180);
        let delta = center.setMag(center.mag() - center.mag() / this.r * this.speed);
        this.next = p5V.add(this.target, delta);
    }

    run() { // 对目标点进行匀速圆周运动
        let head = this.cur;
        let center = p5V.sub(this.target, head);
        let tangent = center.copy();
        tangent.rotate(- HALF_PI);
        let delta = tangent.setMag(this.speed);
        let nextPos = p5V.sub(this.target, p5V.add(head, delta));
        let dMag = nextPos.mag() - center.mag();
        let dVector = nextPos.setMag(dMag);
        this.next = p5V.add(p5V.add(head, delta), dVector);
    }

    action() { // 根据与目标点的距离获取下一步位置
        let d = p5V.sub(this.target, this.cur);
        let distance = d.mag();
        if(distance > 1){
            if(distance > this.r){
                this.move();
            }else{
                this.run();
            }
        }
        this.draw();
        this.cur = this.next.copy();
    }

    draw() { // 绘制
        let changeColor = color(this.c);
        fill(changeColor);
        stroke(changeColor);
        strokeWeight(this.size * 2); // 将直线宽度设置为球的直径
        line(this.cur.x, this.cur.y, this.next.x, this.next.y); // 从当前点到下一步绘制直线
    }
}

function setup() { // 初始化
    createCanvas(window.innerWidth, window.innerHeight);
    background(30);
    noStroke();
    randomBall(25);
}

function draw(){
    background(30, 30, 30, 15);
    for(let i in ballList){
        ballList[i].action();
    }
}

function mouseMoved() { // 绑定鼠标移动事件，并将当前鼠标位置设置为目标点
    let nextT = createVector(mouseX, mouseY);
    for(let i in ballList){
        ballList[i].target = nextT;
    }
}

function randomBall(num) { // 随机生成拖尾球
    for(let i = 0; i < num; i++){
        ballList.push(new trailBall(random(colorList), random(1, 3), round(random(50, width - 50)), round(random(50, height - 100))));
    }
}