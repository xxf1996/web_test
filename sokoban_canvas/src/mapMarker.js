let ground, wall, box, subject, people;
let gui, setting, blockLine;
let canvasCreated = false;
let map, main;
let mapWidth, mapHeight;
let elemType = [];
let manPos;

function preload() {
    ground = loadImage('src/ground.png'); // 加载图片
    wall = loadImage('src/wall.png');
    box = loadImage('src/box.png');
    subject = loadImage('src/point.png');
    people = loadImage('src/people.png');
    setting = { // GUI默认参数
        col: 30,
        row: 20,
        size: 20,
        type: 1,
        line: true,
        reset: resetMap,
        save: saveMap
    };
    loadMap('src/map.json'); // 加载地图
    gui = new dat.GUI(); // 初始化GUI并绑定参数
    gui.add(setting, 'col').name('列数').listen();
    gui.add(setting, 'row').name('行数').listen();
    gui.add(setting, 'size').name('方格大小');
    gui.add(setting, 'type', {'背景':0, '墙':1, '箱子':2, '目标点':3, '人':4}).name('元素类型');
    blockLine = gui.add(setting, 'line').name('显示分割线');
    blockLine.onChange(drawMap);
    gui.add(setting, 'reset').name('重置地图');
    gui.add(setting, 'save').name('保存地图');
    initMap(); // 初始化地图元素
}

function setup() {
    elemType = [ground, wall, box, subject];
    drawMap();
    main.mousePressed(mouseClick); // 在canvas上绑定监听函数
    main.mouseMoved(mouseMove);
}

function drawMap() { // 绘制地图
    mapWidth = setting.col * setting.size;
    mapHeight = setting.row * setting.size;
    if(canvasCreated){
        resizeCanvas(mapWidth, mapHeight);
    }else{
        main = createCanvas(mapWidth, mapHeight);
        canvasCreated = true;
    }
    background(255);
    for(let y = 0; y < setting.row; y++){
        for(let x = 0; x < setting.col; x++){
            image(elemType[map[y][x]], x*setting.size, y*setting.size, setting.size, setting.size);
        }
    }
    if(manPos != undefined){
        image(people, manPos[0]*setting.size, manPos[1]*setting.size, setting.size, setting.size);
    }
    if(setting.line){
        drawLine();
    }
}

function initMap() { // 初始化地图元素
    map = [];
    for(let y = 0; y < setting.row; y++){
        let rowArr = [];
        for(let x = 0; x < setting.col; x++){
            rowArr.push(0);
        }
        map.push(rowArr);
    }
}

function drawLine() { // 绘制方格分割线
    stroke('#ccc');
    for(let y = 1; y < setting.row; y++){
        line(0, y * setting.size, mapWidth, y * setting.size);
    }
    for(let x = 1; x < setting.col; x++){
        line(x * setting.size, 0, x * setting.size, mapHeight);
    }
    stroke('#000');
}

function mouseClick() { // 点击地图在相应位置绘制地图元素
    let x = floor(mouseX / setting.size);
    let y = floor(mouseY / setting.size);
    if(setting.type == 4){
        manPos = [x, y];
    }else{
        map[y][x] = setting.type;
    }

    drawMap();
}

function mouseMove() { // 鼠标拖动摆放元素
    if(mouseIsPressed){
        mouseClick();
    }
}

function resetMap() { // 重置地图
    initMap();
    drawMap();
}

function saveMap() { // 保存地图信息为json格式
    let mapData = {
        col: setting.col,
        row: setting.row,
        data: map,
        pos: manPos
    };

    saveJSON(mapData, 'map.json');
}

function loadMap(src) { // 加载json格式的地图信息
    loadJSON(src, function (res) {
        setting.col = res.col;
        setting.row = res.row;
        map = res.data;
        manPos = res.pos;
    });
}