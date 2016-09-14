(() => {
  'use strict';

  Polymer({
    properties: {
      type: {
        type: String,
        value: 'log',
        reflectToAttribute: true,
      },

      count: {
        type: Number,
        value: 0,
      },

      desc: {
        type: String,
        value: '',
      },

      detail: {
        type: String,
        value: '',
      },

      showCount: {
        type: Boolean,
        value: false,
      },

      folded: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
      },
    },

    ready () {
    },

    _typeClass ( type ) {
      return 'item layout vertical ' + type;
    },

    _iconClass (type) {
      switch (type) {
        case 'error':
          return 'fa fa-times-circle icon';

        case 'warn':
          return 'fa fa-warning icon';

        default:
          return '';
      }
    },

    _textClass (detail) {
      if (detail) {
        return 'more';
      }
    },

    _showCount ( showCount, count ) {
      if ( showCount && count > 0 ) {
        return true;
      }

      return false;
    },

    _computedCount ( count ) {
      return count + 1;
    },

    _onFoldClick () {
      this.set( 'folded', !this.folded );
    },

    _foldClass ( detail, folded ) {
      if (!detail) {
        return;
      }
      return folded ? 'fa fold fa-caret-down' : 'fa fold fa-caret-right';
    },
  });
})();
