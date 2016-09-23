'use strict';


(function() {

    var db = {

        loadData: function(filter) {
            return $.grep(this.clients, function(client) {
                for(var k in client) {
                    if(filter[k] && client[k].indexOf(filter[k]) < 0) {
                        return false;
                    }
                }
                return true;
            });
        },

        insertItem: function(insertingClient) {
            this.clients.push(insertingClient);
            onSaveData();
        },

        updateItem: function(updatingClient) { 
            onSaveData();
        },

        deleteItem: function(deletingClient) {
            var clientIndex = $.inArray(deletingClient, this.clients);
            this.clients.splice(clientIndex, 1);
            onSaveData();
        }

    };

    window.db = db;

    db.clients = [];

}());


function checkKeyValidator(key, item) {
    if(!key || key.length == 0) {
        return false;
    }
    if(key == item.Key) {
        return true;
    }
    for(var i = 0; i < db.clients.length; i++) {
        if(db.clients[i].Key == key) {
            return false;
        }
    }
    return true;
}


function initFromPath() {
    let path = GetConfigValueByKey("currentLangOpenPath", true);
    if(path == null) {
        return;
    }

    let allDatas = GetFileToData(path);
    let clients = [];
    let fields = [
        { name: "Key", type: "text", width: 150,
            validate: { 
                message: "Key Can't Repeat or Empty!!!", 
                validator: checkKeyValidator
            }
        },
        { name: "Zh", type: "text", width: 300 },
        { name: "En", type: "text", width: 250 },
    ]

    let allReadyAdd = {Key: true, Zh:true, En: true};
    window.allReadyAdd = allReadyAdd
    for(var k in allDatas) {
        let data = allDatas[k];
        let format = {Key: k};
        for(var dk in data) {
            if(!allReadyAdd[dk]) {
                fields.push({name: dk, type: "text", width: 200});
                allReadyAdd[dk] = true;
            }
            format[dk] = data[dk];
        }
        clients.push(format);
    }

    db.clients = clients;

    fields.push({ type: "control", modeSwitchButton: false, editButton: false});

    return {fields: fields};
}

$(function() {

    let ret = initFromPath();
    console.log(ret)
    if(!ret) {
        return null;
    }

    $("#jsGrid").jsGrid({
        height: "100%",
        width: "100%",
        filtering: true,
        editing: true,
        inserting: true,
        sorting: true,
        paging: false,
        autoload: true,
        pageSize: 15,
        pageButtonCount: 5,
        deleteConfirm: "确认是否删除？",
        controller: db,
        fields: ret.fields,
    });

});

function onSaveData() {
    let langPath = GetConfigValueByKey("currentLangOpenPath", true);
    if(langPath == null) {
        return;
    }
    let saveData = {};
    for(var i = 0; i < db.clients.length; i++) {
        let data = db.clients[i];
        let newData = {};
        for(var k in data) {
            if(k != "Key") {
                newData[k] = data[k]
            }
        }
        saveData[data.Key] = newData;
    }
    saveLangData(langPath, saveData);
}