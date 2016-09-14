
(() => {
  'use strict';

  Polymer({
    properties: {
      enableDrag: Boolean,
    },

    fixForgeCanvas: function() {
        let rect = this.getBoundingClientRect();
        let canvas = this.$.forgeCanvas;
        canvas.width = rect.width - 5;
        canvas.height = rect.height - 5;
        this.fabricCanvas.setWidth(rect.width - 5);
        this.fabricCanvas.setHeight(rect.height - 5);
    },

    initGameCanvas: function() {
        if (this._isInitGameCanvas) {
            return;
        }
        let rect = this.getBoundingClientRect();
        let canvas = this.$.gameCanvas;
        let canvasRect = canvas.getBoundingClientRect();
        canvas.style.left = (rect.width - canvasRect.width) / 2;
        canvas.style.top = (rect.height - canvasRect.height) / 2;
        this._isInitGameCanvas = true;
    },

    getRunScene: function() {
        return this.runScene;
    },

    getFabricCanvas: function() {
        return this.fabricCanvas;
    },

    ready: function() {
        this.fabricCanvas = new fabric.Canvas(this.$.forgeCanvas);
        this.runScene = null;
        cc.game.run({
            "debugMode"     : 0,
            "showFPS"       : false,
            "frameRate"     : 20,
            "id"            : this.$.gameCanvas,
            "renderMode"    : 1,
        }, function() {
        }.bind(this));

    },

    attached: function() {
    },


    created: function() {
        
    },

    
  });

})();
