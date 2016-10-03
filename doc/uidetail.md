#VisualUIEditor项目讲解之UI文件说明
ui文件为以ui文件结尾的文件，文件的内容以Json数据存储的布局信息文件。

#节点的基本数据结构
```Json
{
    "type": "Scene",
    "children": []
}
```
结点的最小单元需定义类型type，若该结点有子结点，那children里则依次顺序存储子结点的信息。

而类型为UIButton(按钮)，UICheckBox(复选框)，UIImage(图片)，UIInput(输入框)，UIScale9(九宫)，UISlider(滑动条)，UIText(文本输入)，UITextAtlas(图片文本)或者类型字符串以SubPath:(子UI)开头的节点，都属于基本节点，在UI编辑器里，这些节点，不存在任何的子结点。

#编辑器自带的属性编辑
编辑器自带的属性编辑分别位于[ve](https://github.com/tickbh/VisualUIEditor/tree/master/prop/ve "ve")和[ve-widget](https://github.com/tickbh/VisualUIEditor/tree/master/prop/ve "ve-widget")目录下，包含有以下格式编辑
> 基础控件
* **ve-input** 基础的字符串输入控件
* **ve-checkbox** 复选框的选择控件
* **ve-unit-input** 数字的输入控件
* **ve-textarea** 多行文本的输入控件
* **ve-slider** 数字滑动控件

> 组合控件
* **ve-vec2** 包含x和y信息的控件，如位置，锚点，缩放等
* **ve-size** 包含width和height的信息控件
* **ve-asset** 资源属性的节点，用于资源文件的拖动设置属性
* **ve-color** 颜色信息的节点，用于快速设置颜色设置，支持RGBA
* **ve-relative** 用于相对位置信息的设置，用来保证布局由于动态放大缩小而改变的信息设置，如left，top，right，bottom，center hor， center ver

这些是常用的属性编辑节点


#节点的基本属性
下面列举节点共用的基本属性
* **x** 数字，节点位置的横坐标, 大小为从左往右增大
* **y** 数字，节点位置的纵坐标, 大小为从下往上增大，为opengl系坐标
* **left** 数字，节点位置相对父节点的左偏移，若该值存在忽略信息x
* **right** 数字，节点位置相对父节点的右偏移，若该值存在忽略信息x
* **horizontal** 数字，节点位置相对父节点的水平居中的偏移，负值则表示中偏左，正则表示中偏右，若该值存在忽略信息x，left，right，horizontal三者只会同时存在一个
* **top** 数字，节点位置相对父节点的上偏移，若该值存在忽略信息y
* **bottom** 数字，节点位置相对父节点的下偏移，若该值存在忽略信息y
* **vertical** 数字，节点位置相对父节点的竖直居中的偏移，负值则表示中偏下，正则表示中偏上，若该值存在忽略信息y，top，bottom，vertical三者只会同时存在一个
* **width** 字符串，节点的宽度信息，若为%号结尾，则表示该宽度占父节点的大小的百分比，否则则为固定值
* **height** 字符串，节点的高度信息，若为%号结尾，则表示该高度占父节点的大小的百分比，否则则为固定值
* **type** 字符串，节点的类型信息，若该结点以SubPath:开头，则表示该结点复用别的组件
* **id** 字符串，节点的名字信息，同一个父节点，不允许两个id名字一样的节点
* **color** 颜色，节点的颜色值
* **scaleX** 数字，节点的横向缩放值，该值默认为1
* **scaleY** 数字，节点的纵向缩放值，该值默认为1
* **rotation** 数字，节点的旋转角度，该值默认为0
* **opacity** 数字，节点的不透明度，为0-255间的数字，该值默认为255，表示该节点不透明
* **anchorX** 数字，节点的横向锚点，该值默认为0.5
* **anchorY** 数字，节点的纵向锚点，该值默认为0.5
* **touchEnabled** 布尔，节点的是否可点击
* **touchListener** 字符串，节点的监听函数信息
* **visible** 布尔，节点是否可见

每个子节点有各自的属性，通过设置各个属性值改变节点的状态信息

#其它信息
**VisualUIEditor开发QQ群欢迎您的加入: 453224679**
