/**
 *
 *  You can modify and use this source freely
 *  only for the development of application related Live2D.
 *
 *  (c) Live2D Inc. All rights reserved.
 */

//============================================================
//============================================================
//  class PlatformManager     extend IPlatformManager
//============================================================
//============================================================
function PlatformManager() {

}

//============================================================
//    PlatformManager # loadBytes()
//============================================================
PlatformManager.prototype.loadBytes = function (path/*String*/, callback) {
    var request = new XMLHttpRequest();
    request.open("GET", path, true);
    request.responseType = "arraybuffer";
    request.onload = function () {
        if (request.response) {
            callback(request.response);
        } else {
            console.error("Failed to load (" + request.status + ") : " + path);
            break;
        }
    }
    request.send(null);
    //return request;
}

//============================================================
//    PlatformManager # loadString()
//============================================================
PlatformManager.prototype.loadString = function (path/*String*/) {

    this.loadBytes(path, function (buf) {
        return buf;
    });

}

//============================================================
//    PlatformManager # loadLive2DModel()
//============================================================
PlatformManager.prototype.loadLive2DModel = function (path/*String*/, callback) {
    var model = null;

    // load moc
    this.loadBytes(path, function (buf) {
        model = Live2DModelWebGL.loadModel(buf);
        callback(model);
    });

}

//============================================================
//    PlatformManager # loadTexture()
//============================================================
PlatformManager.prototype.loadTexture = function (model/*ALive2DModel*/, no/*int*/, path/*String*/, obj/*context*/, callback) {
    // load textures
    var loadedImage = new Image();
    let getImageBlob = (url, callback) => {
        let xhr = new XMLHttpRequest();
        xhr.open('get', url);
        xhr.responseType = 'blob';
        xhr.onload = function () {
            callback(this.response)
        }
        xhr.send();
    }
    getImageBlob(path, (blob) => {
        loadedImage.src = URL.createObjectURL(blob)
    })
    loadedImage.onload = function () {

        // create texture
        // var canvas = document.getElementById("glcanvas");
        // var gl = getWebGLContext(canvas, {premultipliedAlpha : true});
        let canvas = obj.canvas
        let gl = obj.gl
        let texture = gl.createTexture();
        if (!texture) { console.error("Failed to generate gl texture name."); return -1; }

        if (model.isPremultipliedAlpha() == false) {
            // 乗算済アルファテクスチャ以外の場合
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
        }
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
            gl.UNSIGNED_BYTE, loadedImage);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        model.setTexture(no, texture);

        // テクスチャオブジェクトを解放
        texture = null;

        if (typeof callback == "function") callback();
    };

    loadedImage.onerror = function () {
        console.error("Failed to load image : " + path);
    }
}


//============================================================
//    PlatformManager # parseFromBytes(buf)

//============================================================
PlatformManager.prototype.jsonParseFromBytes = function (buf) {

    var jsonStr;



    var bomCode = new Uint8Array(buf, 0, 3);
    if (bomCode[0] == 239 && bomCode[1] == 187 && bomCode[2] == 191) {
        jsonStr = String.fromCharCode.apply(null, new Uint8Array(buf, 3));
    } else {
        jsonStr = String.fromCharCode.apply(null, new Uint8Array(buf));
    }

    var jsonObj = JSON.parse(jsonStr);

    return jsonObj;
};


//============================================================
//    PlatformManager # log()
//============================================================
PlatformManager.prototype.log = function (txt/*String*/) {
    console.log(txt);
}
