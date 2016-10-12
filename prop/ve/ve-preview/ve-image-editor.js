'use strict'
Polymer({
  properties: {
    info: {
      type: String,
      value: 'Unknown'
    },
    path: {
      type: String,
      value: '',
      observer: '_pathChanged'
    }
  },
  ready: function () {
    this.metaData = {}

    this._isReseting = false;

    this.$.insetLeft.prop = {
      path: 'insetLeft',
      type: 'unit-input',
      name: 'insetLeft',
      attrs: {
      },
      value: 0
    }

    this.$.insetTop.prop = {
      path: 'insetTop',
      type: 'unit-input',
      name: 'insetTop',
      attrs: {
      },
      value: 0
    }

    this.$.insetRight.prop = {
      path: 'insetRight',
      type: 'unit-input',
      name: 'insetRight',
      attrs: {
      },
      value: 0
    }

    this.$.insetBottom.prop = {
      path: 'insetBottom',
      type: 'unit-input',
      name: 'insetBottom',
      attrs: {
      },
      value: 0
    }

    this.addEventListener('end-editing', function (e) {
      if (e.detail.cancel || this._isReseting) {
        return
      }
      let path = e.target.path, value = e.target.value
      if (!path) {
        return
      }
      this.metaData[e.target.path] = e.target.value
    })

    
  },
  _onSaveEditor: function() {
    if (!this.path) {
      return
    }
    setMetaData(this.path, this.metaData);
  },

  _pathChanged: function () {
    if (!this.path) {
      return
    }
    this.$.preview.path = this.path;

    this._isReseting = true;
    this.metaData = getMetaData(this.path)
    function setTargetValue(target, value) {
      let prop = dup(target.prop);
      prop.name = "fuck";
      prop.value = value;
      target.prop = prop;

      target.prop = {
        path: 'insetRight',
        type: 'unit-input',
        name: 'insetRight',
        attrs: {
        },
        value: 10
      }
    }
    setTargetValue(this.$.insetLeft, this.metaData.insetLeft || 0)
    // this.$.insetLeft.prop.value = this.metaData.insetLeft || 0;
    this.$.insetTop.prop.value = this.metaData.insetTop || 0;
    this.$.insetRight.prop.value = this.metaData.insetRight || 0;
    this.$.insetBottom.prop.value = this.metaData.insetBottom || 0;

    this._isReseting = false;
  },

})
