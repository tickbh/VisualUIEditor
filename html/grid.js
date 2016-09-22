'use strict';


(function() {

    var db = {

        loadData: function(filter) {
            return $.grep(this.clients, function(client) {
                return (!filter.Name || client.Name.indexOf(filter.Name) > -1)
                    && (!filter.Age || client.Age === filter.Age)
                    && (!filter.Address || client.Address.indexOf(filter.Address) > -1)
                    && (!filter.Country || client.Country === filter.Country)
                    && (filter.Married === undefined || client.Married === filter.Married);
            });
        },

        insertItem: function(insertingClient) {
            this.clients.push(insertingClient);
        },

        updateItem: function(updatingClient) { },

        deleteItem: function(deletingClient) {
            var clientIndex = $.inArray(deletingClient, this.clients);
            this.clients.splice(clientIndex, 1);
        }

    };

    window.db = db;

    db.clients = [];

}());

function initFromPath() {
    let path = GetConfigValueByKey("langPath");
    if(path == null) {
        return;
    }

    let allDatas = GetFileToData(path);
    let clients = {};
    let fields = [
        { name: "Key", type: "text", width: 150 },
        { name: "Ch", type: "text", width: 300 },
        { name: "En", type: "text", width: 250 },
    ]

    let allReadyAdd = {Key: true, Ch:true, En: true};
    window.allReadyAdd = allReadyAdd
    for(var k in allDatas) {
        let data = allDatas[k];
        let format = {Key: k};
        for(dk in data) {
            if(!allReadyAdd[dk]) {
                fields.push({name: dk, type: "text": width: 200});
                allReadyAdd[dk] = true;
            }
            foramt[dk] = data[dk];
        }
        clients.push(foramt);
    }

    db.clients = clients;

    fields.push({ type: "control" });

    return {fields: fields};
}

$(function() {

    let ret = initFromPath();
    if(!ret) {
        return null;
    }

    $("#jsGrid").jsGrid({
        height: "80%",
        width: "100%",
        filtering: true,
        editing: true,
        inserting: true,
        sorting: true,
        paging: true,
        autoload: true,
        pageSize: 15,
        pageButtonCount: 5,
        deleteConfirm: "确认是否删除？",
        controller: db,
        fields: ret.fields,
    });

});

function onSaveData() {

}