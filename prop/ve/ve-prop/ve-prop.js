"use strict";
Polymer({
    listeners: {
        keydown: "_onKeyDown"
    },
    properties: {
        prop: {
            value: function() {
                return {
                    path: "",
                    type: "",
                    name: "",
                    attrs: {},
                    value: null
                }
            },
            notify: true
        },
    },
    ready: function() {
    },
    _nameText: function(name) {
        return name ? ToHumanText(name) : "(Anonymous)"
    },
    _nameClass: function(name) {
        return name ? "name flex-1" : "name anonymous flex-1"
    },
    _onKeyDown: function(event) {

    }
});