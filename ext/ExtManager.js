

let allExtNodeControls = {};

function RegisterExtNodeControl(name, nodeControl) {
    allExtNodeControls[name] = nodeControl;
    //TODO check
    Ipc.sendToAll('ui:has_extnodecontrol_add', name);
}

function GetExtNodeControl(name) {
    return allExtNodeControls[name];
}

function GetExtllNodeControls() {
    return allExtNodeControls;
}

function SetSpriteFrame(node, path, value, defRes, fn) {
    let url = getFullPathForName(value);
    let exist = checkTextureExist(url);
    value = exist ? value : defRes;
    let newPath = "_" + path;
    node[newPath] = value;
    fn.call(node, getFullPathForName(value));
}
