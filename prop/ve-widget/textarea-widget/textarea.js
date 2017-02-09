'use strict'
Polymer({
    behaviors: [Polymer.IronValidatableBehavior],

    listeners: {
        'focused-changed': '_onFocusedChanged'
    },

    properties: {
        placeholder: {
            type: String,
            notify: true,
            value: ''
        },

        invalid: {
            type: Boolean,
            value: false
        },

        inputValue: {
            type: String,
            notify: true,
            value: ''
        },

        value: {
            type: String,
            notify: true,
            value: '',
            observer: '_valueChanged'
        },

        readonly: {
            type: Boolean,
            value: false,
            reflectToAttribute: true
        }

    },

    ready() {},

    _valueChanged() {
        this.inputValue = this.value
    },

    clear() {
        this.value = ''
        this.inputValue = ''
    },

    confirm(pressEnter) {
        this.value = this.inputValue
        this.fire('confirm', {
            confirmByEnter: pressEnter
        }, {
            bubbles: false
        })

        this.async(() => {
            this.fire('end-editing')
        }, 1)
    },

    cancel() {
        this.inputValue = this.value
        this.fire('cancel', null, { bubbles: false })

        this.async(() => {
            this.fire('end-editing', { cancel: true })
        }, 1)
    },

    select(start, end) {
        if (typeof start === 'number' && typeof end === 'number') {
            this.$.input.setSelectionRange(start, end)
        } else {
            this.$.input.select()
        }
    },

    _onBlur() {
        this.confirm()
    },

    _onKeyDown(event) {
        // keydown 'enter'
        if (event.keyCode === 13) {
            // event.preventDefault()
            event.stopPropagation()

            this.confirm(true)
                // FocusParent(this)
        }
        // keydown 'esc'
        else if (event.keyCode === 27) {
            event.preventDefault()
            event.stopPropagation()

            this.cancel()
            FocusParent(this)
        }
    },

    _onFocusedChanged(event) {
        if (event.detail.value) {
            this.value = this.inputValue
        } else {
            this.confirm()
        }
    }

})