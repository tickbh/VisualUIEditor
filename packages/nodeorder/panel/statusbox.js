'use strict';
Polymer({
    behaviors: [Polymer.IronButtonState],

    listeners: {
        'focus': '_onFocus',
        'blur': '_onBlur',
        'click': '_onClick',
    },

    properties: {
        activited: {
            type: Boolean,
            value: true,
            notify: true,
            reflectToAttribute: true,
        },

        readonly: {
            type: Boolean,
            value: false,
            reflectToAttribute: true,
        },

        bgIcon: {
            type: String,
            notify: true,
            value: "fa fa-circle-o",
        },

        activiteIcon: {
            type: String,
            notify: true,
            value: "fa fa-eye",
        },
    },

    ready() {},

    _statusIconClass(activited) {
        if (activited)
            return this.activiteIcon;

        return this.bgIcon;
    },

    _onClick(event) {
        event.stopPropagation();

        this.activited = !this.activited;
        this.async(() => {
            this.fire('end-editing');
        }, 1);
    },
});