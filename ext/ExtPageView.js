let ExtPageView = {}

ExtPageView.name = 'UIPageView'
ExtPageView.icon = 'app://res/control/pageview.png'
ExtPageView.tag = 9

ExtPageView.GenEmptyNode = function () {
  node = new ccui.PageView()
  node.setContentSize(cc.size(200, 100))
  node._className = ExtPageView.name
  return node
}

ExtPageView.GenNodeByData = function (data, parent) {
  node = new ccui.PageView()
  node.setContentSize(cc.size(data.width || 200, data.height || 1000))
  ExtPageView.SetNodePropByData(node, data, parent)
  node._className = ExtPageView.name
  return node
}

ExtPageView.SetNodePropByData = function (node, data, parent) {
  ExtListView.SetNodePropByData(node, data, parent)
}

ExtPageView.ExportNodeData = function (node, data) {
  ExtListView.ExportNodeData(node, data)
}

ExtPageView.SetPropChange = function (control, path, value) {
  SetDefaultPropChange(control, path, value)
}

ExtPageView.NodifyPropChange = function (control) {
  SetNodifyPropChange(control)
}

ExtPageView.ExportData = function (node) {
  this._node = node
}

ExtPageView.ExportData.prototype = {
  __displayName__: 'PageView',

  get __props__() {
    return []
  }
}

ExtPageView.PropComps = function (node) {
  let datas = [ new WidgetData(node) ]
  datas.push(new TouchData(node))
  datas.push(new ExtPageView.ExportData(node))
  datas.push(new ExtListView.ExportData(node))
  datas.push(new ExtScrollView.ExportData(node))
  return datas
}

module.exports = ExtPageView

RegisterExtNodeControl(ExtPageView.name, ExtPageView)
