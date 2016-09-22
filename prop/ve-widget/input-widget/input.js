'use strict';

Polymer({
  behaviors: [Polymer.IronValidatableBehavior],

  listeners: {
    'focused-changed': '_onFocusedChanged',
  },

  properties: {
    placeholder: {
      type: String,
      notify: true,
      value: ''
    },

    inputValue: {
      type: String,
      notify: true,
      value: '',
    },

    value: {
      type: String,
      notify: true,
      value: '',
      observer: '_valueChanged'
    },

    cancelable: {
      type: Boolean,
      value: false,
      reflectToAttribute: true
    },

    type: {
      type: String,
      value: 'text'
    }
  },

  created () {
    this._inited = false;
  },

  ready () {
    this._inited = true;
  },

  _valueChanged () {
    this.inputValue = this.value;
  },

  clear () {
    this.value = '';
    this.inputValue = '';
    this.confirm();
  },

  confirm ( pressEnter ) {
    this.value = this.inputValue;
    this.fire('confirm', {
      confirmByEnter: pressEnter,
    }, {
      bubbles: false
    });
    if(!this._inited) {
      return;
    }
    this.async(() => {
      this.fire('end-editing');
    },1);
  },

  cancel() {
    this.inputValue = this.value;
    this.fire('cancel', null, {bubbles: false} );

    this.async(() => {
      this.fire('end-editing', {cancel: true});
    },1);
  },

  select ( start, end ) {
    if ( typeof start === 'number' && typeof end === 'number' ) {
      this.$.input.setSelectionRange( start, end );
    }
    else {
      this.$.input.select();
    }
  },

  _onKeyDown (event) {
    // keydown 'enter'
    if (event.keyCode === 13) {
      event.preventDefault();
      event.stopPropagation();

      this.confirm(true);
      FocusParent(this);
    }
    // keydown 'esc'
    else if (event.keyCode === 27) {
      event.preventDefault();
      event.stopPropagation();

      this.cancel();
      FocusParent(this);
    }
  },

  _onFocusedChanged ( event ) {
    if(!this._inited) {
      return;
    }
    this._lastFocused = event.detail.value;

    setTimeout(() => {
      if ( !this._lastFocused ) {
        this.confirm();
      }
    },1);
  },

  _checkCancelable (inputValue) {
    return this.cancelable && inputValue;
  },

  _onClear ( event ) {
    event.preventDefault();
    event.stopPropagation();
    this.fire('clear', null, {bubbles: false} );
    this.inputValue = '';
    this.confirm();
  }

});
