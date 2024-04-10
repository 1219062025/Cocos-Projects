
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/util/AStar.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
                    }
                    if (nodeEnv) {
                        __define(__module.exports, __require, __module);
                    }
                    else {
                        __quick_compile_project__.registerModuleFunc(__filename, function () {
                            __define(__module.exports, __require, __module);
                        });
                    }
                })();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcc2NyaXB0XFx1dGlsXFxBU3Rhci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBTSxJQUFBLEtBQXdCLEVBQUUsQ0FBQyxVQUFVLEVBQW5DLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBa0IsQ0FBQztBQUU1QztJQUdJLGVBQVksQ0FBUyxFQUFFLENBQVM7UUFJaEMsTUFBQyxHQUFVLENBQUMsQ0FBQyxDQUFHLG1DQUFtQztRQUNuRCxNQUFDLEdBQVUsQ0FBQyxDQUFDLENBQUcsMkJBQTJCO1FBQzNDLE1BQUMsR0FBVSxDQUFDLENBQUMsQ0FBRyxXQUFXO1FBQzNCLFdBQU0sR0FBUyxJQUFJLENBQUMsQ0FBRyxzQkFBc0I7UUFDN0MsYUFBUSxHQUFXLEtBQUssQ0FBQyxDQUFHLFFBQVE7UUFQaEMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNmLENBQUM7SUFNTCxZQUFDO0FBQUQsQ0FaQSxBQVlDLElBQUE7QUFaWSxzQkFBSztBQWVsQjtJQUFtQyx5QkFBWTtJQUEvQzs7SUFvSkEsQ0FBQztJQXpJRzs7T0FFRztJQUNJLGNBQVEsR0FBZixVQUFnQixLQUFZLEVBQUUsR0FBVSxFQUFFLEdBQXVCLEVBQUMsSUFBYTtRQUEvRSxpQkF5QkM7UUF4QkcsWUFBWTtRQUNaLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ25CLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxLQUFLLGdCQUFPLEtBQUssQ0FBQyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxHQUFHLGdCQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQWdCLENB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Q0FBQyxDQUFFLE1BQU07SUFDbkMsVUFBSSxHQUFTLElBQUksQ0FBQyxDQUFPLG1CQUFtQjtJQWlDbkQ7O09BRUc7SUFDSSxhQUFPLEdBQUcsS0FBSyxDQUFDLENBQUksVUFBVTtJQTVDcEIsS0FBSztRQUR6QixPQUFPO09BQ2EsS0FBSyxDQW9KekI7SUFBRCxZQUFDO0NBcEpELEFBb0pDLENBcEprQyxFQUFFLENBQUMsU0FBUyxHQW9KOUM7a0JBcEpvQixLQUFLIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgeyBjY2NsYXNzLCBwcm9wZXJ0eSB9ID0gY2MuX2RlY29yYXRvcjtcclxuXHJcbmV4cG9ydCBjbGFzcyBQb2ludCB7XHJcbiAgICB4OiBudW1iZXI7XHJcbiAgICB5OiBudW1iZXI7XHJcbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgIH1cclxuICAgIEc6bnVtYmVyID0gMDsgICAvL0cgPSDku47otbfngrlB77yM5rK/552A5Lqn55Sf55qE6Lev5b6E77yM56e75Yqo5Yiw572R5qC85LiK5oyH5a6a5pa55qC855qE56e75Yqo6ICX6LS544CCXHJcbiAgICBIOm51bWJlciA9IDA7ICAgLy9IID0g5LuO572R5qC85LiK6YKj5Liq5pa55qC856e75Yqo5Yiw57uI54K5QueahOmihOS8sOenu+WKqOiAl+i0uVxyXG4gICAgRjpudW1iZXIgPSAwOyAgIC8vRiA9IEcgKyBIXHJcbiAgICBmYXRoZXI6UG9pbnQgPSBudWxsOyAgIC8v6L+Z5Liq54K555qE5LiK5LiA5Liq54K577yM6YCa6L+H5Zue5rqv5Y+v5Lul5om+5Yiw6LW354K5IFxyXG4gICAgaXNfY2xvc2U6Ym9vbGVhbiA9IGZhbHNlOyAgIC8v5piv5ZCm5YWz6Zet5pCc57SiXHJcbn1cclxuXHJcbkBjY2NsYXNzXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFTdGFyIGV4dGVuZHMgY2MuQ29tcG9uZW50IHtcclxuXHJcbiAgICBzdGF0aWMgc3RhcnQ6UG9pbnQgPSBudWxsOyAgICAgIC8v6LW354K5XHJcbiAgICBzdGF0aWMgZW5kOlBvaW50ID0gbnVsbDsgICAgICAgIC8v57uI54K5XHJcbiAgICBzdGF0aWMgbWFwOiBNYXA8bnVtYmVyLCBQb2ludD4gPSBudWxsOyAgIC8v5Zyw5Zu+cG9pbnRcclxuICAgIHN0YXRpYyBzaXplOiBjYy5TaXplID0gbnVsbDsgICAgLy/lnLDlm77lsLrlr7hcclxuXHJcbiAgICBzdGF0aWMgYXJyX29wZW46QXJyYXk8UG9pbnQ+ID0gW107ICAvL+W8gOaUvumYn+WIl1xyXG4gICAgc3RhdGljIHBwcHA6UG9pbnQgPSBudWxsOyAgICAgICAvL+aJp+ihjOWujOWvu+i3r++8jOWug+WwseacieWAvOS6hu+8jOmZpOmdnuayoeaJvuWIsFxyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPlui3r+e6vyDvvIjmraTlr7vot6/kuI3otbDmlpznur/vvIlcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldFJvdXRlKHN0YXJ0OiBQb2ludCwgZW5kOiBQb2ludCwgbWFwOiBNYXA8bnVtYmVyLCBQb2ludD4sc2l6ZTogY2MuU2l6ZSkge1xyXG4gICAgICAgIC8v5riF56m65LiK5qyh5a+76Lev77yM5bm26LWL5YC8XHJcbiAgICAgICAgdGhpcy5pc19maW5kID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5hcnJfb3BlbiA9IFtdO1xyXG4gICAgICAgIHRoaXMucHBwcCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5zdGFydCA9IHsuLi5zdGFydH07XHJcbiAgICAgICAgdGhpcy5lbmQgPSB7Li4uZW5kfTtcclxuICAgICAgICB0aGlzLm1hcCA9IG5ldyBNYXA8bnVtYmVyLFBvaW50PigpOyAgICAgXHJcbiAgICAgICAgbWFwLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5tYXAuc2V0KGtleSx7Li4udmFsdWV9KTsgICAgICAgLy9tYXAg6YeM5pS+55qE5piv5Lyg6L+H5p2l55qE5a+56LGh77yM5L2/55So5rex5ou36LSdXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5zaXplID0gc2l6ZTtcclxuICAgICAgICBtYXAuZ2V0KHRoaXMuc3RhcnQueCt0aGlzLnN0YXJ0LnkqdGhpcy5zaXplLndpZHRoKS5HID0gMDsgICAgICAgLy/otbfngrnnmoRH5pivMFxyXG4gICAgICAgIC8v5byA5aeL5a+76LevXHJcbiAgICAgICAgbGV0IHJvdXRlID0gbmV3IEFycmF5PFBvaW50PigpO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoKHRoaXMuc3RhcnQpOyAgICAgLy/lhoXlrZjkuI3lpJ/kvJrmiqXplJnvvIzkuIDoiKzmmK/otbfngrnmiJbnu4jngrnlsIHpl61cclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi5L2N572u5LiN5a+5XCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gcm91dGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRoaXMucHBwcCl7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0RmF0aGVyKHRoaXMucHBwcCxyb3V0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByb3V0ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWvu+i3r1xyXG4gICAgICovXHJcbiAgICBzdGF0aWMgaXNfZmluZCA9IGZhbHNlOyAgICAvL+aYr+WQpuW3sue7j+aJvuWIsOi3r+e6v1xyXG4gICAgc3RhdGljIHNlYXJjaChwb2ludDpQb2ludCl7XHJcbiAgICAgICAgaWYocG9pbnQueD09dGhpcy5lbmQueCYmcG9pbnQueT09dGhpcy5lbmQueSl7XHJcbiAgICAgICAgICAgIHRoaXMuaXNfZmluZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMucHBwcCA9IHBvaW50O1xyXG4gICAgICAgICAgICByZXR1cm4gO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgYXJyID0gdGhpcy5nZXRBcm91bmQocG9pbnQpO1xyXG4gICAgICAgIGFyci5mb3JFYWNoKHAgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNldEZhdGhlcihwLHBvaW50KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAvL2FycuaMieeFp0bmjpLluo8g5LuO5bCP5Yiw5aSnXHJcbiAgICAgICAgdGhpcy5hcnJfb3Blbi5zb3J0KHRoaXMuY29tcGFyZSk7XHJcbiAgICAgICAgLy/pgJLlvZLnu6fnu63mib5cclxuICAgICAgICB0aGlzLmFycl9vcGVuLmZvckVhY2goKHBwLGluZGV4LGFycik9PntcclxuICAgICAgICAgICAgaWYocHAuaXNfY2xvc2UpeyAgICAgICAgLy/liKDpmaTmsqHnlKjnmoRcclxuICAgICAgICAgICAgICAgIGFyci5zcGxpY2UoaW5kZXgsMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoIXRoaXMuaXNfZmluZCl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlYXJjaChwcCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluWRqOWbtDTkuKrngrnvvIzkuIrkuIvlt6blj7NcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldEFyb3VuZChwb2ludDpQb2ludCl7XHJcbiAgICAgICAgcG9pbnQuaXNfY2xvc2UgPSB0cnVlO1xyXG4gICAgICAgIGxldCBhcnIgPSBuZXcgQXJyYXk8UG9pbnQ+KCk7XHJcbiAgICAgICAgbGV0IGluZGV4Om51bWJlcjtcclxuICAgICAgICBsZXQgcDpQb2ludDtcclxuICAgICAgICAvL+S4ilxyXG4gICAgICAgIGlmKHBvaW50LnkhPTApeyAgICAgLy/liLDpobbkuobvvIzmsqHmnInkuIpcclxuICAgICAgICAgICAgaW5kZXggPSBwb2ludC54Kyhwb2ludC55LTEpKnRoaXMuc2l6ZS53aWR0aDtcclxuICAgICAgICAgICAgcCA9IHRoaXMubWFwLmdldChpbmRleClcclxuICAgICAgICAgICAgaWYocCYmIXAuaXNfY2xvc2Upe1xyXG4gICAgICAgICAgICAgICAgYXJyLnB1c2godGhpcy5tYXAuZ2V0KGluZGV4KSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFycl9vcGVuLnB1c2godGhpcy5tYXAuZ2V0KGluZGV4KSk7ICAgIC8v5oiR5Lmf6KaB5LiA5Lu9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy/kuItcclxuICAgICAgICBpZihwb2ludC55KzEhPXRoaXMuc2l6ZS5oZWlnaHQpeyAgICAgICAgLy/liLDlupXkuobvvIzmsqHmnInkuItcclxuICAgICAgICAgICAgaW5kZXggPSBwb2ludC54Kyhwb2ludC55KzEpKnRoaXMuc2l6ZS53aWR0aDtcclxuICAgICAgICAgICAgcCA9IHRoaXMubWFwLmdldChpbmRleClcclxuICAgICAgICAgICAgaWYocCYmIXAuaXNfY2xvc2Upe1xyXG4gICAgICAgICAgICAgICAgYXJyLnB1c2godGhpcy5tYXAuZ2V0KGluZGV4KSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFycl9vcGVuLnB1c2godGhpcy5tYXAuZ2V0KGluZGV4KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy/lt6ZcclxuICAgICAgICBpZihwb2ludC54IT0wKXsgICAgICAgICAgICAvL+WQjOeQhlxyXG4gICAgICAgICAgICBpbmRleCA9IHBvaW50LngtMStwb2ludC55KnRoaXMuc2l6ZS53aWR0aDtcclxuICAgICAgICAgICAgcCA9IHRoaXMubWFwLmdldChpbmRleClcclxuICAgICAgICAgICAgaWYocCYmIXAuaXNfY2xvc2Upe1xyXG4gICAgICAgICAgICAgICAgYXJyLnB1c2godGhpcy5tYXAuZ2V0KGluZGV4KSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFycl9vcGVuLnB1c2godGhpcy5tYXAuZ2V0KGluZGV4KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy/lj7NcclxuICAgICAgICBpZihwb2ludC54KzEhPXRoaXMuc2l6ZS53aWR0aCl7ICAgICAgICAgICAgIC8v5ZCM55CGXHJcbiAgICAgICAgICAgIGluZGV4ID0gcG9pbnQueCsxK3BvaW50LnkqdGhpcy5zaXplLndpZHRoO1xyXG4gICAgICAgICAgICBwID0gdGhpcy5tYXAuZ2V0KGluZGV4KVxyXG4gICAgICAgICAgICBpZihwJiYhcC5pc19jbG9zZSl7XHJcbiAgICAgICAgICAgICAgICBhcnIucHVzaCh0aGlzLm1hcC5nZXQoaW5kZXgpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXJyX29wZW4ucHVzaCh0aGlzLm1hcC5nZXQoaW5kZXgpKTtcclxuICAgICAgICAgICAgfSBcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGFycjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBvaW505o2i54i25LqyLOW5tumHjeaWsOiuoeeul0fjgIFI44CBRlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgc2V0RmF0aGVyKHNvbjpQb2ludCxmYXRoZXI6UG9pbnQpe1xyXG4gICAgICAgIGlmKCFzb24uZmF0aGVyfHxzb24uZmF0aGVyLkc+ZmF0aGVyLkcpe1xyXG4gICAgICAgICAgICBzb24uZmF0aGVyID0gZmF0aGVyO1xyXG4gICAgICAgICAgICBzb24uRyA9IHNvbi5mYXRoZXIuRysxO1xyXG4gICAgICAgICAgICBzb24uSCA9IE1hdGguYWJzKHNvbi54LXRoaXMuZW5kLngpK01hdGguYWJzKHNvbi55LXRoaXMuZW5kLnkpO1xyXG4gICAgICAgICAgICBzb24uRiA9IHNvbi5HK3Nvbi5IO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOavlOi+g+WZqFxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgY29tcGFyZShwMTpQb2ludCxwMjpQb2ludCl7XHJcbiAgICAgICAgaWYocDEuRj5wMi5GKXtcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDpgJLlvZIg5oqK56WW5a6X5pS+6L+bcm91dGXph4zpnaJcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldEZhdGhlcihwb2ludDpQb2ludCxyb3V0ZTpBcnJheTxQb2ludD4pe1xyXG4gICAgICAgIGxldCBmYXRoZXIgPSBwb2ludC5mYXRoZXI7XHJcbiAgICAgICAgaWYoZmF0aGVyKXtcclxuICAgICAgICAgICAgdGhpcy5nZXRGYXRoZXIoZmF0aGVyLHJvdXRlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcm91dGUucHVzaChwb2ludCk7ICAgIFxyXG4gICAgfVxyXG59XHJcblxyXG4iXX0=