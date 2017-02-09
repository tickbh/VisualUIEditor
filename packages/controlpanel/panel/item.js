(() => {
    'use strict'

    Polymer({
        properties: {
            icon: {
                type: String,
                value: ''
            },

            name: {
                type: String,
                value: ''
            }
        },

        dragStart: function(ev) {
            ev.stopPropagation()
            ev.dataTransfer.dropEffect = 'move'
            ev.dataTransfer.clearData()
            ev.dataTransfer.setData('controlType', this.name)
            ev.target.style.opacity = '0.4'
        },

        dragEnd: function(ev) {
            ev.preventDefault()
            ev.target.style.opacity = '1'
        },

        ready() {
            this['ondragstart'] = this.dragStart.bind(this)
            this['ondragend'] = this.dragEnd.bind(this)
        }

    })
})()