(() => {
    'use strict'

    Polymer({
        properties: {
            logs: {
                type: Array,
                value() {
                    return []
                }
            },

            filterOption: {
                type: String,
                value: 'All'
            },
            filterText: {
                type: String,
                value: ''
            },

            useRegex: {
                type: Boolean,
                value: false
            },

            collapse: {
                type: Boolean,
                value: true
            },

            logsCount: {
                type: Number,
                value: 0
            }
        },

        ready() {
            this._addLogTimeoutID = null
            this._logsToAdd = []
            Ipc.sendToMain('ui:console-query', (err, results) => {
                for (let i = 0; i < results.length; ++i) {
                    let item = results[i]
                    this.add(item.type, item.message)
                }
            })
        },

        messages: {
            'ui:console-log' (event, message) {
                this.add('log', message)
            },

            'ui:console-success' (event, message) {
                this.add('success', message)
            },

            'ui:console-failed' (event, message) {
                this.add('failed', message)
            },

            'ui:console-info' (event, message) {
                this.add('info', message)
            },

            'ui:console-warn' (event, message) {
                this.add('warn', message)
            },

            'ui:console-error' (event, message) {
                this.add('error', message)
            },

            'ui:console-clear' () {
                this._clear()
            }
        },

        add(type, text) {
            let desc = text.split('\n')[0]
            let detail = ''
            let firstLine = text.indexOf('\n')

            if (firstLine > 0) {
                detail = text.substring(firstLine + 1)
            }

            this._logsToAdd.push({
                type: type,
                text: text,
                desc: desc,
                detail: detail,
                count: 0
            })

            if (this._addLogTimeoutID) {
                return
            }

            this._addLogTimeoutID = setTimeout(() => {
                this._addLogTimeoutID = null

                let args = ['logs', this.logs.length, 0].concat(this._logsToAdd)
                this.splice.apply(this, args)

                this._logsToAdd.length = 0
                this.logsCount = this.logs.length

                // to make sure after layout and before render
                if (!this._scrollTaskID) {
                    this._scrollTaskID = window.requestAnimationFrame(() => {
                        this._scrollTaskID = null
                        this.$.view.scrollTop = this.$.view.scrollHeight
                    })
                }
            }, 50)
        },

        clear() {
            this._clear()
            Ipc.sendToMain('console:clear')
        },

        _clear() {
            this.logs = []
            this.logsCount = this.logs.length
        },

        _onOpenLogFile() {
            let rect = this.$.openLogBtn.getBoundingClientRect()
        },

        applyFilter(logsCount, filterText, filterOption, useRegex, collapse) {
            let filterLogs = []
            let type = filterOption.toLowerCase()

            let filter
            if (useRegex) {
                try {
                    filter = new RegExp(filterText)
                } catch (err) {
                    filter = new RegExp('')
                }
            } else {
                filter = filterText.toLowerCase()
            }

            let log = null

            for (let i = 0; i < this.logs.length; ++i) {
                let log_ = this.logs[i]

                log = {
                    type: log_.type,
                    text: log_.text,
                    desc: log_.desc,
                    detail: log_.detail,
                    count: 0
                }

                if (type !== 'all' && log.type !== type) {
                    continue
                }

                if (useRegex) {
                    if (!filter.exec(log.text)) {
                        continue
                    }
                } else {
                    if (log.text.toLowerCase().indexOf(filter) === -1) {
                        continue
                    }
                }

                // check duplicate if collapse
                if (collapse && filterLogs.length > 0) {
                    let loopCount = Math.min(filterLogs.length, 6)
                    let duplicateLog = false
                    for (let i = filterLogs.length - 1; i > filterLogs.length - loopCount; --i) {
                        let filterLog = filterLogs[i]
                        if (log.text === filterLog.text && log.type === filterLog.type) {
                            filterLog.count += 1
                            duplicateLog = true
                            break
                        }
                    }
                    if (duplicateLog === false) {
                        filterLogs.push(log)
                    }
                } else {
                    filterLogs.push(log)
                }
            }

            return filterLogs
        }
    })
})()