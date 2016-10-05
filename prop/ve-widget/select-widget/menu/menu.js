'use strict'

Polymer({
  behaviors: [Polymer.IronMultiSelectableBehavior],

  listeners: {
    'focus': '_onFocus',
    'blur': '_onBlur',
    'keydown': '_onKeyDown',
    'mousedown': '_onMouseDown',
    'click': '_onClick'
  },

  properties: {
    value: {
      type: String,
      value: '',
      notify: true
    },

    text: {
      type: String,
      value: '',
      notify: true
    }
  },

  ready() {
    this.noNavigate = true
  },

  _onMouseDown(event) {
    event.stopPropagation()
  },

  _onClick() {
    this.async(() => {
      this.confirm()
    }, 1)
  },

  _onKeyDown(event) {
    var items

    // up-arrow
    if (event.keyCode === 38) {
      event.preventDefault()
      event.stopPropagation()

      if (!this.selectedItem) {
        items = this.items
        if (items.length > 0) {
          this.select(items[items.length - 1].value)
        }
      } else {
        this.selectPrevious()
      }
    }
    // down-arrow
    else if (event.keyCode === 40) {
      event.preventDefault()
      event.stopPropagation()

      if (!this.selectedItem) {
        items = this.items
        if (items.length > 0) {
          this.select(items[0].value)
        }
      } else {
        this.selectNext()
      }
    }
    // space, enter
    else if (event.keyCode === 13 || event.keyCode === 32) {
      event.preventDefault()
      event.stopPropagation()

      this.confirm()
    }
    // esc
    else if (event.keyCode === 27) {
      event.preventDefault()
      event.stopPropagation()

      this.cancel()
    }
  },

  confirm() {
    if (this.selectedItem && this.selectedItem.disabled) {
      this.cancel()
      return
    }

    this.value = this.selected
    if (this.selectedItem.text) {
      this.text = this.selectedItem.text
    } else {
      this.text = this.selectedItem.innerText
    }

    this.hidden = true
    FocusParent(this)

    this.async(() => {
      this.fire('end-editing')
    }, 1)
  },

  cancel() {
    this.select(this.value)
    this.hidden = true
    FocusParent(this)

    this.async(() => {
      this.fire('end-editing', {cancel: true})
    }, 1)
  }
})
