"use strict";
cc._RF.push(module, '05f35CaCepNEpykvXMMJg4o', 'AStar');
// script/util/AStar.ts

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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Point = void 0;
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var Point = /** @class */ (function () {
    function Point(x, y) {
        this.G = 0; //G = 从起点A，沿着产生的路径，移动到网格上指定方格的移动耗费。
        this.H = 0; //H = 从网格上那个方格移动到终点B的预估移动耗费
        this.F = 0; //F = G + H
        this.father = null; //这个点的上一个点，通过回溯可以找到起点 
        this.is_close = false; //是否关闭搜索
        this.x = x;
        this.y = y;
    }
    return Point;
}());
exports.Point = Point;
var AStar = /** @class */ (function (_super) {
    __extends(AStar, _super);
    function AStar() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * 获取路线 （此寻路不走斜线）
     */
    AStar.getRoute = function (start, end, map, size) {
        var _this = this;
        //清空上次寻路，并赋值
        this.is_find = false;
        this.arr_open = [];
        this.pppp = null;
        this.start = __assign({}, start);
        this.end = __assign({}, end);
        this.map = new Map();
        map.forEach(function (value, key) {
            _this.map.set(key, __assign({}, value)); //map 里放的是传过来的对象，使用深拷贝
        });
        this.size = size;
        map.get(this.start.x + this.start.y * this.size.width).G = 0; //起点的G是0
        //开始寻路
        var route = new Array();
        try {
            this.search(this.start); //内存不够会报错，一般是起点或终点封闭
        }
        catch (error) {
            console.error("位置不对");
            return route;
        }
        if (this.pppp) {
            this.getFather(this.pppp, route);
        }
        return route;
    };
    AStar.search = function (point) {
        var _this = this;
        if (point.x == this.end.x && point.y == this.end.y) {
            this.is_find = true;
            this.pppp = point;
            return;
        }
        var arr = this.getAround(point);
        arr.forEach(function (p) {
            _this.setFather(p, point);
        });
        //arr按照F排序 从小到大
        this.arr_open.sort(this.compare);
        //递归继续找
        this.arr_open.forEach(function (pp, index, arr) {
            if (pp.is_close) { //删除没用的
                arr.splice(index, 1);
            }
            if (!_this.is_find) {
                _this.search(pp);
            }
        });
    };
    /**
     * 获取周围4个点，上下左右
     */
    AStar.getAround = function (point) {
        point.is_close = true;
        var arr = new Array();
        var index;
        var p;
        //上
        if (point.y != 0) { //到顶了，没有上
            index = point.x + (point.y - 1) * this.size.width;
            p = this.map.get(index);
            if (p && !p.is_close) {
                arr.push(this.map.get(index));
                this.arr_open.push(this.map.get(index)); //我也要一份
            }
        }
        //下
        if (point.y + 1 != this.size.height) { //到底了，没有下
            index = point.x + (point.y + 1) * this.size.width;
            p = this.map.get(index);
            if (p && !p.is_close) {
                arr.push(this.map.get(index));
                this.arr_open.push(this.map.get(index));
            }
        }
        //左
        if (point.x != 0) { //同理
            index = point.x - 1 + point.y * this.size.width;
            p = this.map.get(index);
            if (p && !p.is_close) {
                arr.push(this.map.get(index));
                this.arr_open.push(this.map.get(index));
            }
        }
        //右
        if (point.x + 1 != this.size.width) { //同理
            index = point.x + 1 + point.y * this.size.width;
            p = this.map.get(index);
            if (p && !p.is_close) {
                arr.push(this.map.get(index));
                this.arr_open.push(this.map.get(index));
            }
        }
        return arr;
    };
    /**
     * point换父亲,并重新计算G、H、F
     */
    AStar.setFather = function (son, father) {
        if (!son.father || son.father.G > father.G) {
            son.father = father;
            son.G = son.father.G + 1;
            son.H = Math.abs(son.x - this.end.x) + Math.abs(son.y - this.end.y);
            son.F = son.G + son.H;
        }
    };
    /**
     * 比较器
     */
    AStar.compare = function (p1, p2) {
        if (p1.F > p2.F) {
            return 1;
        }
        else {
            return -1;
        }
    };
    /**
     * 递归 把祖宗放进route里面
     */
    AStar.getFather = function (point, route) {
        var father = point.father;
        if (father) {
            this.getFather(father, route);
        }
        route.push(point);
    };
    AStar.start = null; //起点
    AStar.end = null; //终点
    AStar.map = null; //地图point
    AStar.size = null; //地图尺寸
    AStar.arr_open = []; //开放队列
    AStar.pppp = null; //执行完寻路，它就有值了，除非没找到
    /**
     * 寻路
     */
    AStar.is_find = false; //是否已经找到路线
    AStar = __decorate([
        ccclass
    ], AStar);
    return AStar;
}(cc.Component));
exports.default = AStar;

cc._RF.pop();