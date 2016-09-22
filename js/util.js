var fs = require('fs')
var Path = require('path');

function gen_uuid() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";
 
    var uuid = s.join("");
    return uuid;
}

function print_func(o) {
  var result = '';
  var type = typeof o;
  switch(type) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'undefined':
        break;
    case 'function':
        result += o;
        break;
    case 'object':
    default:
      result += '[';
      for(var key in o) {
         if (typeof o[key] == "function") {
            result += key + ", ";
         }
      }
      result += ']';
  }
  console.log(result);
  return result;
}

function print_keys(o) {
  var result = '';
  var type = typeof o;
  switch(type) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'undefined':
        break;
    case 'function':
        result += o;
        break;
    case 'object':
    default:
      result += '[';
      for(var key in o) {
        result += key + ", ";
      }
      result += ']';
  }
  console.log(result);
  return result;
}

function print_r(o, depth) {
      var result = '';
      depth || (depth=1);
      if(depth > 3) {
          return result;
      }
      var indent = new Array(4*depth+1).join(' ');
      var indentNext = new Array(4*(depth+1)+1).join(' ');
      var indentNextTwo = new Array(4*(depth+2)+1).join(' ');
      var tmp = '';
      var type = typeof o;
      switch(type) {
        case 'string':
        case 'number':
        case 'boolean':
        case 'undefined':
        case 'function':
          tmp += indent + indentNext + o + "\n";
          break;
        case 'object':
        default:
          for(var key in o) {
            tmp += indentNextTwo + '[' + key + '] = ';
            tmp += print_r(o[key], (depth+1));
          }
      }
      result += type + "\n";
      result += indentNext + '(' + "\n";
      result += tmp;
      result += indentNext + ')' + "\n";
      console.log(result)
      return result;
};


function getFileName(path) {
    var result = path;
    var index = 0;
    for(var i = path.length - 2; i >= 0; i--) {
        if(path.charAt(i) == '\\' || path.charAt(i) == '/') {
            index = Math.min(i + 1, path.length - 1);
            break;
        }
    }
    return path.substring(index);
}
 
//遍历文件夹，获取所有文件夹里面的文件信息
/*
 * @param path 路径
 *
 */
 
function getFileList(path, filter)
{
    var filesList = [];
    var childList = [];
    filesList.push({
        name: getFileName(path),
        isDirectory: true,
        children: childList,
        path: path,
    });
    readFile(path,childList, filter)
    return filesList;
}
 
//遍历读取文件
function readFile(path,filesList, filter)
{
    files = fs.readdirSync(path);//需要用到同步读取
    files.forEach(walk);
    function walk(file)
    { 
        if(filter && filter(file)) {
            return;
        }
        states = fs.statSync(path+'/'+file);   
        if(states.isDirectory())
        {

            var childList = [];
            readFile(path+'/'+file, childList, filter);
            filesList.push({
                name: file,
                isDirectory: true,
                children: childList,
                path: path + "/" + file,
            })
        }
        else
        {
            filesList.push({
                name: file,
                isDirectory: false,
                path: path + "/" + file,
            })
        }  
    }
}
 
isSelfOrAncient = function ( node, parentNode) {
  let parent = node;
  while ( parent ) {
    if ( parent === parentNode ) {
      return true;
    }

    parent = parent.getParent();
  }

  return false;
};



/**
 *判断str1字符串是否以str2为结束
 *@param str1 原字符串
 *@param str2 子串
 *@author pansen
 *@return 是-true,否-false
 */
function endWith(str1, str2) {
    if (str1 == null || str2 == null) {
        return false;
    }
    if (str1.length < str2.length) {
        return false;
    } else if (str1 == str2) {
        return true;
    } else if (str1.substring(str1.length - str2.length) == str2) {
        return true;
    }
    return false;
}
/**
 *判断str1字符串是否以str2为开头
 *@param str1 原字符串
 *@param str2 子串
 *@author pansen
 *@return 是-true,否-false
 */
function startWith(str1, str2) {
    if (str1 == null || str2 == null) {
        return false;
    }
    if (str1.length < str2.length) {
        return false;
    } else if (str1 == str2) {
        return true;
    } else if (str1.substr(0, str2.length) == str2) {
        return true;
    }
    return false;
}

function getParentDir(path) {
    let ret = Path.parse(path);
    return ret.dir;
}

function deleteFolderRecursive(path) {
    
    if( !fs.existsSync(path) ) {
        return;
    }

    if(!fs.statSync(path).isDirectory()) {
        return fs.unlinkSync(path);
    }

    var files = [];
    files = fs.readdirSync(path);
    files.forEach(function(file, index){

        var curPath = path + "/" + file;
        if(fs.statSync(curPath).isDirectory()) { // recurse
            deleteFolderRecursive(curPath);
        } else { // delete file
            fs.unlinkSync(curPath);
        }
    });

    fs.rmdirSync(path);

};

function getCanUseFolder(path) {
    let prefix = "UIFolder";
    let name = '';
    for(var i = 0; i < 100000; i++) {
        name = prefix + " " + i;
        if(!fs.existsSync(path + "/" + name)) {
            break;
        }
    }

    return {
        name: name,
        isDirectory: true,
        children: [],
        path: path + "/" + name,
    };
}

function getCanUseFile(path) {
    let prefix = "UIFile";
    let suffix = ".ui";
    let name = '';
    for(var i = 0; i < 100000; i++) {
        name = prefix + " " + i + suffix;
        if(!fs.existsSync(path + "/" + name)) {
            break;
        }
    }

    return {
        name: name,
        isDirectory: false,
        children: [],
        path: path + "/" + name,
    };
}

function isNum(value) {
    return typeof value == "number";
}


function isNull(value) {
    return value === null || value === undefined;
}

function isValue(value) {
    return !isNull(value);
}


function fixFloatValue(value, precision) {
    return parseFloat(parseFloat(value).toFixed(precision || 0));
}


function merge(src, t) {
    if(typeof src != "object" || typeof t != "object") {
        return src
    }
    for (k in t) {
        src[k] = t[k]
    }
    return src
}

function dup(t) {
    if(typeof t != "object") {
        return t
    }
    let src = {};
    for (k in t) {
        src[k] = t[k]
    }
    return src
}
 
// 动态插入script标签 
function createScript(url, callback){ 
    var oScript = document.createElement('script'); 
    oScript.type = 'text/javascript'; 
    oScript.async = true; 
    oScript.src = url; 
    /* 
    ** script标签的onload和onreadystatechange事件 
    ** IE6/7/8支持onreadystatechange事件 
    ** IE9/10支持onreadystatechange和onload事件 
    ** Firefox/Chrome/Opera支持onload事件 
    */ 

    // 判断IE8及以下浏览器 
    var isIE = !-[1,]; 
    if(isIE){ 
        alert('IE') 
        oScript.onreadystatechange = function(){ 
            if(this.readyState == 'loaded' || this.readyState == 'complete'){ 
            callback(); 
            } 
        } 
    } else { 
        // IE9及以上浏览器，Firefox，Chrome，Opera 
        oScript.onload = function(){ 
            callback(); 
        } 
    } 
    document.body.appendChild(oScript); 
} 


function AddLinkToScripte(url, callback) {
    if(!fs.existsSync(url)) {
        callback();
        return;
    }
    var head = document.getElementsByTagName('head')[0], linkTag = document.createElement('link');
    linkTag.id = 'dynamic-style';
    linkTag.href = url;
    linkTag.setAttribute('rel','import');

    linkTag.onload = linkTag.readystatechange = function () {  
        callback();
    }
    head.appendChild(linkTag);
}

function GetFileToData(file) {
    let content = fs.readFileSync(file);
    return JSON.parse(content || "{}");
}

var configFile = "ProgramConfig.json";
function GetConfigData() {
    if(!fs.existsSync(configFile)) {
        return {}; 
    }
    let content = fs.readFileSync(configFile);
    return JSON.parse(content || "{}");
}

function AddOrModifyConfig(key, value) {
    let data = GetConfigData();
    data[key] = value;
    fs.writeFileSync(configFile, JSON.stringify(data, null, 4));
}

function GetConfigValueByKey(key) {
    let data = GetConfigData();
    return data[key];
}

function mkdirPath(dirpath, mode) {
    if (!fs.existsSync(dirpath)) {
        if (!fs.mkdirSync(dirpath, mode)) {
            return false;
        }
    }
    return true;
}

function ensureLangExist(langFolder) {
    if(!mkdirPath(langFolder)) {
        return false;
    }

    let langPath = langFolder + "/lang.txt";
    if (!fs.existsSync(langPath)) {
        let test = {test: {Zh:"测试", En:"test"}};
        fs.writeFileSync(langPath, JSON.stringify(test, null, 4));
    }
    return true;
}

function saveLangData(langPath, data) {
    AddOrModifyConfig("modify:" + langPath, true);
    fs.writeFileSync(langPath, JSON.stringify(data, null, 4));
}