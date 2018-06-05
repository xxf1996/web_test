let ground, wall, box, subject, people;
let elemType = [];
let jsonData, map, col, row;
let size = 20;
let manPos;

function preload() { // 预先加载图片资源
    ground = loadImage('src/ground.png');
    wall = loadImage('src/wall.png');
    box = loadImage('src/box.png');
    subject = loadImage('src/point.png');
    people = loadImage('src/people.png');
    jsonData = loadJSON('src/map.json'); // 加载地图信息
}

function setup() {
    elemType = [ground, wall, box, subject];
    map = jsonData.data.slice(0);
    col = jsonData.col;
    row = jsonData.row;
    manPos = jsonData.pos.slice(0);
    createCanvas(col * size, row * size);
    drawMap();
}

function drawMap() { // 根据二维地图数据的元素类型绘制各元素
    background(255);
    for(let y = 0; y < row; y++){
        for(let x = 0; x < col; x++){
            image(elemType[map[y][x]], x*size, y*size, size, size);
        }
    }
    image(people, manPos[0]*size, manPos[1]*size, size, size)
}

function keyPressed() {
    switch(keyCode){
        case 37: // left
            move([-1, 0]);
            break;
        case 39: // right
            move([1, 0]);
            break;
        case 38: // up
            move([0, -1]);
            break;
        case 40: // down
            move([0, 1]);
            break;
        default:
            break;
    }
}

function move(direction) { // 移动判断
    let nextX = manPos[0] + direction[0]; // 下一步坐标
    let nextY = manPos[1] + direction[1];
    let change = false; // 地图状态是否改变

    switch(parseInt(map[nextY][nextX])){ // 根据下一步坐标所处的类型选择走法
        case 0:
        case 3:
            manPos = [nextX, nextY];
            change = true;
            break;
        case 2:
            let nx = nextX + direction[0];
            let ny = nextY + direction[1];
            if(map[ny][nx] == 0 || map[ny][nx] == 3){
                manPos = [nextX, nextY];
                map[ny][nx] = 2;
                if(jsonData.data[nextY][nextX] == 3){
                    map[nextY][nextX] = 2;
                }else{
                    map[nextY][nextX] = 0;
                }
                change = true;
            }
            break;
        default:
            break;
    }

    if(change) drawMap();
}