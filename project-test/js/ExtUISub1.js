let ExtUISub1 = {};

ExtUISub1.name = "ui/sub1.ui";
ExtUISub1.icon = "res/control/Node.png";
ExtUISub1.tag = 0;

ExtUISub1.GenEmptyNode = function() {
    return cocosGenSubUINode(ExtUISub1.name, null);
};

ExtUISub1.GenNodeByData = function(data, parent) {
    return cocosGenSubUINode(ExtUISub1.name, parent);
};

ExtUISub1.SetNodePropByData = function(node, data, parent) {
    if (data.test) {
        let text = node.getChildByName("text");
        text.setString(data.test);
        node.test = data.test;
    }
};

ExtUISub1.ExportNodeData = function(node, data) {
    data.test = node.test;

};

ExtUISub1.SetPropChange = function(control, path, value) {
    if (path == "test") {
        ExtUISub1.SetNodePropByData(control._node, { test: value });
    } else {
        control._node[path] = value;
    }
};

ExtUISub1.ExportData = function(node) {
    this._node = node;
}

ExtUISub1.ExportData.prototype = {
    __displayName__: "UISub1",
    __type__: "ccui.UISub1",

    get test() {
        return {
            path: "test",
            type: "string",
            name: "test",
            attrs: {},
            value: this._node.test,
        };
    },

    get __props__() {
        return [this.test];
    }
}

ExtUISub1.PropComps = function(node) {
    let datas = [new WidgetData(node)];
    datas.push(new ExtUISub1.ExportData(node));
    return datas;
};

module.exports = ExtUISub1;

RegisterExtNodeControl(ExtUISub1.name, ExtUISub1);