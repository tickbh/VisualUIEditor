
let ExtScrollView = {};

ExtScrollView.name = "UIScrollView";
ExtScrollView.icon = "app://res/control/scrollview.png";
ExtScrollView.tag = 9;

ExtScrollView.GenEmptyNode = function() {
    node = new ccui.ScrollView();
    node.setContentSize(cc.size(200, 100));
    node._className = ExtScrollView.name;
    return node;
};

ExtScrollView.GenNodeByData = function(data, parent) {
    return this.GenEmptyNode();
};

ExtScrollView.SetNodePropByData = function(node, data, parent) {
    if(!isNull(data["innerPosX"]) || !isNull(data["innerPosY"])) {
        node.setInnerContainerPosition(cc.p(data["innerPosX"] || 0, data["innerPosY"] || 0));
    }

    if(!isNull(data["innerSizeW"]) || !isNull(data["innerSizeH"])) {
        node.setInnerContainerSize(cc.size(data["innerSizeW"] || 0, data["innerSizeH"] || 0));
    }

    (isValue(data["direction"])) && (node.setDirection(data["direction"]));
    (isValue(data["scrollBarEnabled"])) && (node.setScrollBarEnabled(data["scrollBarEnabled"]));
    (isValue(data["inertiaScrollEnabled"])) && (node.setInertiaScrollEnabled(data["inertiaScrollEnabled"]));
    (isValue(data["bounceEnabled"])) && (node.setBounceEnabled(data["bounceEnabled"]));
};

ExtScrollView.ExportNodeData = function(node, data) {
    let innerPos = node.getInnerContainerPosition();
    data["innerPosX"] = innerPos.x;
    data["innerPosY"] = innerPos.y;

    let innerSize = node.getInnerContainerSize();
    data["innerSizeW"] = innerSize.width;
    data["innerSizeH"] = innerSize.height;

    data["direction"] = node._direction;
    data["scrollBarEnabled"] = node._scrollBarEnabled;
    data["inertiaScrollEnabled"] = node._inertiaScrollEnabled;
    data["bounceEnabled"] = node._bounceEnabled;
};

ExtScrollView.SetPropChange = function(control, path, value) {
    if(path == "innerPosition.x") {
        control._node.setInnerContainerPosition(cc.p(value, control._node.getInnerContainerPosition().y));
    } else if(path == "innerPosition.y") {
        control._node.setInnerContainerPosition(cc.p(control._node.getInnerContainerPosition().x, value));
    } else if(path == "innerSize.width") {
        control._node.setInnerContainerSize(value, cc.size(control._node.getInnerContainerSize().height));
    } else if(path == "innerSize.height") {
        control._node.setInnerContainerSize(cc.size(control._node.getInnerContainerSize().width, value));
    } else if(path == "direction") {
        value = fixFloatValue(value);
        let pre = control._node._direction;
        control._node.setDirection(value == 4 ? 0 : value);
        let after = control._node._direction;
    } else if(path == "scrollBarEnabled") {
        control._node.setScrollBarEnabled(value);
    } else if(path == "inertiaScrollEnabled") {
        control._node.setInertiaScrollEnabled(value);
    } else if(path == "bounceEnabled") {
        control._node.setBounceEnabled(value);
    }
};

ExtScrollView.ExportData = function(node) {
    this._node = node;
}

ExtScrollView.ExportData.prototype = {
    __displayName__: "ScrollView",

    get bounceEnabled() {
        return {
            path: "bounceEnabled",
            type: "checkbox",
            name: "bounceEnabled",
            attrs: {
            },
            value: this._node._bounceEnabled,
        };
    },

    get inertiaScrollEnabled() {
        return {
            path: "inertiaScrollEnabled",
            type: "checkbox",
            name: "inertiaScrollEnabled",
            attrs: {
            },
            value: this._node._inertiaScrollEnabled,
        };
    },

    get scrollBarEnabled() {
        return {
            path: "scrollBarEnabled",
            type: "checkbox",
            name: "scrollBarEnabled",
            attrs: {
            },
            value: this._node._scrollBarEnabled,
        };
    },

    get innerPosition() {
        return {
            path: "innerPosition",
            type: "vec2",
            name: "innerPosition",
            attrs: {
                step: 5,
                precision: 0,
                min: -1000,
                max: 10000,
            },
            value: {
                x: this._node.getInnerContainerPosition().x,
                y: this._node.getInnerContainerPosition().y,
            }
        }
    },

    get innerSize() {
        let parent = this._node.getParent();
        let size = this._node.getInnerContainerSize();
        return {
            path: "innerSize",
            type: "size",
            name: "innerSize",
            attrs: {
                hasParent : false,
                min: 0,
                step: 5,
                precision: 0,
            },
            value: {
                width: size.width,
                height: size.height,
            }
        }
    },

    get direction() {
        return {
            path: "direction",
            type: "select",
            name: "direction",
            attrs: {
                selects: {
                    1: "VERTICAL",
                    2: "HORIZONTAL",
                    3: "BOTH",
                    4: "NONE",
                }
            },
            value: this._node._direction,
        };
    },

    get __props__() {
        return [
            this.innerPosition,
            this.innerSize,
            this.direction,
            this.inertiaScrollEnabled,
            this.scrollBarEnabled,
            this.bounceEnabled,
        ];
    }
}

ExtScrollView.PropComps = function(node) {
    let datas = [ new WidgetData(node) ];
    datas.push(new TouchData(node));
    datas.push(new ExtScrollView.ExportData(node));
    return datas;
};

module.exports = ExtScrollView;

RegisterExtNodeControl(ExtScrollView.name, ExtScrollView);
