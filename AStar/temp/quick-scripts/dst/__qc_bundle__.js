
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/__qc_index__.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}
require('./assets/script/index');
require('./assets/script/util/AStar');

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
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/index.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcc2NyaXB0XFxpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxzQ0FBNEM7QUFFdEMsSUFBQSxLQUFzQixFQUFFLENBQUMsVUFBVSxFQUFsQyxPQUFPLGFBQUEsRUFBRSxRQUFRLGNBQWlCLENBQUM7QUFHMUM7SUFBc0MsNEJBQVk7SUFBbEQ7UUFBQSxxRUErSEM7UUE1SEcsU0FBRyxHQUFlLElBQUksQ0FBQyxDQUFJLElBQUk7UUFHL0IsZ0JBQVUsR0FBVyxJQUFJLENBQUMsQ0FBUyxlQUFlO1FBRWxELGtCQUFZLEdBQVcsSUFBSSxDQUFDLENBQVEsVUFBVTtRQUc5QyxnQkFBVSxHQUFXLElBQUksQ0FBQyxDQUFHLFlBQVk7UUFFekMsY0FBUSxHQUFXLElBQUksQ0FBQyxDQUFLLFlBQVk7UUFFekMsYUFBTyxHQUFXLElBQUksQ0FBQyxDQUFNLFlBQVk7UUFFekMsa0JBQVksR0FBYSxJQUFJLENBQUMsQ0FBRSxRQUFRO1FBRXhDLGdCQUFVLEdBQWlCLElBQUksQ0FBQyxDQUFJLE1BQU07UUFDMUMsZ0JBQVUsR0FBaUIsSUFBSSxDQUFDLENBQUksTUFBTTtRQUUxQyxpQkFBVyxHQUFTLElBQUksQ0FBQyxDQUFLLFNBQVM7UUFDdkMsZUFBUyxHQUFTLElBQUksQ0FBQyxDQUFPLFNBQVM7UUFDdkMsZUFBUyxHQUFxQixJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUssT0FBTztRQUNwRCxXQUFLLEdBQWdCLEVBQUUsQ0FBQyxDQUFJLElBQUk7UUFDaEMsVUFBSSxHQUFXLElBQUksQ0FBQyxDQUFRLE1BQU07UUEwRmxDOztXQUVHO1FBQ0gsT0FBQyxHQUFVLENBQUMsQ0FBQzs7SUFRakIsQ0FBQztJQW5HRyx5QkFBTSxHQUFOO1FBQ0ksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ25CLENBQUM7SUFFRDs7T0FFRztJQUNILDBCQUFPLEdBQVA7UUFDSSxJQUFJLENB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Q1E7SUFFMUI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzs4Q0FDTTtJQUV4QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDOzZDQUNLO0lBRXZCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUM7a0RBQ1U7SUFqQmIsUUFBUTtRQUQ1QixPQUFPO09BQ2EsUUFBUSxDQStINUI7SUFBRCxlQUFDO0NBL0hELEFBK0hDLENBL0hxQyxFQUFFLENBQUMsU0FBUyxHQStIakQ7a0JBL0hvQixRQUFRIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEFTdGFyLCB7IFBvaW50IH0gZnJvbSBcIi4vdXRpbC9BU3RhclwiO1xyXG5cclxuY29uc3Qge2NjY2xhc3MsIHByb3BlcnR5fSA9IGNjLl9kZWNvcmF0b3I7XHJcblxyXG5AY2NjbGFzc1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOZXdDbGFzcyBleHRlbmRzIGNjLkNvbXBvbmVudCB7XHJcblxyXG4gICAgQHByb3BlcnR5KGNjLlRpbGVkTWFwKVxyXG4gICAgTWFwOmNjLlRpbGVkTWFwID0gbnVsbDsgICAgLy/lnLDlm75cclxuXHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIEZvbGRlcl9ib3g6Y2MuTm9kZSA9IG51bGw7ICAgICAgICAgLy/miYDmnInmlrnlnZfpg73lnKjov5nkuKpub2Rl5LiLXHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIEZvbGRlcl9yb3V0ZTpjYy5Ob2RlID0gbnVsbDsgICAgICAgIC8v6Lev5Z2X5Zyo6L+Z5Liq6IqC54K55LiLXHJcblxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBOb2RlX3N0YXJ0OmNjLk5vZGUgPSBudWxsOyAgIC8v6LW35aeL6IqC54K5ICDnuqLoibLmlrnlnZdcclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgTm9kZV9lbmQ6Y2MuTm9kZSA9IG51bGw7ICAgICAvL+e7k+adn+iKgueCuSAg6JOd6Imy5pa55Z2XXHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIE5vZGVfZ286Y2MuTm9kZSA9IG51bGw7ICAgICAgLy/np7vliqjoioLngrkgIOe7v+iJsuaWueWdl1xyXG4gICAgQHByb3BlcnR5KGNjLlByZWZhYilcclxuICAgIFByZWZhYl9yb3V0ZTpjYy5QcmVmYWIgPSBudWxsOyAgLy/ot6/nur/mj5DnpLrmlrnlnZdcclxuXHJcbiAgICBsYXllcl9yb2FkOmNjLlRpbGVkTGF5ZXIgPSBudWxsOyAgICAvL+S4tOaXtuiusOW9lVxyXG4gICAgbGF5ZXJfd2FsbDpjYy5UaWxlZExheWVyID0gbnVsbDsgICAgLy/kuLTml7borrDlvZVcclxuXHJcbiAgICBzdGFydF9wb2ludDpQb2ludCA9IG51bGw7ICAgICAvL+i1t+Wni3BvaW50XHJcbiAgICBlbmRfcG9pbnQ6UG9pbnQgPSBudWxsOyAgICAgICAvL+e7k+adn3BvaW50XHJcbiAgICBtYXBfcG9pbnQ6TWFwPG51bWJlcixQb2ludD4gPSBuZXcgTWFwKCk7ICAgICAvL+WcsOWbviDntKLlvJVcclxuICAgIHJvdXRlOkFycmF5PFBvaW50PiA9IFtdOyAgICAvL+i3r+e6v1xyXG4gICAgc2l6ZTpjYy5TaXplID0gbnVsbDsgICAgICAgIC8v5Zyw5Zu+5bC65a+4XHJcblxyXG4gICAgb25Mb2FkKCl7XHJcbiAgICAgICAgdGhpcy5yZWFkTWFwKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDor7vlj5blnLDlm77vvIzlvpfliLDlj6/ku6XotbDnmoTlhajpg6jlnLDlnZfntKLlvJUgICDvvIjlnLDlm77nmoR4eeaYr+S7juW3puS4iuinkuWIsOWPs+S4i+inku+8iVxyXG4gICAgICovXHJcbiAgICByZWFkTWFwKCl7XHJcbiAgICAgICAgdGhpcy5sYXllcl9yb2FkID0gdGhpcy5NYXAuZ2V0TGF5ZXIoXCJyb2FkXCIpLmdldENvbXBvbmVudChjYy5UaWxlZExheWVyKTtcclxuICAgICAgICB0aGlzLmxheWVyX3dhbGwgPSB0aGlzLk1hcC5nZXRMYXllcihcIndhbGxcIikuZ2V0Q29tcG9uZW50KGNjLlRpbGVkTGF5ZXIpO1xyXG4gICAgICAgIHRoaXMuc2l6ZSA9IHRoaXMuTWFwLmdldE1hcFNpemUoKTtcclxuICAgICAgICAvL+WcsOadvyAg5YWo6YOo5Yqg6L+b5Y67XHJcbiAgICAgICAgZm9yKGxldCB4PTA7eDx0aGlzLnNpemUud2lkdGg7eCsrKXtcclxuICAgICAgICAgICAgZm9yKGxldCB5PTA7eTx0aGlzLnNpemUuaGVpZ2h0O3krKyl7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGlsZWQgPXRoaXMubGF5ZXJfcm9hZC5nZXRUaWxlZFRpbGVBdCh4LHksdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBpZih0aWxlZC5naWQhPTApe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwb2ludCA9IG5ldyBQb2ludCh4LHkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwX3BvaW50LnNldCh4K3kqdGhpcy5zaXplLndpZHRoLHBvaW50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvL+WimSAg5LiN6KaBXHJcbiAgICAgICAgZm9yKGxldCB4PTA7eDx0aGlzLnNpemUud2lkdGg7eCsrKXtcclxuICAgICAgICAgICAgZm9yKGxldCB5PTA7eTx0aGlzLnNpemUuaGVpZ2h0O3krKyl7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGlsZWQgPXRoaXMubGF5ZXJfd2FsbC5nZXRUaWxlZFRpbGVBdCh4LHksdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBpZih0aWxlZC5naWQhPTApe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwX3BvaW50LmRlbGV0ZSh4K3kqdGhpcy5zaXplLndpZHRoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiuvuWumuS4gOS4qui1t+Wni+S9jee9rlxyXG4gICAgICovXHJcbiAgICBzZXRTdGFydCgpe1xyXG4gICAgICAgIHRoaXMuc3RhcnRfcG9pbnQgPSB0aGlzLmdldFJhbmRvbVBvaW50KCk7XHJcbiAgICAgICAgdGhpcy5Ob2RlX3N0YXJ0LnNldFBvc2l0aW9uKHRoaXMubGF5ZXJfcm9hZC5nZXRUaWxlZFRpbGVBdCh0aGlzLnN0YXJ0X3BvaW50LngsdGhpcy5zdGFydF9wb2ludC55LGZhbHNlKS5ub2RlLnBvc2l0aW9uKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiuvuWumuS4gOS4que7iOeCueS9jee9rlxyXG4gICAgICovXHJcbiAgICBzZXRFbmQoKXtcclxuICAgICAgICB0aGlzLmVuZF9wb2ludCA9IHRoaXMuZ2V0UmFuZG9tUG9pbnQoKTtcclxuICAgICAgICB0aGlzLk5vZGVfZW5kLnNldFBvc2l0aW9uKHRoaXMubGF5ZXJfcm9hZC5nZXRUaWxlZFRpbGVBdCh0aGlzLmVuZF9wb2ludC54LHRoaXMuZW5kX3BvaW50LnksZmFsc2UpLm5vZGUucG9zaXRpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5LiA5Liq6ZqP5py655qEcG9pbnRcclxuICAgICAqL1xyXG4gICAgZ2V0UmFuZG9tUG9pbnQoKXtcclxuICAgICAgICBsZXQgciA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSp0aGlzLnNpemUud2lkdGgqdGhpcy5zaXplLmhlaWdodCk7XHJcbiAgICAgICAgbGV0IHBvaW50ID0gdGhpcy5tYXBfcG9pbnQuZ2V0KHIpO1xyXG4gICAgICAgIGlmKCFwb2ludCl7XHJcbiAgICAgICAgICAgIHBvaW50ID0gdGhpcy5nZXRSYW5kb21Qb2ludCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcG9pbnQ7ICBcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOeUn+aIkOi3r+e6v1xyXG4gICAgICovXHJcbiAgICBnZXRSb3V0ZSgpe1xyXG4gICAgICAgIGlmKCF0aGlzLnN0YXJ0X3BvaW50KXtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIuS9oOi/mOayoeacieiuvue9rui1t+eCuVwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZighdGhpcy5lbmRfcG9pbnQpe1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi5L2g6L+Y5rKh5pyJ6K6+572u57uI54K5XCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8v6LCD55So5bel5YW357G76I635Y+W6Lev57q/XHJcbiAgICAgICAgdGhpcy5yb3V0ZSA9IEFTdGFyLmdldFJvdXRlKHRoaXMuc3RhcnRfcG9pbnQsdGhpcy5lbmRfcG9pbnQsdGhpcy5tYXBfcG9pbnQsdGhpcy5zaXplKTtcclxuICAgICAgICBpZih0aGlzLnJvdXRlLmxlbmd0aD09MCl7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi5rKh5pyJ5om+5Yiw6Lev5b6EXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL+m7keiJsuaWueWdl+aPkOekuuWHuuadpeeci+eciyzlhYjmuIXnqbrkuYvliY3nmoRcclxuICAgICAgICB0aGlzLkZvbGRlcl9yb3V0ZS5yZW1vdmVBbGxDaGlsZHJlbigpO1xyXG4gICAgICAgIHRoaXMuaSA9IDA7XHJcbiAgICAgICAgdGhpcy5yb3V0ZS5mb3JFYWNoKHBvaW50PT57XHJcbiAgICAgICAgICAgIGxldCB0aWxlZCA9IHRoaXMubGF5ZXJfcm9hZC5nZXRUaWxlZFRpbGVBdChwb2ludC54LHBvaW50LnksZmFsc2UpO1xyXG4gICAgICAgICAgICBsZXQgbm9kZSA9IGNjLmluc3RhbnRpYXRlKHRoaXMuUHJlZmFiX3JvdXRlKTtcclxuICAgICAgICAgICAgdGhpcy5Gb2xkZXJfcm91dGUuYWRkQ2hpbGQobm9kZSk7XHJcbiAgICAgICAgICAgIG5vZGUuc2V0UG9zaXRpb24odGlsZWQubm9kZS5wb3NpdGlvbik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmjInnhafot6/nur/np7vliqhcclxuICAgICAqL1xyXG4gICAgaTpudW1iZXIgPSAwO1xyXG4gICAgbW92ZSgpe1xyXG4gICAgICAgIGlmKHRoaXMuaT09dGhpcy5yb3V0ZS5sZW5ndGgpeyAgLy/ooajnpLrotbDlrozkuoZcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgcG9pbnQgPSB0aGlzLnJvdXRlW3RoaXMuaSsrXTtcclxuICAgICAgICBjYy50d2Vlbih0aGlzLk5vZGVfZ28pLnRvKC4yLHtwb3NpdGlvbjp0aGlzLmxheWVyX3JvYWQuZ2V0VGlsZWRUaWxlQXQocG9pbnQueCxwb2ludC55LGZhbHNlKS5ub2RlLnBvc2l0aW9ufSkuY2FsbCgoKT0+e3RoaXMubW92ZSgpO30pLnN0YXJ0KCk7XHJcbiAgICB9XHJcbn1cclxuIl19
//------QC-SOURCE-SPLIT------

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
//------QC-SOURCE-SPLIT------
