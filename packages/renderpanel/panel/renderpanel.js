(() => {
  'use strict';

  var dragIdName = "NodeMoveUUID";
  
  Polymer({
    properties: {
      filterText: {
        type: String,
        value: '',
      },

      zoomScale: {
        type: Number,
        value: 1,
        observer: '_zoomScaleChange'
      },

      modeSelected: {
        type: Number,
        value: 0,
        observer: '_modeSelectedChange'
      },
    },

    listeners: {
        'panel-resize': 'resize',
        'panelResized': 'resize',
        'mousemove' : "_mouseMove",
        'mousewheel' : "_mouseWheel",
        'mousedown' : "_mouseDown",
        'focused-changed': '_onFocusedChanged',
    },

    _mouseDown : function(ev) {
    },


    _onFocusedChanged (event) {
        
        console.log("_onFocusedChanged");
    },

    _alignSelectItems: function(dir) {
        let selectItems = this.getSelectItems();
        if(selectItems.length <= 1) {
            return;
        }
        if(!this._firstSelectItem) {
            this._firstSelectItem = selectItems[0];
        }
        //only in same parent add opitems
        let firstChild = cocosGetItemByUUID(this.$.scene.getRunScene(), this._firstSelectItem);
        if(!firstChild) {
            return;
        }
        let parent = firstChild.getParent();
        let opitems = [];
        for(var i = 0; i < selectItems.length; i++) {
            if(this._firstSelectItem == selectItems[i]) {
                continue;
            }
            let compareChild = cocosGetItemByUUID(this.$.scene.getRunScene(), selectItems[i]);
            if(firstChild.getParent() == compareChild.getParent()) {
                opitems.push(compareChild);
            }
        }

        if(!parent || opitems.length == 0) {
            return;
        }

        let left = firstChild.x - firstChild.anchorX * firstChild.width;
        let right = left + firstChild.width;

        let rect = firstChild.getBoundingBox();

        switch(dir) {
            case 0:
            {
                opitems.forEach(function(child){  
                    let newX = rect.x +  child.anchorX * child.width * child.scaleX;
                    addNodeCommand(child, "x", child.x, newX);
                    child.x = newX;
                });
            }
                break;

            case 1:
            {
                opitems.forEach(function(child){  
                    let childRect = child.getBoundingBox();
                    let alignX = rect.x + rect.width / 2 - childRect.width / 2;
                    let newX = alignX +  child.anchorX * child.width * child.scaleX;
                    addNodeCommand(child, "x", child.x, newX);
                    child.x = newX;
                });
            }
                break;

            case 2:
            {
                opitems.forEach(function(child){  
                    let childRect = child.getBoundingBox();
                    let alignX = rect.x + rect.width - childRect.width;
                    let newX = alignX +  child.anchorX * child.width * child.scaleX;
                    addNodeCommand(child, "x", child.x, newX);
                    child.x = newX;
                });
            }
                break;
            case 3:
            {
                opitems.forEach(function(child){  
                    let childRect = child.getBoundingBox();
                    let alignY = rect.y + rect.height - childRect.height;
                    let newY = alignY +  child.anchorY * child.height * child.scaleY;
                    addNodeCommand(child, "y", child.y, newY);
                    child.y = newY;
                });
            }
                break;

            case 4:
            {
                opitems.forEach(function(child){  
                    let childRect = child.getBoundingBox();
                    let alignY = rect.y + rect.height / 2 - childRect.height / 2;
                    let newY = alignY +  child.anchorY * child.height * child.scaleY;
                    addNodeCommand(child, "y", child.y, newY);
                    child.y = newY;
                });
            }
                break;

            case 5:
            {
                opitems.forEach(function(child){
                    let newY = rect.y +  child.anchorY * child.height * child.scaleY;
                    addNodeCommand(child, "y", child.y, newY);
                    child.y = newY;
                });
            }
                break;
        }

        
        this.updateForgeCanvas(); 

    },

    _alignLeft: function() {
        this._alignSelectItems(0);
    },

    _alignHCenter: function() {
        this._alignSelectItems(1);
    },

    _alignRight: function() {
        this._alignSelectItems(2);
    },

    _alignTop: function() {
        this._alignSelectItems(3);
    },

    _alignVCenter: function() {
        this._alignSelectItems(4);
    },

    _alignBottom: function() {
        this._alignSelectItems(5);
    },

    _resizeGameCanvasCenter: function() {
        let gameCanvas = this.$.scene.$.gameCanvas;
        let curRect = this.getBoundingClientRect();
        let zoom = this.calcGameCanvasZoom();
        gameCanvas.style.left = ((curRect.width - gameCanvas.width * zoom) / 2 / zoom) + "px";
        gameCanvas.style.top = ((curRect.height - gameCanvas.height * zoom) / 2 / zoom) + "px";

        this.updateForgeCanvas(); 
    },

    _realignPosition: function() {
        this._resizeGameCanvasCenter();
    },

    _modeSelectedChange: function() {
        if(!this._isReady) {
            return
        }
        if(this.modeSelected == 1) {
            let data = cocosExportNodeData(this.$.scene.getRunScene());
            this._editor.setValue(JSON.stringify(data, null, 4));
            this.$.code.value = JSON.stringify(data, null, 4);
        } else {
            let failed = false;
            try {
                let data = this._editor.getValue();
                if(data && data.length > 0) {
                    let json = JSON.parse(data);
                        let scene = cocosGenNodeByData(json, null);
                        if(scene && (scene._className == "Scene")) {
                        this.sceneChange(scene);
                    } else {
                        failed = true;
                    }
                }
            } catch(e) {
                failed = true;
            }

            if(failed) {
                console.error("解析数据出错，放弃更改");
            }
        }

        this.$.scene.hidden = this.modeSelected != 0;
        this.$.code.hidden = this.modeSelected != 1;

        
    },

    _zoomScaleChange: function(newValue, location) {
        let gameCanvas = this.$.scene.$.gameCanvas;
        let isNeedFix = false;
        let preLocation = null;
        if(location) {
            isNeedFix = true;
            preLocation = this.calcSceneLocation(location.x, location.y);
        }
        let rect = gameCanvas.getBoundingClientRect();
        gameCanvas.style.zoom = "" + newValue;
        if(!isNeedFix) {
            return;
        }
        let rect1 = gameCanvas.getBoundingClientRect();
        let nowLocation = this.calcSceneLocation(location.x, location.y);
        let stepX = nowLocation.x - preLocation.x, stepY = nowLocation.y - preLocation.y;
        
        gameCanvas.style.left = parseFloat(gameCanvas.style.left)  + stepX + "px";
        gameCanvas.style.top = parseFloat(gameCanvas.style.top) - stepY + "px";

        let afterFix = this.calcSceneLocation(location.x, location.y);
    },

    _mouseWheel: function(ev) {
        if(this.modeSelected != 0) {
            return;
        }
        this.$.zoomSlider.value = this.$.zoomSlider.value + (ev.deltaY < 0 ? 0.05 : -0.05);
        this._zoomScaleChange(this.$.zoomSlider.value, {x : ev.clientX, y : ev.clientY});

        this.updateForgeCanvas();
    },

    _mouseMove: function(ev) {
        this.$.scene.focus();
        if(this.modeSelected != 0) {
            return;
        }
        let location = this.calcSceneLocation(ev.clientX, ev.clientY);
        this.$.location.textContent = location.x + "X" + location.y;
    },

    sceneToDom: function(x, y) {
        let gameCanvas = this.$.scene.$.gameCanvas;
        let rect = gameCanvas.getBoundingClientRect();
        let ratio = this.calcGameCanvasZoom();
        y = rect.height - y;
        return {x : (rect.left + x) * ratio, y : (rect.top + y) * ratio};
    },

    calcGameCanvasZoom: function() {
        let zoom = this.$.scene.$.gameCanvas.style.zoom;
        if(zoom) {
            if(zoom.indexOf("%") >= 0) {
                return parseFloat(zoom) / 100;
            } else {
                return parseFloat(zoom);
            }
        }
        return 1
    },

    calcSceneLocation: function(x, y) {
        let gameCanvas = this.$.scene.$.gameCanvas;
        let rect = gameCanvas.getBoundingClientRect();
        let zoom = gameCanvas.style.zoom;
        let left = rect.left, top = rect.top;
        let ratio = this.calcGameCanvasZoom();
        left = left * ratio;
        top = top * ratio;
        x = (x - left) / ratio;
        y = (y - top) / ratio;
        return {x : x.toFixed(1), y : (rect.height - y).toFixed(1)};
    },

    isCollection: function(rectSrc, rectDest) {
        return !(   rectSrc.left + rectSrc.width < rectDest.left ||
                    rectDest.left + rectDest.width < rectSrc.left ||
                    rectSrc.top + rectSrc.height < rectDest.top || 
                    rectDest.top + rectDest.height < rectSrc.top );
    },

    addNodeControl: function(node) {
        if(!this._firstSelectItem) {
            this._firstSelectItem = node.uuid;
        }
        let canvas = this.$.scene.getFabricCanvas();
        let forgeRect = this.$.scene.$.forgeCanvas.getBoundingClientRect();
        let nodeRect = this.getNodeWorldRectToFabric(node);
        nodeRect.left -= forgeRect.left;
        nodeRect.top -= forgeRect.top;
        nodeRect.scaleX = nodeRect.scaleX || 1;
        nodeRect.scaleY = nodeRect.scaleY || 1;
        nodeRect.opacity = 0.5;
        nodeRect.fill = "red";
        nodeRect.hasRotatingPoint = true;
        var block = new fabric.Rect(nodeRect);
        block._innerItem = node;
        block._preInfo = nodeRect;
        block.hasRotatingPoint = true;
        canvas.add(block);
        return true;
    },

    recursiveAddChild: function(node, rect, isClick) {
        let canvas = this.$.scene.getFabricCanvas();

        let forgeRect = this.$.scene.$.forgeCanvas.getBoundingClientRect();

        if(isClick) {
            let _this = this;
            function calcCollectNode(node, rect) {
                let nodeRect = _this.getNodeWorldRectToFabric(node);
                nodeRect.left -= forgeRect.left;
                nodeRect.top -= forgeRect.top;
                let baseNode = null;
                if(!isBaseType(node)) {
                    var children = node.getChildren();
                    for(var i = children.length - 1; i >= 0; i--) {
                        baseNode = calcCollectNode(children[i], rect);
                        if(baseNode) {
                            break;
                        }
                    }
                }
                if(!baseNode && _this.isCollection(nodeRect, rect)) {
                    baseNode = node;
                }
                return baseNode;
            }
            let baseNode = calcCollectNode(node, rect);
            if(baseNode) {
                this.addNodeControl(baseNode);
            }
            return baseNode != null;
        } else {
            let nodeRect = this.getNodeWorldRectToFabric(node);
            nodeRect.left -= forgeRect.left;
            nodeRect.top -= forgeRect.top;
            let isCollect = this.isCollection(nodeRect, rect);
            if(isCollect) {
                this.addNodeControl(node);
                return true;
            }

            var children = node.getChildren();
            for(var i = 0; i < children.length; i++) {
                this.recursiveAddChild(children[i], rect, isClick);
            }
        }

        return false;
    },

    getSelectItems: function() {
        let canvas = this.$.scene.getFabricCanvas();

        let objects = canvas.getObjects();
        let select_items = [];
        for(var i = 0; i < objects.length; i++) {
            let uuid = objects[i]._innerItem.uuid;
            if(uuid) 
                select_items.push(uuid);
        }

        return select_items;
    },

    _doSelectAll: function() {
        let canvas = this.$.scene.getFabricCanvas();
        this._firstSelectItem = null;
        canvas.clear();

        let runScene = this.$.scene.getRunScene();
        runScene.getChildren().forEach(function(node) {
            this.addNodeControl(node);
        }, this);

        this.updateAllObjectSelect();
    },

    updateForgeCanvas: function() {

        let canvas = this.$.scene.getFabricCanvas();
        let select_items = this.getSelectItems();
        canvas.clear();

        for(var i = 0; i < select_items.length; i++) {
            let sourceNode = cocosGetItemByUUID(this.$.scene.getRunScene(),select_items[i]);
            if(!sourceNode) {
                continue;
            }
            this.addNodeControl(sourceNode);
        }

        this.updateAllObjectSelect();
    },

    updateAllObjectSelect: function() {
        let canvas = this.$.scene.getFabricCanvas();
        var group = canvas.getObjects();
        // do not create group for 1 element only
        if (group.length === 1) {
            canvas.setActiveObject(group[0], null);
        }
        else if (group.length > 1) {
            group = new fabric.Group(group.reverse(), {
                canvas: canvas
            });
            group.addWithUpdate();
            canvas.setActiveGroup(group, null);
            group.saveCoords();
            canvas.fire('selection:created', { target: group });
            canvas.renderAll();
        }
    },

    isBaseType: function(node) {

    },

    getNodeWorldRectToFabric: function(node) {
        let rect = this.getWorldNodeRect(node);
        return {
            top : rect.y,
            left: rect.x,
            width: rect.width,
            height: rect.height,
        }
    },


    getNodeRectToFabric: function(node) {
        let rect = this.getNodeRect(node);
        return {
            top : rect.y + rect.height / 2,
            left: rect.x + rect.width / 2,
            width: rect.width,
            height: rect.height,
        }
    },

    getWorldNodeRect: function(node) {
        let rect = node.getBoundingBoxToWorld();
        let start = this.sceneToDom(rect.x, rect.y);
        let zoom = this.calcGameCanvasZoom();
        let height = rect.height * zoom;

        return {
            x : start.x, y : start.y - height,
            width: rect.width * zoom,
            height: height,
        }
    },

    getNodeRect: function(node) {
        let rect = node.getBoundingBox();
        let start = this.sceneToDom(rect.x, rect.y);
        let zoom = this.calcGameCanvasZoom();
        let height = rect.height * zoom;

        return {
            x : start.x, y : start.y - height,
            width: rect.width * zoom,
            height: height,
        }
    },

    resize: function() {
        this.$.scene.fixForgeCanvas();
        this.$.scene.initGameCanvas();
    },

    addFunc: function(data) {

    },

    _doDeleteFunc: function() {
        let runScene = this.$.scene.getRunScene();
        let select_items = this.getSelectItems();
        for(var i = 0; i < select_items.length; i++) {
            let node = cocosGetItemByUUID(runScene, select_items[i]);
            if(node.getParent()) {
                this._doItemDelete(node);
            }
        }
        this.$.scene.getFabricCanvas().clear();
        this._firstSelectItem = null;
        Ipc.sendToAll("ui:scene_items_change", {});
    },

    _doCopyFunc: function() {
        Electron.clipboard.writeText(this.getSelectItems().join("#"));
    },

    _doPasteFunc: function() {
        let detail = Electron.clipboard.readText();
        let selectItems = detail.split("#");
        let runScene = this.$.scene.getRunScene();
        if(detail.length == 0 || selectItems.length == 0) {
            return;
        }

        //only copy parent node, filter child node
        let finalItems = [];
        for (var i = 0; i < selectItems.length; i++) {
            var item = cocosGetItemByUUID(runScene, selectItems[i]);
            if(!item) {
                return;
            }
            let isChildNode = false;
            let parent = item.getParent();
            while(parent) {
                if(selectItems.indexOf(parent.uuid) >= 0) {
                    isChildNode = true;
                    break;
                }
                parent = parent.getParent();
            }
            if(!isChildNode) {
                finalItems.push(item);
            }
        }

        for(var i = 0; i < finalItems.length; i++) {
            let item = finalItems[i];
            let parent = item.getParent();
            //no parent node(such as scene), no support copy
            if(!parent) {
                continue;
            }

            let data = cocosExportNodeData(item);
            //no support same id in same children
            if(data.id && data.id.length > 0) {
                data.id = null;
            }

            let genNode = cocosGenNodeByData(data, parent);
            if(!genNode) {
                continue;
            }
            this._doItemAdd(parent, genNode);
            Ipc.sendToAll("ui:scene_item_add", {uuid:genNode.uuid});
        }
    },

    _doItemDelete: function(node) {
        let runScene = this.$.scene.getRunScene();
        let oldValue = cocosExportNodeData(node, {uuid: true});
        this._undo.add(newPropCommandChange(runScene, node.getParent().uuid, node.uuid, oldValue, {}, AddPropChange));
        node.removeFromParent(false);
    },

    _doItemAdd: function(parent, node) {
        let runScene = this.$.scene.getRunScene();
        let newValue = cocosExportNodeData(node, {uuid: true});
        this._undo.add(newPropCommandChange(runScene, parent.uuid, node.uuid, {}, newValue, AddPropChange));
        parent.addChild(node);
        this.changeItemSelect({uuid: node.uuid});
    },

    _doItemMove: function(event) {
        let canvas = this.$.scene.getFabricCanvas();
        let objects = canvas.getObjects();
        let runScene = this.$.scene.getRunScene();
        let undo = runScene._undo;

        let step = 1;
        let prop = 'x';
        if(event.keyCode == KeyCodes('left')) {
            step = -1;
        } else if(event.keyCode == KeyCodes('right')) {
            step = 1;
        } else if(event.keyCode == KeyCodes('up')) {
            step = 1;
            prop = 'y';
        } else if(event.keyCode == KeyCodes('down')) {
            step = -1;
            prop = 'y';
        }

        if (event.shiftKey) {
            step = step * 10;
        }
        
        for(var i = 0; i < objects.length; i++) {
            let child = objects[i]._innerItem;
            let oldValue = child[prop];
            if(prop == 'x') {
                FixNodeHor(child, step);
            } else {
                FixNodeVer(child, step);
            }
            undo.add(newPropCommandChange(runScene, child.uuid, prop, oldValue, child[prop]));
        }
    },

    _doSaveFunc: function() {
        if(this.modeSelected == 1) {
            saveFileByContent(this._openPath, this._editor.getValue())
        } else {
            saveSceneToFile(this._openPath, this.$.scene.getRunScene());
        }

        let runScene = this.$.scene.getRunScene();
        runScene._undo.save();
    },

    ready: function () {
        this._undo = null;
        this._firstSelectItem = null;
        this._openPath = null;
        this._isReady = true;

        var editor = ace.edit(this.$.code);
        editor.setTheme("ace/theme/twilight");
        editor.session.setMode("ace/mode/javascript");
        editor.setFontSize(16);
        this._editor = editor;

        this.$.zoomSlider.addEventListener('end-editing', (event => {
            event.stopPropagation();
            this._zoomScaleChange(event.target.value);
        }).bind(this));

        let canvas = this.$.scene.getFabricCanvas();
        canvas.on({
            'object:moving': this.canvasItemChange.bind(this),
            'object:scaling': this.canvasItemChange.bind(this),
            'object:rotating': this.canvasItemChange.bind(this),
            'selection:preselect': this.preSelectorRect.bind(this),
            'mouseup:touchnull': this.mouseupTouchnull.bind(this),
        });

       this['ondragenter'] = this.dragEnter.bind(this);
       this['ondragover'] = this.dragOver.bind(this);
       this['ondrop'] = this.dragDrop.bind(this);
       this['ondragleave'] = this.dragLeave.bind(this);

       global.setTimeout(() => {
            if(window.localStorage["projectFolder"]) {
                let path = window.localStorage["projectFolder"];
                window["projectFolder"] = path;
                Ipc.sendToAll("ui:project_floder_change", {folder: path});
            }


       },1000);
    },

    sceneChange: function(newScene) {
        this.$.scene.getFabricCanvas().clear();
        this._firstSelectItem = null;
        this.$.scene.runScene = newScene;
        window.runScene = newScene;
        cc.director.runScene(newScene);

        this.$.showName.textContent = this._openPath;
        Ipc.sendToAll('ui:scene_change', {});
        Console.log("ui:scene_change");
    },

    undoScene: function() {
        let runScene = this.$.scene.getRunScene();
        if(!runScene) {
            return;
        }
        runScene._undo.undo();
    },

    redoScene: function() {
        let runScene = this.$.scene.getRunScene();
        if(!runScene) {
            return;
        }
        runScene._undo.redo();
    },

    mouseupTouchnull: function(e) {
        let canvas = this.$.scene.getFabricCanvas();
        if(e.ctrlKey || canvas.getActiveObject() || canvas.getActiveGroup()) {

        } else {
            canvas.clear();
            this._firstSelectItem = null;
        }

        this.preSelectorRect({selector: {
            ex : e.offsetX,
            ey : e.offsetY,
            left: 0,
            top: 0,
        }, e : e});
    },

    preSelectorRect: function(object) {
        let rect = object.selector;
        let left = Math.min(rect.ex, rect.ex + rect.left);
        let top = Math.min(rect.ey, rect.ey + rect.top);
        let isClick = rect.left == 0 && rect.top == 0;
        let width = Math.abs(rect.left), height = Math.abs(rect.top);
        let e = object.e;
        rect = {left:left, top:top, width: width, height: height};

        let runScene = this.$.scene.getRunScene();
        if(!runScene) {
            return;
        }
        let children = runScene.getChildren();

        let canvas = this.$.scene.getFabricCanvas();
        let activeGroup = canvas.getActiveGroup();
        if(e.ctrlKey || canvas.getActiveObject() || canvas.getActiveGroup()) {

        } else {
            canvas.clear();
        }

        let forgeRect = this.$.scene.$.forgeCanvas.getBoundingClientRect();
        let objectLen = canvas.getObjects().length;
        for(var i = children.length - 1; i >= 0; i--) {
            let isSuccessAdd = this.recursiveAddChild(children[i], rect, isClick);
            if(isClick && isSuccessAdd) {
                break;
            }
        }
        if(canvas.getObjects().length != objectLen)
            this.updateAllObjectSelect();

        let select_items = this.getSelectItems();
        Ipc.sendToAll("ui:select_items_change", {select_items : select_items});
    },

    canvasTargetChange: function(target, group) {
       let child = target._innerItem;
        let preInfo = target._preInfo;
        if(!child) {
            return;
        }
        let curInfo = {
            left: target.left,
            top: target.top,
            width: target.width,
            height: target.height,
            scaleX: target.scaleX,
            scaleY: target.scaleY,
            angle: target.getAngle(),
        };

        if(group) {
            curInfo.left = group.left + group.width / 2 + target.left;
            curInfo.top = group.top + group.height / 2 + target.top;

            curInfo.scaleX = curInfo.scaleX * group.scaleX;
            curInfo.scaleY = curInfo.scaleY * group.scaleY;
        }
        let ratio = this.calcGameCanvasZoom();
        let runScene = this.$.scene.getRunScene();
        let undo = runScene._undo;

        if(curInfo.left != preInfo.left) {
            let oldValue = child.x;
            let step = (curInfo.left - preInfo.left) / ratio;
            FixNodeHor(child, step);
            undo.add(newPropCommandChange(runScene, child.uuid, 'x', oldValue, child.x));
        }   

        if(curInfo.top != preInfo.top) {
            let oldValue = child.y;
            let step = - (curInfo.top - preInfo.top) / ratio;
            FixNodeVer(child, step);
            undo.add(newPropCommandChange(runScene, child.uuid, 'y', oldValue, child.y));
        }

        if(curInfo.scaleX != preInfo.scaleX) {
            let oldValue = child.scaleX;
            child.setScaleX(child.getScaleX() * (curInfo.scaleX / preInfo.scaleX));
            undo.add(newPropCommandChange(runScene, child.uuid, 'scaleX', oldValue, child.scaleX));
        }

        if(curInfo.scaleY != preInfo.scaleY) {
            let oldValue = child.scaleY;
            child.setScaleY(child.getScaleY() * (curInfo.scaleY / preInfo.scaleY));
            undo.add(newPropCommandChange(runScene, child.uuid, 'scaleY', oldValue, child.scaleY));
        }
        preInfo.angle = preInfo.angle || 0;
        if(curInfo.angle != preInfo.angle) {
            let oldValue = child.rotation;
            child.setRotation(child.getRotation() + (curInfo.angle - preInfo.angle));
            undo.add(newPropCommandChange(runScene, child.uuid, 'rotation', oldValue, child.rotation));
        }

        Ipc.sendToAll("ui:item_prop_change", {uuid:child.uuid});
        // curInfo.left -= group.left || 0;
        // curInfo.top -= group.top || 0;
        target._preInfo = curInfo;
    },

    canvasItemChange: function(options) {
        if (options.target._objects) {
            options.target._objects.forEach(function(target) {
                this.canvasTargetChange(target, options.target)
            }, this);
        }
        this.canvasTargetChange(options.target);
    },


    dragEnter: function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        
    },
    dragOver: function(ev) {
        

        ev.dataTransfer.effectAllowed = "all";
        ev.dataTransfer.dropEffect = "all"; // drop it like it's hot
        ev.preventDefault();
        ev.stopPropagation();
    },
    dragLeave: function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
    },
    dragDrop: function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        ev.target.style.removeProperty("background");
        let scenePosition = this.calcSceneLocation(ev.clientX, ev.clientY);
        let uuid = gen_uuid();
        
        let runScene = this.$.scene.getRunScene();
        if(!runScene) {
            return;
        }
        var data = ev.dataTransfer.getData("controlType");
        var asset = ev.dataTransfer.getData("asset");
        var isCanControl = false;
        if(data) {
            isCanControl = true;
        } else if(asset) {
            if(endWith(asset, ".ui") || endWith(asset, ".png") || endWith(asset, ".jpg")) {
                isCanControl = true;
            }
        }
        if(!isCanControl) {
            return;
        }
        var node = null;
        if(data) {
            node = createEmptyNodeByType(data);
        }

        if(asset) {
            let subPath = calcRelativePath(window.projectFolder + "/", asset);
            if(endWith(subPath, ".ui")) {
                node = cocosGenNodeByData({"path":subPath}, runScene);
            } else if(endWith(subPath, ".png") || endWith(subPath, ".jpg")) {
                node = createEmptyNodeByType("UIImage");
                if(node) {
                    setNodeSpriteFrame("spriteFrame", subPath, node, node.initWithFile);
                }
            }
        }

        if (node) {
            node.setPosition(parseFloat(scenePosition.x), parseFloat(scenePosition.y));
            node.uuid = uuid;
            node.uiname = data;
            this._doItemAdd(runScene, node);
            Ipc.sendToAll("ui:scene_item_add", {uuid:uuid});
        }
        
    },

    insertItemBefore: function(sourceNode, compareNode) {
        let compareParent = compareNode.getParent();
        if(!compareParent) {
            return;
        }
        InsertBeforeUUID(sourceNode, compareParent, compareNode.uuid);
    },

    insertItemAfter: function(sourceNode, compareNode) {
        let compareParent = compareNode.getParent();
        if(!compareParent) {
            return;
        }
        InsertAfterUUID(sourceNode, compareParent, compareNode.uuid);
    },

    calcOffsetPos: function(sourceNode, compareNode) {
        let sourceWorld = sourceNode.convertToWorldSpace();
        let compareWorld = compareNode.convertToWorldSpace();
        return {x:sourceWorld.x - compareWorld.x, y: sourceWorld.y - compareWorld.y};
    },

    changeItemPosition : function(sourceUUID, compareUUID, mode) {
        let sourceNode = cocosGetItemByUUID(this.$.scene.getRunScene(), sourceUUID);
        let compareNode = cocosGetItemByUUID(this.$.scene.getRunScene(),compareUUID);
        if(!sourceNode || !compareNode || IsSelfOrAncient(compareNode, sourceNode)) {
            return;
        }

        let offsetNode = compareNode.getParent();
        if(mode == "top") {
            this.insertItemBefore(sourceNode, compareNode);
        } else if(mode == "bottom") {
            this.insertItemAfter(sourceNode, compareNode);
        } else {
            offsetNode = compareNode;
            this._doItemDelete(sourceNode);
            this._doItemAdd(compareNode, sourceNode);
            FixNodeHor(sourceNode, -sourceNode.x);
            FixNodeVer(sourceNode, -sourceNode.y);
        }
        // let offset = this.calcOffsetPos(sourceNode, offsetNode);
        
    },

    changeItemSelect: function(info) {
        let sourceNode = cocosGetItemByUUID(this.$.scene.getRunScene(),info.uuid);
        if(!sourceNode) {
            return;
        }
        if(!info.ctrlKey) {
            this.$.scene.getFabricCanvas().clear();
            this._firstSelectItem = null;
        }
        this.addNodeControl(sourceNode);
        this.updateForgeCanvas();

        let select_items = this.getSelectItems();
        Ipc.sendToAll("ui:select_items_change", {select_items : select_items});
    },

    messages: {
        "ui:project_floder_change"(event, message) {
            let last_open_ui = window.localStorage["last_open_ui"];
            if(!startWith(last_open_ui, message.folder)) {
                last_open_ui = null;
                window.localStorage["last_open_ui"] = null;
            }
            AddLinkToScripte(message.folder + "/js/init.html", function() {
                if(last_open_ui) {
                    Ipc.sendToAll("ui:open_file", {path: last_open_ui});
                }
            });

            this._openPath = null;
            let node = new cc.Scene();
            node.width = 800;
            node.height = 400;
            this.sceneChange(node);
        },
        "ui:change_item_position" (event, message) {
            this.changeItemPosition(message.sourceUUID, message.compareUUID, message.mode);
            this.updateForgeCanvas();
        },
        "ui:select_item" (event, message) {
            this.changeItemSelect(message);
        },
        "ui:scene_change"(event, message) {
            let runScene = this.$.scene.getRunScene();
            if(!runScene._undo)
                runScene._undo =  new UndoObj();

            this._undo = runScene._undo;
            this.$.scene.$.gameCanvas.width = runScene.width;
            this.$.scene.$.gameCanvas.height = runScene.height;

            cc.EGLView._resetInstance();
            this._resizeGameCanvasCenter();
        },
        "ui:has_item_change"(event, message) {
            this.updateForgeCanvas();
        },
        "ui:open_file"(event, message) {
            let path = message.path;
            if(endWith(path, ".ui")) {
                let dialog = Electron.remote.dialog;
                let runScene = this.$.scene.getRunScene();
                let self = this;
                var openScene = function() {
                    let scene = loadSceneFromFile(path);
                    if(scene && (scene._className == "Scene")) {
                        self._openPath = path;
                        window.localStorage["last_open_ui"] = path;
                        self.sceneChange(scene);
                    }
                };
                let isModify = false;
                if(runScene._undo && !runScene._undo.isSaved()) {
                    isModify = true;
                    dialog.showMessageBox({
                        type:"question",
                        buttons:["取消", "确定", "不保存"],
                        title:"是否保存",
                        message:"您已进行修改，尚未保存，是否保存？",
                    }, function (buttonIndex) {
                        if(buttonIndex == 0) {
                            return;
                        }
                        if(buttonIndex == 1) {
                            self._doSaveFunc();
                        }
                        openScene();
                    })
                }

                if(!isModify) {
                    openScene();
                }

                
            }
        },
        'ui:scene_prop_change'(event, message) {
            let runScene = this.$.scene.getRunScene();
            this.$.scene.$.gameCanvas.width = runScene.width;
            this.$.scene.$.gameCanvas.height = runScene.height;

            cc.EGLView._resetInstance();
        },

        'ui:create_render_node'(event, data) {
            let runScene = this.$.scene.getRunScene();
            let uuid = gen_uuid();
            var node = createEmptyNodeByType(data);
            if (node) {
                node.setPosition(100, 100);
                node.uuid = uuid;
                node.uiname = data;
                this._doItemAdd(runScene, node);
                Ipc.sendToAll("ui:scene_item_add", {uuid:uuid});
            }
        },
        'ui:scene-undo'(event, data) {
            this.undoScene();
        },
        'ui:scene-redo'(event, data) {
            this.redoScene();
        },
        'ui:scene-copy'(event, data) {
            this._doCopyFunc();
        },
        'ui:scene-paste'(event, data) {
            this._doPasteFunc();
        },
        'ui:scene-copyall'(event, data) {
            this._doSelectAll();
        },
        'node:delete_item'(event, data) {
            this._doDeleteFunc();
        },
        'node:copy_paste_item'(event, data) {
            this._doCopyFunc();
            this._doPasteFunc();
        },
        'node:paste_item'(event, data) {
            this._doPasteFunc();
        },
        'node:copy_item'(event, data) {
            this._doCopyFunc();
        },

        "ui:keydownEvent"(ev, event) {
           if(event.keyCode == KeyCodes('c') && event.ctrlKey) {
               this._doCopyFunc();
           } else if(event.keyCode == KeyCodes('v') && event.ctrlKey) {
               this._doPasteFunc();
           } else if(event.keyCode == KeyCodes('a') && event.ctrlKey) {
               this._doSelectAll();
           } else if(event.keyCode == KeyCodes('esc')) {
               this.$.scene.getFabricCanvas().clear();
               this._firstSelectItem = null;
           } else if(event.keyCode == KeyCodes('left') || event.keyCode == KeyCodes('right') || event.keyCode == KeyCodes('up') || event.keyCode == KeyCodes('down')) {
               this._doItemMove(event);
           }
            
           if(event.keyCode == KeyCodes('s') && event.ctrlKey && this._openPath) {
               this._doSaveFunc();
           } else if(event.keyCode == KeyCodes('delete')) {
               this._doDeleteFunc();
           }
        },
        'ui:store-layout'(event, data) {
            if(!global.myDocker) {
                return;
            }
            let _saveLayout = global.myDocker.save();
            window.localStorage["saveLayout"] = _saveLayout;
        },
        'ui:reset-layout'(event, data) {
            if(window.localStorage["saveLayout"] && global.myDocker) {
                global.myDocker.restore(window.localStorage["saveLayout"]);
            }
        },
        'ui:reset-init-layout'(event, data) {
            myDocker.setInitLayout();
        },


    },

  });

})();
