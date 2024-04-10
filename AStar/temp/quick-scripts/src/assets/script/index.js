"use strict";
cc._RF.push(module, '62ec0cdYUlN5bQZkBvtBefO', 'index');
// script/index.ts

"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var AStar_1 = require("./util/AStar");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var NewClass = /** @class */ (function (_super) {
    __extends(NewClass, _super);
    function NewClass() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.Map = null; //地图
        _this.Folder_box = null; //所有方块都在这个node下
        _this.Folder_route = null; //路块在这个节点下
        _this.Node_start = null; //起始节点  红色方块
        _this.Node_end = null; //结束节点  蓝色方块
        _this.Node_go = null; //移动节点  绿色方块
        _this.Prefab_route = null; //路线提示方块
        _this.layer_road = null; //临时记录
        _this.layer_wall = null; //临时记录
        _this.start_point = null; //起始point
        _this.end_point = null; //结束point
        _this.map_point = new Map(); //地图 索引
        _this.route = []; //路线
        _this.size = null; //地图尺寸
        /**
         * 按照路线移动
         */
        _this.i = 0;
        return _this;
    }
    NewClass.prototype.onLoad = function () {
        this.readMap();
    };
    /**
     * 读取地图，得到可以走的全部地块索引   （地图的xy是从左上角到右下角）
     */
    NewClass.prototype.readMap = function () {
        this.layer_road = this.Map.getLayer("road").getComponent(cc.TiledLayer);
        this.layer_wall = this.Map.getLayer("wall").getComponent(cc.TiledLayer);
        this.size = this.Map.getMapSize();
        //地板  全部加进去
        for (var x = 0; x < this.size.width; x++) {
            for (var y = 0; y < this.size.height; y++) {
                var tiled = this.layer_road.getTiledTileAt(x, y, true);
                if (tiled.gid != 0) {
                    var point = new AStar_1.Point(x, y);
                    this.map_point.set(x + y * this.size.width, point);
                }
            }
        }
        //墙  不要
        for (var x = 0; x < this.size.width; x++) {
            for (var y = 0; y < this.size.height; y++) {
                var tiled = this.layer_wall.getTiledTileAt(x, y, true);
                if (tiled.gid != 0) {
                    this.map_point.delete(x + y * this.size.width);
                }
            }
        }
    };
    /**
     * 设定一个起始位置
     */
    NewClass.prototype.setStart = function () {
        this.start_point = this.getRandomPoint();
        this.Node_start.setPosition(this.layer_road.getTiledTileAt(this.start_point.x, this.start_point.y, false).node.position);
    };
    /**
     * 设定一个终点位置
     */
    NewClass.prototype.setEnd = function () {
        this.end_point = this.getRandomPoint();
        this.Node_end.setPosition(this.layer_road.getTiledTileAt(this.end_point.x, this.end_point.y, false).node.position);
    };
    /**
     * 获取一个随机的point
     */
    NewClass.prototype.getRandomPoint = function () {
        var r = Math.floor(Math.random() * this.size.width * this.size.height);
        var point = this.map_point.get(r);
        if (!point) {
            point = this.getRandomPoint();
        }
        return point;
    };
    /**
     * 生成路线
     */
    NewClass.prototype.getRoute = function () {
        var _this = this;
        if (!this.start_point) {
            console.error("你还没有设置起点");
            return;
        }
        if (!this.end_point) {
            console.error("你还没有设置终点");
            return;
        }
        //调用工具类获取路线
        this.route = AStar_1.default.getRoute(this.start_point, this.end_point, this.map_point, this.size);
        if (this.route.length == 0) {
            console.log("没有找到路径");
        }
        //黑色方块提示出来看看,先清空之前的
        this.Folder_route.removeAllChildren();
        this.i = 0;
        this.route.forEach(function (point) {
            var tiled = _this.layer_road.getTiledTileAt(point.x, point.y, false);
            var node = cc.instantiate(_this.Prefab_route);
            _this.Folder_route.addChild(node);
            node.setPosition(tiled.node.position);
        });
    };
    NewClass.prototype.move = function () {
        var _this = this;
        if (this.i == this.route.length) { //表示走完了
            return;
        }
        var point = this.route[this.i++];
        cc.tween(this.Node_go).to(.2, { position: this.layer_road.getTiledTileAt(point.x, point.y, false).node.position }).call(function () { _this.move(); }).start();
    };
    __decorate([
        property(cc.TiledMap)
    ], NewClass.prototype, "Map", void 0);
    __decorate([
        property(cc.Node)
    ], NewClass.prototype, "Folder_box", void 0);
    __decorate([
        property(cc.Node)
    ], NewClass.prototype, "Folder_route", void 0);
    __decorate([
        property(cc.Node)
    ], NewClass.prototype, "Node_start", void 0);
    __decorate([
        property(cc.Node)
    ], NewClass.prototype, "Node_end", void 0);
    __decorate([
        property(cc.Node)
    ], NewClass.prototype, "Node_go", void 0);
    __decorate([
        property(cc.Prefab)
    ], NewClass.prototype, "Prefab_route", void 0);
    NewClass = __decorate([
        ccclass
    ], NewClass);
    return NewClass;
}(cc.Component));
exports.default = NewClass;

cc._RF.pop();