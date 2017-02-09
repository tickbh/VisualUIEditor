'use strict'
Polymer({
    properties: {
        path: {
            type: String,
            value: ''
        },
        type: {
            type: String,
            value: '',
            observer: '_typeChanged'
        },
        attrs: {
            type: Object,
            value: function() {
                return {}
            },
            observer: '_attrsChanged'
        },
        value: {
            value: null,
            notify: true,
            observer: '_valueChanged'
        }
    },
    ready: function() {
        this.rebuild()
    },
    rebuild: function() {
        var t = this
        this.async(function() {
            t._rebuild()
        }, 50)
    },
    _rebuild: function() {
        var t = Polymer.dom(this),
            e = void 0
        let element_name = this.type || 'input'
        element_name = 've-' + element_name
        let child = t.firstChild
        let isRecreate = false
        if (!t.firstChild || t.firstChild.localName != element_name) {
            child = document.createElement(element_name)
            isRecreate = true
        }
        t.firstChild && t.removeChild(t.firstChild)
        child.value = this.value
        child.attrs = this.attrs
        child.path = this.path
        if (isRecreate) {
            if (this.type == 'select') {
                let selects = this.attrs.selects || {}
                for (var k in selects) {
                    child.add(k, selects[k])
                }
                child.text = selects[this.value]
            }
        }


        t.appendChild(child)
    },
    _valueChanged: function(t, e) {
        if (!isNull(t) && !isNull(e) && typeof t != typeof e) {
            this.rebuild()
        }
    },
    _attrsChanged: function() {
        this.rebuild()
    },
    _typeChanged: function() {
        this.rebuild()
    }
})