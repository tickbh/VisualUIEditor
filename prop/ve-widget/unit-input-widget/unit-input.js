'use strict'
Polymer({
    behaviors: [Polymer.IronValidatableBehavior],

    listeners: {
        'keydown': '_onKeyDown',
        'focused-changed': '_onFocusedChanged'
    },

    properties: {
        invalid: {
            type: Boolean,
            value: false
        },

        value: {
            type: Number,
            notify: true,
            value: 0,
            observer: '_valueChanged'
        },

        inputValue: {
            type: Number,
            notify: true,
            value: 0,
            observer: '_inputValueChanged'
        },

        step: {
            type: Number,
            notify: true,
            value: 0.1
        },

        min: {
            type: Number,
            notify: true,
            value: -Number.MAX_VALUE
        },

        max: {
            type: Number,
            notify: true,
            value: Number.MAX_VALUE
        },

        hint: {
            type: String,
            value: ''
        },

        precision: {
            type: Number,
            value: -1
        },

        readonly: {
            type: Boolean,
            value: false,
            reflectToAttribute: true
        }
    },

    created() {
        this._lastValidValue = 0
        this._inited = false
    },

    ready() {
        this.value = this._convert(this.value)
        this.inputValue = this.value
        this.$.input.bindValue = this.value.toString()

        if (!this.hint) {
            this.$.hint.hidden = true
        } else {
            this.$.hint.hidden = false
        }

        this._inited = true
    },

    _inputValueChanged() {
        let val = this._convert(this.inputValue)

        // NOTE: this will prevent value like "0." can not remain in
        // input field when user hit backspace on "0.1"
        if (val !== parseFloat(this.$.input.bindValue)) {
            this.$.input.bindValue = val.toString()
        }
    },

    _valueChanged() {
        this.value = this._convert(this.value)
        this.inputValue = this.value

        // NOTE: this will prevent value like "0." can not remain in
        // input field when user hit backspace on "0.1"
        if (this.value !== parseFloat(this.$.input.bindValue)) {
            this.$.input.bindValue = this.value.toString()
        }
    },

    confirm() {
        this.value = this._convert(this.$.input.bindValue)
        this.inputValue = this.value
        this.$.input.bindValue = this.value.toString()
        this.fire('confirm', null, { bubbles: false })

        this.async(() => {
            this.fire('end-editing')
        }, 1)
    },

    cancel() {
        this.$.input.bindValue = this.value.toString()
        this.fire('cancel', null, { bubbles: false })

        this.async(() => {
            this.fire('end-editing', { cancel: true })
        }, 1)
    },

    _onBlur() {
        this.confirm()
    },

    _onKeyDown(event) {
        // keydown 'enter'
        if (event.keyCode === 13) {
            event.preventDefault()
            event.stopPropagation()

            this.confirm()
            FocusParent(this)
        }
        // keydown 'esc'
        else if (event.keyCode === 27) {
            event.preventDefault()
            event.stopPropagation()

            this.cancel()
            FocusParent(this)
        }
    },

    _onInputKeyDown(event) {

        // keydown 'up'
        if (event.keyCode === 38) {
            event.preventDefault()
            if (this.readonly) {
                return
            }
            this._stepUp()
        }
        // keydown 'down'
        else if (event.keyCode === 40) {
            event.preventDefault()
            if (this.readonly) {
                return
            }
            this._stepDown()
        }
    },

    _onIncreaseClick(event) {
        event.stopPropagation()
            // event.preventDefault()

        this._stepUp()
    },

    _onDecreaseClick(event) {
        event.stopPropagation()
            // event.preventDefault()

        this._stepDown()
    },

    _stepUp() {
        let val = this._nullToFloat(this.$.input.bindValue) + this.step

        if (val >= this.max) {
            this.$.input.bindValue = this.max.toString()
        } else {
            let precision = this.precision
            if (precision === -1) {
                precision = 2
            }
            this.$.input.bindValue = val.toFixed(precision)
        }
    },

    _stepDown() {
        let val = this._nullToFloat(this.$.input.bindValue) - this.step

        if (val <= this.min) {
            this.$.input.bindValue = this.min.toString()
        } else {
            let precision = this.precision
            if (precision === -1) {
                precision = 2
            }
            this.$.input.bindValue = val.toFixed(precision)
        }
    },

    _onIncrease(event) {
        event.stopPropagation()
        event.preventDefault()

        this._timeoutID = setTimeout(() => {
            this._holdingID = setInterval(() => {
                this._stepUp()
            }, 50)
        }, 500)
    },

    _onDecrease: function(event) {
        event.stopPropagation()
        event.preventDefault()

        this.setFocus()

        this._timeoutID = setTimeout(() => {
            this._holdingID = setInterval(() => {
                this._stepDown()
            }, 50)
        }, 500)
    },

    _onStopRoll(event) {
        event.stopPropagation()

        clearInterval(this._holdingID)
        this._holdingID = null

        clearTimeout(this._timeoutID)
        this._timeoutID = null

        setTimeout(() => {
            this.confirm()
        }, 1)
    },

    _onMouseLeave(event) {
        if (this._holdingID) {
            clearInterval(this._holdingID)
            this._holdingID = null
        }

        if (this._timeoutID) {
            clearTimeout(this._timeoutID)
            this._timeoutID = null
        }
    },

    _onHintMounseDown: function(event) {
        event.preventDefault()
        event.stopPropagation()
    },

    _convert(val, noFixedPrecision) {
        if (val === '' || isNaN(val)) {
            return this._lastValidValue
        }

        val = parseFloat(val)
        if (isNaN(val)) {
            val = 0
        }

        // NOTE: do not use clamp(val, min, max), user can only define min or define max
        if (this.min !== undefined) {
            val = Math.max(val, this.min)
        }

        if (this.max !== undefined) {
            val = Math.min(val, this.max)
        }

        if (noFixedPrecision || this.precision === -1) {
            val = parseFloat(val.toFixed(20))
        } else {
            val = parseFloat(val.toFixed(this.precision))
        }
        this._lastValidValue = val

        return val
    },

    _nullToFloat(val) {
        if (!val) {
            return 0
        }

        if (isNaN(val)) {
            return 0
        }

        return parseFloat(val)
    },

    _onBindValueChanged() {
        if (!this._inited) {
            return
        }

        this.inputValue = this._convert(this.$.input.bindValue, true)
    },

    _onFocusedChanged(event) {
        if (!this._inited) {
            return
        }

        this._lastFocused = event.detail.value

        setTimeout(() => {
            if (!this._lastFocused) {
                this.confirm()
            }
        }, 1)
    }
})