#VisualUIEditor项目讲解之如何使用初始篇
------------------------
#如何得到它
1、 二进制方式
> [下载地址Github](https://github.com/tickbh/VisualUIEditor/releases "Github release")直接下载对应的平台进行下，解压，打开对应的程序

2、 源码下载
> [Github连接](https://github.com/tickbh/VisualUIEditor "Github Code")进行克隆编译运行，可参考README.md进行编译运行

#如何使用它
1、 项目准备

> 非源码方式: 可到这里进行下载[测试项目的地址目录](https://github.com/tickbh/VisualUIEditor/tree/master/project-test "Github Test Project Folder")

> 源码方式:   测试项目的地址为根目录底下的**project-test**目录

2、 初次打开，这时没有默认的，这时候需要我们手动打开项目

> 操作菜单 **文件**->**打开项目**，这时候将弹出一个选择目录的窗口，选择刚刚的项目目录，进行打开，如图所示
![](https://raw.githubusercontent.com/tickbh/VisualUIEditor/master/doc/image/HowToUse/FileOper.jpg)

> 打开完成后，我们可以资源操作栏里面，选择**UI**->**test.ui**，这时候我们就可以打开我们的UI布局，操作示意图如下：
![](https://raw.githubusercontent.com/tickbh/VisualUIEditor/master/doc/image/HowToUse/ResOpenTest.jpg)

> UI界面的预览图，如下：
![](https://raw.githubusercontent.com/tickbh/VisualUIEditor/master/doc/image/HowToUse/ResAfterOpenTestShowAll.jpg)

3、 此时，我们就可以开始使用UI编辑器的功能，来辅助我们的游戏进行开发，[已实现的功能](https://github.com/tickbh/VisualUIEditor/wiki "已实现的功能")

#ui文件说明
此编辑器的ui文件存储以Json格式存储，编辑器和代码均以Json解析的方式还原出UI效果，保存UI的编辑效果一致。

此编辑器的Runtime，[地址](https://github.com/tickbh/VisualUIEditor_2dx_runtime "Runtime地址")

此编辑器2dx-lua的Demo，[地址](https://github.com/tickbh/VisualUIEditor_2dx_demo_lua "Demo地址")

此编辑器2dx-cpp的Demo，[地址](https://github.com/tickbh/VisualUIEditor_2dx_demo "Demo地址")

#导出说明
由于编辑器所编辑的UI文件，没有冗余信息，暂时无需导出功能的选项，即源文件为目标文件


#其它信息
**VisualUIEditor开发QQ群欢迎您的加入: 453224679**
