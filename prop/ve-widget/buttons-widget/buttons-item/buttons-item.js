'use strict'

Polymer({
  behaviors: [Polymer.IronButtonState],

  listeners: {
    'focus': '_onFocus',
    'blur': '_onBlur',
    'click': '_onEndEditing'
  },

  properties: {
    selected: {
      type: Boolean,
      value: false,
      notify: true,
      reflectToAttribute: true
    }
  },

  ready() {
    this.noNavigate = this.nofocus
  },

  _onEndEditing() {
    this.async(() => {
      this.fire('end-editing')
    }, 1)
  }
})
