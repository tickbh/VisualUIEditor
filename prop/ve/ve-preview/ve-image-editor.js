'use strict'

Polymer({
    properties: {
        info: {
            type: String,
            value: 'Unknown'
        },
        path: {
            type: String,
            value: '',
            observer: '_pathChanged'
        }
    },
    ready: function() {
        this.metaData = {}

        this._isReseting = false;

        this._leftProp = {
            path: 'insetLeft',
            type: 'unit-input',
            name: 'insetLeft',
            attrs: {},
            value: 0
        };

        this._topProp = {
            path: 'insetTop',
            type: 'unit-input',
            name: 'insetTop',
            attrs: {},
            value: 0
        }

        this._rightProp = {
            path: 'insetRight',
            type: 'unit-input',
            name: 'insetRight',
            attrs: {},
            value: 0
        }

        this._bottomProp = {
            path: 'insetBottom',
            type: 'unit-input',
            name: 'insetBottom',
            attrs: {},
            value: 0
        }

        this.$.insetLeft.prop = dup(this._leftProp);

        this.$.insetTop.prop = dup(this._topProp);

        this.$.insetRight.prop = dup(this._rightProp);

        this.$.insetBottom.prop = dup(this._bottomProp);

        this.addEventListener('end-editing', function(e) {
            if (e.detail.cancel || this._isReseting) {
                return
            }
            let path = e.target.path,
                value = e.target.value
            if (!path) {
                return
            }
            this.metaData[e.target.path] = e.target.value
        })


    },
    _onSaveEditor: function() {
        if (!this.path) {
            return
        }
        setMetaData(this.path, this.metaData);
    },

    _pathChanged: function() {
        if (!this.path) {
            return
        }
        this.$.preview.path = this.path;

        this._isReseting = true;
        this.metaData = getMetaData(this.path)

        function setTargetValue(target, prop, value) {
            let new_prop = dup(prop);
            new_prop.value = value;
            target.prop = {};
            target.prop = new_prop;
        }
        setTargetValue(this.$.insetLeft, dup(this._leftProp), this.metaData.insetLeft || 0)
        setTargetValue(this.$.insetTop, this._topProp, this.metaData.insetTop || 0)
        setTargetValue(this.$.insetRight, this._rightProp, this.metaData.insetRight || 0)
        setTargetValue(this.$.insetBottom, this._bottomProp, this.metaData.insetBottom || 0)

        this._isReseting = false;
    },

})