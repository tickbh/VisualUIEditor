'use strict';

Polymer({
  behaviors: [Polymer.IronButtonState],

  listeners: {
    'focus': '_onFocus',
    'blur': '_onBlur',
    'click': '_onEndEditing',
  },

  properties: {
    nofocus: {
      type: Boolean,
      value: false,
      notify: true,
      reflectToAttribute: true,
    },
  },

  ready () {
    this.noNavigate = this.nofocus;
  },

  _onEndEditing () {
    this.fire('confirm', {
      confirmByEnter: true,
    }, {
      bubbles: false
    });

    this.async(() => {
      this.fire('end-editing');
    },1);
  },
});
