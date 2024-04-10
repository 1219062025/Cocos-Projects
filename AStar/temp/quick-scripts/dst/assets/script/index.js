
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