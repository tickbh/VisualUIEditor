(() => {
  'use strict';
  var dragIdName = "NodeMoveUUID";
  
  Polymer({
    properties: {
        show_items: {
            type: Array,
            value: function () { return []; },
        }
    },

    

    addFunc: function(data) {

    },


    ready: function () {
        let show_items = [];
        var nodes=GetExtllNodeControls();
        for (name in nodes)
        {
            let node = nodes[name]
            show_items.push({icon:node.icon, name:node.name, tag:node.tag});
        }

        this.resetSortItems(show_items);
    },

    resetSortItems: function(items) {
        items.sort(function(a,b){
            return (a.tag - b.tag)
        });
        let newItems = [];

        for(let i = 0; i < items.length; i++) {
            if(items[i].tag >= 0) {
                newItems.push(items[i]);
            }
        }

        this.show_items = newItems;
    },

    messages: {
      "ui:has_extnodecontrol_add"(event, name) {
          let nodeControl = GetExtNodeControl(name);
          this.show_items.push({icon:nodeControl.icon, name:nodeControl.name, tag:nodeControl.tag})

          this.resetSortItems(this.show_items)
      },
    },

  });

})();
