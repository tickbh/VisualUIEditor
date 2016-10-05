'use strict'

Polymer({
  behaviors: [],

  listeners: {
    'focus': '_onFocus',
    'blur': '_onBlur',
    'focusin': '_onFocusIn',
    'focusout': '_onFocusOut',
    'keydown': '_onKeyDown',
    'mousedown': '_onMouseDown'
  },

  properties: {
    placeholder: {
      type: String,
      value: ''
    },

    value: {
      type: String,
      value: '',
      notify: true
    },

    text: {
      type: String,
      value: ''
    },

    readonly: {
      type: Boolean,
      value: false,
      reflectToAttribute: true
    }
  },

  created() {
    this._inited = false
  },

  ready() {
    this._inited = true
  },

  add(value, text) {
    var el = document.createElement('ve-option')
    Polymer.dom(el).textContent = text
    el.value = value.toString()

    Polymer.dom(this).appendChild(el)
  },

  addHtml(value, html) {
    var el = document.createElement('ve-option')
    Polymer.dom(el).innerHTML = html
    el.value = value.toString()

    Polymer.dom(this).appendChild(el)
  },

  showMenu() {
    if (this.$.menu.hidden) {
      this.$.menu.hidden = false
      this.$.menu.focus()
      this._updateMenu()
    }
  },

  attached() {
    if (this.$.menu.selectedItem) {
      if (this.$.menu.selectedItem.text) {
        this.text = this.$.menu.selectedItem.text
      } else {
        this.text = this.$.menu.selectedItem.innerText
      }
    }
  },

  toggleMenu() {
    this.$.menu.hidden = !this.$.menu.hidden

    if (!this.$.menu.hidden) {
      this.$.menu.focus()
      this._updateMenu()
    } else {
      this.focus()
    }
  },

  _onFocusIn() {},

  _onFocusOut() {
    this.async(() => {
      if (!this.focused) {
        this.$.menu.hidden = true
      }
    }, 1)
  },

  _onSelectedItemChanged() {
    if (this.$.menu.selectedItem) {
      if (this.$.menu.selectedItem.text) {
        this.text = this.$.menu.selectedItem.text
      } else {
        this.text = this.$.menu.selectedItem.innerText
      }
    } else {
      this.text = ''
    }
    if (this._inited) {
      this.async(() => {
        this.fire('end-editing', {})
      }, 1)
    }
  },

  _onKeyDown(event) {
    if (this.readonly) {
      return
    }

    // up-arrow
    if (event.keyCode === 38) {
      event.preventDefault()
      event.stopPropagation()

      this.showMenu()
    }
    // down-arrow
    else if (event.keyCode === 40) {
      event.preventDefault()
      event.stopPropagation()

      this.showMenu()
    }
    // space, enter
    else if (event.keyCode === 13 || event.keyCode === 32) {
      event.preventDefault()
      event.stopPropagation()

      this.showMenu()
    }
  },

  _onMouseDown(event) {
    if (this.readonly) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    this.toggleMenu()
  },

  _updateMenu() {
    window.requestAnimationFrame(() => {
      if (this.$.menu.hidden) {
        return
      }

      var bodyBcr = document.body.getBoundingClientRect()
      var menuBcr = this.$.menu.getBoundingClientRect()
      var bcr = this.getBoundingClientRect()

      if (bcr.bottom + menuBcr.height > bodyBcr.bottom) {
        this.$.menu.style.top = 'auto'
        this.$.menu.style.borderTop = '1px solid #0c70a6'

        this.$.menu.style.bottom = (bodyBcr.height - bcr.bottom + bcr.height + 5) + 'px'
        this.$.menu.style.borderBottom = '0px'
      } else {
        this.$.menu.style.top = (bcr.top + bcr.height - 1) + 'px'
        this.$.menu.style.borderTop = '0px'

        this.$.menu.style.bottom = 'auto'
        this.$.menu.style.borderBottom = '1px solid #0c70a6'
      }
      this.$.menu.style.width = bcr.width + 'px'
      this.$.menu.style.left = bcr.left + 'px'

      this._updateMenu()
    })
  },

  _text(text) {
    if (text === '') {
      return this.placeholder
    }
    return text
  },

  _textClass(text) {
    if (text === '') {
      return 'placeholder'
    }
    return ''
  }
})
