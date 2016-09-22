$(document).ready(function() {

  // --------------------------------------------------------------------------------
  // Create an instance of our docker window and assign it to the document.
  var myDocker = new wcDocker('.dockerContainer', {
    allowDrawers: true,
    responseRate: 10,
    themePath: 'app://js/Themes',
    theme: 'default.min'
  });
  if (myDocker) {

    var _currentTheme = 'default.min';
    var _showingInfo  = true;
    var _savedLayout  = null;
    var _chatterIndex = 1;

    myDocker.registerPanelType('NodePanel', {
      faicon: 'cubes',
      onCreate: function(myPanel) {
        myPanel.initSize(200, 400);
        myPanel.maxSize(250, Infinity);
        var $node = $('<ve-nodeorder id="NodePanel" style="position:absolute;top:0px;left:0px;right:0px;bottom:0px;"></ve-nodeorder>');
        myPanel._main = $node[0];
        myPanel.layout().addItem($node).stretch('', '100%');
      },
    });

    myDocker.registerPanelType('ResourcePanel', {
      faicon: 'cubes',
      onCreate: function(myPanel) {
        var $node = $('<ve-resorder style="position:absolute;top:0px;left:0px;right:0px;bottom:0px;"></ve-resorder>');
        myPanel._main = $node[0];
        myPanel.layout().addItem($node).stretch('', '100%');
      },
    });

   myDocker.registerPanelType('ControlPanel', {
      faicon: 'cubes',
      onCreate: function(myPanel) {
        myPanel.maxSize(200, Infinity);
        var $node = $('<ve-controlpanel style="position:absolute;top:0px;left:0px;right:0px;bottom:0px;"></ve-controlpanel>');
        myPanel._main = $node[0];
        myPanel.layout().addItem($node).stretch('', '100%');
      },
    });


    myDocker.registerPanelType('ConsolePanel', {
      faicon: 'cubes',
      onCreate: function(myPanel) {

        var $node = $('<ve-console style="position:absolute;top:0px;left:0px;right:0px;bottom:0px;"></ve-console>');
        myPanel._main = $node[0];
        myPanel.layout().addItem($node).stretch('', '100%');
      },
    });


    myDocker.registerPanelType('RenderPanel', {
      isPersistent: true,
      faicon: 'cubes',
      onCreate: function(myPanel) {

        var $node = $('<ve-renderpanel id="render" style="position:absolute;top:0px;left:0px;right:0px;bottom:0px;"></ve-renderpanel>');
        myPanel._main = $node[0];
        myPanel.layout().addItem($node).stretch('', '100%');
        myPanel.on(wcDocker.EVENT.RESIZED, function(data) {

          
          Ipc.sendToAll("panelResized")
        });
        
        myPanel.on(wcDocker.EVENT.GAIN_FOCUS, function(data) {
          myPanel._main.focus();
          console.log("RenderPanel GAIN_FOCUS");
        });

        myPanel.on(wcDocker.EVENT.LOST_FOCUS, function(data) {
          console.log("RenderPanel lose focus");
        });
        
      },
    });


    myDocker.registerPanelType('PropPanel', {
      faicon: 'cubes',
      onCreate: function(myPanel) {

        var $node = $('<ve-proppanel style="position:absolute;top:0px;left:0px;right:0px;bottom:0px;"></ve-proppanel>');
        myPanel._main = $node[0];
        myPanel.layout().addItem($node).stretch('', '100%');
      },
    });

    // myDocker.registerPanelType('GridPanel', {
    //   faicon: 'cubes',
    //   onCreate: function(myPanel) {

    //     var $node = $('<ve-gridpanel style="position:absolute;top:0px;left:0px;right:0px;bottom:0px;"></ve-gridpanel>');
    //     myPanel.initSize(600, Infinity);
    //     myPanel.minSize(200, Infinity);
    //     myPanel._main = $node[0];
    //     myPanel.layout().addItem($node).stretch('', '100%');
    //   },
    // });

    myDocker.registerPanelType('Theme Builder', {
      faicon: 'map',
      onCreate: wcThemeBuilder
    });

    global.myDocker = myDocker;
    myDocker.startLoading('Loading...');

    myDocker.setInitLayout = function() {
      myDocker.clear();
      var nodePanel = myDocker.addPanel('NodePanel', wcDocker.DOCK.LEFT, null);
      var controlPanel = myDocker.addPanel('ControlPanel', wcDocker.DOCK.RIGHT, null, {w: '200px'});
      var renderPanel = myDocker.addPanel('RenderPanel', wcDocker.DOCK.RIGHT, controlPanel);
      var propPanel = myDocker.addPanel('PropPanel', wcDocker.DOCK.RIGHT, null, {w:"200px"});
      var consolePanel = myDocker.addPanel('ConsolePanel', wcDocker.DOCK.BOTTOM, wcDocker.COLLAPSED, {h: '20%'});
      var resourcePanel = myDocker.addPanel('ResourcePanel', wcDocker.DOCK.BOTTOM, nodePanel, {h: '60%'});
      // var gridPanel = myDocker.addPanel('GridPanel', wcDocker.DOCK.LEFT, wcDocker.COLLAPSED, {h: '20%'});
    }

    if(window.localStorage["saveLayout"]) {
        myDocker.restore(window.localStorage["saveLayout"]);
    } else {
      myDocker.setInitLayout();
    }

    myDocker.on(wcDocker.EVENT.LOADED, function() {
      myDocker.finishLoading(500);
    });

    document.body.addEventListener("keydown", function(event) {
        Ipc.sendToAll("ui:keydownEvent", {keyCode: event.keyCode, ctrlKey: event.ctrlKey, shiftKey: event.shiftKey, altKey: event.altKey});
    });

  }
});