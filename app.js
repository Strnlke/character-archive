/*
  Third-party dependency: JSZip 3.10.1. MIT licensed.
  The following notice applies to the bundled JSZip code:

Copyright (c) 2009-2016 Stuart Knightley, David Duponchel, Franz Buchinger, António Afonso

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
/*!

JSZip v3.10.1 - A JavaScript class for generating and reading zip files
<http://stuartk.com/jszip>

(c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/main/LICENSE.markdown.

JSZip uses the library pako released under the MIT license :
https://github.com/nodeca/pako/blob/main/LICENSE
*/

!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).JSZip=e()}}(function(){return function s(a,o,h){function u(r,e){if(!o[r]){if(!a[r]){var t="function"==typeof require&&require;if(!e&&t)return t(r,!0);if(l)return l(r,!0);var n=new Error("Cannot find module '"+r+"'");throw n.code="MODULE_NOT_FOUND",n}var i=o[r]={exports:{}};a[r][0].call(i.exports,function(e){var t=a[r][1][e];return u(t||e)},i,i.exports,s,a,o,h)}return o[r].exports}for(var l="function"==typeof require&&require,e=0;e<h.length;e++)u(h[e]);return u}({1:[function(e,t,r){"use strict";var d=e("./utils"),c=e("./support"),p="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";r.encode=function(e){for(var t,r,n,i,s,a,o,h=[],u=0,l=e.length,f=l,c="string"!==d.getTypeOf(e);u<e.length;)f=l-u,n=c?(t=e[u++],r=u<l?e[u++]:0,u<l?e[u++]:0):(t=e.charCodeAt(u++),r=u<l?e.charCodeAt(u++):0,u<l?e.charCodeAt(u++):0),i=t>>2,s=(3&t)<<4|r>>4,a=1<f?(15&r)<<2|n>>6:64,o=2<f?63&n:64,h.push(p.charAt(i)+p.charAt(s)+p.charAt(a)+p.charAt(o));return h.join("")},r.decode=function(e){var t,r,n,i,s,a,o=0,h=0,u="data:";if(e.substr(0,u.length)===u)throw new Error("Invalid base64 input, it looks like a data url.");var l,f=3*(e=e.replace(/[^A-Za-z0-9+/=]/g,"")).length/4;if(e.charAt(e.length-1)===p.charAt(64)&&f--,e.charAt(e.length-2)===p.charAt(64)&&f--,f%1!=0)throw new Error("Invalid base64 input, bad content length.");for(l=c.uint8array?new Uint8Array(0|f):new Array(0|f);o<e.length;)t=p.indexOf(e.charAt(o++))<<2|(i=p.indexOf(e.charAt(o++)))>>4,r=(15&i)<<4|(s=p.indexOf(e.charAt(o++)))>>2,n=(3&s)<<6|(a=p.indexOf(e.charAt(o++))),l[h++]=t,64!==s&&(l[h++]=r),64!==a&&(l[h++]=n);return l}},{"./support":30,"./utils":32}],2:[function(e,t,r){"use strict";var n=e("./external"),i=e("./stream/DataWorker"),s=e("./stream/Crc32Probe"),a=e("./stream/DataLengthProbe");function o(e,t,r,n,i){this.compressedSize=e,this.uncompressedSize=t,this.crc32=r,this.compression=n,this.compressedContent=i}o.prototype={getContentWorker:function(){var e=new i(n.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new a("data_length")),t=this;return e.on("end",function(){if(this.streamInfo.data_length!==t.uncompressedSize)throw new Error("Bug : uncompressed data size mismatch")}),e},getCompressedWorker:function(){return new i(n.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize",this.compressedSize).withStreamInfo("uncompressedSize",this.uncompressedSize).withStreamInfo("crc32",this.crc32).withStreamInfo("compression",this.compression)}},o.createWorkerFrom=function(e,t,r){return e.pipe(new s).pipe(new a("uncompressedSize")).pipe(t.compressWorker(r)).pipe(new a("compressedSize")).withStreamInfo("compression",t)},t.exports=o},{"./external":6,"./stream/Crc32Probe":25,"./stream/DataLengthProbe":26,"./stream/DataWorker":27}],3:[function(e,t,r){"use strict";var n=e("./stream/GenericWorker");r.STORE={magic:"\0\0",compressWorker:function(){return new n("STORE compression")},uncompressWorker:function(){return new n("STORE decompression")}},r.DEFLATE=e("./flate")},{"./flate":7,"./stream/GenericWorker":28}],4:[function(e,t,r){"use strict";var n=e("./utils");var o=function(){for(var e,t=[],r=0;r<256;r++){e=r;for(var n=0;n<8;n++)e=1&e?3988292384^e>>>1:e>>>1;t[r]=e}return t}();t.exports=function(e,t){return void 0!==e&&e.length?"string"!==n.getTypeOf(e)?function(e,t,r,n){var i=o,s=n+r;e^=-1;for(var a=n;a<s;a++)e=e>>>8^i[255&(e^t[a])];return-1^e}(0|t,e,e.length,0):function(e,t,r,n){var i=o,s=n+r;e^=-1;for(var a=n;a<s;a++)e=e>>>8^i[255&(e^t.charCodeAt(a))];return-1^e}(0|t,e,e.length,0):0}},{"./utils":32}],5:[function(e,t,r){"use strict";r.base64=!1,r.binary=!1,r.dir=!1,r.createFolders=!0,r.date=null,r.compression=null,r.compressionOptions=null,r.comment=null,r.unixPermissions=null,r.dosPermissions=null},{}],6:[function(e,t,r){"use strict";var n=null;n="undefined"!=typeof Promise?Promise:e("lie"),t.exports={Promise:n}},{lie:37}],7:[function(e,t,r){"use strict";var n="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Uint32Array,i=e("pako"),s=e("./utils"),a=e("./stream/GenericWorker"),o=n?"uint8array":"array";function h(e,t){a.call(this,"FlateWorker/"+e),this._pako=null,this._pakoAction=e,this._pakoOptions=t,this.meta={}}r.magic="\b\0",s.inherits(h,a),h.prototype.processChunk=function(e){this.meta=e.meta,null===this._pako&&this._createPako(),this._pako.push(s.transformTo(o,e.data),!1)},h.prototype.flush=function(){a.prototype.flush.call(this),null===this._pako&&this._createPako(),this._pako.push([],!0)},h.prototype.cleanUp=function(){a.prototype.cleanUp.call(this),this._pako=null},h.prototype._createPako=function(){this._pako=new i[this._pakoAction]({raw:!0,level:this._pakoOptions.level||-1});var t=this;this._pako.onData=function(e){t.push({data:e,meta:t.meta})}},r.compressWorker=function(e){return new h("Deflate",e)},r.uncompressWorker=function(){return new h("Inflate",{})}},{"./stream/GenericWorker":28,"./utils":32,pako:38}],8:[function(e,t,r){"use strict";function A(e,t){var r,n="";for(r=0;r<t;r++)n+=String.fromCharCode(255&e),e>>>=8;return n}function n(e,t,r,n,i,s){var a,o,h=e.file,u=e.compression,l=s!==O.utf8encode,f=I.transformTo("string",s(h.name)),c=I.transformTo("string",O.utf8encode(h.name)),d=h.comment,p=I.transformTo("string",s(d)),m=I.transformTo("string",O.utf8encode(d)),_=c.length!==h.name.length,g=m.length!==d.length,b="",v="",y="",w=h.dir,k=h.date,x={crc32:0,compressedSize:0,uncompressedSize:0};t&&!r||(x.crc32=e.crc32,x.compressedSize=e.compressedSize,x.uncompressedSize=e.uncompressedSize);var S=0;t&&(S|=8),l||!_&&!g||(S|=2048);var z=0,C=0;w&&(z|=16),"UNIX"===i?(C=798,z|=function(e,t){var r=e;return e||(r=t?16893:33204),(65535&r)<<16}(h.unixPermissions,w)):(C=20,z|=function(e){return 63&(e||0)}(h.dosPermissions)),a=k.getUTCHours(),a<<=6,a|=k.getUTCMinutes(),a<<=5,a|=k.getUTCSeconds()/2,o=k.getUTCFullYear()-1980,o<<=4,o|=k.getUTCMonth()+1,o<<=5,o|=k.getUTCDate(),_&&(v=A(1,1)+A(B(f),4)+c,b+="up"+A(v.length,2)+v),g&&(y=A(1,1)+A(B(p),4)+m,b+="uc"+A(y.length,2)+y);var E="";return E+="\n\0",E+=A(S,2),E+=u.magic,E+=A(a,2),E+=A(o,2),E+=A(x.crc32,4),E+=A(x.compressedSize,4),E+=A(x.uncompressedSize,4),E+=A(f.length,2),E+=A(b.length,2),{fileRecord:R.LOCAL_FILE_HEADER+E+f+b,dirRecord:R.CENTRAL_FILE_HEADER+A(C,2)+E+A(p.length,2)+"\0\0\0\0"+A(z,4)+A(n,4)+f+b+p}}var I=e("../utils"),i=e("../stream/GenericWorker"),O=e("../utf8"),B=e("../crc32"),R=e("../signature");function s(e,t,r,n){i.call(this,"ZipFileWorker"),this.bytesWritten=0,this.zipComment=t,this.zipPlatform=r,this.encodeFileName=n,this.streamFiles=e,this.accumulate=!1,this.contentBuffer=[],this.dirRecords=[],this.currentSourceOffset=0,this.entriesCount=0,this.currentFile=null,this._sources=[]}I.inherits(s,i),s.prototype.push=function(e){var t=e.meta.percent||0,r=this.entriesCount,n=this._sources.length;this.accumulate?this.contentBuffer.push(e):(this.bytesWritten+=e.data.length,i.prototype.push.call(this,{data:e.data,meta:{currentFile:this.currentFile,percent:r?(t+100*(r-n-1))/r:100}}))},s.prototype.openedSource=function(e){this.currentSourceOffset=this.bytesWritten,this.currentFile=e.file.name;var t=this.streamFiles&&!e.file.dir;if(t){var r=n(e,t,!1,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);this.push({data:r.fileRecord,meta:{percent:0}})}else this.accumulate=!0},s.prototype.closedSource=function(e){this.accumulate=!1;var t=this.streamFiles&&!e.file.dir,r=n(e,t,!0,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);if(this.dirRecords.push(r.dirRecord),t)this.push({data:function(e){return R.DATA_DESCRIPTOR+A(e.crc32,4)+A(e.compressedSize,4)+A(e.uncompressedSize,4)}(e),meta:{percent:100}});else for(this.push({data:r.fileRecord,meta:{percent:0}});this.contentBuffer.length;)this.push(this.contentBuffer.shift());this.currentFile=null},s.prototype.flush=function(){for(var e=this.bytesWritten,t=0;t<this.dirRecords.length;t++)this.push({data:this.dirRecords[t],meta:{percent:100}});var r=this.bytesWritten-e,n=function(e,t,r,n,i){var s=I.transformTo("string",i(n));return R.CENTRAL_DIRECTORY_END+"\0\0\0\0"+A(e,2)+A(e,2)+A(t,4)+A(r,4)+A(s.length,2)+s}(this.dirRecords.length,r,e,this.zipComment,this.encodeFileName);this.push({data:n,meta:{percent:100}})},s.prototype.prepareNextSource=function(){this.previous=this._sources.shift(),this.openedSource(this.previous.streamInfo),this.isPaused?this.previous.pause():this.previous.resume()},s.prototype.registerPrevious=function(e){this._sources.push(e);var t=this;return e.on("data",function(e){t.processChunk(e)}),e.on("end",function(){t.closedSource(t.previous.streamInfo),t._sources.length?t.prepareNextSource():t.end()}),e.on("error",function(e){t.error(e)}),this},s.prototype.resume=function(){return!!i.prototype.resume.call(this)&&(!this.previous&&this._sources.length?(this.prepareNextSource(),!0):this.previous||this._sources.length||this.generatedError?void 0:(this.end(),!0))},s.prototype.error=function(e){var t=this._sources;if(!i.prototype.error.call(this,e))return!1;for(var r=0;r<t.length;r++)try{t[r].error(e)}catch(e){}return!0},s.prototype.lock=function(){i.prototype.lock.call(this);for(var e=this._sources,t=0;t<e.length;t++)e[t].lock()},t.exports=s},{"../crc32":4,"../signature":23,"../stream/GenericWorker":28,"../utf8":31,"../utils":32}],9:[function(e,t,r){"use strict";var u=e("../compressions"),n=e("./ZipFileWorker");r.generateWorker=function(e,a,t){var o=new n(a.streamFiles,t,a.platform,a.encodeFileName),h=0;try{e.forEach(function(e,t){h++;var r=function(e,t){var r=e||t,n=u[r];if(!n)throw new Error(r+" is not a valid compression method !");return n}(t.options.compression,a.compression),n=t.options.compressionOptions||a.compressionOptions||{},i=t.dir,s=t.date;t._compressWorker(r,n).withStreamInfo("file",{name:e,dir:i,date:s,comment:t.comment||"",unixPermissions:t.unixPermissions,dosPermissions:t.dosPermissions}).pipe(o)}),o.entriesCount=h}catch(e){o.error(e)}return o}},{"../compressions":3,"./ZipFileWorker":8}],10:[function(e,t,r){"use strict";function n(){if(!(this instanceof n))return new n;if(arguments.length)throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");this.files=Object.create(null),this.comment=null,this.root="",this.clone=function(){var e=new n;for(var t in this)"function"!=typeof this[t]&&(e[t]=this[t]);return e}}(n.prototype=e("./object")).loadAsync=e("./load"),n.support=e("./support"),n.defaults=e("./defaults"),n.version="3.10.1",n.loadAsync=function(e,t){return(new n).loadAsync(e,t)},n.external=e("./external"),t.exports=n},{"./defaults":5,"./external":6,"./load":11,"./object":15,"./support":30}],11:[function(e,t,r){"use strict";var u=e("./utils"),i=e("./external"),n=e("./utf8"),s=e("./zipEntries"),a=e("./stream/Crc32Probe"),l=e("./nodejsUtils");function f(n){return new i.Promise(function(e,t){var r=n.decompressed.getContentWorker().pipe(new a);r.on("error",function(e){t(e)}).on("end",function(){r.streamInfo.crc32!==n.decompressed.crc32?t(new Error("Corrupted zip : CRC32 mismatch")):e()}).resume()})}t.exports=function(e,o){var h=this;return o=u.extend(o||{},{base64:!1,checkCRC32:!1,optimizedBinaryString:!1,createFolders:!1,decodeFileName:n.utf8decode}),l.isNode&&l.isStream(e)?i.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")):u.prepareContent("the loaded zip file",e,!0,o.optimizedBinaryString,o.base64).then(function(e){var t=new s(o);return t.load(e),t}).then(function(e){var t=[i.Promise.resolve(e)],r=e.files;if(o.checkCRC32)for(var n=0;n<r.length;n++)t.push(f(r[n]));return i.Promise.all(t)}).then(function(e){for(var t=e.shift(),r=t.files,n=0;n<r.length;n++){var i=r[n],s=i.fileNameStr,a=u.resolve(i.fileNameStr);h.file(a,i.decompressed,{binary:!0,optimizedBinaryString:!0,date:i.date,dir:i.dir,comment:i.fileCommentStr.length?i.fileCommentStr:null,unixPermissions:i.unixPermissions,dosPermissions:i.dosPermissions,createFolders:o.createFolders}),i.dir||(h.file(a).unsafeOriginalName=s)}return t.zipComment.length&&(h.comment=t.zipComment),h})}},{"./external":6,"./nodejsUtils":14,"./stream/Crc32Probe":25,"./utf8":31,"./utils":32,"./zipEntries":33}],12:[function(e,t,r){"use strict";var n=e("../utils"),i=e("../stream/GenericWorker");function s(e,t){i.call(this,"Nodejs stream input adapter for "+e),this._upstreamEnded=!1,this._bindStream(t)}n.inherits(s,i),s.prototype._bindStream=function(e){var t=this;(this._stream=e).pause(),e.on("data",function(e){t.push({data:e,meta:{percent:0}})}).on("error",function(e){t.isPaused?this.generatedError=e:t.error(e)}).on("end",function(){t.isPaused?t._upstreamEnded=!0:t.end()})},s.prototype.pause=function(){return!!i.prototype.pause.call(this)&&(this._stream.pause(),!0)},s.prototype.resume=function(){return!!i.prototype.resume.call(this)&&(this._upstreamEnded?this.end():this._stream.resume(),!0)},t.exports=s},{"../stream/GenericWorker":28,"../utils":32}],13:[function(e,t,r){"use strict";var i=e("readable-stream").Readable;function n(e,t,r){i.call(this,t),this._helper=e;var n=this;e.on("data",function(e,t){n.push(e)||n._helper.pause(),r&&r(t)}).on("error",function(e){n.emit("error",e)}).on("end",function(){n.push(null)})}e("../utils").inherits(n,i),n.prototype._read=function(){this._helper.resume()},t.exports=n},{"../utils":32,"readable-stream":16}],14:[function(e,t,r){"use strict";t.exports={isNode:"undefined"!=typeof Buffer,newBufferFrom:function(e,t){if(Buffer.from&&Buffer.from!==Uint8Array.from)return Buffer.from(e,t);if("number"==typeof e)throw new Error('The "data" argument must not be a number');return new Buffer(e,t)},allocBuffer:function(e){if(Buffer.alloc)return Buffer.alloc(e);var t=new Buffer(e);return t.fill(0),t},isBuffer:function(e){return Buffer.isBuffer(e)},isStream:function(e){return e&&"function"==typeof e.on&&"function"==typeof e.pause&&"function"==typeof e.resume}}},{}],15:[function(e,t,r){"use strict";function s(e,t,r){var n,i=u.getTypeOf(t),s=u.extend(r||{},f);s.date=s.date||new Date,null!==s.compression&&(s.compression=s.compression.toUpperCase()),"string"==typeof s.unixPermissions&&(s.unixPermissions=parseInt(s.unixPermissions,8)),s.unixPermissions&&16384&s.unixPermissions&&(s.dir=!0),s.dosPermissions&&16&s.dosPermissions&&(s.dir=!0),s.dir&&(e=g(e)),s.createFolders&&(n=_(e))&&b.call(this,n,!0);var a="string"===i&&!1===s.binary&&!1===s.base64;r&&void 0!==r.binary||(s.binary=!a),(t instanceof c&&0===t.uncompressedSize||s.dir||!t||0===t.length)&&(s.base64=!1,s.binary=!0,t="",s.compression="STORE",i="string");var o=null;o=t instanceof c||t instanceof l?t:p.isNode&&p.isStream(t)?new m(e,t):u.prepareContent(e,t,s.binary,s.optimizedBinaryString,s.base64);var h=new d(e,o,s);this.files[e]=h}var i=e("./utf8"),u=e("./utils"),l=e("./stream/GenericWorker"),a=e("./stream/StreamHelper"),f=e("./defaults"),c=e("./compressedObject"),d=e("./zipObject"),o=e("./generate"),p=e("./nodejsUtils"),m=e("./nodejs/NodejsStreamInputAdapter"),_=function(e){"/"===e.slice(-1)&&(e=e.substring(0,e.length-1));var t=e.lastIndexOf("/");return 0<t?e.substring(0,t):""},g=function(e){return"/"!==e.slice(-1)&&(e+="/"),e},b=function(e,t){return t=void 0!==t?t:f.createFolders,e=g(e),this.files[e]||s.call(this,e,null,{dir:!0,createFolders:t}),this.files[e]};function h(e){return"[object RegExp]"===Object.prototype.toString.call(e)}var n={load:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},forEach:function(e){var t,r,n;for(t in this.files)n=this.files[t],(r=t.slice(this.root.length,t.length))&&t.slice(0,this.root.length)===this.root&&e(r,n)},filter:function(r){var n=[];return this.forEach(function(e,t){r(e,t)&&n.push(t)}),n},file:function(e,t,r){if(1!==arguments.length)return e=this.root+e,s.call(this,e,t,r),this;if(h(e)){var n=e;return this.filter(function(e,t){return!t.dir&&n.test(e)})}var i=this.files[this.root+e];return i&&!i.dir?i:null},folder:function(r){if(!r)return this;if(h(r))return this.filter(function(e,t){return t.dir&&r.test(e)});var e=this.root+r,t=b.call(this,e),n=this.clone();return n.root=t.name,n},remove:function(r){r=this.root+r;var e=this.files[r];if(e||("/"!==r.slice(-1)&&(r+="/"),e=this.files[r]),e&&!e.dir)delete this.files[r];else for(var t=this.filter(function(e,t){return t.name.slice(0,r.length)===r}),n=0;n<t.length;n++)delete this.files[t[n].name];return this},generate:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},generateInternalStream:function(e){var t,r={};try{if((r=u.extend(e||{},{streamFiles:!1,compression:"STORE",compressionOptions:null,type:"",platform:"DOS",comment:null,mimeType:"application/zip",encodeFileName:i.utf8encode})).type=r.type.toLowerCase(),r.compression=r.compression.toUpperCase(),"binarystring"===r.type&&(r.type="string"),!r.type)throw new Error("No output type specified.");u.checkSupport(r.type),"darwin"!==r.platform&&"freebsd"!==r.platform&&"linux"!==r.platform&&"sunos"!==r.platform||(r.platform="UNIX"),"win32"===r.platform&&(r.platform="DOS");var n=r.comment||this.comment||"";t=o.generateWorker(this,r,n)}catch(e){(t=new l("error")).error(e)}return new a(t,r.type||"string",r.mimeType)},generateAsync:function(e,t){return this.generateInternalStream(e).accumulate(t)},generateNodeStream:function(e,t){return(e=e||{}).type||(e.type="nodebuffer"),this.generateInternalStream(e).toNodejsStream(t)}};t.exports=n},{"./compressedObject":2,"./defaults":5,"./generate":9,"./nodejs/NodejsStreamInputAdapter":12,"./nodejsUtils":14,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31,"./utils":32,"./zipObject":35}],16:[function(e,t,r){"use strict";t.exports=e("stream")},{stream:void 0}],17:[function(e,t,r){"use strict";var n=e("./DataReader");function i(e){n.call(this,e);for(var t=0;t<this.data.length;t++)e[t]=255&e[t]}e("../utils").inherits(i,n),i.prototype.byteAt=function(e){return this.data[this.zero+e]},i.prototype.lastIndexOfSignature=function(e){for(var t=e.charCodeAt(0),r=e.charCodeAt(1),n=e.charCodeAt(2),i=e.charCodeAt(3),s=this.length-4;0<=s;--s)if(this.data[s]===t&&this.data[s+1]===r&&this.data[s+2]===n&&this.data[s+3]===i)return s-this.zero;return-1},i.prototype.readAndCheckSignature=function(e){var t=e.charCodeAt(0),r=e.charCodeAt(1),n=e.charCodeAt(2),i=e.charCodeAt(3),s=this.readData(4);return t===s[0]&&r===s[1]&&n===s[2]&&i===s[3]},i.prototype.readData=function(e){if(this.checkOffset(e),0===e)return[];var t=this.data.slice(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./DataReader":18}],18:[function(e,t,r){"use strict";var n=e("../utils");function i(e){this.data=e,this.length=e.length,this.index=0,this.zero=0}i.prototype={checkOffset:function(e){this.checkIndex(this.index+e)},checkIndex:function(e){if(this.length<this.zero+e||e<0)throw new Error("End of data reached (data length = "+this.length+", asked index = "+e+"). Corrupted zip ?")},setIndex:function(e){this.checkIndex(e),this.index=e},skip:function(e){this.setIndex(this.index+e)},byteAt:function(){},readInt:function(e){var t,r=0;for(this.checkOffset(e),t=this.index+e-1;t>=this.index;t--)r=(r<<8)+this.byteAt(t);return this.index+=e,r},readString:function(e){return n.transformTo("string",this.readData(e))},readData:function(){},lastIndexOfSignature:function(){},readAndCheckSignature:function(){},readDate:function(){var e=this.readInt(4);return new Date(Date.UTC(1980+(e>>25&127),(e>>21&15)-1,e>>16&31,e>>11&31,e>>5&63,(31&e)<<1))}},t.exports=i},{"../utils":32}],19:[function(e,t,r){"use strict";var n=e("./Uint8ArrayReader");function i(e){n.call(this,e)}e("../utils").inherits(i,n),i.prototype.readData=function(e){this.checkOffset(e);var t=this.data.slice(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./Uint8ArrayReader":21}],20:[function(e,t,r){"use strict";var n=e("./DataReader");function i(e){n.call(this,e)}e("../utils").inherits(i,n),i.prototype.byteAt=function(e){return this.data.charCodeAt(this.zero+e)},i.prototype.lastIndexOfSignature=function(e){return this.data.lastIndexOf(e)-this.zero},i.prototype.readAndCheckSignature=function(e){return e===this.readData(4)},i.prototype.readData=function(e){this.checkOffset(e);var t=this.data.slice(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./DataReader":18}],21:[function(e,t,r){"use strict";var n=e("./ArrayReader");function i(e){n.call(this,e)}e("../utils").inherits(i,n),i.prototype.readData=function(e){if(this.checkOffset(e),0===e)return new Uint8Array(0);var t=this.data.subarray(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./ArrayReader":17}],22:[function(e,t,r){"use strict";var n=e("../utils"),i=e("../support"),s=e("./ArrayReader"),a=e("./StringReader"),o=e("./NodeBufferReader"),h=e("./Uint8ArrayReader");t.exports=function(e){var t=n.getTypeOf(e);return n.checkSupport(t),"string"!==t||i.uint8array?"nodebuffer"===t?new o(e):i.uint8array?new h(n.transformTo("uint8array",e)):new s(n.transformTo("array",e)):new a(e)}},{"../support":30,"../utils":32,"./ArrayReader":17,"./NodeBufferReader":19,"./StringReader":20,"./Uint8ArrayReader":21}],23:[function(e,t,r){"use strict";r.LOCAL_FILE_HEADER="PK",r.CENTRAL_FILE_HEADER="PK",r.CENTRAL_DIRECTORY_END="PK",r.ZIP64_CENTRAL_DIRECTORY_LOCATOR="PK",r.ZIP64_CENTRAL_DIRECTORY_END="PK",r.DATA_DESCRIPTOR="PK\b"},{}],24:[function(e,t,r){"use strict";var n=e("./GenericWorker"),i=e("../utils");function s(e){n.call(this,"ConvertWorker to "+e),this.destType=e}i.inherits(s,n),s.prototype.processChunk=function(e){this.push({data:i.transformTo(this.destType,e.data),meta:e.meta})},t.exports=s},{"../utils":32,"./GenericWorker":28}],25:[function(e,t,r){"use strict";var n=e("./GenericWorker"),i=e("../crc32");function s(){n.call(this,"Crc32Probe"),this.withStreamInfo("crc32",0)}e("../utils").inherits(s,n),s.prototype.processChunk=function(e){this.streamInfo.crc32=i(e.data,this.streamInfo.crc32||0),this.push(e)},t.exports=s},{"../crc32":4,"../utils":32,"./GenericWorker":28}],26:[function(e,t,r){"use strict";var n=e("../utils"),i=e("./GenericWorker");function s(e){i.call(this,"DataLengthProbe for "+e),this.propName=e,this.withStreamInfo(e,0)}n.inherits(s,i),s.prototype.processChunk=function(e){if(e){var t=this.streamInfo[this.propName]||0;this.streamInfo[this.propName]=t+e.data.length}i.prototype.processChunk.call(this,e)},t.exports=s},{"../utils":32,"./GenericWorker":28}],27:[function(e,t,r){"use strict";var n=e("../utils"),i=e("./GenericWorker");function s(e){i.call(this,"DataWorker");var t=this;this.dataIsReady=!1,this.index=0,this.max=0,this.data=null,this.type="",this._tickScheduled=!1,e.then(function(e){t.dataIsReady=!0,t.data=e,t.max=e&&e.length||0,t.type=n.getTypeOf(e),t.isPaused||t._tickAndRepeat()},function(e){t.error(e)})}n.inherits(s,i),s.prototype.cleanUp=function(){i.prototype.cleanUp.call(this),this.data=null},s.prototype.resume=function(){return!!i.prototype.resume.call(this)&&(!this._tickScheduled&&this.dataIsReady&&(this._tickScheduled=!0,n.delay(this._tickAndRepeat,[],this)),!0)},s.prototype._tickAndRepeat=function(){this._tickScheduled=!1,this.isPaused||this.isFinished||(this._tick(),this.isFinished||(n.delay(this._tickAndRepeat,[],this),this._tickScheduled=!0))},s.prototype._tick=function(){if(this.isPaused||this.isFinished)return!1;var e=null,t=Math.min(this.max,this.index+16384);if(this.index>=this.max)return this.end();switch(this.type){case"string":e=this.data.substring(this.index,t);break;case"uint8array":e=this.data.subarray(this.index,t);break;case"array":case"nodebuffer":e=this.data.slice(this.index,t)}return this.index=t,this.push({data:e,meta:{percent:this.max?this.index/this.max*100:0}})},t.exports=s},{"../utils":32,"./GenericWorker":28}],28:[function(e,t,r){"use strict";function n(e){this.name=e||"default",this.streamInfo={},this.generatedError=null,this.extraStreamInfo={},this.isPaused=!0,this.isFinished=!1,this.isLocked=!1,this._listeners={data:[],end:[],error:[]},this.previous=null}n.prototype={push:function(e){this.emit("data",e)},end:function(){if(this.isFinished)return!1;this.flush();try{this.emit("end"),this.cleanUp(),this.isFinished=!0}catch(e){this.emit("error",e)}return!0},error:function(e){return!this.isFinished&&(this.isPaused?this.generatedError=e:(this.isFinished=!0,this.emit("error",e),this.previous&&this.previous.error(e),this.cleanUp()),!0)},on:function(e,t){return this._listeners[e].push(t),this},cleanUp:function(){this.streamInfo=this.generatedError=this.extraStreamInfo=null,this._listeners=[]},emit:function(e,t){if(this._listeners[e])for(var r=0;r<this._listeners[e].length;r++)this._listeners[e][r].call(this,t)},pipe:function(e){return e.registerPrevious(this)},registerPrevious:function(e){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.streamInfo=e.streamInfo,this.mergeStreamInfo(),this.previous=e;var t=this;return e.on("data",function(e){t.processChunk(e)}),e.on("end",function(){t.end()}),e.on("error",function(e){t.error(e)}),this},pause:function(){return!this.isPaused&&!this.isFinished&&(this.isPaused=!0,this.previous&&this.previous.pause(),!0)},resume:function(){if(!this.isPaused||this.isFinished)return!1;var e=this.isPaused=!1;return this.generatedError&&(this.error(this.generatedError),e=!0),this.previous&&this.previous.resume(),!e},flush:function(){},processChunk:function(e){this.push(e)},withStreamInfo:function(e,t){return this.extraStreamInfo[e]=t,this.mergeStreamInfo(),this},mergeStreamInfo:function(){for(var e in this.extraStreamInfo)Object.prototype.hasOwnProperty.call(this.extraStreamInfo,e)&&(this.streamInfo[e]=this.extraStreamInfo[e])},lock:function(){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.isLocked=!0,this.previous&&this.previous.lock()},toString:function(){var e="Worker "+this.name;return this.previous?this.previous+" -> "+e:e}},t.exports=n},{}],29:[function(e,t,r){"use strict";var h=e("../utils"),i=e("./ConvertWorker"),s=e("./GenericWorker"),u=e("../base64"),n=e("../support"),a=e("../external"),o=null;if(n.nodestream)try{o=e("../nodejs/NodejsStreamOutputAdapter")}catch(e){}function l(e,o){return new a.Promise(function(t,r){var n=[],i=e._internalType,s=e._outputType,a=e._mimeType;e.on("data",function(e,t){n.push(e),o&&o(t)}).on("error",function(e){n=[],r(e)}).on("end",function(){try{var e=function(e,t,r){switch(e){case"blob":return h.newBlob(h.transformTo("arraybuffer",t),r);case"base64":return u.encode(t);default:return h.transformTo(e,t)}}(s,function(e,t){var r,n=0,i=null,s=0;for(r=0;r<t.length;r++)s+=t[r].length;switch(e){case"string":return t.join("");case"array":return Array.prototype.concat.apply([],t);case"uint8array":for(i=new Uint8Array(s),r=0;r<t.length;r++)i.set(t[r],n),n+=t[r].length;return i;case"nodebuffer":return Buffer.concat(t);default:throw new Error("concat : unsupported type '"+e+"'")}}(i,n),a);t(e)}catch(e){r(e)}n=[]}).resume()})}function f(e,t,r){var n=t;switch(t){case"blob":case"arraybuffer":n="uint8array";break;case"base64":n="string"}try{this._internalType=n,this._outputType=t,this._mimeType=r,h.checkSupport(n),this._worker=e.pipe(new i(n)),e.lock()}catch(e){this._worker=new s("error"),this._worker.error(e)}}f.prototype={accumulate:function(e){return l(this,e)},on:function(e,t){var r=this;return"data"===e?this._worker.on(e,function(e){t.call(r,e.data,e.meta)}):this._worker.on(e,function(){h.delay(t,arguments,r)}),this},resume:function(){return h.delay(this._worker.resume,[],this._worker),this},pause:function(){return this._worker.pause(),this},toNodejsStream:function(e){if(h.checkSupport("nodestream"),"nodebuffer"!==this._outputType)throw new Error(this._outputType+" is not supported by this method");return new o(this,{objectMode:"nodebuffer"!==this._outputType},e)}},t.exports=f},{"../base64":1,"../external":6,"../nodejs/NodejsStreamOutputAdapter":13,"../support":30,"../utils":32,"./ConvertWorker":24,"./GenericWorker":28}],30:[function(e,t,r){"use strict";if(r.base64=!0,r.array=!0,r.string=!0,r.arraybuffer="undefined"!=typeof ArrayBuffer&&"undefined"!=typeof Uint8Array,r.nodebuffer="undefined"!=typeof Buffer,r.uint8array="undefined"!=typeof Uint8Array,"undefined"==typeof ArrayBuffer)r.blob=!1;else{var n=new ArrayBuffer(0);try{r.blob=0===new Blob([n],{type:"application/zip"}).size}catch(e){try{var i=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);i.append(n),r.blob=0===i.getBlob("application/zip").size}catch(e){r.blob=!1}}}try{r.nodestream=!!e("readable-stream").Readable}catch(e){r.nodestream=!1}},{"readable-stream":16}],31:[function(e,t,s){"use strict";for(var o=e("./utils"),h=e("./support"),r=e("./nodejsUtils"),n=e("./stream/GenericWorker"),u=new Array(256),i=0;i<256;i++)u[i]=252<=i?6:248<=i?5:240<=i?4:224<=i?3:192<=i?2:1;u[254]=u[254]=1;function a(){n.call(this,"utf-8 decode"),this.leftOver=null}function l(){n.call(this,"utf-8 encode")}s.utf8encode=function(e){return h.nodebuffer?r.newBufferFrom(e,"utf-8"):function(e){var t,r,n,i,s,a=e.length,o=0;for(i=0;i<a;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<a&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),o+=r<128?1:r<2048?2:r<65536?3:4;for(t=h.uint8array?new Uint8Array(o):new Array(o),i=s=0;s<o;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<a&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),r<128?t[s++]=r:(r<2048?t[s++]=192|r>>>6:(r<65536?t[s++]=224|r>>>12:(t[s++]=240|r>>>18,t[s++]=128|r>>>12&63),t[s++]=128|r>>>6&63),t[s++]=128|63&r);return t}(e)},s.utf8decode=function(e){return h.nodebuffer?o.transformTo("nodebuffer",e).toString("utf-8"):function(e){var t,r,n,i,s=e.length,a=new Array(2*s);for(t=r=0;t<s;)if((n=e[t++])<128)a[r++]=n;else if(4<(i=u[n]))a[r++]=65533,t+=i-1;else{for(n&=2===i?31:3===i?15:7;1<i&&t<s;)n=n<<6|63&e[t++],i--;1<i?a[r++]=65533:n<65536?a[r++]=n:(n-=65536,a[r++]=55296|n>>10&1023,a[r++]=56320|1023&n)}return a.length!==r&&(a.subarray?a=a.subarray(0,r):a.length=r),o.applyFromCharCode(a)}(e=o.transformTo(h.uint8array?"uint8array":"array",e))},o.inherits(a,n),a.prototype.processChunk=function(e){var t=o.transformTo(h.uint8array?"uint8array":"array",e.data);if(this.leftOver&&this.leftOver.length){if(h.uint8array){var r=t;(t=new Uint8Array(r.length+this.leftOver.length)).set(this.leftOver,0),t.set(r,this.leftOver.length)}else t=this.leftOver.concat(t);this.leftOver=null}var n=function(e,t){var r;for((t=t||e.length)>e.length&&(t=e.length),r=t-1;0<=r&&128==(192&e[r]);)r--;return r<0?t:0===r?t:r+u[e[r]]>t?r:t}(t),i=t;n!==t.length&&(h.uint8array?(i=t.subarray(0,n),this.leftOver=t.subarray(n,t.length)):(i=t.slice(0,n),this.leftOver=t.slice(n,t.length))),this.push({data:s.utf8decode(i),meta:e.meta})},a.prototype.flush=function(){this.leftOver&&this.leftOver.length&&(this.push({data:s.utf8decode(this.leftOver),meta:{}}),this.leftOver=null)},s.Utf8DecodeWorker=a,o.inherits(l,n),l.prototype.processChunk=function(e){this.push({data:s.utf8encode(e.data),meta:e.meta})},s.Utf8EncodeWorker=l},{"./nodejsUtils":14,"./stream/GenericWorker":28,"./support":30,"./utils":32}],32:[function(e,t,a){"use strict";var o=e("./support"),h=e("./base64"),r=e("./nodejsUtils"),u=e("./external");function n(e){return e}function l(e,t){for(var r=0;r<e.length;++r)t[r]=255&e.charCodeAt(r);return t}e("setimmediate"),a.newBlob=function(t,r){a.checkSupport("blob");try{return new Blob([t],{type:r})}catch(e){try{var n=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);return n.append(t),n.getBlob(r)}catch(e){throw new Error("Bug : can't construct the Blob.")}}};var i={stringifyByChunk:function(e,t,r){var n=[],i=0,s=e.length;if(s<=r)return String.fromCharCode.apply(null,e);for(;i<s;)"array"===t||"nodebuffer"===t?n.push(String.fromCharCode.apply(null,e.slice(i,Math.min(i+r,s)))):n.push(String.fromCharCode.apply(null,e.subarray(i,Math.min(i+r,s)))),i+=r;return n.join("")},stringifyByChar:function(e){for(var t="",r=0;r<e.length;r++)t+=String.fromCharCode(e[r]);return t},applyCanBeUsed:{uint8array:function(){try{return o.uint8array&&1===String.fromCharCode.apply(null,new Uint8Array(1)).length}catch(e){return!1}}(),nodebuffer:function(){try{return o.nodebuffer&&1===String.fromCharCode.apply(null,r.allocBuffer(1)).length}catch(e){return!1}}()}};function s(e){var t=65536,r=a.getTypeOf(e),n=!0;if("uint8array"===r?n=i.applyCanBeUsed.uint8array:"nodebuffer"===r&&(n=i.applyCanBeUsed.nodebuffer),n)for(;1<t;)try{return i.stringifyByChunk(e,r,t)}catch(e){t=Math.floor(t/2)}return i.stringifyByChar(e)}function f(e,t){for(var r=0;r<e.length;r++)t[r]=e[r];return t}a.applyFromCharCode=s;var c={};c.string={string:n,array:function(e){return l(e,new Array(e.length))},arraybuffer:function(e){return c.string.uint8array(e).buffer},uint8array:function(e){return l(e,new Uint8Array(e.length))},nodebuffer:function(e){return l(e,r.allocBuffer(e.length))}},c.array={string:s,array:n,arraybuffer:function(e){return new Uint8Array(e).buffer},uint8array:function(e){return new Uint8Array(e)},nodebuffer:function(e){return r.newBufferFrom(e)}},c.arraybuffer={string:function(e){return s(new Uint8Array(e))},array:function(e){return f(new Uint8Array(e),new Array(e.byteLength))},arraybuffer:n,uint8array:function(e){return new Uint8Array(e)},nodebuffer:function(e){return r.newBufferFrom(new Uint8Array(e))}},c.uint8array={string:s,array:function(e){return f(e,new Array(e.length))},arraybuffer:function(e){return e.buffer},uint8array:n,nodebuffer:function(e){return r.newBufferFrom(e)}},c.nodebuffer={string:s,array:function(e){return f(e,new Array(e.length))},arraybuffer:function(e){return c.nodebuffer.uint8array(e).buffer},uint8array:function(e){return f(e,new Uint8Array(e.length))},nodebuffer:n},a.transformTo=function(e,t){if(t=t||"",!e)return t;a.checkSupport(e);var r=a.getTypeOf(t);return c[r][e](t)},a.resolve=function(e){for(var t=e.split("/"),r=[],n=0;n<t.length;n++){var i=t[n];"."===i||""===i&&0!==n&&n!==t.length-1||(".."===i?r.pop():r.push(i))}return r.join("/")},a.getTypeOf=function(e){return"string"==typeof e?"string":"[object Array]"===Object.prototype.toString.call(e)?"array":o.nodebuffer&&r.isBuffer(e)?"nodebuffer":o.uint8array&&e instanceof Uint8Array?"uint8array":o.arraybuffer&&e instanceof ArrayBuffer?"arraybuffer":void 0},a.checkSupport=function(e){if(!o[e.toLowerCase()])throw new Error(e+" is not supported by this platform")},a.MAX_VALUE_16BITS=65535,a.MAX_VALUE_32BITS=-1,a.pretty=function(e){var t,r,n="";for(r=0;r<(e||"").length;r++)n+="\\x"+((t=e.charCodeAt(r))<16?"0":"")+t.toString(16).toUpperCase();return n},a.delay=function(e,t,r){setImmediate(function(){e.apply(r||null,t||[])})},a.inherits=function(e,t){function r(){}r.prototype=t.prototype,e.prototype=new r},a.extend=function(){var e,t,r={};for(e=0;e<arguments.length;e++)for(t in arguments[e])Object.prototype.hasOwnProperty.call(arguments[e],t)&&void 0===r[t]&&(r[t]=arguments[e][t]);return r},a.prepareContent=function(r,e,n,i,s){return u.Promise.resolve(e).then(function(n){return o.blob&&(n instanceof Blob||-1!==["[object File]","[object Blob]"].indexOf(Object.prototype.toString.call(n)))&&"undefined"!=typeof FileReader?new u.Promise(function(t,r){var e=new FileReader;e.onload=function(e){t(e.target.result)},e.onerror=function(e){r(e.target.error)},e.readAsArrayBuffer(n)}):n}).then(function(e){var t=a.getTypeOf(e);return t?("arraybuffer"===t?e=a.transformTo("uint8array",e):"string"===t&&(s?e=h.decode(e):n&&!0!==i&&(e=function(e){return l(e,o.uint8array?new Uint8Array(e.length):new Array(e.length))}(e))),e):u.Promise.reject(new Error("Can't read the data of '"+r+"'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"))})}},{"./base64":1,"./external":6,"./nodejsUtils":14,"./support":30,setimmediate:54}],33:[function(e,t,r){"use strict";var n=e("./reader/readerFor"),i=e("./utils"),s=e("./signature"),a=e("./zipEntry"),o=e("./support");function h(e){this.files=[],this.loadOptions=e}h.prototype={checkSignature:function(e){if(!this.reader.readAndCheckSignature(e)){this.reader.index-=4;var t=this.reader.readString(4);throw new Error("Corrupted zip or bug: unexpected signature ("+i.pretty(t)+", expected "+i.pretty(e)+")")}},isSignature:function(e,t){var r=this.reader.index;this.reader.setIndex(e);var n=this.reader.readString(4)===t;return this.reader.setIndex(r),n},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2),this.diskWithCentralDirStart=this.reader.readInt(2),this.centralDirRecordsOnThisDisk=this.reader.readInt(2),this.centralDirRecords=this.reader.readInt(2),this.centralDirSize=this.reader.readInt(4),this.centralDirOffset=this.reader.readInt(4),this.zipCommentLength=this.reader.readInt(2);var e=this.reader.readData(this.zipCommentLength),t=o.uint8array?"uint8array":"array",r=i.transformTo(t,e);this.zipComment=this.loadOptions.decodeFileName(r)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8),this.reader.skip(4),this.diskNumber=this.reader.readInt(4),this.diskWithCentralDirStart=this.reader.readInt(4),this.centralDirRecordsOnThisDisk=this.reader.readInt(8),this.centralDirRecords=this.reader.readInt(8),this.centralDirSize=this.reader.readInt(8),this.centralDirOffset=this.reader.readInt(8),this.zip64ExtensibleData={};for(var e,t,r,n=this.zip64EndOfCentralSize-44;0<n;)e=this.reader.readInt(2),t=this.reader.readInt(4),r=this.reader.readData(t),this.zip64ExtensibleData[e]={id:e,length:t,value:r}},readBlockZip64EndOfCentralLocator:function(){if(this.diskWithZip64CentralDirStart=this.reader.readInt(4),this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8),this.disksCount=this.reader.readInt(4),1<this.disksCount)throw new Error("Multi-volumes zip are not supported")},readLocalFiles:function(){var e,t;for(e=0;e<this.files.length;e++)t=this.files[e],this.reader.setIndex(t.localHeaderOffset),this.checkSignature(s.LOCAL_FILE_HEADER),t.readLocalPart(this.reader),t.handleUTF8(),t.processAttributes()},readCentralDir:function(){var e;for(this.reader.setIndex(this.centralDirOffset);this.reader.readAndCheckSignature(s.CENTRAL_FILE_HEADER);)(e=new a({zip64:this.zip64},this.loadOptions)).readCentralPart(this.reader),this.files.push(e);if(this.centralDirRecords!==this.files.length&&0!==this.centralDirRecords&&0===this.files.length)throw new Error("Corrupted zip or bug: expected "+this.centralDirRecords+" records in central dir, got "+this.files.length)},readEndOfCentral:function(){var e=this.reader.lastIndexOfSignature(s.CENTRAL_DIRECTORY_END);if(e<0)throw!this.isSignature(0,s.LOCAL_FILE_HEADER)?new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html"):new Error("Corrupted zip: can't find end of central directory");this.reader.setIndex(e);var t=e;if(this.checkSignature(s.CENTRAL_DIRECTORY_END),this.readBlockEndOfCentral(),this.diskNumber===i.MAX_VALUE_16BITS||this.diskWithCentralDirStart===i.MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===i.MAX_VALUE_16BITS||this.centralDirRecords===i.MAX_VALUE_16BITS||this.centralDirSize===i.MAX_VALUE_32BITS||this.centralDirOffset===i.MAX_VALUE_32BITS){if(this.zip64=!0,(e=this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR))<0)throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");if(this.reader.setIndex(e),this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR),this.readBlockZip64EndOfCentralLocator(),!this.isSignature(this.relativeOffsetEndOfZip64CentralDir,s.ZIP64_CENTRAL_DIRECTORY_END)&&(this.relativeOffsetEndOfZip64CentralDir=this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_END),this.relativeOffsetEndOfZip64CentralDir<0))throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_END),this.readBlockZip64EndOfCentral()}var r=this.centralDirOffset+this.centralDirSize;this.zip64&&(r+=20,r+=12+this.zip64EndOfCentralSize);var n=t-r;if(0<n)this.isSignature(t,s.CENTRAL_FILE_HEADER)||(this.reader.zero=n);else if(n<0)throw new Error("Corrupted zip: missing "+Math.abs(n)+" bytes.")},prepareReader:function(e){this.reader=n(e)},load:function(e){this.prepareReader(e),this.readEndOfCentral(),this.readCentralDir(),this.readLocalFiles()}},t.exports=h},{"./reader/readerFor":22,"./signature":23,"./support":30,"./utils":32,"./zipEntry":34}],34:[function(e,t,r){"use strict";var n=e("./reader/readerFor"),s=e("./utils"),i=e("./compressedObject"),a=e("./crc32"),o=e("./utf8"),h=e("./compressions"),u=e("./support");function l(e,t){this.options=e,this.loadOptions=t}l.prototype={isEncrypted:function(){return 1==(1&this.bitFlag)},useUTF8:function(){return 2048==(2048&this.bitFlag)},readLocalPart:function(e){var t,r;if(e.skip(22),this.fileNameLength=e.readInt(2),r=e.readInt(2),this.fileName=e.readData(this.fileNameLength),e.skip(r),-1===this.compressedSize||-1===this.uncompressedSize)throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");if(null===(t=function(e){for(var t in h)if(Object.prototype.hasOwnProperty.call(h,t)&&h[t].magic===e)return h[t];return null}(this.compressionMethod)))throw new Error("Corrupted zip : compression "+s.pretty(this.compressionMethod)+" unknown (inner file : "+s.transformTo("string",this.fileName)+")");this.decompressed=new i(this.compressedSize,this.uncompressedSize,this.crc32,t,e.readData(this.compressedSize))},readCentralPart:function(e){this.versionMadeBy=e.readInt(2),e.skip(2),this.bitFlag=e.readInt(2),this.compressionMethod=e.readString(2),this.date=e.readDate(),this.crc32=e.readInt(4),this.compressedSize=e.readInt(4),this.uncompressedSize=e.readInt(4);var t=e.readInt(2);if(this.extraFieldsLength=e.readInt(2),this.fileCommentLength=e.readInt(2),this.diskNumberStart=e.readInt(2),this.internalFileAttributes=e.readInt(2),this.externalFileAttributes=e.readInt(4),this.localHeaderOffset=e.readInt(4),this.isEncrypted())throw new Error("Encrypted zip are not supported");e.skip(t),this.readExtraFields(e),this.parseZIP64ExtraField(e),this.fileComment=e.readData(this.fileCommentLength)},processAttributes:function(){this.unixPermissions=null,this.dosPermissions=null;var e=this.versionMadeBy>>8;this.dir=!!(16&this.externalFileAttributes),0==e&&(this.dosPermissions=63&this.externalFileAttributes),3==e&&(this.unixPermissions=this.externalFileAttributes>>16&65535),this.dir||"/"!==this.fileNameStr.slice(-1)||(this.dir=!0)},parseZIP64ExtraField:function(){if(this.extraFields[1]){var e=n(this.extraFields[1].value);this.uncompressedSize===s.MAX_VALUE_32BITS&&(this.uncompressedSize=e.readInt(8)),this.compressedSize===s.MAX_VALUE_32BITS&&(this.compressedSize=e.readInt(8)),this.localHeaderOffset===s.MAX_VALUE_32BITS&&(this.localHeaderOffset=e.readInt(8)),this.diskNumberStart===s.MAX_VALUE_32BITS&&(this.diskNumberStart=e.readInt(4))}},readExtraFields:function(e){var t,r,n,i=e.index+this.extraFieldsLength;for(this.extraFields||(this.extraFields={});e.index+4<i;)t=e.readInt(2),r=e.readInt(2),n=e.readData(r),this.extraFields[t]={id:t,length:r,value:n};e.setIndex(i)},handleUTF8:function(){var e=u.uint8array?"uint8array":"array";if(this.useUTF8())this.fileNameStr=o.utf8decode(this.fileName),this.fileCommentStr=o.utf8decode(this.fileComment);else{var t=this.findExtraFieldUnicodePath();if(null!==t)this.fileNameStr=t;else{var r=s.transformTo(e,this.fileName);this.fileNameStr=this.loadOptions.decodeFileName(r)}var n=this.findExtraFieldUnicodeComment();if(null!==n)this.fileCommentStr=n;else{var i=s.transformTo(e,this.fileComment);this.fileCommentStr=this.loadOptions.decodeFileName(i)}}},findExtraFieldUnicodePath:function(){var e=this.extraFields[28789];if(e){var t=n(e.value);return 1!==t.readInt(1)?null:a(this.fileName)!==t.readInt(4)?null:o.utf8decode(t.readData(e.length-5))}return null},findExtraFieldUnicodeComment:function(){var e=this.extraFields[25461];if(e){var t=n(e.value);return 1!==t.readInt(1)?null:a(this.fileComment)!==t.readInt(4)?null:o.utf8decode(t.readData(e.length-5))}return null}},t.exports=l},{"./compressedObject":2,"./compressions":3,"./crc32":4,"./reader/readerFor":22,"./support":30,"./utf8":31,"./utils":32}],35:[function(e,t,r){"use strict";function n(e,t,r){this.name=e,this.dir=r.dir,this.date=r.date,this.comment=r.comment,this.unixPermissions=r.unixPermissions,this.dosPermissions=r.dosPermissions,this._data=t,this._dataBinary=r.binary,this.options={compression:r.compression,compressionOptions:r.compressionOptions}}var s=e("./stream/StreamHelper"),i=e("./stream/DataWorker"),a=e("./utf8"),o=e("./compressedObject"),h=e("./stream/GenericWorker");n.prototype={internalStream:function(e){var t=null,r="string";try{if(!e)throw new Error("No output type specified.");var n="string"===(r=e.toLowerCase())||"text"===r;"binarystring"!==r&&"text"!==r||(r="string"),t=this._decompressWorker();var i=!this._dataBinary;i&&!n&&(t=t.pipe(new a.Utf8EncodeWorker)),!i&&n&&(t=t.pipe(new a.Utf8DecodeWorker))}catch(e){(t=new h("error")).error(e)}return new s(t,r,"")},async:function(e,t){return this.internalStream(e).accumulate(t)},nodeStream:function(e,t){return this.internalStream(e||"nodebuffer").toNodejsStream(t)},_compressWorker:function(e,t){if(this._data instanceof o&&this._data.compression.magic===e.magic)return this._data.getCompressedWorker();var r=this._decompressWorker();return this._dataBinary||(r=r.pipe(new a.Utf8EncodeWorker)),o.createWorkerFrom(r,e,t)},_decompressWorker:function(){return this._data instanceof o?this._data.getContentWorker():this._data instanceof h?this._data:new i(this._data)}};for(var u=["asText","asBinary","asNodeBuffer","asUint8Array","asArrayBuffer"],l=function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},f=0;f<u.length;f++)n.prototype[u[f]]=l;t.exports=n},{"./compressedObject":2,"./stream/DataWorker":27,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31}],36:[function(e,l,t){(function(t){"use strict";var r,n,e=t.MutationObserver||t.WebKitMutationObserver;if(e){var i=0,s=new e(u),a=t.document.createTextNode("");s.observe(a,{characterData:!0}),r=function(){a.data=i=++i%2}}else if(t.setImmediate||void 0===t.MessageChannel)r="document"in t&&"onreadystatechange"in t.document.createElement("script")?function(){var e=t.document.createElement("script");e.onreadystatechange=function(){u(),e.onreadystatechange=null,e.parentNode.removeChild(e),e=null},t.document.documentElement.appendChild(e)}:function(){setTimeout(u,0)};else{var o=new t.MessageChannel;o.port1.onmessage=u,r=function(){o.port2.postMessage(0)}}var h=[];function u(){var e,t;n=!0;for(var r=h.length;r;){for(t=h,h=[],e=-1;++e<r;)t[e]();r=h.length}n=!1}l.exports=function(e){1!==h.push(e)||n||r()}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],37:[function(e,t,r){"use strict";var i=e("immediate");function u(){}var l={},s=["REJECTED"],a=["FULFILLED"],n=["PENDING"];function o(e){if("function"!=typeof e)throw new TypeError("resolver must be a function");this.state=n,this.queue=[],this.outcome=void 0,e!==u&&d(this,e)}function h(e,t,r){this.promise=e,"function"==typeof t&&(this.onFulfilled=t,this.callFulfilled=this.otherCallFulfilled),"function"==typeof r&&(this.onRejected=r,this.callRejected=this.otherCallRejected)}function f(t,r,n){i(function(){var e;try{e=r(n)}catch(e){return l.reject(t,e)}e===t?l.reject(t,new TypeError("Cannot resolve promise with itself")):l.resolve(t,e)})}function c(e){var t=e&&e.then;if(e&&("object"==typeof e||"function"==typeof e)&&"function"==typeof t)return function(){t.apply(e,arguments)}}function d(t,e){var r=!1;function n(e){r||(r=!0,l.reject(t,e))}function i(e){r||(r=!0,l.resolve(t,e))}var s=p(function(){e(i,n)});"error"===s.status&&n(s.value)}function p(e,t){var r={};try{r.value=e(t),r.status="success"}catch(e){r.status="error",r.value=e}return r}(t.exports=o).prototype.finally=function(t){if("function"!=typeof t)return this;var r=this.constructor;return this.then(function(e){return r.resolve(t()).then(function(){return e})},function(e){return r.resolve(t()).then(function(){throw e})})},o.prototype.catch=function(e){return this.then(null,e)},o.prototype.then=function(e,t){if("function"!=typeof e&&this.state===a||"function"!=typeof t&&this.state===s)return this;var r=new this.constructor(u);this.state!==n?f(r,this.state===a?e:t,this.outcome):this.queue.push(new h(r,e,t));return r},h.prototype.callFulfilled=function(e){l.resolve(this.promise,e)},h.prototype.otherCallFulfilled=function(e){f(this.promise,this.onFulfilled,e)},h.prototype.callRejected=function(e){l.reject(this.promise,e)},h.prototype.otherCallRejected=function(e){f(this.promise,this.onRejected,e)},l.resolve=function(e,t){var r=p(c,t);if("error"===r.status)return l.reject(e,r.value);var n=r.value;if(n)d(e,n);else{e.state=a,e.outcome=t;for(var i=-1,s=e.queue.length;++i<s;)e.queue[i].callFulfilled(t)}return e},l.reject=function(e,t){e.state=s,e.outcome=t;for(var r=-1,n=e.queue.length;++r<n;)e.queue[r].callRejected(t);return e},o.resolve=function(e){if(e instanceof this)return e;return l.resolve(new this(u),e)},o.reject=function(e){var t=new this(u);return l.reject(t,e)},o.all=function(e){var r=this;if("[object Array]"!==Object.prototype.toString.call(e))return this.reject(new TypeError("must be an array"));var n=e.length,i=!1;if(!n)return this.resolve([]);var s=new Array(n),a=0,t=-1,o=new this(u);for(;++t<n;)h(e[t],t);return o;function h(e,t){r.resolve(e).then(function(e){s[t]=e,++a!==n||i||(i=!0,l.resolve(o,s))},function(e){i||(i=!0,l.reject(o,e))})}},o.race=function(e){var t=this;if("[object Array]"!==Object.prototype.toString.call(e))return this.reject(new TypeError("must be an array"));var r=e.length,n=!1;if(!r)return this.resolve([]);var i=-1,s=new this(u);for(;++i<r;)a=e[i],t.resolve(a).then(function(e){n||(n=!0,l.resolve(s,e))},function(e){n||(n=!0,l.reject(s,e))});var a;return s}},{immediate:36}],38:[function(e,t,r){"use strict";var n={};(0,e("./lib/utils/common").assign)(n,e("./lib/deflate"),e("./lib/inflate"),e("./lib/zlib/constants")),t.exports=n},{"./lib/deflate":39,"./lib/inflate":40,"./lib/utils/common":41,"./lib/zlib/constants":44}],39:[function(e,t,r){"use strict";var a=e("./zlib/deflate"),o=e("./utils/common"),h=e("./utils/strings"),i=e("./zlib/messages"),s=e("./zlib/zstream"),u=Object.prototype.toString,l=0,f=-1,c=0,d=8;function p(e){if(!(this instanceof p))return new p(e);this.options=o.assign({level:f,method:d,chunkSize:16384,windowBits:15,memLevel:8,strategy:c,to:""},e||{});var t=this.options;t.raw&&0<t.windowBits?t.windowBits=-t.windowBits:t.gzip&&0<t.windowBits&&t.windowBits<16&&(t.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new s,this.strm.avail_out=0;var r=a.deflateInit2(this.strm,t.level,t.method,t.windowBits,t.memLevel,t.strategy);if(r!==l)throw new Error(i[r]);if(t.header&&a.deflateSetHeader(this.strm,t.header),t.dictionary){var n;if(n="string"==typeof t.dictionary?h.string2buf(t.dictionary):"[object ArrayBuffer]"===u.call(t.dictionary)?new Uint8Array(t.dictionary):t.dictionary,(r=a.deflateSetDictionary(this.strm,n))!==l)throw new Error(i[r]);this._dict_set=!0}}function n(e,t){var r=new p(t);if(r.push(e,!0),r.err)throw r.msg||i[r.err];return r.result}p.prototype.push=function(e,t){var r,n,i=this.strm,s=this.options.chunkSize;if(this.ended)return!1;n=t===~~t?t:!0===t?4:0,"string"==typeof e?i.input=h.string2buf(e):"[object ArrayBuffer]"===u.call(e)?i.input=new Uint8Array(e):i.input=e,i.next_in=0,i.avail_in=i.input.length;do{if(0===i.avail_out&&(i.output=new o.Buf8(s),i.next_out=0,i.avail_out=s),1!==(r=a.deflate(i,n))&&r!==l)return this.onEnd(r),!(this.ended=!0);0!==i.avail_out&&(0!==i.avail_in||4!==n&&2!==n)||("string"===this.options.to?this.onData(h.buf2binstring(o.shrinkBuf(i.output,i.next_out))):this.onData(o.shrinkBuf(i.output,i.next_out)))}while((0<i.avail_in||0===i.avail_out)&&1!==r);return 4===n?(r=a.deflateEnd(this.strm),this.onEnd(r),this.ended=!0,r===l):2!==n||(this.onEnd(l),!(i.avail_out=0))},p.prototype.onData=function(e){this.chunks.push(e)},p.prototype.onEnd=function(e){e===l&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=o.flattenChunks(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg},r.Deflate=p,r.deflate=n,r.deflateRaw=function(e,t){return(t=t||{}).raw=!0,n(e,t)},r.gzip=function(e,t){return(t=t||{}).gzip=!0,n(e,t)}},{"./utils/common":41,"./utils/strings":42,"./zlib/deflate":46,"./zlib/messages":51,"./zlib/zstream":53}],40:[function(e,t,r){"use strict";var c=e("./zlib/inflate"),d=e("./utils/common"),p=e("./utils/strings"),m=e("./zlib/constants"),n=e("./zlib/messages"),i=e("./zlib/zstream"),s=e("./zlib/gzheader"),_=Object.prototype.toString;function a(e){if(!(this instanceof a))return new a(e);this.options=d.assign({chunkSize:16384,windowBits:0,to:""},e||{});var t=this.options;t.raw&&0<=t.windowBits&&t.windowBits<16&&(t.windowBits=-t.windowBits,0===t.windowBits&&(t.windowBits=-15)),!(0<=t.windowBits&&t.windowBits<16)||e&&e.windowBits||(t.windowBits+=32),15<t.windowBits&&t.windowBits<48&&0==(15&t.windowBits)&&(t.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new i,this.strm.avail_out=0;var r=c.inflateInit2(this.strm,t.windowBits);if(r!==m.Z_OK)throw new Error(n[r]);this.header=new s,c.inflateGetHeader(this.strm,this.header)}function o(e,t){var r=new a(t);if(r.push(e,!0),r.err)throw r.msg||n[r.err];return r.result}a.prototype.push=function(e,t){var r,n,i,s,a,o,h=this.strm,u=this.options.chunkSize,l=this.options.dictionary,f=!1;if(this.ended)return!1;n=t===~~t?t:!0===t?m.Z_FINISH:m.Z_NO_FLUSH,"string"==typeof e?h.input=p.binstring2buf(e):"[object ArrayBuffer]"===_.call(e)?h.input=new Uint8Array(e):h.input=e,h.next_in=0,h.avail_in=h.input.length;do{if(0===h.avail_out&&(h.output=new d.Buf8(u),h.next_out=0,h.avail_out=u),(r=c.inflate(h,m.Z_NO_FLUSH))===m.Z_NEED_DICT&&l&&(o="string"==typeof l?p.string2buf(l):"[object ArrayBuffer]"===_.call(l)?new Uint8Array(l):l,r=c.inflateSetDictionary(this.strm,o)),r===m.Z_BUF_ERROR&&!0===f&&(r=m.Z_OK,f=!1),r!==m.Z_STREAM_END&&r!==m.Z_OK)return this.onEnd(r),!(this.ended=!0);h.next_out&&(0!==h.avail_out&&r!==m.Z_STREAM_END&&(0!==h.avail_in||n!==m.Z_FINISH&&n!==m.Z_SYNC_FLUSH)||("string"===this.options.to?(i=p.utf8border(h.output,h.next_out),s=h.next_out-i,a=p.buf2string(h.output,i),h.next_out=s,h.avail_out=u-s,s&&d.arraySet(h.output,h.output,i,s,0),this.onData(a)):this.onData(d.shrinkBuf(h.output,h.next_out)))),0===h.avail_in&&0===h.avail_out&&(f=!0)}while((0<h.avail_in||0===h.avail_out)&&r!==m.Z_STREAM_END);return r===m.Z_STREAM_END&&(n=m.Z_FINISH),n===m.Z_FINISH?(r=c.inflateEnd(this.strm),this.onEnd(r),this.ended=!0,r===m.Z_OK):n!==m.Z_SYNC_FLUSH||(this.onEnd(m.Z_OK),!(h.avail_out=0))},a.prototype.onData=function(e){this.chunks.push(e)},a.prototype.onEnd=function(e){e===m.Z_OK&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=d.flattenChunks(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg},r.Inflate=a,r.inflate=o,r.inflateRaw=function(e,t){return(t=t||{}).raw=!0,o(e,t)},r.ungzip=o},{"./utils/common":41,"./utils/strings":42,"./zlib/constants":44,"./zlib/gzheader":47,"./zlib/inflate":49,"./zlib/messages":51,"./zlib/zstream":53}],41:[function(e,t,r){"use strict";var n="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Int32Array;r.assign=function(e){for(var t=Array.prototype.slice.call(arguments,1);t.length;){var r=t.shift();if(r){if("object"!=typeof r)throw new TypeError(r+"must be non-object");for(var n in r)r.hasOwnProperty(n)&&(e[n]=r[n])}}return e},r.shrinkBuf=function(e,t){return e.length===t?e:e.subarray?e.subarray(0,t):(e.length=t,e)};var i={arraySet:function(e,t,r,n,i){if(t.subarray&&e.subarray)e.set(t.subarray(r,r+n),i);else for(var s=0;s<n;s++)e[i+s]=t[r+s]},flattenChunks:function(e){var t,r,n,i,s,a;for(t=n=0,r=e.length;t<r;t++)n+=e[t].length;for(a=new Uint8Array(n),t=i=0,r=e.length;t<r;t++)s=e[t],a.set(s,i),i+=s.length;return a}},s={arraySet:function(e,t,r,n,i){for(var s=0;s<n;s++)e[i+s]=t[r+s]},flattenChunks:function(e){return[].concat.apply([],e)}};r.setTyped=function(e){e?(r.Buf8=Uint8Array,r.Buf16=Uint16Array,r.Buf32=Int32Array,r.assign(r,i)):(r.Buf8=Array,r.Buf16=Array,r.Buf32=Array,r.assign(r,s))},r.setTyped(n)},{}],42:[function(e,t,r){"use strict";var h=e("./common"),i=!0,s=!0;try{String.fromCharCode.apply(null,[0])}catch(e){i=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch(e){s=!1}for(var u=new h.Buf8(256),n=0;n<256;n++)u[n]=252<=n?6:248<=n?5:240<=n?4:224<=n?3:192<=n?2:1;function l(e,t){if(t<65537&&(e.subarray&&s||!e.subarray&&i))return String.fromCharCode.apply(null,h.shrinkBuf(e,t));for(var r="",n=0;n<t;n++)r+=String.fromCharCode(e[n]);return r}u[254]=u[254]=1,r.string2buf=function(e){var t,r,n,i,s,a=e.length,o=0;for(i=0;i<a;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<a&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),o+=r<128?1:r<2048?2:r<65536?3:4;for(t=new h.Buf8(o),i=s=0;s<o;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<a&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),r<128?t[s++]=r:(r<2048?t[s++]=192|r>>>6:(r<65536?t[s++]=224|r>>>12:(t[s++]=240|r>>>18,t[s++]=128|r>>>12&63),t[s++]=128|r>>>6&63),t[s++]=128|63&r);return t},r.buf2binstring=function(e){return l(e,e.length)},r.binstring2buf=function(e){for(var t=new h.Buf8(e.length),r=0,n=t.length;r<n;r++)t[r]=e.charCodeAt(r);return t},r.buf2string=function(e,t){var r,n,i,s,a=t||e.length,o=new Array(2*a);for(r=n=0;r<a;)if((i=e[r++])<128)o[n++]=i;else if(4<(s=u[i]))o[n++]=65533,r+=s-1;else{for(i&=2===s?31:3===s?15:7;1<s&&r<a;)i=i<<6|63&e[r++],s--;1<s?o[n++]=65533:i<65536?o[n++]=i:(i-=65536,o[n++]=55296|i>>10&1023,o[n++]=56320|1023&i)}return l(o,n)},r.utf8border=function(e,t){var r;for((t=t||e.length)>e.length&&(t=e.length),r=t-1;0<=r&&128==(192&e[r]);)r--;return r<0?t:0===r?t:r+u[e[r]]>t?r:t}},{"./common":41}],43:[function(e,t,r){"use strict";t.exports=function(e,t,r,n){for(var i=65535&e|0,s=e>>>16&65535|0,a=0;0!==r;){for(r-=a=2e3<r?2e3:r;s=s+(i=i+t[n++]|0)|0,--a;);i%=65521,s%=65521}return i|s<<16|0}},{}],44:[function(e,t,r){"use strict";t.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],45:[function(e,t,r){"use strict";var o=function(){for(var e,t=[],r=0;r<256;r++){e=r;for(var n=0;n<8;n++)e=1&e?3988292384^e>>>1:e>>>1;t[r]=e}return t}();t.exports=function(e,t,r,n){var i=o,s=n+r;e^=-1;for(var a=n;a<s;a++)e=e>>>8^i[255&(e^t[a])];return-1^e}},{}],46:[function(e,t,r){"use strict";var h,c=e("../utils/common"),u=e("./trees"),d=e("./adler32"),p=e("./crc32"),n=e("./messages"),l=0,f=4,m=0,_=-2,g=-1,b=4,i=2,v=8,y=9,s=286,a=30,o=19,w=2*s+1,k=15,x=3,S=258,z=S+x+1,C=42,E=113,A=1,I=2,O=3,B=4;function R(e,t){return e.msg=n[t],t}function T(e){return(e<<1)-(4<e?9:0)}function D(e){for(var t=e.length;0<=--t;)e[t]=0}function F(e){var t=e.state,r=t.pending;r>e.avail_out&&(r=e.avail_out),0!==r&&(c.arraySet(e.output,t.pending_buf,t.pending_out,r,e.next_out),e.next_out+=r,t.pending_out+=r,e.total_out+=r,e.avail_out-=r,t.pending-=r,0===t.pending&&(t.pending_out=0))}function N(e,t){u._tr_flush_block(e,0<=e.block_start?e.block_start:-1,e.strstart-e.block_start,t),e.block_start=e.strstart,F(e.strm)}function U(e,t){e.pending_buf[e.pending++]=t}function P(e,t){e.pending_buf[e.pending++]=t>>>8&255,e.pending_buf[e.pending++]=255&t}function L(e,t){var r,n,i=e.max_chain_length,s=e.strstart,a=e.prev_length,o=e.nice_match,h=e.strstart>e.w_size-z?e.strstart-(e.w_size-z):0,u=e.window,l=e.w_mask,f=e.prev,c=e.strstart+S,d=u[s+a-1],p=u[s+a];e.prev_length>=e.good_match&&(i>>=2),o>e.lookahead&&(o=e.lookahead);do{if(u[(r=t)+a]===p&&u[r+a-1]===d&&u[r]===u[s]&&u[++r]===u[s+1]){s+=2,r++;do{}while(u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&s<c);if(n=S-(c-s),s=c-S,a<n){if(e.match_start=t,o<=(a=n))break;d=u[s+a-1],p=u[s+a]}}}while((t=f[t&l])>h&&0!=--i);return a<=e.lookahead?a:e.lookahead}function j(e){var t,r,n,i,s,a,o,h,u,l,f=e.w_size;do{if(i=e.window_size-e.lookahead-e.strstart,e.strstart>=f+(f-z)){for(c.arraySet(e.window,e.window,f,f,0),e.match_start-=f,e.strstart-=f,e.block_start-=f,t=r=e.hash_size;n=e.head[--t],e.head[t]=f<=n?n-f:0,--r;);for(t=r=f;n=e.prev[--t],e.prev[t]=f<=n?n-f:0,--r;);i+=f}if(0===e.strm.avail_in)break;if(a=e.strm,o=e.window,h=e.strstart+e.lookahead,u=i,l=void 0,l=a.avail_in,u<l&&(l=u),r=0===l?0:(a.avail_in-=l,c.arraySet(o,a.input,a.next_in,l,h),1===a.state.wrap?a.adler=d(a.adler,o,l,h):2===a.state.wrap&&(a.adler=p(a.adler,o,l,h)),a.next_in+=l,a.total_in+=l,l),e.lookahead+=r,e.lookahead+e.insert>=x)for(s=e.strstart-e.insert,e.ins_h=e.window[s],e.ins_h=(e.ins_h<<e.hash_shift^e.window[s+1])&e.hash_mask;e.insert&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[s+x-1])&e.hash_mask,e.prev[s&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=s,s++,e.insert--,!(e.lookahead+e.insert<x)););}while(e.lookahead<z&&0!==e.strm.avail_in)}function Z(e,t){for(var r,n;;){if(e.lookahead<z){if(j(e),e.lookahead<z&&t===l)return A;if(0===e.lookahead)break}if(r=0,e.lookahead>=x&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+x-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),0!==r&&e.strstart-r<=e.w_size-z&&(e.match_length=L(e,r)),e.match_length>=x)if(n=u._tr_tally(e,e.strstart-e.match_start,e.match_length-x),e.lookahead-=e.match_length,e.match_length<=e.max_lazy_match&&e.lookahead>=x){for(e.match_length--;e.strstart++,e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+x-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart,0!=--e.match_length;);e.strstart++}else e.strstart+=e.match_length,e.match_length=0,e.ins_h=e.window[e.strstart],e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+1])&e.hash_mask;else n=u._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++;if(n&&(N(e,!1),0===e.strm.avail_out))return A}return e.insert=e.strstart<x-1?e.strstart:x-1,t===f?(N(e,!0),0===e.strm.avail_out?O:B):e.last_lit&&(N(e,!1),0===e.strm.avail_out)?A:I}function W(e,t){for(var r,n,i;;){if(e.lookahead<z){if(j(e),e.lookahead<z&&t===l)return A;if(0===e.lookahead)break}if(r=0,e.lookahead>=x&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+x-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),e.prev_length=e.match_length,e.prev_match=e.match_start,e.match_length=x-1,0!==r&&e.prev_length<e.max_lazy_match&&e.strstart-r<=e.w_size-z&&(e.match_length=L(e,r),e.match_length<=5&&(1===e.strategy||e.match_length===x&&4096<e.strstart-e.match_start)&&(e.match_length=x-1)),e.prev_length>=x&&e.match_length<=e.prev_length){for(i=e.strstart+e.lookahead-x,n=u._tr_tally(e,e.strstart-1-e.prev_match,e.prev_length-x),e.lookahead-=e.prev_length-1,e.prev_length-=2;++e.strstart<=i&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+x-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),0!=--e.prev_length;);if(e.match_available=0,e.match_length=x-1,e.strstart++,n&&(N(e,!1),0===e.strm.avail_out))return A}else if(e.match_available){if((n=u._tr_tally(e,0,e.window[e.strstart-1]))&&N(e,!1),e.strstart++,e.lookahead--,0===e.strm.avail_out)return A}else e.match_available=1,e.strstart++,e.lookahead--}return e.match_available&&(n=u._tr_tally(e,0,e.window[e.strstart-1]),e.match_available=0),e.insert=e.strstart<x-1?e.strstart:x-1,t===f?(N(e,!0),0===e.strm.avail_out?O:B):e.last_lit&&(N(e,!1),0===e.strm.avail_out)?A:I}function M(e,t,r,n,i){this.good_length=e,this.max_lazy=t,this.nice_length=r,this.max_chain=n,this.func=i}function H(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=v,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new c.Buf16(2*w),this.dyn_dtree=new c.Buf16(2*(2*a+1)),this.bl_tree=new c.Buf16(2*(2*o+1)),D(this.dyn_ltree),D(this.dyn_dtree),D(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new c.Buf16(k+1),this.heap=new c.Buf16(2*s+1),D(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new c.Buf16(2*s+1),D(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function G(e){var t;return e&&e.state?(e.total_in=e.total_out=0,e.data_type=i,(t=e.state).pending=0,t.pending_out=0,t.wrap<0&&(t.wrap=-t.wrap),t.status=t.wrap?C:E,e.adler=2===t.wrap?0:1,t.last_flush=l,u._tr_init(t),m):R(e,_)}function K(e){var t=G(e);return t===m&&function(e){e.window_size=2*e.w_size,D(e.head),e.max_lazy_match=h[e.level].max_lazy,e.good_match=h[e.level].good_length,e.nice_match=h[e.level].nice_length,e.max_chain_length=h[e.level].max_chain,e.strstart=0,e.block_start=0,e.lookahead=0,e.insert=0,e.match_length=e.prev_length=x-1,e.match_available=0,e.ins_h=0}(e.state),t}function Y(e,t,r,n,i,s){if(!e)return _;var a=1;if(t===g&&(t=6),n<0?(a=0,n=-n):15<n&&(a=2,n-=16),i<1||y<i||r!==v||n<8||15<n||t<0||9<t||s<0||b<s)return R(e,_);8===n&&(n=9);var o=new H;return(e.state=o).strm=e,o.wrap=a,o.gzhead=null,o.w_bits=n,o.w_size=1<<o.w_bits,o.w_mask=o.w_size-1,o.hash_bits=i+7,o.hash_size=1<<o.hash_bits,o.hash_mask=o.hash_size-1,o.hash_shift=~~((o.hash_bits+x-1)/x),o.window=new c.Buf8(2*o.w_size),o.head=new c.Buf16(o.hash_size),o.prev=new c.Buf16(o.w_size),o.lit_bufsize=1<<i+6,o.pending_buf_size=4*o.lit_bufsize,o.pending_buf=new c.Buf8(o.pending_buf_size),o.d_buf=1*o.lit_bufsize,o.l_buf=3*o.lit_bufsize,o.level=t,o.strategy=s,o.method=r,K(e)}h=[new M(0,0,0,0,function(e,t){var r=65535;for(r>e.pending_buf_size-5&&(r=e.pending_buf_size-5);;){if(e.lookahead<=1){if(j(e),0===e.lookahead&&t===l)return A;if(0===e.lookahead)break}e.strstart+=e.lookahead,e.lookahead=0;var n=e.block_start+r;if((0===e.strstart||e.strstart>=n)&&(e.lookahead=e.strstart-n,e.strstart=n,N(e,!1),0===e.strm.avail_out))return A;if(e.strstart-e.block_start>=e.w_size-z&&(N(e,!1),0===e.strm.avail_out))return A}return e.insert=0,t===f?(N(e,!0),0===e.strm.avail_out?O:B):(e.strstart>e.block_start&&(N(e,!1),e.strm.avail_out),A)}),new M(4,4,8,4,Z),new M(4,5,16,8,Z),new M(4,6,32,32,Z),new M(4,4,16,16,W),new M(8,16,32,32,W),new M(8,16,128,128,W),new M(8,32,128,256,W),new M(32,128,258,1024,W),new M(32,258,258,4096,W)],r.deflateInit=function(e,t){return Y(e,t,v,15,8,0)},r.deflateInit2=Y,r.deflateReset=K,r.deflateResetKeep=G,r.deflateSetHeader=function(e,t){return e&&e.state?2!==e.state.wrap?_:(e.state.gzhead=t,m):_},r.deflate=function(e,t){var r,n,i,s;if(!e||!e.state||5<t||t<0)return e?R(e,_):_;if(n=e.state,!e.output||!e.input&&0!==e.avail_in||666===n.status&&t!==f)return R(e,0===e.avail_out?-5:_);if(n.strm=e,r=n.last_flush,n.last_flush=t,n.status===C)if(2===n.wrap)e.adler=0,U(n,31),U(n,139),U(n,8),n.gzhead?(U(n,(n.gzhead.text?1:0)+(n.gzhead.hcrc?2:0)+(n.gzhead.extra?4:0)+(n.gzhead.name?8:0)+(n.gzhead.comment?16:0)),U(n,255&n.gzhead.time),U(n,n.gzhead.time>>8&255),U(n,n.gzhead.time>>16&255),U(n,n.gzhead.time>>24&255),U(n,9===n.level?2:2<=n.strategy||n.level<2?4:0),U(n,255&n.gzhead.os),n.gzhead.extra&&n.gzhead.extra.length&&(U(n,255&n.gzhead.extra.length),U(n,n.gzhead.extra.length>>8&255)),n.gzhead.hcrc&&(e.adler=p(e.adler,n.pending_buf,n.pending,0)),n.gzindex=0,n.status=69):(U(n,0),U(n,0),U(n,0),U(n,0),U(n,0),U(n,9===n.level?2:2<=n.strategy||n.level<2?4:0),U(n,3),n.status=E);else{var a=v+(n.w_bits-8<<4)<<8;a|=(2<=n.strategy||n.level<2?0:n.level<6?1:6===n.level?2:3)<<6,0!==n.strstart&&(a|=32),a+=31-a%31,n.status=E,P(n,a),0!==n.strstart&&(P(n,e.adler>>>16),P(n,65535&e.adler)),e.adler=1}if(69===n.status)if(n.gzhead.extra){for(i=n.pending;n.gzindex<(65535&n.gzhead.extra.length)&&(n.pending!==n.pending_buf_size||(n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),F(e),i=n.pending,n.pending!==n.pending_buf_size));)U(n,255&n.gzhead.extra[n.gzindex]),n.gzindex++;n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),n.gzindex===n.gzhead.extra.length&&(n.gzindex=0,n.status=73)}else n.status=73;if(73===n.status)if(n.gzhead.name){i=n.pending;do{if(n.pending===n.pending_buf_size&&(n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),F(e),i=n.pending,n.pending===n.pending_buf_size)){s=1;break}s=n.gzindex<n.gzhead.name.length?255&n.gzhead.name.charCodeAt(n.gzindex++):0,U(n,s)}while(0!==s);n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),0===s&&(n.gzindex=0,n.status=91)}else n.status=91;if(91===n.status)if(n.gzhead.comment){i=n.pending;do{if(n.pending===n.pending_buf_size&&(n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),F(e),i=n.pending,n.pending===n.pending_buf_size)){s=1;break}s=n.gzindex<n.gzhead.comment.length?255&n.gzhead.comment.charCodeAt(n.gzindex++):0,U(n,s)}while(0!==s);n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),0===s&&(n.status=103)}else n.status=103;if(103===n.status&&(n.gzhead.hcrc?(n.pending+2>n.pending_buf_size&&F(e),n.pending+2<=n.pending_buf_size&&(U(n,255&e.adler),U(n,e.adler>>8&255),e.adler=0,n.status=E)):n.status=E),0!==n.pending){if(F(e),0===e.avail_out)return n.last_flush=-1,m}else if(0===e.avail_in&&T(t)<=T(r)&&t!==f)return R(e,-5);if(666===n.status&&0!==e.avail_in)return R(e,-5);if(0!==e.avail_in||0!==n.lookahead||t!==l&&666!==n.status){var o=2===n.strategy?function(e,t){for(var r;;){if(0===e.lookahead&&(j(e),0===e.lookahead)){if(t===l)return A;break}if(e.match_length=0,r=u._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++,r&&(N(e,!1),0===e.strm.avail_out))return A}return e.insert=0,t===f?(N(e,!0),0===e.strm.avail_out?O:B):e.last_lit&&(N(e,!1),0===e.strm.avail_out)?A:I}(n,t):3===n.strategy?function(e,t){for(var r,n,i,s,a=e.window;;){if(e.lookahead<=S){if(j(e),e.lookahead<=S&&t===l)return A;if(0===e.lookahead)break}if(e.match_length=0,e.lookahead>=x&&0<e.strstart&&(n=a[i=e.strstart-1])===a[++i]&&n===a[++i]&&n===a[++i]){s=e.strstart+S;do{}while(n===a[++i]&&n===a[++i]&&n===a[++i]&&n===a[++i]&&n===a[++i]&&n===a[++i]&&n===a[++i]&&n===a[++i]&&i<s);e.match_length=S-(s-i),e.match_length>e.lookahead&&(e.match_length=e.lookahead)}if(e.match_length>=x?(r=u._tr_tally(e,1,e.match_length-x),e.lookahead-=e.match_length,e.strstart+=e.match_length,e.match_length=0):(r=u._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++),r&&(N(e,!1),0===e.strm.avail_out))return A}return e.insert=0,t===f?(N(e,!0),0===e.strm.avail_out?O:B):e.last_lit&&(N(e,!1),0===e.strm.avail_out)?A:I}(n,t):h[n.level].func(n,t);if(o!==O&&o!==B||(n.status=666),o===A||o===O)return 0===e.avail_out&&(n.last_flush=-1),m;if(o===I&&(1===t?u._tr_align(n):5!==t&&(u._tr_stored_block(n,0,0,!1),3===t&&(D(n.head),0===n.lookahead&&(n.strstart=0,n.block_start=0,n.insert=0))),F(e),0===e.avail_out))return n.last_flush=-1,m}return t!==f?m:n.wrap<=0?1:(2===n.wrap?(U(n,255&e.adler),U(n,e.adler>>8&255),U(n,e.adler>>16&255),U(n,e.adler>>24&255),U(n,255&e.total_in),U(n,e.total_in>>8&255),U(n,e.total_in>>16&255),U(n,e.total_in>>24&255)):(P(n,e.adler>>>16),P(n,65535&e.adler)),F(e),0<n.wrap&&(n.wrap=-n.wrap),0!==n.pending?m:1)},r.deflateEnd=function(e){var t;return e&&e.state?(t=e.state.status)!==C&&69!==t&&73!==t&&91!==t&&103!==t&&t!==E&&666!==t?R(e,_):(e.state=null,t===E?R(e,-3):m):_},r.deflateSetDictionary=function(e,t){var r,n,i,s,a,o,h,u,l=t.length;if(!e||!e.state)return _;if(2===(s=(r=e.state).wrap)||1===s&&r.status!==C||r.lookahead)return _;for(1===s&&(e.adler=d(e.adler,t,l,0)),r.wrap=0,l>=r.w_size&&(0===s&&(D(r.head),r.strstart=0,r.block_start=0,r.insert=0),u=new c.Buf8(r.w_size),c.arraySet(u,t,l-r.w_size,r.w_size,0),t=u,l=r.w_size),a=e.avail_in,o=e.next_in,h=e.input,e.avail_in=l,e.next_in=0,e.input=t,j(r);r.lookahead>=x;){for(n=r.strstart,i=r.lookahead-(x-1);r.ins_h=(r.ins_h<<r.hash_shift^r.window[n+x-1])&r.hash_mask,r.prev[n&r.w_mask]=r.head[r.ins_h],r.head[r.ins_h]=n,n++,--i;);r.strstart=n,r.lookahead=x-1,j(r)}return r.strstart+=r.lookahead,r.block_start=r.strstart,r.insert=r.lookahead,r.lookahead=0,r.match_length=r.prev_length=x-1,r.match_available=0,e.next_in=o,e.input=h,e.avail_in=a,r.wrap=s,m},r.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./messages":51,"./trees":52}],47:[function(e,t,r){"use strict";t.exports=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}},{}],48:[function(e,t,r){"use strict";t.exports=function(e,t){var r,n,i,s,a,o,h,u,l,f,c,d,p,m,_,g,b,v,y,w,k,x,S,z,C;r=e.state,n=e.next_in,z=e.input,i=n+(e.avail_in-5),s=e.next_out,C=e.output,a=s-(t-e.avail_out),o=s+(e.avail_out-257),h=r.dmax,u=r.wsize,l=r.whave,f=r.wnext,c=r.window,d=r.hold,p=r.bits,m=r.lencode,_=r.distcode,g=(1<<r.lenbits)-1,b=(1<<r.distbits)-1;e:do{p<15&&(d+=z[n++]<<p,p+=8,d+=z[n++]<<p,p+=8),v=m[d&g];t:for(;;){if(d>>>=y=v>>>24,p-=y,0===(y=v>>>16&255))C[s++]=65535&v;else{if(!(16&y)){if(0==(64&y)){v=m[(65535&v)+(d&(1<<y)-1)];continue t}if(32&y){r.mode=12;break e}e.msg="invalid literal/length code",r.mode=30;break e}w=65535&v,(y&=15)&&(p<y&&(d+=z[n++]<<p,p+=8),w+=d&(1<<y)-1,d>>>=y,p-=y),p<15&&(d+=z[n++]<<p,p+=8,d+=z[n++]<<p,p+=8),v=_[d&b];r:for(;;){if(d>>>=y=v>>>24,p-=y,!(16&(y=v>>>16&255))){if(0==(64&y)){v=_[(65535&v)+(d&(1<<y)-1)];continue r}e.msg="invalid distance code",r.mode=30;break e}if(k=65535&v,p<(y&=15)&&(d+=z[n++]<<p,(p+=8)<y&&(d+=z[n++]<<p,p+=8)),h<(k+=d&(1<<y)-1)){e.msg="invalid distance too far back",r.mode=30;break e}if(d>>>=y,p-=y,(y=s-a)<k){if(l<(y=k-y)&&r.sane){e.msg="invalid distance too far back",r.mode=30;break e}if(S=c,(x=0)===f){if(x+=u-y,y<w){for(w-=y;C[s++]=c[x++],--y;);x=s-k,S=C}}else if(f<y){if(x+=u+f-y,(y-=f)<w){for(w-=y;C[s++]=c[x++],--y;);if(x=0,f<w){for(w-=y=f;C[s++]=c[x++],--y;);x=s-k,S=C}}}else if(x+=f-y,y<w){for(w-=y;C[s++]=c[x++],--y;);x=s-k,S=C}for(;2<w;)C[s++]=S[x++],C[s++]=S[x++],C[s++]=S[x++],w-=3;w&&(C[s++]=S[x++],1<w&&(C[s++]=S[x++]))}else{for(x=s-k;C[s++]=C[x++],C[s++]=C[x++],C[s++]=C[x++],2<(w-=3););w&&(C[s++]=C[x++],1<w&&(C[s++]=C[x++]))}break}}break}}while(n<i&&s<o);n-=w=p>>3,d&=(1<<(p-=w<<3))-1,e.next_in=n,e.next_out=s,e.avail_in=n<i?i-n+5:5-(n-i),e.avail_out=s<o?o-s+257:257-(s-o),r.hold=d,r.bits=p}},{}],49:[function(e,t,r){"use strict";var I=e("../utils/common"),O=e("./adler32"),B=e("./crc32"),R=e("./inffast"),T=e("./inftrees"),D=1,F=2,N=0,U=-2,P=1,n=852,i=592;function L(e){return(e>>>24&255)+(e>>>8&65280)+((65280&e)<<8)+((255&e)<<24)}function s(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new I.Buf16(320),this.work=new I.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function a(e){var t;return e&&e.state?(t=e.state,e.total_in=e.total_out=t.total=0,e.msg="",t.wrap&&(e.adler=1&t.wrap),t.mode=P,t.last=0,t.havedict=0,t.dmax=32768,t.head=null,t.hold=0,t.bits=0,t.lencode=t.lendyn=new I.Buf32(n),t.distcode=t.distdyn=new I.Buf32(i),t.sane=1,t.back=-1,N):U}function o(e){var t;return e&&e.state?((t=e.state).wsize=0,t.whave=0,t.wnext=0,a(e)):U}function h(e,t){var r,n;return e&&e.state?(n=e.state,t<0?(r=0,t=-t):(r=1+(t>>4),t<48&&(t&=15)),t&&(t<8||15<t)?U:(null!==n.window&&n.wbits!==t&&(n.window=null),n.wrap=r,n.wbits=t,o(e))):U}function u(e,t){var r,n;return e?(n=new s,(e.state=n).window=null,(r=h(e,t))!==N&&(e.state=null),r):U}var l,f,c=!0;function j(e){if(c){var t;for(l=new I.Buf32(512),f=new I.Buf32(32),t=0;t<144;)e.lens[t++]=8;for(;t<256;)e.lens[t++]=9;for(;t<280;)e.lens[t++]=7;for(;t<288;)e.lens[t++]=8;for(T(D,e.lens,0,288,l,0,e.work,{bits:9}),t=0;t<32;)e.lens[t++]=5;T(F,e.lens,0,32,f,0,e.work,{bits:5}),c=!1}e.lencode=l,e.lenbits=9,e.distcode=f,e.distbits=5}function Z(e,t,r,n){var i,s=e.state;return null===s.window&&(s.wsize=1<<s.wbits,s.wnext=0,s.whave=0,s.window=new I.Buf8(s.wsize)),n>=s.wsize?(I.arraySet(s.window,t,r-s.wsize,s.wsize,0),s.wnext=0,s.whave=s.wsize):(n<(i=s.wsize-s.wnext)&&(i=n),I.arraySet(s.window,t,r-n,i,s.wnext),(n-=i)?(I.arraySet(s.window,t,r-n,n,0),s.wnext=n,s.whave=s.wsize):(s.wnext+=i,s.wnext===s.wsize&&(s.wnext=0),s.whave<s.wsize&&(s.whave+=i))),0}r.inflateReset=o,r.inflateReset2=h,r.inflateResetKeep=a,r.inflateInit=function(e){return u(e,15)},r.inflateInit2=u,r.inflate=function(e,t){var r,n,i,s,a,o,h,u,l,f,c,d,p,m,_,g,b,v,y,w,k,x,S,z,C=0,E=new I.Buf8(4),A=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!e||!e.state||!e.output||!e.input&&0!==e.avail_in)return U;12===(r=e.state).mode&&(r.mode=13),a=e.next_out,i=e.output,h=e.avail_out,s=e.next_in,n=e.input,o=e.avail_in,u=r.hold,l=r.bits,f=o,c=h,x=N;e:for(;;)switch(r.mode){case P:if(0===r.wrap){r.mode=13;break}for(;l<16;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(2&r.wrap&&35615===u){E[r.check=0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0),l=u=0,r.mode=2;break}if(r.flags=0,r.head&&(r.head.done=!1),!(1&r.wrap)||(((255&u)<<8)+(u>>8))%31){e.msg="incorrect header check",r.mode=30;break}if(8!=(15&u)){e.msg="unknown compression method",r.mode=30;break}if(l-=4,k=8+(15&(u>>>=4)),0===r.wbits)r.wbits=k;else if(k>r.wbits){e.msg="invalid window size",r.mode=30;break}r.dmax=1<<k,e.adler=r.check=1,r.mode=512&u?10:12,l=u=0;break;case 2:for(;l<16;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(r.flags=u,8!=(255&r.flags)){e.msg="unknown compression method",r.mode=30;break}if(57344&r.flags){e.msg="unknown header flags set",r.mode=30;break}r.head&&(r.head.text=u>>8&1),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0)),l=u=0,r.mode=3;case 3:for(;l<32;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.head&&(r.head.time=u),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,E[2]=u>>>16&255,E[3]=u>>>24&255,r.check=B(r.check,E,4,0)),l=u=0,r.mode=4;case 4:for(;l<16;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.head&&(r.head.xflags=255&u,r.head.os=u>>8),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0)),l=u=0,r.mode=5;case 5:if(1024&r.flags){for(;l<16;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.length=u,r.head&&(r.head.extra_len=u),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0)),l=u=0}else r.head&&(r.head.extra=null);r.mode=6;case 6:if(1024&r.flags&&(o<(d=r.length)&&(d=o),d&&(r.head&&(k=r.head.extra_len-r.length,r.head.extra||(r.head.extra=new Array(r.head.extra_len)),I.arraySet(r.head.extra,n,s,d,k)),512&r.flags&&(r.check=B(r.check,n,d,s)),o-=d,s+=d,r.length-=d),r.length))break e;r.length=0,r.mode=7;case 7:if(2048&r.flags){if(0===o)break e;for(d=0;k=n[s+d++],r.head&&k&&r.length<65536&&(r.head.name+=String.fromCharCode(k)),k&&d<o;);if(512&r.flags&&(r.check=B(r.check,n,d,s)),o-=d,s+=d,k)break e}else r.head&&(r.head.name=null);r.length=0,r.mode=8;case 8:if(4096&r.flags){if(0===o)break e;for(d=0;k=n[s+d++],r.head&&k&&r.length<65536&&(r.head.comment+=String.fromCharCode(k)),k&&d<o;);if(512&r.flags&&(r.check=B(r.check,n,d,s)),o-=d,s+=d,k)break e}else r.head&&(r.head.comment=null);r.mode=9;case 9:if(512&r.flags){for(;l<16;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(u!==(65535&r.check)){e.msg="header crc mismatch",r.mode=30;break}l=u=0}r.head&&(r.head.hcrc=r.flags>>9&1,r.head.done=!0),e.adler=r.check=0,r.mode=12;break;case 10:for(;l<32;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}e.adler=r.check=L(u),l=u=0,r.mode=11;case 11:if(0===r.havedict)return e.next_out=a,e.avail_out=h,e.next_in=s,e.avail_in=o,r.hold=u,r.bits=l,2;e.adler=r.check=1,r.mode=12;case 12:if(5===t||6===t)break e;case 13:if(r.last){u>>>=7&l,l-=7&l,r.mode=27;break}for(;l<3;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}switch(r.last=1&u,l-=1,3&(u>>>=1)){case 0:r.mode=14;break;case 1:if(j(r),r.mode=20,6!==t)break;u>>>=2,l-=2;break e;case 2:r.mode=17;break;case 3:e.msg="invalid block type",r.mode=30}u>>>=2,l-=2;break;case 14:for(u>>>=7&l,l-=7&l;l<32;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if((65535&u)!=(u>>>16^65535)){e.msg="invalid stored block lengths",r.mode=30;break}if(r.length=65535&u,l=u=0,r.mode=15,6===t)break e;case 15:r.mode=16;case 16:if(d=r.length){if(o<d&&(d=o),h<d&&(d=h),0===d)break e;I.arraySet(i,n,s,d,a),o-=d,s+=d,h-=d,a+=d,r.length-=d;break}r.mode=12;break;case 17:for(;l<14;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(r.nlen=257+(31&u),u>>>=5,l-=5,r.ndist=1+(31&u),u>>>=5,l-=5,r.ncode=4+(15&u),u>>>=4,l-=4,286<r.nlen||30<r.ndist){e.msg="too many length or distance symbols",r.mode=30;break}r.have=0,r.mode=18;case 18:for(;r.have<r.ncode;){for(;l<3;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.lens[A[r.have++]]=7&u,u>>>=3,l-=3}for(;r.have<19;)r.lens[A[r.have++]]=0;if(r.lencode=r.lendyn,r.lenbits=7,S={bits:r.lenbits},x=T(0,r.lens,0,19,r.lencode,0,r.work,S),r.lenbits=S.bits,x){e.msg="invalid code lengths set",r.mode=30;break}r.have=0,r.mode=19;case 19:for(;r.have<r.nlen+r.ndist;){for(;g=(C=r.lencode[u&(1<<r.lenbits)-1])>>>16&255,b=65535&C,!((_=C>>>24)<=l);){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(b<16)u>>>=_,l-=_,r.lens[r.have++]=b;else{if(16===b){for(z=_+2;l<z;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(u>>>=_,l-=_,0===r.have){e.msg="invalid bit length repeat",r.mode=30;break}k=r.lens[r.have-1],d=3+(3&u),u>>>=2,l-=2}else if(17===b){for(z=_+3;l<z;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}l-=_,k=0,d=3+(7&(u>>>=_)),u>>>=3,l-=3}else{for(z=_+7;l<z;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}l-=_,k=0,d=11+(127&(u>>>=_)),u>>>=7,l-=7}if(r.have+d>r.nlen+r.ndist){e.msg="invalid bit length repeat",r.mode=30;break}for(;d--;)r.lens[r.have++]=k}}if(30===r.mode)break;if(0===r.lens[256]){e.msg="invalid code -- missing end-of-block",r.mode=30;break}if(r.lenbits=9,S={bits:r.lenbits},x=T(D,r.lens,0,r.nlen,r.lencode,0,r.work,S),r.lenbits=S.bits,x){e.msg="invalid literal/lengths set",r.mode=30;break}if(r.distbits=6,r.distcode=r.distdyn,S={bits:r.distbits},x=T(F,r.lens,r.nlen,r.ndist,r.distcode,0,r.work,S),r.distbits=S.bits,x){e.msg="invalid distances set",r.mode=30;break}if(r.mode=20,6===t)break e;case 20:r.mode=21;case 21:if(6<=o&&258<=h){e.next_out=a,e.avail_out=h,e.next_in=s,e.avail_in=o,r.hold=u,r.bits=l,R(e,c),a=e.next_out,i=e.output,h=e.avail_out,s=e.next_in,n=e.input,o=e.avail_in,u=r.hold,l=r.bits,12===r.mode&&(r.back=-1);break}for(r.back=0;g=(C=r.lencode[u&(1<<r.lenbits)-1])>>>16&255,b=65535&C,!((_=C>>>24)<=l);){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(g&&0==(240&g)){for(v=_,y=g,w=b;g=(C=r.lencode[w+((u&(1<<v+y)-1)>>v)])>>>16&255,b=65535&C,!(v+(_=C>>>24)<=l);){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}u>>>=v,l-=v,r.back+=v}if(u>>>=_,l-=_,r.back+=_,r.length=b,0===g){r.mode=26;break}if(32&g){r.back=-1,r.mode=12;break}if(64&g){e.msg="invalid literal/length code",r.mode=30;break}r.extra=15&g,r.mode=22;case 22:if(r.extra){for(z=r.extra;l<z;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.length+=u&(1<<r.extra)-1,u>>>=r.extra,l-=r.extra,r.back+=r.extra}r.was=r.length,r.mode=23;case 23:for(;g=(C=r.distcode[u&(1<<r.distbits)-1])>>>16&255,b=65535&C,!((_=C>>>24)<=l);){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(0==(240&g)){for(v=_,y=g,w=b;g=(C=r.distcode[w+((u&(1<<v+y)-1)>>v)])>>>16&255,b=65535&C,!(v+(_=C>>>24)<=l);){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}u>>>=v,l-=v,r.back+=v}if(u>>>=_,l-=_,r.back+=_,64&g){e.msg="invalid distance code",r.mode=30;break}r.offset=b,r.extra=15&g,r.mode=24;case 24:if(r.extra){for(z=r.extra;l<z;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.offset+=u&(1<<r.extra)-1,u>>>=r.extra,l-=r.extra,r.back+=r.extra}if(r.offset>r.dmax){e.msg="invalid distance too far back",r.mode=30;break}r.mode=25;case 25:if(0===h)break e;if(d=c-h,r.offset>d){if((d=r.offset-d)>r.whave&&r.sane){e.msg="invalid distance too far back",r.mode=30;break}p=d>r.wnext?(d-=r.wnext,r.wsize-d):r.wnext-d,d>r.length&&(d=r.length),m=r.window}else m=i,p=a-r.offset,d=r.length;for(h<d&&(d=h),h-=d,r.length-=d;i[a++]=m[p++],--d;);0===r.length&&(r.mode=21);break;case 26:if(0===h)break e;i[a++]=r.length,h--,r.mode=21;break;case 27:if(r.wrap){for(;l<32;){if(0===o)break e;o--,u|=n[s++]<<l,l+=8}if(c-=h,e.total_out+=c,r.total+=c,c&&(e.adler=r.check=r.flags?B(r.check,i,c,a-c):O(r.check,i,c,a-c)),c=h,(r.flags?u:L(u))!==r.check){e.msg="incorrect data check",r.mode=30;break}l=u=0}r.mode=28;case 28:if(r.wrap&&r.flags){for(;l<32;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(u!==(4294967295&r.total)){e.msg="incorrect length check",r.mode=30;break}l=u=0}r.mode=29;case 29:x=1;break e;case 30:x=-3;break e;case 31:return-4;case 32:default:return U}return e.next_out=a,e.avail_out=h,e.next_in=s,e.avail_in=o,r.hold=u,r.bits=l,(r.wsize||c!==e.avail_out&&r.mode<30&&(r.mode<27||4!==t))&&Z(e,e.output,e.next_out,c-e.avail_out)?(r.mode=31,-4):(f-=e.avail_in,c-=e.avail_out,e.total_in+=f,e.total_out+=c,r.total+=c,r.wrap&&c&&(e.adler=r.check=r.flags?B(r.check,i,c,e.next_out-c):O(r.check,i,c,e.next_out-c)),e.data_type=r.bits+(r.last?64:0)+(12===r.mode?128:0)+(20===r.mode||15===r.mode?256:0),(0==f&&0===c||4===t)&&x===N&&(x=-5),x)},r.inflateEnd=function(e){if(!e||!e.state)return U;var t=e.state;return t.window&&(t.window=null),e.state=null,N},r.inflateGetHeader=function(e,t){var r;return e&&e.state?0==(2&(r=e.state).wrap)?U:((r.head=t).done=!1,N):U},r.inflateSetDictionary=function(e,t){var r,n=t.length;return e&&e.state?0!==(r=e.state).wrap&&11!==r.mode?U:11===r.mode&&O(1,t,n,0)!==r.check?-3:Z(e,t,n,n)?(r.mode=31,-4):(r.havedict=1,N):U},r.inflateInfo="pako inflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./inffast":48,"./inftrees":50}],50:[function(e,t,r){"use strict";var D=e("../utils/common"),F=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],N=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],U=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],P=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];t.exports=function(e,t,r,n,i,s,a,o){var h,u,l,f,c,d,p,m,_,g=o.bits,b=0,v=0,y=0,w=0,k=0,x=0,S=0,z=0,C=0,E=0,A=null,I=0,O=new D.Buf16(16),B=new D.Buf16(16),R=null,T=0;for(b=0;b<=15;b++)O[b]=0;for(v=0;v<n;v++)O[t[r+v]]++;for(k=g,w=15;1<=w&&0===O[w];w--);if(w<k&&(k=w),0===w)return i[s++]=20971520,i[s++]=20971520,o.bits=1,0;for(y=1;y<w&&0===O[y];y++);for(k<y&&(k=y),b=z=1;b<=15;b++)if(z<<=1,(z-=O[b])<0)return-1;if(0<z&&(0===e||1!==w))return-1;for(B[1]=0,b=1;b<15;b++)B[b+1]=B[b]+O[b];for(v=0;v<n;v++)0!==t[r+v]&&(a[B[t[r+v]]++]=v);if(d=0===e?(A=R=a,19):1===e?(A=F,I-=257,R=N,T-=257,256):(A=U,R=P,-1),b=y,c=s,S=v=E=0,l=-1,f=(C=1<<(x=k))-1,1===e&&852<C||2===e&&592<C)return 1;for(;;){for(p=b-S,_=a[v]<d?(m=0,a[v]):a[v]>d?(m=R[T+a[v]],A[I+a[v]]):(m=96,0),h=1<<b-S,y=u=1<<x;i[c+(E>>S)+(u-=h)]=p<<24|m<<16|_|0,0!==u;);for(h=1<<b-1;E&h;)h>>=1;if(0!==h?(E&=h-1,E+=h):E=0,v++,0==--O[b]){if(b===w)break;b=t[r+a[v]]}if(k<b&&(E&f)!==l){for(0===S&&(S=k),c+=y,z=1<<(x=b-S);x+S<w&&!((z-=O[x+S])<=0);)x++,z<<=1;if(C+=1<<x,1===e&&852<C||2===e&&592<C)return 1;i[l=E&f]=k<<24|x<<16|c-s|0}}return 0!==E&&(i[c+E]=b-S<<24|64<<16|0),o.bits=k,0}},{"../utils/common":41}],51:[function(e,t,r){"use strict";t.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],52:[function(e,t,r){"use strict";var i=e("../utils/common"),o=0,h=1;function n(e){for(var t=e.length;0<=--t;)e[t]=0}var s=0,a=29,u=256,l=u+1+a,f=30,c=19,_=2*l+1,g=15,d=16,p=7,m=256,b=16,v=17,y=18,w=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],k=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],x=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],S=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],z=new Array(2*(l+2));n(z);var C=new Array(2*f);n(C);var E=new Array(512);n(E);var A=new Array(256);n(A);var I=new Array(a);n(I);var O,B,R,T=new Array(f);function D(e,t,r,n,i){this.static_tree=e,this.extra_bits=t,this.extra_base=r,this.elems=n,this.max_length=i,this.has_stree=e&&e.length}function F(e,t){this.dyn_tree=e,this.max_code=0,this.stat_desc=t}function N(e){return e<256?E[e]:E[256+(e>>>7)]}function U(e,t){e.pending_buf[e.pending++]=255&t,e.pending_buf[e.pending++]=t>>>8&255}function P(e,t,r){e.bi_valid>d-r?(e.bi_buf|=t<<e.bi_valid&65535,U(e,e.bi_buf),e.bi_buf=t>>d-e.bi_valid,e.bi_valid+=r-d):(e.bi_buf|=t<<e.bi_valid&65535,e.bi_valid+=r)}function L(e,t,r){P(e,r[2*t],r[2*t+1])}function j(e,t){for(var r=0;r|=1&e,e>>>=1,r<<=1,0<--t;);return r>>>1}function Z(e,t,r){var n,i,s=new Array(g+1),a=0;for(n=1;n<=g;n++)s[n]=a=a+r[n-1]<<1;for(i=0;i<=t;i++){var o=e[2*i+1];0!==o&&(e[2*i]=j(s[o]++,o))}}function W(e){var t;for(t=0;t<l;t++)e.dyn_ltree[2*t]=0;for(t=0;t<f;t++)e.dyn_dtree[2*t]=0;for(t=0;t<c;t++)e.bl_tree[2*t]=0;e.dyn_ltree[2*m]=1,e.opt_len=e.static_len=0,e.last_lit=e.matches=0}function M(e){8<e.bi_valid?U(e,e.bi_buf):0<e.bi_valid&&(e.pending_buf[e.pending++]=e.bi_buf),e.bi_buf=0,e.bi_valid=0}function H(e,t,r,n){var i=2*t,s=2*r;return e[i]<e[s]||e[i]===e[s]&&n[t]<=n[r]}function G(e,t,r){for(var n=e.heap[r],i=r<<1;i<=e.heap_len&&(i<e.heap_len&&H(t,e.heap[i+1],e.heap[i],e.depth)&&i++,!H(t,n,e.heap[i],e.depth));)e.heap[r]=e.heap[i],r=i,i<<=1;e.heap[r]=n}function K(e,t,r){var n,i,s,a,o=0;if(0!==e.last_lit)for(;n=e.pending_buf[e.d_buf+2*o]<<8|e.pending_buf[e.d_buf+2*o+1],i=e.pending_buf[e.l_buf+o],o++,0===n?L(e,i,t):(L(e,(s=A[i])+u+1,t),0!==(a=w[s])&&P(e,i-=I[s],a),L(e,s=N(--n),r),0!==(a=k[s])&&P(e,n-=T[s],a)),o<e.last_lit;);L(e,m,t)}function Y(e,t){var r,n,i,s=t.dyn_tree,a=t.stat_desc.static_tree,o=t.stat_desc.has_stree,h=t.stat_desc.elems,u=-1;for(e.heap_len=0,e.heap_max=_,r=0;r<h;r++)0!==s[2*r]?(e.heap[++e.heap_len]=u=r,e.depth[r]=0):s[2*r+1]=0;for(;e.heap_len<2;)s[2*(i=e.heap[++e.heap_len]=u<2?++u:0)]=1,e.depth[i]=0,e.opt_len--,o&&(e.static_len-=a[2*i+1]);for(t.max_code=u,r=e.heap_len>>1;1<=r;r--)G(e,s,r);for(i=h;r=e.heap[1],e.heap[1]=e.heap[e.heap_len--],G(e,s,1),n=e.heap[1],e.heap[--e.heap_max]=r,e.heap[--e.heap_max]=n,s[2*i]=s[2*r]+s[2*n],e.depth[i]=(e.depth[r]>=e.depth[n]?e.depth[r]:e.depth[n])+1,s[2*r+1]=s[2*n+1]=i,e.heap[1]=i++,G(e,s,1),2<=e.heap_len;);e.heap[--e.heap_max]=e.heap[1],function(e,t){var r,n,i,s,a,o,h=t.dyn_tree,u=t.max_code,l=t.stat_desc.static_tree,f=t.stat_desc.has_stree,c=t.stat_desc.extra_bits,d=t.stat_desc.extra_base,p=t.stat_desc.max_length,m=0;for(s=0;s<=g;s++)e.bl_count[s]=0;for(h[2*e.heap[e.heap_max]+1]=0,r=e.heap_max+1;r<_;r++)p<(s=h[2*h[2*(n=e.heap[r])+1]+1]+1)&&(s=p,m++),h[2*n+1]=s,u<n||(e.bl_count[s]++,a=0,d<=n&&(a=c[n-d]),o=h[2*n],e.opt_len+=o*(s+a),f&&(e.static_len+=o*(l[2*n+1]+a)));if(0!==m){do{for(s=p-1;0===e.bl_count[s];)s--;e.bl_count[s]--,e.bl_count[s+1]+=2,e.bl_count[p]--,m-=2}while(0<m);for(s=p;0!==s;s--)for(n=e.bl_count[s];0!==n;)u<(i=e.heap[--r])||(h[2*i+1]!==s&&(e.opt_len+=(s-h[2*i+1])*h[2*i],h[2*i+1]=s),n--)}}(e,t),Z(s,u,e.bl_count)}function X(e,t,r){var n,i,s=-1,a=t[1],o=0,h=7,u=4;for(0===a&&(h=138,u=3),t[2*(r+1)+1]=65535,n=0;n<=r;n++)i=a,a=t[2*(n+1)+1],++o<h&&i===a||(o<u?e.bl_tree[2*i]+=o:0!==i?(i!==s&&e.bl_tree[2*i]++,e.bl_tree[2*b]++):o<=10?e.bl_tree[2*v]++:e.bl_tree[2*y]++,s=i,u=(o=0)===a?(h=138,3):i===a?(h=6,3):(h=7,4))}function V(e,t,r){var n,i,s=-1,a=t[1],o=0,h=7,u=4;for(0===a&&(h=138,u=3),n=0;n<=r;n++)if(i=a,a=t[2*(n+1)+1],!(++o<h&&i===a)){if(o<u)for(;L(e,i,e.bl_tree),0!=--o;);else 0!==i?(i!==s&&(L(e,i,e.bl_tree),o--),L(e,b,e.bl_tree),P(e,o-3,2)):o<=10?(L(e,v,e.bl_tree),P(e,o-3,3)):(L(e,y,e.bl_tree),P(e,o-11,7));s=i,u=(o=0)===a?(h=138,3):i===a?(h=6,3):(h=7,4)}}n(T);var q=!1;function J(e,t,r,n){P(e,(s<<1)+(n?1:0),3),function(e,t,r,n){M(e),n&&(U(e,r),U(e,~r)),i.arraySet(e.pending_buf,e.window,t,r,e.pending),e.pending+=r}(e,t,r,!0)}r._tr_init=function(e){q||(function(){var e,t,r,n,i,s=new Array(g+1);for(n=r=0;n<a-1;n++)for(I[n]=r,e=0;e<1<<w[n];e++)A[r++]=n;for(A[r-1]=n,n=i=0;n<16;n++)for(T[n]=i,e=0;e<1<<k[n];e++)E[i++]=n;for(i>>=7;n<f;n++)for(T[n]=i<<7,e=0;e<1<<k[n]-7;e++)E[256+i++]=n;for(t=0;t<=g;t++)s[t]=0;for(e=0;e<=143;)z[2*e+1]=8,e++,s[8]++;for(;e<=255;)z[2*e+1]=9,e++,s[9]++;for(;e<=279;)z[2*e+1]=7,e++,s[7]++;for(;e<=287;)z[2*e+1]=8,e++,s[8]++;for(Z(z,l+1,s),e=0;e<f;e++)C[2*e+1]=5,C[2*e]=j(e,5);O=new D(z,w,u+1,l,g),B=new D(C,k,0,f,g),R=new D(new Array(0),x,0,c,p)}(),q=!0),e.l_desc=new F(e.dyn_ltree,O),e.d_desc=new F(e.dyn_dtree,B),e.bl_desc=new F(e.bl_tree,R),e.bi_buf=0,e.bi_valid=0,W(e)},r._tr_stored_block=J,r._tr_flush_block=function(e,t,r,n){var i,s,a=0;0<e.level?(2===e.strm.data_type&&(e.strm.data_type=function(e){var t,r=4093624447;for(t=0;t<=31;t++,r>>>=1)if(1&r&&0!==e.dyn_ltree[2*t])return o;if(0!==e.dyn_ltree[18]||0!==e.dyn_ltree[20]||0!==e.dyn_ltree[26])return h;for(t=32;t<u;t++)if(0!==e.dyn_ltree[2*t])return h;return o}(e)),Y(e,e.l_desc),Y(e,e.d_desc),a=function(e){var t;for(X(e,e.dyn_ltree,e.l_desc.max_code),X(e,e.dyn_dtree,e.d_desc.max_code),Y(e,e.bl_desc),t=c-1;3<=t&&0===e.bl_tree[2*S[t]+1];t--);return e.opt_len+=3*(t+1)+5+5+4,t}(e),i=e.opt_len+3+7>>>3,(s=e.static_len+3+7>>>3)<=i&&(i=s)):i=s=r+5,r+4<=i&&-1!==t?J(e,t,r,n):4===e.strategy||s===i?(P(e,2+(n?1:0),3),K(e,z,C)):(P(e,4+(n?1:0),3),function(e,t,r,n){var i;for(P(e,t-257,5),P(e,r-1,5),P(e,n-4,4),i=0;i<n;i++)P(e,e.bl_tree[2*S[i]+1],3);V(e,e.dyn_ltree,t-1),V(e,e.dyn_dtree,r-1)}(e,e.l_desc.max_code+1,e.d_desc.max_code+1,a+1),K(e,e.dyn_ltree,e.dyn_dtree)),W(e),n&&M(e)},r._tr_tally=function(e,t,r){return e.pending_buf[e.d_buf+2*e.last_lit]=t>>>8&255,e.pending_buf[e.d_buf+2*e.last_lit+1]=255&t,e.pending_buf[e.l_buf+e.last_lit]=255&r,e.last_lit++,0===t?e.dyn_ltree[2*r]++:(e.matches++,t--,e.dyn_ltree[2*(A[r]+u+1)]++,e.dyn_dtree[2*N(t)]++),e.last_lit===e.lit_bufsize-1},r._tr_align=function(e){P(e,2,3),L(e,m,z),function(e){16===e.bi_valid?(U(e,e.bi_buf),e.bi_buf=0,e.bi_valid=0):8<=e.bi_valid&&(e.pending_buf[e.pending++]=255&e.bi_buf,e.bi_buf>>=8,e.bi_valid-=8)}(e)}},{"../utils/common":41}],53:[function(e,t,r){"use strict";t.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}},{}],54:[function(e,t,r){(function(e){!function(r,n){"use strict";if(!r.setImmediate){var i,s,t,a,o=1,h={},u=!1,l=r.document,e=Object.getPrototypeOf&&Object.getPrototypeOf(r);e=e&&e.setTimeout?e:r,i="[object process]"==={}.toString.call(r.process)?function(e){process.nextTick(function(){c(e)})}:function(){if(r.postMessage&&!r.importScripts){var e=!0,t=r.onmessage;return r.onmessage=function(){e=!1},r.postMessage("","*"),r.onmessage=t,e}}()?(a="setImmediate$"+Math.random()+"$",r.addEventListener?r.addEventListener("message",d,!1):r.attachEvent("onmessage",d),function(e){r.postMessage(a+e,"*")}):r.MessageChannel?((t=new MessageChannel).port1.onmessage=function(e){c(e.data)},function(e){t.port2.postMessage(e)}):l&&"onreadystatechange"in l.createElement("script")?(s=l.documentElement,function(e){var t=l.createElement("script");t.onreadystatechange=function(){c(e),t.onreadystatechange=null,s.removeChild(t),t=null},s.appendChild(t)}):function(e){setTimeout(c,0,e)},e.setImmediate=function(e){"function"!=typeof e&&(e=new Function(""+e));for(var t=new Array(arguments.length-1),r=0;r<t.length;r++)t[r]=arguments[r+1];var n={callback:e,args:t};return h[o]=n,i(o),o++},e.clearImmediate=f}function f(e){delete h[e]}function c(e){if(u)setTimeout(c,0,e);else{var t=h[e];if(t){u=!0;try{!function(e){var t=e.callback,r=e.args;switch(r.length){case 0:t();break;case 1:t(r[0]);break;case 2:t(r[0],r[1]);break;case 3:t(r[0],r[1],r[2]);break;default:t.apply(n,r)}}(t)}finally{f(e),u=!1}}}}function d(e){e.source===r&&"string"==typeof e.data&&0===e.data.indexOf(a)&&c(+e.data.slice(a.length))}}("undefined"==typeof self?void 0===e?this:e:self)}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[10])(10)});
;
'use strict';
/* Character Bookshelf — USB folder storage. No accounts, tokens, or remote APIs. */
const $ = id => document.getElementById(id);
const el = (tag, className = '', text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
const cleanName = value => String(value || '').trim();
const folderSafe = value => {
  const name = cleanName(value).replace(/[\\/:*?"<>|\x00-\x1f]/g, '-').replace(/[. ]+$/g, '').slice(0, 70) || 'Untitled';
  return /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i.test(name) ? '_' + name : name;
};
const randomId = () => crypto.randomUUID();
const dateNow = () => new Date().toISOString();
const status = (message, kind = '') => { $('saveStatus').textContent = message; $('saveStatus').dataset.kind = kind; };
let toastTimer;
function toast(message, isError = false) {
  const t = $('toast');
  clearTimeout(toastTimer);
  t.textContent = message;
  t.classList.toggle('error', isError);
  t.classList.remove('hidden');
  toastTimer = setTimeout(() => t.classList.add('hidden'), 6000);
}
const APP_VERSION = '4.2.0';
// Summaries verified against the release archives and their README files.
const RELEASE_HISTORY = [
  ['4.1.3','Mobile Interface Update',['Mobile-only compact application menu with visible save status','Responsive bookshelf spacing, horizontal recent-work cards, and touch-friendly books','Novel actions, character gallery and editor adapted for small screens','Manuscript, notes, series and timeline controls adapted for mobile','Desktop styles, storage behavior and library format remain unchanged']],
  ['4.1.2','Character Development & Manuscript Notes',['Generic arc prompts for new characters; existing profiles keep their original questions and gain a freeform arc-type field','Drag-and-drop import zones for DOCX, PDF, TXT and reviewed character JSON','Manuscript annotations and quote-based relocation, printable margin-note exports for TXT/DOCX','Novel-wide notes, custom character tags and gallery filters','Live RAM recovery usage, inline novel-title editing and desktop button alignment']],
  ['4.1.1','Unified Series Bookshelf',['Linked novels now share ordinary bookshelf rows with standalone novels','Small clickable series labels on linked covers lead straight to the correct Series page','No character, timeline, or novel files are migrated or modified']],
  ['4.1','Series & Manuscript Update',['Writer-level series organization, independently copied characters and deferred relationship links','Combined read-only series timelines with undated events separated','Character mention navigation for DOCX and TXT manuscripts; PDF page viewer retained','Smaller RAM recovery without manuscript copies; writer search index','Optional illustrated, pop-out tutorial with persistent footer access']],
  ['4.0.2','Relationship Color Hotfix',['Fixed an older CSS rule overriding relationship-specific tree line, label, and border colors','Preserved existing tree layout, links, exports, and library data']],
  ['4.0.1','Pinned Navigation Hotfix',['Top navigation remains visible while scrolling, including on narrower screens','Header height is measured automatically to prevent page content from being obscured','Updated stylesheet and script references to avoid using older cached assets']],
  ['4.0','Visual & Manuscript Reading',['Sticky navigation and clearer active-page indicators','Subtle, distinct relationship colors and a collapsible legend','Read-only DOCX, PDF and TXT reader with novel and bookshelf entry points','Version footer with complete release history','Responsive navigation and layout refinements']],
  ['3.9','Storage Reliability & Recovery',['Writer deletion safeguards and simplified writer creation','Verified writes and file conflict detection','RAM snapshots, recovery to another folder, and recovery reports','Storage status and backup reminders']],
  ['3.8','Character History & Library Tools',['Created/updated dates and sorting','Whole-word writer-wide search with highlighted destinations','Compare revisions and export or restore writer backups','Recently worked on and clickable Bookshelf logo']],
  ['3.7','Character Import Review',['Compare proposed updates next to editable existing profiles','Review imported new characters before saving','Duplicate detection and safe cancellations']],
  ['3.6','Timeline & Library Enhancements',['Novel and character-linked timeline events','Writer-wide library search and uploaded book covers','Character revision history and relationship tree PNG/PDF export']],
  ['3.5','Refresh & Navigation',['In-app Refresh View','Per-page Undo and preserved navigation after browser reload']],
  ['3.4','Relationship Tree Improvements',['Clearer tree connections and extended relationship types','Multiple target connections and drag-to-link','One-step Undo']],
  ['3.3','Character Tree',['Editable relationship map with automatic layout','Persistent character card positions and relationship types']],
  ['3.2','Deletion Safeguards',['Delete characters and novels with confirmation warnings']],
  ['3.1','Character Bookshelf Naming',['Application renamed Character Bookshelf','New Character Bookshelf folder name; compatibility with existing Character Archive folders']],
  ['3.0','USB Bookshelf & Exports',['Refined USB library folder organization','PDF and DOCX character and whole-novel exports']],
  ['2.0','Writer Bookshelves',['Writer-specific bookshelves','All Characters galleries and improved navigation']],
  ['1.0','Original USB Release',['First functional USB-based character library, writer profiles, autosave, portraits, and individual JSON character files','Initial cloud storage integration proved unsuccessful, prompting a transition to USB-based local storage.']]
];
function renderReleaseHistory(){
  const host=$('releaseHistoryList');host.replaceChildren();
  for(const [version,title,notes] of RELEASE_HISTORY){
    const details=el('details','releaseEntry');if(version===APP_VERSION)details.open=true;
    const summary=el('summary');summary.append(el('strong','',`v${version} — ${title}`));
    if(version===APP_VERSION)summary.append(el('span','releaseCurrent','Current release'));
    details.append(summary);
    const ul=el('ul');for(const note of notes)ul.append(el('li','',note));
    details.append(ul);host.append(details);
  }
}
const state = {
  root: null, selectedLocation: null, manifest: null, writer: null, writerDir: null,
  novels: [], novel: null, novelDir: null, charsDir: null, portraitsDir: null,
  characters: [], active: null, saveTimer: null, saving: null,
  revision: 0, savedRevision: 0, portraitUrl: null, galleryUrls: [], epoch: 0, treeMeta: null, treeRevision: 0, treeSavedRevision: 0, treeTimer: null, treeSaving: null, timelineEvents: [], timelineFilter: 'all', coverUrls: [], searchEpoch: 0, series: [], activeSeries: null, searchIndex: null, searchIndexEpoch: 0
};

/* v3.9 — volatile recovery. Only file bytes are kept in RAM. A browser reload
   or closing this tab destroys them. No contents are uploaded or put in storage.
   Storage pointers are File System Access handles, not paths on the PC. */
const RECOVERY_LIMIT = 384 * 1024 * 1024, RECOVERY_FILE_LIMIT = 20000;
const memoryRecovery = {
  files:new Map(), pending:new Map(), handles:new WeakMap(), versions:new Map(),
  bytes:0, complete:false, scanning:false, partialReason:'Not loaded',
  lastVerified:null, lastFailure:null, disconnected:false, active:false, refreshing:false,
  scanId:0, writeSerial:0, lastReport:null, lastRecoveryFolder:null, lastRecoveryHandle:null
};
const encoder = new TextEncoder();
function sameBytes(a,b) {
  if(!a||!b||a.byteLength!==b.byteLength)return false;
  for(let i=0;i<a.byteLength;i++)if(a[i]!==b[i])return false;
  return true;
}
async function contentBytes(content) {
  if(content instanceof Uint8Array)return content.slice();
  if(content instanceof ArrayBuffer)return new Uint8Array(content.slice(0));
  if(typeof content==='string')return encoder.encode(content);
  return new Uint8Array(await new Blob([content]).arrayBuffer());
}
async function recoveryPath(handle) {
  if(!state.root || !handle)return null;
  if(memoryRecovery.handles.has(handle))return memoryRecovery.handles.get(handle);
  if(typeof state.root.resolve!=='function')return null;
  try {
    const parts=await state.root.resolve(handle);
    if(!parts)return null;
    const path=parts.join('/');memoryRecovery.handles.set(handle,path);
    return path;
  }catch{return null;}
}
function recoveryStore(path,data,version=null) {
  if(path===null || !path || !data || isManuscriptReferencePath(path))return;
  const previous=memoryRecovery.files.get(path);
  const size=memoryRecovery.bytes-(previous?.byteLength||0)+data.byteLength;
  if(size>RECOVERY_LIMIT || (previous===undefined&&memoryRecovery.files.size>=RECOVERY_FILE_LIMIT)) {
    memoryRecovery.complete=false;memoryRecovery.partialReason='RAM recovery capacity limit reached';return;
  }
  memoryRecovery.files.set(path,data.slice());memoryRecovery.bytes=size;
  if(version!==null)memoryRecovery.versions.set(path,version);
}
function recoveryRemove(path,prefix=false) {
  if(!path)return;
  for(const [key,data] of memoryRecovery.files)if(key===path||(prefix&&key.startsWith(path+'/'))){
    memoryRecovery.bytes-=data.byteLength;memoryRecovery.files.delete(key);
    memoryRecovery.versions.set(key,++memoryRecovery.writeSerial);
    memoryRecovery.pending.delete(key);
  }
}
async function removeTrackedEntry(directory,name,options) {
  const base=await recoveryPath(directory),path=base===null?null:[base,name].filter(Boolean).join('/');
  await directory.removeEntry(name,options);
  if(path)recoveryRemove(path,!!options?.recursive);
}
// Imported manuscripts and World Maps background images are reference copies.
// Exclude their bytes from volatile RAM recovery; keep JSON/annotations.
// Normal writer ZIP backups still include these source files.
function isManuscriptReferencePath(path){
  return /(?:^|\/)manuscript-[^/]+\.(?:docx|pdf|txt)$/i.test(String(path||'')) || /(?:^|\/)world-maps\/images\//i.test(String(path||''));
}
function eligibleRecoveryFileCount(){return memoryRecovery.files.size;}
async function captureRecoverySnapshot() {
  if(!state.root || memoryRecovery.scanning)return;
  const scan=++memoryRecovery.scanId,root=state.root;
  memoryRecovery.scanning=true;memoryRecovery.partialReason='Scanning accessible reference data (manuscripts excluded)';
  const scanVersion=memoryRecovery.writeSerial;
  let finished=true,reason='',count=0;
  const entries=[];
  // Collect handles first, then protect the hardest-to-replace files first.
  const walk=async(dir,prefix='')=>{
    for await(const [name,entry] of dir.entries()){
      if(scan!==memoryRecovery.scanId||root!==state.root)throw Error('Snapshot interrupted by a library change.');
      if(!name||name==='.'||name==='..'||name.includes('/')||name.includes('\\'))throw Error('Invalid library file name.');
      const path=prefix+name;
      memoryRecovery.handles.set(entry,path);
      if(entry.kind==='directory')await walk(entry,path+'/');
      else if(entry.kind==='file'&&!isManuscriptReferencePath(path))entries.push({path,entry});
    }
  };
  const priority=path=>{
    if(path==='character-archive-manifest.json')return 0;
    if(path.endsWith('/'+NOVEL_NOTES_FILE)||path.endsWith('/'+ANNOTATIONS_FILE))return 2;
    if(path.endsWith('/novel.json')||path.endsWith('/'+SERIES_FILENAME))return 1;
    if(path.includes('/characters/')&&path.endsWith('.json'))return 2;
    if(path.endsWith('/timeline.json')||path.endsWith('/character-tree.json'))return 3;
    if(path.includes('/revisions/')&&path.endsWith('.json'))return 4;
    if(path.endsWith('.json'))return 5;
    return 6;
  };
  try{
    await walk(root);
    entries.sort((a,b)=>priority(a.path)-priority(b.path)||a.path.localeCompare(b.path));
    for(const {path,entry} of entries){
      if(scan!==memoryRecovery.scanId||root!==state.root)throw Error('Snapshot interrupted by a library change.');
      if(count>=RECOVERY_FILE_LIMIT){finished=false;reason='File count exceeds RAM recovery limit; essential files were prioritized.';break;}
      count++;
      // Preserve newer verified edits, even when the snapshot scan runs late.
      if((memoryRecovery.versions.get(path)||0)>scanVersion)continue;
      const file=await entry.getFile();
      const previous=memoryRecovery.files.get(path);
      const nextBytes=memoryRecovery.bytes-(previous?.byteLength||0)+file.size;
      if(nextBytes>RECOVERY_LIMIT){finished=false;reason='RAM capacity exceeded; some nonessential data is not recoverable.';continue;}
      // An existing baseline is never silently overwritten by a normal scan.
      if(previous&&!memoryRecovery.refreshing)continue;
      recoveryStore(path,new Uint8Array(await file.arrayBuffer()));
    }
  }catch(error){finished=false;reason=error.message;}
  if(scan===memoryRecovery.scanId){
    memoryRecovery.complete=finished;
    memoryRecovery.partialReason=finished?'Imported manuscript and map source images deliberately excluded.':reason;
    memoryRecovery.scanning=false;
    if(!finished)console.warn('Character Bookshelf recovery snapshot incomplete:',reason);
    renderStorageStatus();
  }
}
function beginVolatileRecovery() {
  memoryRecovery.scanId++;
  memoryRecovery.files.clear();memoryRecovery.pending.clear();memoryRecovery.versions.clear();
  memoryRecovery.handles=new WeakMap();memoryRecovery.bytes=0;
  memoryRecovery.complete=false;memoryRecovery.scanning=false;
  memoryRecovery.partialReason='Loading library into RAM';
  memoryRecovery.lastVerified=null;memoryRecovery.lastFailure=null;
  memoryRecovery.disconnected=false;memoryRecovery.active=true;
  void captureRecoverySnapshot();
}
async function rememberRead(handle,bytes) {
  if(!memoryRecovery.active || !state.root)return;
  const path=await recoveryPath(handle);
  if(path!==null && (memoryRecovery.refreshing||!memoryRecovery.files.has(path)))
    recoveryStore(path,bytes,memoryRecovery.refreshing?++memoryRecovery.writeSerial:null);
}
function storageFailed(error) {
  memoryRecovery.lastFailure=String(error?.message||error);
  memoryRecovery.disconnected=error?.name==='NotFoundError'||error?.name==='NotAllowedError'||error?.name==='NotReadableError';
  renderStorageStatus();
}
function renderStorageStatus() {
  const host=$('storageStatusDetails');if(!host)return;
  const summary=memoryRecovery.scanning?'Building snapshot':memoryRecovery.complete?'Complete (except reference images/files)':memoryRecovery.active?'Partial':'Unavailable';
  const items=[
    ['Original location',memoryRecovery.disconnected?'Unavailable / needs attention':state.root?.name||'Not connected'],
    ['Last verified write',memoryRecovery.lastVerified?formatMoment(memoryRecovery.lastVerified):'Not yet verified'],
    ['Pending file writes',String(memoryRecovery.pending.size)],
    ['RAM snapshot',summary+' · '+memoryRecovery.files.size+' files · '+(memoryRecovery.bytes/1048576).toFixed(1)+' MiB'],
    ['Snapshot limits',Math.round(RECOVERY_LIMIT/1048576)+' MiB / '+RECOVERY_FILE_LIMIT+' files'],
    ['Snapshot details',memoryRecovery.partialReason||'All accessible files captured'],
    ['Last storage error',memoryRecovery.lastFailure||'None']
  ];
  updateRecoveryMeter();
  host.replaceChildren();
  for(const [label,value] of items){const row=el('div','statusDataRow');row.append(el('strong','',label),el('span','',value));host.append(row);}
}
function memorySnapshotForRecovery() {
  const files=new Map([...memoryRecovery.files].map(([k,v])=>[k,v.slice()]));
  for(const [path,item] of memoryRecovery.pending)files.set(path,item.bytes.slice());
  // Uncommitted character/tree edits stay in their editor state, even if the USB
  // disconnected before their file handle could be used again.
  if(state.writer?.folder && state.novel?.folder) {
    const prefix=state.writer.folder+'/'+state.novel.folder+'/';
    if(state.novel&&!files.has(prefix+'novel.json'))files.set(prefix+'novel.json',encoder.encode(JSON.stringify(state.novel,null,2)+'\n'));
    for(const character of state.characters)if(character._filename){
      const path=prefix+'characters/'+character._filename;
      if(!files.has(path)||character===state.active&&hasUnsaved())
        files.set(path,encoder.encode(JSON.stringify(diskProfile(character),null,2)+'\n'));
    }
    if(state.treeMeta&&treeUnsaved())files.set(prefix+'character-tree.json',encoder.encode(JSON.stringify(state.treeMeta,null,2)+'\n'));
  }
  const manifest=structuredClone(state.manifest);
  if(!manifest)throw Error('No library manifest is available in this tab.');
  const writerPaths=manifest.writers.filter(w=>[...files.keys()].some(k=>k.startsWith(w.folder+'/')));
  const full=memoryRecovery.complete; // Empty writer folders legitimately have no files to snapshot.
  // If capture failed, do not present a copy as a full multi-writer recovery.
  let retained=full?manifest.writers:writerPaths;
  if(!full){
    if(!state.writer)throw Error('Select a writer before performing a partial recovery.');
    retained=writerPaths.filter(w=>w.id===state.writer.id);
  }
  manifest.writers=retained;
  if(!retained.length)throw Error('No writer files are currently recoverable.');
  const allowed=new Set(retained.map(w=>w.folder));
  for(const path of [...files.keys()]){
    if(path==='character-archive-manifest.json')continue;
    if(![...allowed].some(folder=>path.startsWith(folder+'/')))files.delete(path);
  }
  files.set('character-archive-manifest.json',encoder.encode(JSON.stringify(manifest,null,2)+'\n'));
  return {files,full,retained,originalWriters:state.manifest?.writers?.length||0,pending:memoryRecovery.pending.size,reason:memoryRecovery.partialReason};
}
function recoveryOffer(message='The original storage location could not be accessed.') {
  $('recoveryReason').textContent=message+' The tab can save the information currently in memory to a different folder. Do not reload or close the page yet.';
  $('recoverySaveStatus').textContent='No files have been copied to a new location.';
  $('openRecoveredLibraryBtn').classList.add('hidden');
  if(!$('recoveryDialog').open)$('recoveryDialog').showModal();
}
function downloadRecoveryReport() {
  if(!memoryRecovery.lastReport)return;
  downloadBlob(new Blob([JSON.stringify(memoryRecovery.lastReport,null,2)+'\n'],{type:'application/json'}),'Character-Bookshelf-Recovery-Report.json');
}
async function emergencySaveElsewhere() {
  const button=$('saveRecoveryElsewhereBtn');button.disabled=true;
  memoryRecovery.lastReport=null;memoryRecovery.lastRecoveryHandle=null;
  $('downloadRecoveryReportBtn').classList.add('hidden');$('openRecoveredLibraryBtn').classList.add('hidden');
  let targetName=null,copied=0,failed=[];
  try {
    if(typeof window.showDirectoryPicker!=='function')throw Error('Folder selection is unavailable in this browser.');
    const recovery=memorySnapshotForRecovery();
    const target=await window.showDirectoryPicker({mode:'readwrite'});
    if(typeof target.queryPermission==='function'&&await target.queryPermission({mode:'readwrite'})!=='granted'){
      if(await target.requestPermission({mode:'readwrite'})!=='granted')throw Error('Write access was denied.');
    }
    // A failed/removable USB handle can throw even on equality checks. Never
    // require successful access to the missing drive to save to a NEW target.
    try{
      if(state.root && typeof state.root.isSameEntry==='function' && await state.root.isSameEntry(target))
        throw Error('Select a different destination from the original library.');
      if(state.root && typeof state.root.resolve==='function' && await state.root.resolve(target)!==null)
        throw Error('The recovery location must not be inside the original library.');
    }catch(error){
      if(!['NotFoundError','NotReadableError','NotAllowedError'].includes(error.name))throw error;
    }
    const base='Character Bookshelf Recovery '+dateNow().replace(/[:.]/g,'-');
    let name=base,idx=2;
    while(true){try{await target.getDirectoryHandle(name);name=base+'-'+idx++;}
      catch(error){if(error.name==='NotFoundError')break;throw error;}}
    const output=await target.getDirectoryHandle(name,{create:true});targetName=name;
    // Empty writer folders are part of a complete library too.
    for(const writer of recovery.retained)await output.getDirectoryHandle(writer.folder,{create:true});
    $('recoverySaveStatus').textContent='Copying '+recovery.files.size+' recoverable files…';
    for(const [path,bytes] of recovery.files){
      try{
        const segments=path.split('/'),filename=segments.pop();let dir=output;
        for(const segment of segments)dir=await dir.getDirectoryHandle(segment,{create:true});
        const handle=await dir.getFileHandle(filename,{create:true});
        await writeHandle(handle,bytes);copied++;
      }catch(e){failed.push({path,error:e.message});break;}
    }
    const success=failed.length===0;
    const report={type:'character-bookshelf-recovery-report',createdAt:dateNow(),folder:targetName,
      completeLibrary:success&&recovery.full, writersIncluded:recovery.retained.map(w=>w.name),
      originalWriterCount:recovery.originalWriters,filesExpected:recovery.files.size,filesWritten:copied,
      pendingEditsIncluded:recovery.pending,reason:recovery.reason||null,errors:failed};
    memoryRecovery.lastReport=report;
    memoryRecovery.lastRecoveryFolder=targetName;
    $('downloadRecoveryReportBtn').classList.remove('hidden');
    if(!success)throw Error('Only '+copied+' files copied. See the recovery report; the destination may be incomplete.');
    memoryRecovery.lastRecoveryHandle=output;
    $('openRecoveredLibraryBtn').classList.remove('hidden');
    $('recoverySaveStatus').textContent='Recovery saved in '+targetName+': '+copied+' files; '+recovery.retained.length+' writer(s). '+(recovery.full?'Full snapshot':'PARTIAL RECOVERY — other data may be missing')+'. Save the report and inspect the files before relying on them.';
    toast('Recovery copy saved. It was not switched into the live application.');
  }catch(error){
    if(error.name!=='AbortError'){
      $('recoverySaveStatus').textContent='Recovery was not completed: '+error.message;
      toast('Emergency save: '+error.message,true);
    }
  }finally{button.disabled=false;renderStorageStatus();}
}
async function openRecoveredLibrary() {
  const root=memoryRecovery.lastRecoveryHandle;if(!root)return;
  const writerId=state.writer?.id;
  try {
    const manifest=await readJSON(await root.getFileHandle('character-archive-manifest.json'));
    validateManifest(manifest);
    // This is a deliberate switch, NOT a retry against the missing original.
    clearRootState();
    state.root=root;state.selectedLocation=root;state.manifest=manifest;
    beginVolatileRecovery();
    $('folderName').textContent=root.name+' (recovered copy)';
    $('retrySaveBtn').classList.add('hidden');$('downloadUnsavedBtn').classList.add('hidden');
    renderWriterCards();setStage('writer');
    $('recoveryDialog').close();
    if(writerId&&manifest.writers.some(w=>w.id===writerId))await chooseWriter(writerId);
    toast('Recovered library opened. This is a separate copy; your original USB files were not changed.');
  }catch(error){toast('Could not open recovery copy: '+error.message,true);}
}
const BACKUP_REMINDER_KEY='character-bookshelf-backup-reminder-v39';
const reminderShown=new Set();
let reminderFallback={};
function reminderState(){try{return JSON.parse(localStorage.getItem(BACKUP_REMINDER_KEY)||'{}');}catch{return structuredClone(reminderFallback);}}
function saveReminderState(next){reminderFallback=structuredClone(next);try{localStorage.setItem(BACKUP_REMINDER_KEY,JSON.stringify(next));}catch{}}
function writerReminderKey(){return (state.manifest?.createdAt||state.root?.name||'library')+'/'+(state.writer?.id||'writer');}
function backupReminderDays(){return reminderState()[writerReminderKey()]?.days??7;}
function setBackupReminderDays(days){const data=reminderState();const key=writerReminderKey();data[key]={...(data[key]||{}),days};saveReminderState(data);}
function recordBackupExport(){const data=reminderState(),key=writerReminderKey();data[key]={...(data[key]||{}),lastExportAt:dateNow()};saveReminderState(data);reminderShown.add(key);}
function maybeShowBackupReminder(){
  if(!state.writer)return;
  const key=writerReminderKey(),record=reminderState()[key]||{},days=record.days??7;
  if(!days||reminderShown.has(key))return;
  if(!record.lastExportAt||Date.now()-new Date(record.lastExportAt).getTime()>=days*86400000){
    reminderShown.add(key);
    toast('Backup reminder: consider exporting '+state.writer.name+'\'s writer ZIP to another device.');
  }
}
function renderReminderSettings(){
  const select=$('backupReminderDays');if(select){select.disabled=!state.writer;select.value=String(backupReminderDays());}
  const row=$('lastBackupExportLabel');if(row){
    const at=reminderState()[writerReminderKey()]?.lastExportAt;
    row.textContent=at?'Last download initiated: '+formatMoment(at):'No backup download recorded on this browser.';
  }
}

// One reversible action PER PAGE, held in this browser tab only. This is not a
// recovery system for permanently deleted USB files and is reset on browser reload.
const undoByPage = new Map();
let undoBusy = false, fieldFocusSerial = 0;
const NAV_KEY = 'character-bookshelf-navigation-v35';
function pageType() {
  if (!state.root) return 'folder';
  if ($('workspace').classList.contains('hidden')) return 'writers';
  for (const [id, kind] of [['bookshelfView','bookshelf'],['novelNotesView','novel-notes'],['seriesView','series'],['novelView','characters'],['treeView','tree'],['timelineView','timeline'],['manuscriptView','manuscript'],['librarySearchView','search'],['editor','editor']]) {
    if (!$(id).classList.contains('hidden')) return kind;
  }
  return 'bookshelf';
}
function pageUndoKey(kind = pageType()) {
  const library = state.manifest?.createdAt || state.root?.name || 'library';
  if (kind === 'writers') return library + '/writers';
  const writer = state.writer?.id || '-';
  if (kind === 'bookshelf' || kind === 'search') return [library,writer,kind].join('/');
  const novel = state.novel?.id || '-';
  if (kind === 'editor') return [library,writer,novel,'editor',state.active?.id || '-'].join('/');
  return [library,writer,novel,kind].join('/');
}
function updateUndoButton() {
  const button = $('undoBtn'); if (!button) return;
  const action = undoByPage.get(pageUndoKey());
  button.disabled = !action || undoBusy;
  button.title = action ? 'Undo on this page: ' + action.label : 'No reversible action on this page';
  button.textContent = action ? '↶ Undo: ' + action.label : '↶ Undo';
}
function clearUndo(scope = null) {
  if (scope) undoByPage.delete(scope);
  else undoByPage.clear();
  updateUndoButton();
}
function rememberUndo(label, rollback, group = null, scope = pageUndoKey()) {
  const old = undoByPage.get(scope);
  if (group && old?.group === group) return;
  undoByPage.set(scope, { label, rollback, group, scope });
  updateUndoButton();
}
async function undoLast() {
  const scope = pageUndoKey(), action = undoByPage.get(scope);
  if (!action || undoBusy) return;
  if (!(await flush())) { toast('Unable to undo until pending changes are saved.',true); return; }
  undoBusy = true; updateUndoButton();
  try {
    const ok = await action.rollback();
    if (ok === false) throw new Error('The USB update could not be completed.');
    if (undoByPage.get(scope) === action) undoByPage.delete(scope);
    toast('Undid: ' + action.label);
  } catch(error) {
    toast('Undo failed: ' + error.message + '. Check the USB files before retrying.',true);
  } finally { undoBusy = false; updateUndoButton(); }
}
function saveNavigation() {
  if (pageType() === 'folder' || pageType() === 'writers') return;
  try {
    sessionStorage.setItem(NAV_KEY, JSON.stringify({
      libraryCreatedAt: state.manifest?.createdAt || null,
      writerId: state.writer?.id || null,
      novelId: state.novel?.id || null,
      characterId: state.active?.id || null,
      view: pageType()
    }));
  } catch { /* Browser storage disabled: navigation works normally until refresh. */ }
}
function savedNavigation() {
  try { return JSON.parse(sessionStorage.getItem(NAV_KEY) || 'null'); }
  catch { return null; }
}
async function restoreNavigation(route) {
  if (!route?.writerId || !state.manifest?.writers.some(w => w.id === route.writerId)) return;
  if (route.libraryCreatedAt && state.manifest.createdAt !== route.libraryCreatedAt) return;
  await chooseWriter(route.writerId);
  if (route.view === 'series') { await showSeries(); return; }
  if (route.view === 'search') { await showLibrarySearch(); return; }
  if (route.view === 'bookshelf') { await showBookshelf(); return; }
  if (!route.novelId || !state.novels.some(n => n.id === route.novelId)) return;
  await chooseNovel(route.novelId);
  if (route.view === 'manuscript') await showManuscript();
  else if (route.view === 'tree') await showTree();
  else if (route.view === 'timeline') await showTimeline();
  else if (route.view === 'editor' && state.characters.some(c => c.id === route.characterId)) await chooseCharacter(route.characterId);
  else if (route.view === 'bookshelf') await showBookshelf();
  else if (route.view === 'search') await showLibrarySearch();
}
async function retryPendingWrites() {
  if(!memoryRecovery.pending.size)return;
  for(const [path,entry] of [...memoryRecovery.pending]) {
    const parts=path.split('/');let dir=state.root;
    for(const segment of parts.slice(0,-1))dir=await dir.getDirectoryHandle(segment);
    const handle=await dir.getFileHandle(parts.at(-1));
    // The version in RAM represents the last known-good original file. A
    // conflict during retry aborts the entire refresh and offers recovery.
    await writeHandle(handle,entry.bytes);
  }
}
async function refreshCurrentView() {
  if (!state.root || undoBusy) return;
  const refreshBtn = $('refreshViewBtn');
  refreshBtn.disabled = true;
  const page = pageType(), writerId = state.writer?.id, novelId = state.novel?.id, characterId = state.active?.id, seriesId=state.activeSeries;
  const oldScope = pageUndoKey();
  try {
    // This is the IN-APP Refresh View button, not F5. Try saving pending edits
    // first, then reload only after all writes have been verified.
    if(typeof state.root.queryPermission==='function'&&await state.root.queryPermission({mode:'readwrite'})!=='granted'){
      if(await state.root.requestPermission({mode:'readwrite'})!=='granted')throw Error('Storage permission was not granted.');
    }
    if(!(await flush()))throw Error('Pending profile or tree edits could not be saved.');
    await retryPendingWrites();
    // Re-read the selected USB library rather than refreshing the entire website.
    memoryRecovery.refreshing=true;
    const manifest = await readJSON(await state.root.getFileHandle('character-archive-manifest.json'));
    validateManifest(manifest);
    state.manifest = manifest;
    renderWriterCards();
    if (page === 'writers') {
      setStage('writer');
    } else if (writerId && manifest.writers.some(w => w.id === writerId)) {
      await chooseWriter(writerId);
      if (!['bookshelf','search','series'].includes(page) && novelId && state.novels.some(n => n.id === novelId)) {
        await chooseNovel(novelId);
        if (page === 'manuscript') await showManuscript();
        else if (page === 'tree') await showTree();
        else if (page === 'timeline') await showTimeline();
        else if (page === 'editor' && characterId && state.characters.some(c => c.id === characterId)) await chooseCharacter(characterId);
      }
    } else {
      state.writer = null; state.writerDir = null; state.novels = [];state.series=[];state.activeSeries=null;invalidateSearchIndex();clearNovelState();
      setStage('writer');
    }
    // A fresh read may have changed the target files; a stale Undo must not overwrite them.
    if (page === 'search') { await showLibrarySearch(); }
    if (page === 'series') {state.activeSeries=seriesId;await showSeries();}
    if (page === 'bookshelf' || page === 'search' || page === 'series') {
      for (const key of undoByPage.keys()) if (key.includes('/' + writerId + '/')) undoByPage.delete(key);
    } else if (novelId) {
      for (const key of undoByPage.keys()) if (key.includes('/' + novelId + '/')) undoByPage.delete(key);
    }
    undoByPage.delete(oldScope);
    updateUndoButton();
    memoryRecovery.lastFailure=null;memoryRecovery.disconnected=false;renderStorageStatus();
    memoryRecovery.refreshing=false;
    void captureRecoverySnapshot(); // reconcile other writers/files when possible
    status('Current view refreshed from USB');
    toast('Current view refreshed from USB. Undo for reloaded files was cleared.');
  } catch (error) {
    storageFailed(error);
    toast('Could not refresh this view: ' + error.message,true);
    recoveryOffer('Refresh could not access or safely update the original storage: '+error.message);
  } finally { memoryRecovery.refreshing=false;refreshBtn.disabled = false; }
}
function rememberFieldUndo(character,section,key,original,group,label) {
  rememberUndo(label || ('Edit '+ section + ' / ' + key), async () => {
    const current = state.characters.find(c=>c.id===character.id);
    if (!current) return false;
    current[section] ??= {};
    current[section][key] = original;
    if (section==='basic' && key==='fullName') current.name=original || 'Unnamed';
    // Save even when the edited character is not currently selected.
    if (state.active===current) { queueSave(); if (!(await flush())) return false; }
    else if (!(await persistTreeLink(current,structuredClone(current.relationships?.links || [])))) return false;
    if (!$('editor').classList.contains('hidden') && state.active===current) renderEditor();
    renderCharacterList();
    return true;
  },group);
}
function rememberLinksUndo(characters, oldLists, label, group = null) {
  const captured = characters.map(c=>({id:c.id,links:structuredClone(oldLists.get(c.id))}));
  rememberUndo(label,async () => {
    for (const item of captured) {
      const c=state.characters.find(x=>x.id===item.id);if(!c)return false;
      const rollback=structuredClone(c.relationships?.links||[]);
      c.relationships??={links:[],notes:''};c.relationships.links=structuredClone(item.links);
      if(!(await persistTreeLink(c,rollback)))return false;
    }
    if (!$('treeView').classList.contains('hidden')) renderTree();
    if (!$('editor').classList.contains('hidden') && state.active) renderEditor();
    return true;
  },group);
}

async function readJSON(handle) {
  const file = await handle.getFile();
  const bytes=new Uint8Array(await file.arrayBuffer());
  await rememberRead(handle,bytes);
  return JSON.parse(new TextDecoder().decode(bytes));
}
async function putFile(directory, filename, content) {
  const handle = await directory.getFileHandle(filename, { create: true });
  await writeHandle(handle, content);
  return handle;
}
async function writeHandle(handle, content) {
  const bytes=await contentBytes(content),path=await recoveryPath(handle);
  const tracked=path!==null&&memoryRecovery.active && !isManuscriptReferencePath(path);
  const baseline=tracked?memoryRecovery.files.get(path):null;
  try {
    // Compare with the original read to avoid overwriting changes made by another
    // computer or an external editor. Never silently replace a conflicting file.
    if(tracked&&baseline){
      const actual=new Uint8Array(await (await handle.getFile()).arrayBuffer());
      if(!sameBytes(actual,baseline)){
        const conflict=new Error('The file changed outside Character Bookshelf: '+path+'. Use recovery to save your version elsewhere.');
        conflict.name='StorageConflictError';throw conflict;
      }
    }
    const writer=await handle.createWritable();
    try{await writer.write(content);await writer.close();}
    catch(error){try{await writer.abort();}catch{}throw error;}
    // A successful close is not enough: read and compare byte-for-byte.
    const verified=new Uint8Array(await (await handle.getFile()).arrayBuffer());
    if(!sameBytes(verified,bytes))throw Error('Save verification failed: file contents differ after writing.');
    if(tracked){
      recoveryStore(path,verified,++memoryRecovery.writeSerial);
      memoryRecovery.pending.delete(path);
    }
    if(path && /\.json$/i.test(path))invalidateSearchIndex();
    memoryRecovery.lastVerified=dateNow();memoryRecovery.lastFailure=null;
    memoryRecovery.disconnected=false;renderStorageStatus();
  }catch(error){
    if(tracked)memoryRecovery.pending.set(path,{bytes:bytes.slice(),reason:error.message});
    storageFailed(error);
    throw error;
  }
}
async function putJSON(directory, filename, data) {
  return putFile(directory, filename, JSON.stringify(data, null, 2) + '\n');
}
function diskProfile(character) {
  return JSON.parse(JSON.stringify(character, (key, value) => key.startsWith('_') ? undefined : value));
}
function hasUnsaved() { return state.revision > state.savedRevision; }
function queueSave() {
  if (!state.active) return;
  state.revision++;
  status('Unsaved changes', 'busy');
  clearTimeout(state.saveTimer);
  state.saveTimer = setTimeout(() => { void flush(); }, 700);
}

/* Profile snapshots are regular JSON files on the selected USB library.
   Keep up to 12 timestamped versions, no more than one automatic snapshot
   per 15 minutes. An explicit restore always protects the current copy. */
const REVISION_GAP_MS = 15 * 60 * 1000;
async function revisionFolder(character, create = false) {
  if (!state.novelDir) throw new Error('No novel open.');
  let root;
  try { root = await state.novelDir.getDirectoryHandle('revisions', {create}); }
  catch(e){ if(!create && e.name==='NotFoundError')return null;throw e; }
  try { return await root.getDirectoryHandle(character.id, {create}); }
  catch(e){ if(!create && e.name==='NotFoundError')return null;throw e; }
}
async function listRevisions(character) {
  const directory = await revisionFolder(character);
  if(!directory)return [];
  const out=[];
  for await (const [name, entry] of directory.entries()) {
    if(entry.kind!=='file'||!name.endsWith('.json'))continue;
    out.push({name,handle:entry,stamp:name.slice(0,-5)});
  }
  return out.sort((a,b)=>b.name.localeCompare(a.name));
}
async function saveRevisionBeforeChange(character, force=false) {
  const existing=await listRevisions(character);
  const latest=existing[0];
  if(!force && latest) {
    const stamp = Date.parse(latest.stamp.slice(0,24).replace(/T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z/,'T$1:$2:$3.$4Z'));
    // Filenames use a safe ISO-like stamp and are comparable as strings.
    if(Number.isFinite(stamp) && Date.now()-stamp<REVISION_GAP_MS)return;
  }
  const disk=await readJSON(character._handle);
  const current=JSON.stringify(diskProfile(character));
  if(!force && JSON.stringify(disk)===current)return;
  const dir=await revisionFolder(character,true);
  const stamp=dateNow().replace(/[:.]/g,'-').replace(/Z$/,'Z');
  const safeStamp=stamp+'-'+Math.random().toString(36).slice(2,7);
  await putJSON(dir,safeStamp+'.json',disk);
  const all=await listRevisions(character);
  for(const old of all.slice(12)) {
    try{await removeTrackedEntry(dir,old.name);}catch(e){console.warn('Could not prune old revision',e);}
  }
}
async function showRevisionHistory() {
  const character=state.active;
  if(!character || !(await flush()))return;
  const dialog=$('revisionHistoryDialog'),host=$('revisionHistoryList');host.replaceChildren();
  const list=await listRevisions(character);
  if(!list.length)host.append(el('p','muted','No previous versions yet. A revision is saved before the next profile edit and periodically afterward.'));
  for(const entry of list){
    const row=el('div','revisionRow');
    row.append(el('strong','',revisionLabel(entry)));
    const preview=el('button','quiet','Preview');preview.type='button';
    preview.onclick=async()=>{try{const old=await readJSON(entry.handle);window.alert(JSON.stringify(old,null,2).slice(0,14000));}catch(e){toast('Could not read revision: '+e.message,true);}};
    const restore=el('button','quiet','Restore');restore.type='button';
    restore.onclick=async()=>{
      if(!confirm('Restore this earlier character profile? A backup of your current profile will be created first.'))return;
      try{
        const old=await readJSON(entry.handle);
        if(old.id!==character.id)throw Error('Revision belongs to a different character.');
        await saveRevisionBeforeChange(character,true);
        const handle=character._handle,filename=character._filename;
        for(const key of Object.keys(character))if(!key.startsWith('_'))delete character[key];
        Object.assign(character,old,{_handle:handle,_filename:filename});
        state.active=character;queueSave();
        if(!(await flush()))throw Error('Save failed; do not close this tab.');
        dialog.close();renderEditor();toast('Earlier character revision restored.');
      }catch(e){toast('Restore failed: '+e.message,true);}
    };
    const compare=el('button','quiet','Compare');compare.type='button';
    compare.onclick=()=>void showRevisionComparison(entry.name);
    row.append(preview,compare,restore);host.append(row);
  }
  dialog.showModal();
}

async function showRevisionComparison(initialName=null) {
  if(!state.active || !(await flush()))return;
  const entries=await listRevisions(state.active);
  if(!entries.length){toast('No earlier versions to compare yet.',true);return;}
  const left=$('compareRevisionLeft'),right=$('compareRevisionRight');left.replaceChildren();right.replaceChildren();
  const options=[{name:'current',label:'Current saved profile'},...entries.map(e=>({name:e.name,label:revisionLabel(e)}))];
  for(const item of options){left.add(new Option(item.label,item.name));right.add(new Option(item.label,item.name));}
  left.value=initialName||entries[0].name;right.value='current';
  $('revisionCompareDialog').showModal();
  await renderRevisionComparison();
}
function revisionLabel(entry) {
  const match=entry.stamp.match(/^(\d{4}-\d\d-\d\d)T(\d\d)-(\d\d)-(\d\d)-(\d{3})Z/);
  if(!match)return entry.stamp;
  const iso=match[1]+'T'+match[2]+':'+match[3]+':'+match[4]+'.'+match[5]+'Z';
  return formatMoment(iso);
}
let revisionCompareToken = 0;
async function renderRevisionComparison() {
  const token=++revisionCompareToken;
  const character=state.active;
  if(!character)return;
  const host=$('revisionCompareBody');host.replaceChildren(el('p','muted','Reading saved revisions…'));
  try{
    const list=await listRevisions(character);
    const read=async name=>name==='current'?readJSON(character._handle):readJSON((list.find(e=>e.name===name)||(() => {throw Error('Revision not found.');})()).handle);
    const [older,newer]=await Promise.all([read($('compareRevisionLeft').value),read($('compareRevisionRight').value)]);
    if(token!==revisionCompareToken || !$('revisionCompareDialog').open)return;
    if(older.id!==character.id||newer.id!==character.id)throw Error('Selected revision belongs to another character.');
    host.replaceChildren();
    const metadata=[['Record','Date created',older.createdAt,newer.createdAt],['Record','Last updated',older.updatedAt,newer.updatedAt]];
    for(const [section,title,fields] of IMPORT_FIELDS) for(const [key,label] of fields) metadata.push([title,label,older[section]?.[key],newer[section]?.[key]]);
    // Relationship IDs and portrait metadata remain visible, but are never altered by a comparison.
    metadata.push(['Relationships','Linked characters (IDs)',JSON.stringify(older.relationships?.links||[]),JSON.stringify(newer.relationships?.links||[])]);
    metadata.push(['Basic Information','Portrait file',older.portraitFile,newer.portraitFile]);
    let changed=0;
    for(const [section,label,a,b] of metadata){
      const old=String(a??''),next=String(b??'');if(old===next)continue;
      changed++;
      const row=el('div','revisionDifference');row.append(el('strong','',section+' · '+label));
      const pair=el('div','revisionPair');
      const one=el('div');one.append(el('span','muted','Left'),el('pre','',old||'(blank)'));
      const two=el('div');two.append(el('span','muted','Right'),el('pre','',next||'(blank)'));
      pair.append(one,two);row.append(pair);host.append(row);
    }
    if(!changed)host.append(el('p','muted','The selected versions have no differences in their profile fields or timestamps.'));
  }catch(e){if(token===revisionCompareToken)host.replaceChildren(el('p','errorText','Could not compare revisions: '+e.message));}
}
async function flushProfile() {
  clearTimeout(state.saveTimer);
  state.saveTimer = null;
  if (state.saving) return state.saving;
  if (!state.active || !hasUnsaved()) return true;
  const character = state.active;
  const epoch = state.epoch;
  state.saving = (async () => {
    while (state.revision > state.savedRevision) {
      const revision = state.revision;
      const now = dateNow();
      const snapshot = diskProfile({ ...character, updatedAt: now });
      try {
        status('Saving to USB…', 'busy');
        // Editing and then reverting to the saved values is not a new revision.
        const saved=await readJSON(character._handle);
        if(JSON.stringify(saved)===JSON.stringify(diskProfile(character))){
          state.savedRevision=revision;
          continue;
        }
        await saveRevisionBeforeChange(character);
        await writeHandle(character._handle, JSON.stringify(snapshot, null, 2) + '\n');
        state.savedRevision = revision;
        character.updatedAt = now;
        if (state.active === character && epoch === state.epoch) {
          $('lastSavedLabel').textContent = 'Saved ' + new Date(now).toLocaleString();
          const updatedValue=document.querySelector('[data-profile-updated-for="'+character.id+'"]');
          if(updatedValue)updatedValue.textContent=formatMoment(now);
        }
      } catch (error) {
        const path=await recoveryPath(character._handle);
        if(path!==null)memoryRecovery.pending.set(path,{bytes:encoder.encode(JSON.stringify(snapshot,null,2)+'\n'),reason:error.message});
        storageFailed(error);
        status('Save failed — changes not saved', 'bad');
        $('retrySaveBtn').classList.remove('hidden');
        $('downloadUnsavedBtn').classList.remove('hidden');
        toast('Could not write to the selected folder: ' + error.message + '. Keep this tab open and reconnect the USB if needed.', true);
        return false;
      }
    }
    status('Saved to folder');
    $('retrySaveBtn').classList.add('hidden');
    $('downloadUnsavedBtn').classList.add('hidden');
    return true;
  })();
  try { return await state.saving; }
  finally { state.saving = null; }
}
async function flush() {
  const profileOk = await flushProfile();
  if (!profileOk) return false;
  return flushTree();
}
function setStage(stage) {
  $('startup').classList.toggle('hidden', stage === 'workspace');
  $('folderStep').classList.toggle('hidden', stage !== 'folder');
  $('writerStep').classList.toggle('hidden', stage !== 'writer');
  $('workspace').classList.toggle('hidden', stage !== 'workspace');
  $('backupBtn').classList.toggle('hidden', !state.root);
  $('storageStatusBtn').classList.toggle('hidden', !state.root);
  $('topSwitchWriterBtn').classList.toggle('hidden', stage !== 'workspace');
  $('changeFolderBtn').classList.toggle('hidden', !state.root);
  $('refreshViewBtn').classList.toggle('hidden', stage !== 'workspace');
  $('globalSearchBtn').classList.toggle('hidden', stage !== 'workspace');
  updateUndoButton();
}
function clearNovelState() {
  state.novel = null; state.novelDir = null; state.charsDir = null; state.portraitsDir = null;
  state.characters = []; state.active = null; state.revision = 0; state.savedRevision = 0;
  state.epoch++;
  clearTimeout(state.treeTimer); state.treeTimer=null; state.treeMeta=null;
  state.treeRevision=0; state.treeSavedRevision=0; state.treeSaving=null;
  state.timelineEvents = []; state.timelineFilter = 'all';
  cleanPortraitUrl(); cleanGalleryUrls(); cleanCoverUrls();
}

function clearRootState() {
  memoryRecovery.scanId++; memoryRecovery.active=false;
  clearUndo();
  state.root = null; state.selectedLocation = null; state.manifest = null; state.writer = null; state.writerDir = null;
  state.novels = []; clearNovelState();
}
async function askName(title, label, hint = '') {
  const dialog = $('nameDialog');
  $('nameDialogTitle').textContent = title;
  $('nameDialogLabel').textContent = label;
  $('nameDialogHint').textContent = hint;
  $('nameInput').value = '';
  return new Promise(resolve => {
    const form = $('nameForm');
    const onSubmit = event => {
      event.preventDefault();
      const value = cleanName($('nameInput').value);
      if (!value) return;
      dialog.close('ok');
    };
    const onCancel = () => dialog.close('cancel');
    const onClose = () => {
      form.removeEventListener('submit', onSubmit);
      $('cancelNameBtn').removeEventListener('click', onCancel);
      dialog.removeEventListener('close', onClose);
      resolve(dialog.returnValue === 'ok' ? cleanName($('nameInput').value) : null);
    };
    form.addEventListener('submit', onSubmit);
    $('cancelNameBtn').addEventListener('click', onCancel);
    dialog.addEventListener('close', onClose);
    dialog.showModal();
    $('nameInput').focus();
  });
}
/* Pick a parent location, then open/create Character Bookshelf inside it.
   Existing Character Archive libraries are opened in place, with their files and
   manifest schema unchanged, so renaming the app never strands existing work. */
async function resolveLibraryLocation(selected) {
  let root = selected;
  let existing = false;
  // An explicitly chosen library (new or legacy) always wins.
  try {
    const file = await selected.getFileHandle('character-archive-manifest.json');
    const manifest = await readJSON(file);
    validateManifest(manifest);
    return { root: selected, manifest, existing: true, direct: true };
  } catch (error) {
    if (error.name !== 'NotFoundError') throw error;
  }
  const newName = 'Character Bookshelf';
  const legacyName = 'Character Archive';
  const selectionIsLibrary = [newName, legacyName].some(name =>
    selected.name.toLowerCase() === name.toLowerCase());
  if (!selectionIsLibrary) {
    async function findChild(name) {
      try { return await selected.getDirectoryHandle(name); }
      catch (error) { if (error.name === 'NotFoundError') return null; throw error; }
    }
    const newFolder = await findChild(newName);
    const legacyFolder = await findChild(legacyName);
    if (newFolder && legacyFolder) {
      throw new Error('Both Character Bookshelf and Character Archive folders were found. Select the one you want directly so the app does not open the wrong library.');
    }
    root = newFolder || legacyFolder || await selected.getDirectoryHandle(newName, { create: true });
  }
  let manifest;
  try {
    manifest = await readJSON(await root.getFileHandle('character-archive-manifest.json'));
    validateManifest(manifest);
    existing = true;
  } catch (error) {
    if (error.name !== 'NotFoundError') throw error;
    // Never silently initialize a folder that already contains files or folders.
    for await (const _entry of root.entries()) {
      throw new Error('The selected application folder contains files but no valid library manifest. Nothing was changed. Back up and inspect this folder first.');
    }
    // Retain the established manifest schema for compatibility with older versions.
    manifest = { type: 'character-archive', version: 1, createdAt: dateNow(), writers: [] };
    await putJSON(root, 'character-archive-manifest.json', manifest);
  }
  return { root, manifest, existing, direct: selected === root };
}
function validateManifest(manifest) {
  if (!manifest || manifest.type !== 'character-archive' || !Array.isArray(manifest.writers)) {
    throw new Error('The selected library manifest is invalid. No existing files were changed.');
  }
}
async function selectFolder() {
  $('folderError').classList.add('hidden');
  if (!window.isSecureContext || typeof window.showDirectoryPicker !== 'function') {
    $('folderError').textContent = 'Folder access is unavailable. Open this application in current Chrome or Edge using its HTTPS GitHub Pages address (or localhost).';
    $('folderError').classList.remove('hidden');
    return;
  }
  if (hasUnsaved() || state.saving || treeUnsaved() || state.treeSaving) {
    toast('Finish saving before changing folders. Click Select folder again after it says Saved.', true);
    void flush();
    return;
  }
  try {
    const selected = await window.showDirectoryPicker({ mode: 'readwrite' });
    if (typeof selected.queryPermission === 'function' && await selected.queryPermission({ mode: 'readwrite' }) !== 'granted') {
      if (await selected.requestPermission({ mode: 'readwrite' }) !== 'granted') {
        toast('Folder write permission was not granted.', true); return;
      }
    }
    const { root, manifest, existing } = await resolveLibraryLocation(selected);
    const routeToRestore = savedNavigation();
    clearRootState();
    state.root = root;
    state.selectedLocation = selected;
    state.manifest = manifest;
    beginVolatileRecovery();
    $('folderName').textContent = root.name + (selected === root ? ' (existing library)' : ' (inside ' + selected.name + ')');
    $('retrySaveBtn').classList.add('hidden');
    $('downloadUnsavedBtn').classList.add('hidden');
    status(existing ? 'Existing library opened' : 'Character Bookshelf folder created');
    renderWriterCards();
    setStage('writer');
    toast(existing ? 'Existing library opened: ' + root.name + '.' : 'Created the Character Bookshelf folder.');
    if (routeToRestore) await restoreNavigation(routeToRestore);
  } catch (error) {
    if (error.name === 'AbortError') return;
    $('folderError').textContent = 'Cannot open folder: ' + error.message;
    $('folderError').classList.remove('hidden');
    toast('Folder access failed: ' + error.message, true);
  }
}

function renderWriterCards() {
  const host = $('writerGrid'); host.replaceChildren();
  for (const writer of state.manifest?.writers || []) {
    const button = el('button', 'writerCard'); button.type = 'button';
    button.append(el('span', 'writerAvatar', writer.name.slice(0,1).toUpperCase()), el('span', '', writer.name));
    button.addEventListener('click', () => void chooseWriter(writer.id));
    const tile=el('div','writerTile');
    const del=el('button','writerDelete','Delete');del.type='button';del.title='Delete '+writer.name+' and all of their books';
    del.setAttribute('aria-label','Delete writer '+writer.name);
    del.onclick=()=>void deleteWriter(writer.id);
    tile.append(button,del);host.append(tile);
  }
}
async function createWriter() {
  const name = await askName('Create writer profile', 'Writer name');
  if (!name) return;
  if (state.manifest.writers.some(w => w.name.toLowerCase() === name.toLowerCase())) {
    toast('That writer already exists.', true); return;
  }
  const folders = state.manifest.writers.map(w => w.folder.toLowerCase());
  let folder = folderSafe(name), index = 2;
  while (folders.includes(folder.toLowerCase())) folder = folderSafe(name) + '-' + index++;
  const writer = { id: randomId(), name, folder };
  try {
    await state.root.getDirectoryHandle(folder, { create: true });
    const manifest = { ...state.manifest, writers: [...state.manifest.writers, writer] };
    await putJSON(state.root, 'character-archive-manifest.json', manifest);
    state.manifest = manifest;
    renderWriterCards();
    await chooseWriter(writer.id);
    rememberUndo('Create writer', async () => {
      if (state.novels.length) return false;
      // Refuse to undo writer creation if anything was added to its folder.
      const folderHandle=await state.root.getDirectoryHandle(folder);
      for await (const _item of folderHandle.entries()) return false;
      await removeTrackedEntry(state.root,folder);
      const next={...state.manifest,writers:state.manifest.writers.filter(x=>x.id!==writer.id)};
      await putJSON(state.root,'character-archive-manifest.json',next);
      state.manifest=next;state.writer=null;state.writerDir=null;state.novels=[];clearNovelState();
      renderWriterCards();setStage('writer');return true;
    }, null, pageUndoKey('writers'));
  } catch (error) { toast('Could not create writer: ' + error.message, true); }
}
async function deleteWriter(id) {
  if(deleteInProgress || pageType()!=='writers' || !state.root || !state.manifest)return;
  const writer=state.manifest.writers.find(w=>w.id===id);if(!writer)return;
  const dialog=$('deleteWriterDialog'),input=$('deleteWriterConfirmInput');
  $('deleteWriterName').textContent=writer.name;
  input.value='';$('confirmDeleteWriterBtn').disabled=true;
  const onInput=()=>{$('confirmDeleteWriterBtn').disabled=input.value.trim()!==writer.name;};
  input.addEventListener('input',onInput);dialog.showModal();input.focus();
  const approved=await new Promise(resolve=>{
    let accepted=false;
    const yes=()=>{accepted=true;dialog.close();};
    const no=()=>dialog.close();
    const closed=()=>{
      input.removeEventListener('input',onInput);
      $('confirmDeleteWriterBtn').removeEventListener('click',yes);
      $('cancelDeleteWriterBtn').removeEventListener('click',no);
      dialog.removeEventListener('close',closed);
      resolve(accepted&&input.value.trim()===writer.name);
    };
    $('confirmDeleteWriterBtn').addEventListener('click',yes);
    $('cancelDeleteWriterBtn').addEventListener('click',no);
    dialog.addEventListener('close',closed);
  });
  if(!approved)return;
  if(!(await flush())){toast('Writer deletion canceled: pending changes could not be saved.',true);return;}
  deleteInProgress=true;
  try {
    const live=await readJSON(await state.root.getFileHandle('character-archive-manifest.json'));
    validateManifest(live);
    if(JSON.stringify(live)!==JSON.stringify(state.manifest))throw Error('The writer list changed on disk. Refresh before deleting.');
    if(!live.writers.some(w=>w.id===writer.id&&w.folder===writer.folder))throw Error('The writer could not be matched safely.');
    status('Deleting writer…','busy');
    // The folder must be removed first. If deletion is interrupted, explicitly
    // report that the writer may be partially deleted; never claim success.
    await removeTrackedEntry(state.root,writer.folder,{recursive:true});
    const next={...live,writers:live.writers.filter(w=>w.id!==writer.id)};
    await putJSON(state.root,'character-archive-manifest.json',next);
    state.manifest=next;renderWriterCards();clearUndo();
    status('Writer removed');toast('Writer and their entire library deleted.');
  }catch(error){storageFailed(error);memoryRecovery.complete=false;memoryRecovery.partialReason='Writer deletion may have been interrupted; inspect USB files';status('Writer deletion needs inspection','bad');
    toast('Writer deletion did not finish safely: '+error.message+'. Check the USB folder before retrying.',true);
  }finally{deleteInProgress=false;}
}

async function chooseWriter(id) {
  if (!(await flush())) { toast('Save your changes before switching writers.', true); return; }
  const writer = state.manifest.writers.find(w => w.id === id);
  if (!writer) return;
  try {
    const directory = await state.root.getDirectoryHandle(writer.folder);
    const novels = [];
    for await (const [folderName, handle] of directory.entries()) {
      if (handle.kind !== 'directory') continue;
      try {
        const novel = await readJSON(await handle.getFileHandle('novel.json'));
        if (novel.type === 'character-archive-novel') novels.push({ ...novel, folder: folderName });
      } catch (error) { if (error.name !== 'NotFoundError') throw error; }
    }
    invalidateSearchIndex(); state.series=[];state.activeSeries=null;
    state.writer = writer; state.writerDir = directory; state.novels = novels.sort((a,b) => a.name.localeCompare(b.name));
    state.series=await loadSeries(directory);
    clearNovelState();
    $('currentWriter').textContent = writer.name;
    $('writerInitial').textContent = writer.name.slice(0,1).toUpperCase();
    renderNovelSelect(); renderCharacterList();
    setStage('workspace');
    status('Library ready');
    await showBookshelf();
    maybeShowBackupReminder();
  } catch (error) { toast('Could not open writer: ' + error.message, true); }
}
function renderNovelSelect() {
  const select = $('novelSelect'); select.replaceChildren();
  select.add(new Option(state.novels.length ? 'Choose a novel…' : 'No novels yet', ''));
  for (const novel of state.novels) select.add(new Option(novel.name, novel.id));
  select.value = state.novel?.id || '';
  $('novelCharactersBtn').disabled = !state.novel;
}
async function createNovel() {
  const name = await askName('Create a novel', 'Novel title');
  if (!name) return;
  if (state.novels.some(n => n.name.toLowerCase() === name.toLowerCase())) {
    toast('That novel already exists for this writer.', true); return;
  }
  const folders = state.novels.map(n => n.folder.toLowerCase());
  let folder = folderSafe(name), index = 2;
  while (folders.includes(folder.toLowerCase())) folder = folderSafe(name) + '-' + index++;
  try {
    const directory = await state.writerDir.getDirectoryHandle(folder, { create: true });
    await directory.getDirectoryHandle('characters', { create: true });
    await directory.getDirectoryHandle('portraits', { create: true });
    const novel = { type: 'character-archive-novel', id: randomId(), name, folder, createdAt: dateNow() };
    await putJSON(directory, 'novel.json', novel);
    state.novels.push(novel); state.novels.sort((a,b) => a.name.localeCompare(b.name));
    await chooseNovel(novel.id);
    rememberUndo('Create book', async () => {
      if (state.characters.length) return false;
      const novelDir=await state.writerDir.getDirectoryHandle(novel.folder);
      for await (const [name,entry] of novelDir.entries()) {
        if (name==='novel.json' && entry.kind==='file') continue;
        if (['characters','portraits'].includes(name) && entry.kind==='directory') {
          for await (const _nested of entry.entries()) return false;
          continue;
        }
        return false; // Do not delete unfamiliar files via Undo.
      }
      await removeTrackedEntry(novelDir,'novel.json');
      await removeTrackedEntry(novelDir,'characters');
      await removeTrackedEntry(novelDir,'portraits');
      await removeTrackedEntry(state.writerDir,novel.folder);
      state.novels=state.novels.filter(x=>x.id!==novel.id);clearNovelState();
      renderNovelSelect();await showBookshelf();return true;
    }, null, pageUndoKey('bookshelf'));
    toast('Novel created.');
  } catch (error) { toast('Could not create novel: ' + error.message, true); }
}
async function chooseNovel(id) {
  if (!(await flush())) { toast('Save your changes before switching novels.', true); renderNovelSelect(); return; }
  const novel = state.novels.find(n => n.id === id);
  if (!novel) return;
  try {
    const directory = await state.writerDir.getDirectoryHandle(novel.folder);
    const charsDir = await directory.getDirectoryHandle('characters', { create: true });
    const portraitsDir = await directory.getDirectoryHandle('portraits', { create: true });
    const treeMeta = await loadTreeMeta(directory);
    const timelineEvents = await loadTimelineEvents(directory);
    const characters = [];
    for await (const [filename, handle] of charsDir.entries()) {
      if (handle.kind !== 'file' || !filename.toLowerCase().endsWith('.json')) continue;
      const profile = await readJSON(handle);
      if (typeof profile.id !== 'string' || !profile.id || typeof profile.name !== 'string') {
        throw new Error('Invalid character profile: ' + filename);
      }
      profile._handle = handle;
      profile._filename = filename;
      characters.push(profile);
    }
    clearNovelState();
    state.novel = novel; state.novelDir = directory; state.charsDir = charsDir; state.portraitsDir = portraitsDir;
    state.characters = characters.sort((a,b) => a.name.localeCompare(b.name));
    state.treeMeta = treeMeta; state.timelineEvents = timelineEvents;
    renderNovelSelect(); renderCharacterList();
    await showCharacters();
    status('Library ready');
  } catch (error) { toast('Could not open novel: ' + error.message, true); renderNovelSelect(); }
}
function blankCharacter(name) {
  const now = dateNow();
  return {
    schema: 1, id: randomId(), name, createdAt: now, updatedAt: now, portraitFile: null,
    basic: { fullName: name, age: '', aliases: '', occupation: '', appearance: '', notes: '' },
    developmentPrompts: 2, tags: [],
    personality: { traits: '', fears: '', lie: '', truth: '', want: '', need: '', notes: '' },
    background: { history: '', experiences: '', formativeExperience: '', startingCircumstances: '', notes: '' },
    relationships: { links: [], notes: '' },
    story: { role: '', timeline: '', events: '', arcType: '', notes: '' },
    freeform: { notes: '' }
  };
}
async function createCharacter() {
  if (!state.novel) return;
  if (!(await flush())) return;
  const name = await askName('Create character', 'Character name', 'All six sections start blank except the character name.');
  if (!name) return;
  const character = blankCharacter(name);
  const fileName = folderSafe(name) + '--' + character.id.slice(0,8) + '.json';
  try {
    const handle = await putJSON(state.charsDir, fileName, character);
    character._handle = handle; character._filename = fileName;
    state.characters.push(character);
    state.characters.sort((a,b) => a.name.localeCompare(b.name));
    await chooseCharacter(character.id);
    rememberUndo('Create character',async () => {
      if (!state.characters.some(x=>x.id===character.id)) return false;
      await removeTrackedEntry(state.charsDir,character._filename);
      state.characters=state.characters.filter(x=>x.id!==character.id);
      if(state.active?.id===character.id)state.active=null;
      await showCharacters();renderCharacterList();return true;
    }, null, pageUndoKey('characters'));
    toast('Character created and saved to the selected folder.');
  } catch (error) { toast('Could not create character: ' + error.message, true); }
}
function renderCharacterList() {
  const host = $('characterList'); host.replaceChildren();
  const search = $('searchInput').value.trim().toLowerCase();
  const chars = state.characters.filter(c => c.name.toLowerCase().includes(search));
  $('characterCount').textContent = String(state.characters.length);
  for (const character of chars) {
    const button = el('button', 'characterItem' + (state.active?.id === character.id ? ' active' : ''));
    button.type = 'button';
    button.append(el('span','mini',character.name[0]?.toUpperCase() || '?'),el('span','cut',character.name));
    button.addEventListener('click', () => void chooseCharacter(character.id));
    host.append(button);
  }
  if (!chars.length) host.append(el('p','emptyList', search ? 'No matching characters.' : 'No characters yet.'));
  $('newCharacterBtn').disabled = !state.novel;
}
function hideMainViews() {
  if(!$('manuscriptView').classList.contains('hidden'))releaseManuscriptResources();
  for (const id of ['bookshelfView', 'novelNotesView', 'seriesView', 'novelView', 'treeView', 'timelineView', 'librarySearchView', 'manuscriptView', 'emptyView', 'editor']) $(id).classList.add('hidden');
}
function cleanGalleryUrls() {
  for (const url of state.galleryUrls) URL.revokeObjectURL(url);
  state.galleryUrls = [];
}
function makeBook(novel, index) {
  const tile = el('div', 'bookTile');
  const button = el('button', 'bookCover bookVariant' + (index % 6));
  button.type = 'button';
  button.setAttribute('aria-label', 'Open ' + novel.name + ' characters');
  const cover = el('span','bookFront');
  cover.append(el('span', 'bookOrnament', '✦'), el('span','bookTitle',novel.name), el('span','bookFooter','CHARACTER COLLECTION'));
  button.append(cover);
  if (novel.coverFile) void showBookCover(novel,cover);
  button.addEventListener('click', () => void chooseNovel(novel.id));
  const remove = el('button', 'bookDeleteBtn', '×');
  remove.type = 'button';
  remove.title = 'Delete book: ' + novel.name;
  remove.setAttribute('aria-label', 'Delete book ' + novel.name);
  remove.addEventListener('click', () => void deleteBook(novel.id));
  const manuscript = el('button','manuscriptShelfButton','▤ Manuscript');
  manuscript.type='button';manuscript.title='Open the read-only manuscript for '+novel.name;
  manuscript.addEventListener('click',async()=>{
    if(state.novel?.id!==novel.id)await chooseNovel(novel.id);
    if(state.novel?.id===novel.id)await showManuscript();
  });
  tile.append(button, manuscript, remove);
  const series=seriesForBook(novel.id);
  if(series){
    const position=series.bookIds.indexOf(novel.id)+1;
    const seriesLink=el('button','bookSeriesLink','◇ '+series.name);
    seriesLink.type='button';
    seriesLink.title='Open '+series.name+' series · Book '+position+' of '+series.bookIds.length;
    seriesLink.setAttribute('aria-label',seriesLink.title);
    seriesLink.addEventListener('click',()=>{
      state.activeSeries=series.id;
      void showSeries();
    });
    tile.classList.add('bookSeriesMember');
    tile.append(seriesLink);
  }
  return tile;
}
async function showBookshelf() {
  if (!(await flush())) { toast('Please save your changes before returning to your bookshelf.', true); return; }
  if (!state.writer) return;
  hideMainViews();
  cleanGalleryUrls();cleanCoverUrls();
  $('bookshelfView').classList.remove('hidden');
  $('shelfTitle').textContent = state.writer.name + "'s Bookshelf";
  $('shelfSubtitle').textContent = state.novels.length ?
    'Choose a novel to explore its characters.' : 'Your shelves are empty. Add a novel to begin.';
  const container = $('shelfBooks'); container.replaceChildren();
  if (!state.novels.length) {
    const empty = el('div', 'noBooks');
    empty.append(el('span', 'bigGlyph','▤'), el('p','', 'Your first book belongs here.'));
    container.append(empty);
  } else {
    let i=0;
    for (const group of renderShelfSeries()){
      const shelf=el('div','bookShelf');
      const books=el('div','bookShelfRow');
      for(const novel of group.books)books.append(makeBook(novel,i++));
      shelf.append(books,el('div','shelfPlank'));container.append(shelf);
    }
  }
  setActiveSidebarNavigation('bookshelf');
  setWorkspaceView('bookshelf');
  void renderRecentlyWorkedOn();
}
async function renderRecentlyWorkedOn() {
  const host=$('recentCharacters');host.replaceChildren(el('p','muted','Checking saved characters…'));
  const writerId=state.writer?.id, results=[];
  if(!writerId)return;
  try {
    for(const novel of state.novels){
      const bookDir=await state.writerDir.getDirectoryHandle(novel.folder);
      let dir;try{dir=await bookDir.getDirectoryHandle('characters');}catch(e){if(e.name==='NotFoundError')continue;throw e;}
      for await(const [name,entry] of dir.entries()){
        if(entry.kind!=='file'||!name.toLowerCase().endsWith('.json'))continue;
        const profile=await readJSON(entry);
        if(profile.updatedAt && Number.isFinite(Date.parse(profile.updatedAt))) results.push({profile,novel});
      }
    }
    if(state.writer?.id!==writerId || pageType()!=='bookshelf')return;
    results.sort((a,b)=>Date.parse(b.profile.updatedAt)-Date.parse(a.profile.updatedAt));
    host.replaceChildren();
    if(!results.length){host.append(el('p','muted','No saved update dates yet. Character updates will appear here.'));return;}
    for(const {profile,novel} of results.slice(0,6)){
      const btn=el('button','recentCharacter');btn.type='button';
      btn.append(el('strong','',profile.name),el('span','muted',novel.name),el('small','',formatMoment(profile.updatedAt)));
      btn.onclick=async()=>{await chooseNovel(novel.id);await chooseCharacter(profile.id);};
      host.append(btn);
    }
  }catch(e){if(state.writer?.id===writerId && pageType()==='bookshelf')host.replaceChildren(el('p','errorText','Recently updated characters could not load: '+e.message));}
}
async function showCharacters() {
  if (!(await flush())) { toast('Please save your changes before viewing all characters.', true); return; }
  if (!state.novel) { await showBookshelf(); return; }
  hideMainViews();
  $('novelView').classList.remove('hidden');
  $('novelViewTitle').textContent = state.novel.name;
  $('novelViewSubtitle').textContent = 'Browse all characters in this novel.';
  $('novelViewKicker').textContent = state.writer.name.toUpperCase() + ' / NOVEL';
  $('novelCharacterCount').textContent = String(state.characters.length);
  $('removeCoverBtn').disabled=!state.novel.coverFile;
  const host = $('characterGallery');
  cleanGalleryUrls(); host.replaceChildren();
  const sort=$('gallerySort').value;
  const sortedCharacters=[...state.characters].sort((a,b)=>sort==='updated'? ((Date.parse(b.updatedAt)||0)-(Date.parse(a.updatedAt)||0)) || a.name.localeCompare(b.name) : sort==='newest'?((Date.parse(b.createdAt)||0)-(Date.parse(a.createdAt)||0)) || a.name.localeCompare(b.name) : a.name.localeCompare(b.name));
  if (!state.characters.length) {
    const empty = el('div','noCharacters');
    empty.append(el('span','bigGlyph','♟'), el('h3','', 'No characters yet'), el('p','', 'Create a character to start this novel’s collection.'));
    host.append(empty);
  }
  const epoch = state.epoch;
  for (const character of sortedCharacters) {
    const tile = el('div','characterTile');tile.dataset.characterId=character.id;
    const button = el('button','characterCard'); button.type='button';
    const frame = el('span','galleryPortrait');
    frame.append(el('span','gallerySilhouette','♟'));
    const body = el('span','galleryBody');
    body.append(el('span','galleryName', character.name));
    const role = character.story?.role?.trim();
    if (role) body.append(el('span','galleryRole',role));
    body.append(el('span','galleryUpdated',character.updatedAt && Number.isFinite(Date.parse(character.updatedAt)) ? 'Updated ' + new Date(character.updatedAt).toLocaleDateString() : 'Update date not recorded'));
    button.append(frame,body);
    button.addEventListener('click',()=> void chooseCharacter(character.id));
    const remove = el('button', 'characterDeleteBtn', '×');
    remove.type = 'button';
    remove.title = 'Delete character: ' + character.name;
    remove.setAttribute('aria-label', 'Delete character ' + character.name);
    remove.addEventListener('click', () => void deleteCharacter(character.id));
    tile.append(button, remove);
    host.append(tile);
    if (character.portraitFile && state.portraitsDir) {
      // Portraits are optional. A missing file leaves the silhouette in place.
      void (async()=>{
        try {
          const file = await (await state.portraitsDir.getFileHandle(character.portraitFile)).getFile();
          if (epoch !== state.epoch || $('novelView').classList.contains('hidden') || !button.isConnected) return;
          const url = URL.createObjectURL(file);
          state.galleryUrls.push(url);
          const img = el('img'); img.src=url; img.alt='';
          frame.replaceChildren(img);
        } catch { /* optional portrait unavailable */ }
      })();
    }
  }
  setActiveSidebarNavigation('characters');
  setWorkspaceView('characters');
}
function setWorkspaceView(view) {
  $('workspace').classList.toggle('galleryMode', view !== 'editor');
  $('workspace').classList.toggle('editorMode', view === 'editor');
  document.body.dataset.activeView=view;
  for(const nav of document.querySelectorAll('.profileNav,.treeBreadcrumb')){
    nav.querySelectorAll('[aria-current=page]').forEach(x=>x.removeAttribute('aria-current'));
    if(!nav.closest('.hidden')){const active=nav.querySelector('.navNow')||[...nav.children].reverse().find(n=>n.tagName==='SPAN' && !n.classList.contains('navSep'));if(active)active.setAttribute('aria-current','page');}
  }
  updateUndoButton();
  saveNavigation();
}
function setActiveSidebarNavigation(view) {
  $('bookshelfBtn').classList.toggle('navSelected',view==='bookshelf');
  $('novelCharactersBtn').classList.toggle('navSelected',view==='characters');
  $('seriesNavBtn').classList.toggle('navSelected',view==='series');
}
function renderEmpty() {
  hideMainViews(); $('emptyView').classList.remove('hidden');
  if (!state.novel) {
    $('emptyTitle').textContent = 'Start a novel';
    $('emptyDescription').textContent = 'Create a novel in ' + (state.writer?.name || 'your writer profile') + "'s library.";
    $('emptyAction').textContent = 'Create a novel';
    $('emptyAction').onclick = createNovel;
  } else {
    $('emptyTitle').textContent = 'Create your first character';
    $('emptyDescription').textContent = 'Profiles for ' + state.novel.name + ' will be saved in its own folder.';
    $('emptyAction').textContent = 'New character';
    $('emptyAction').onclick = createCharacter;
  }
  renderCharacterList();
}
async function chooseCharacter(id) {
  if (!(await flush())) { toast('Unsaved changes: retry saving before switching characters.', true); return; }
  const character = state.characters.find(c => c.id === id);
  if (!character) return;
  state.active = character; state.revision = 0; state.savedRevision = 0; state.epoch++;
  renderCharacterList(); renderEditor();
  status('Saved to folder');
}
const sections = [
  { key: 'basic', title: 'Basic Information', fields: [['fullName','Full name'],['age','Age / ages'],['aliases','Aliases & nicknames (comma-separated)',true],['occupation','Occupation'],['appearance','Physical appearance',true]] },
  { key: 'personality', title: 'Personality', fields: [['traits','Personality traits',true],['fears','Fears',true],['beliefs','Beliefs',true],['motivations','Motivations',true]] },
  { key: 'background', title: 'Background', fields: [['history','Personal history',true],['experiences','Significant experiences',true]] },
  { key: 'relationships', title: 'Relationships', fields: [] },
  { key: 'story', title: 'Story Information', fields: [['role','Role in the story'],['timeline','Timeline',true],['events','Important events',true]] },
  { key: 'freeform', title: 'Freeform Notes', fields: [] }
];
// New profiles use generic arc questions; earlier profiles retain their prompts unchanged.
function characterSectionFields(section,character){
  if(character.developmentPrompts===2 && section.key==='personality')
    return [['traits','Personality traits',true],['fears','Fears',true],['lie','The Lie — what false belief does this character hold?',true],['truth','The Truth — what challenges that belief?',true],['want','The Want — what does this character want?',true],['need','The Need — what do they actually need?',true]];
  if(character.developmentPrompts===2 && section.key==='background')
    return [['history','Personal history',true],['formativeExperience','Formative experience — what shaped their beliefs?',true],['startingCircumstances','Starting circumstances — what is their life like at the beginning?',true]];
  if(section.key==='story')return [...section.fields,['arcType','Character arc type (optional; your own terminology)']];
  return section.fields;
}
let fieldSerial = 0;
function makeField(label, value, update, long = false, undoInfo = null) {
  const container = el('div', 'field' + (long ? ' wide' : ''));
  const lab = el('label', '', label);
  const input = el(long ? 'textarea' : 'input');
  input.id = 'character-field-' + (++fieldSerial);
  lab.htmlFor = input.id;
  if (long) input.rows = 3;
  input.value = value ?? '';
  let group = null;
  input.addEventListener('focus',()=>{group='field-'+(++fieldFocusSerial);});
  input.addEventListener('input', () => {
    if (undoInfo) {
      if (!group) group='field-'+(++fieldFocusSerial);
      const { character, section, key }=undoInfo;
      const before=character[section]?.[key] ?? '';
      rememberFieldUndo(character,section,key,before,group,'Edit '+label);
    }
    update(input.value);
  });
  container.append(lab, input);
  return container;
}
function formatMoment(value) {
  const d = value && new Date(value);
  return d && Number.isFinite(d.getTime()) ? d.toLocaleString() : 'Not recorded';
}
function localDatetimeValue(value) {
  const d = value && new Date(value);
  if (!d || !Number.isFinite(d.getTime())) return '';
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0,16);
}
function renderProfileMetadata(character) {
  const root=el('div','profileMetadata');
  const title=el('h3','', 'Character record'); root.append(title);
  const grid=el('div','recordGrid');
  const created=el('div','recordItem');
  created.append(el('span','recordLabel','Date created'),el('strong','',formatMoment(character.createdAt)));
  const edit=el('button','textButton','Edit creation date');edit.type='button';
  const input=el('input');input.type='datetime-local';input.value=localDatetimeValue(character.createdAt);input.className='hidden';input.setAttribute('aria-label','Set character creation date');
  const save=el('button','quiet hidden','Save date');save.type='button';
  const cancel=el('button','textButton hidden','Cancel');cancel.type='button';
  edit.onclick=()=>{edit.classList.add('hidden');input.classList.remove('hidden');save.classList.remove('hidden');cancel.classList.remove('hidden');input.focus();};
  cancel.onclick=()=>{input.value=localDatetimeValue(character.createdAt);edit.classList.remove('hidden');input.classList.add('hidden');save.classList.add('hidden');cancel.classList.add('hidden');};
  save.onclick=()=>{
    if(!input.value || !Number.isFinite(new Date(input.value).getTime())){toast('Select a valid creation date and time.',true);return;}
    const next=new Date(input.value).toISOString();
    if(next!==character.createdAt){
      const before=character.createdAt;
      rememberUndo('Edit creation date',async()=>{
        const target=state.characters.find(c=>c.id===character.id);if(!target)return false;
        target.createdAt=before; if(target===state.active){queueSave();if(!(await flush()))return false;renderEditor();}
        return true;
      });
      character.createdAt=next;queueSave();
    }
    renderEditor();
  };
  created.append(edit,input,save,cancel);
  const updated=el('div','recordItem');const updatedValue=el('strong','',formatMoment(character.updatedAt));updatedValue.dataset.profileUpdatedFor=character.id;updated.append(el('span','recordLabel','Last updated'),updatedValue,el('span','muted','Automatically recorded after a successful character save'));
  grid.append(created,updated);root.append(grid);return root;
}
function renderEditor() {
  const character = state.active;
  if (!character) return renderEmpty();
  hideMainViews(); cleanGalleryUrls(); $('editor').classList.remove('hidden');
  setWorkspaceView('editor');
  $('profileBookName').textContent = state.novel?.name || 'Novel';
  $('profileNavName').textContent = character.name;
  $('characterName').textContent = character.name;
  setActiveSidebarNavigation('');
  $('lastSavedLabel').textContent = character.updatedAt && Number.isFinite(Date.parse(character.updatedAt)) ? 'Last saved ' + new Date(character.updatedAt).toLocaleString() : 'Last updated: not recorded';
  const host = $('sections'); host.replaceChildren();
  for (const section of sections) {
    character[section.key] ??= {};
    const details = el('details','section'); details.open = true;
    details.id = 'section-' + section.key;
    const summary = el('summary'); summary.append(el('span','',section.title),el('span','', '⌄'));
    const body = el('div','sectionBody');
    const displayFields=characterSectionFields(section,character);
    if (displayFields.length) {
      const grid = el('div','fields');
      for (const [key, label, long] of displayFields) {
        const fieldRow=makeField(label, character[section.key][key] || '', value => {
          character[section.key][key] = value;
          if (section.key === 'basic' && key === 'fullName') {
            character.name = value || 'Unnamed';
            $('characterName').textContent = character.name;
            $('profileNavName').textContent = character.name;
            renderCharacterList();
          }
          queueSave();
        }, !!long, {character,section:section.key,key});
        fieldRow.dataset.section=section.key;fieldRow.dataset.field=key;grid.append(fieldRow);
      }
      body.append(grid);
    }
    if (section.key === 'basic') renderCharacterTagEditor(body,character);
    if (section.key === 'relationships') renderRelationships(body, character);
    if (section.key === 'story') renderCharacterTimelineEvents(body, character);
    const notes = el('div','notes');
    const notesField=makeField(section.key === 'freeform' ? 'Notes' : 'Additional notes', character[section.key].notes || '', value => {
      character[section.key].notes = value;
      queueSave();
    }, true, {character,section:section.key,key:'notes'});
    notesField.dataset.section=section.key;notesField.dataset.field='notes';notes.append(notesField);
    body.append(notes);
    if (section.key === 'freeform') body.append(renderProfileMetadata(character));
    details.append(summary, body); host.append(details);
  }
  void renderPortrait(character);
}
function relatedCharacters(character) {
  const own = character.relationships?.links || [];
  const incoming = state.characters.filter(other => other.id !== character.id && (other.relationships?.links || []).some(r => r.id === character.id)).map(other => ({ id: other.id, notes: '', incoming: true }));
  return [...own, ...incoming.filter(r => !own.some(o => o.id === r.id))].filter(r => state.characters.some(x => x.id === r.id));
}
function renderRelationships(host, character) {
  character.relationships.links ??= [];
  for (const link of relatedCharacters(character)) {
    const target = state.characters.find(c => c.id === link.id);
    const row = el('div','relationshipRow');
    const jump = el('button','linkButton', target.name); jump.type = 'button'; jump.onclick = () => void chooseCharacter(target.id); row.append(jump);
    const own = character.relationships.links.find(x => x.id === link.id);
    if (own) {
      const kind = el('select');
      kind.setAttribute('aria-label', 'Relationship type with ' + target.name);
      addTypes(kind, own.type);
      kind.addEventListener('change', () => { const old=new Map([[character.id,structuredClone(character.relationships.links)]]);own.type=kind.value; rememberLinksUndo([character],old,'Change relationship');queueSave(); });
      row.append(kind);
      const notes = el('textarea'); notes.placeholder = 'Notes from this character’s perspective…'; notes.value = own.notes || '';
      let relationGroup=null;notes.addEventListener('focus',()=>{relationGroup='relation-'+(++fieldFocusSerial);});
      notes.addEventListener('input', () => { if(!relationGroup)relationGroup='relation-'+(++fieldFocusSerial);const old=new Map([[character.id,structuredClone(character.relationships.links)]]); rememberLinksUndo([character],old,'Edit relationship notes',relationGroup);own.notes=notes.value; queueSave(); });
      row.append(notes);
      const remove = el('button','removeButton','Unlink'); remove.type = 'button';
      remove.onclick = () => { const old=new Map([[character.id,structuredClone(character.relationships.links)]]);character.relationships.links=character.relationships.links.filter(x=>x.id!==link.id);rememberLinksUndo([character],old,'Unlink character');queueSave();renderEditor(); };
      row.append(remove);
    } else {
      row.append(el('span','muted','Linked from '+target.name));
      const addOwn = el('button','quiet','Add my notes'); addOwn.type = 'button';
      addOwn.onclick = () => { const old=new Map([[character.id,structuredClone(character.relationships.links)]]);character.relationships.links.push({ id: target.id, notes: '' });rememberLinksUndo([character],old,'Add relationship notes');queueSave(); renderEditor(); };
      row.append(addOwn);
    }
    host.append(row);
  }
  const picker = el('div','relationPicker'), select = el('select');
  select.append(new Option('Select character to link…',''));
  const linked = new Set(relatedCharacters(character).map(r => r.id));
  for (const c of state.characters.filter(c => c.id !== character.id && !linked.has(c.id))) select.add(new Option(c.name, c.id));
  const add = el('button','primary','Link character'); add.type = 'button'; add.disabled = select.options.length < 2;
  add.onclick = () => { if (!select.value) return; const old=new Map([[character.id,structuredClone(character.relationships.links)]]); character.relationships.links.push({ id: select.value, notes: '' });rememberLinksUndo([character],old,'Link character');queueSave(); renderEditor(); };
  picker.append(select,add); host.append(picker);
  host.append(el('p','muted','Links appear on both profiles; each writer can add notes from either character’s perspective.'));
}
function cleanPortraitUrl() { if (state.portraitUrl) URL.revokeObjectURL(state.portraitUrl); state.portraitUrl = null; }
async function renderPortrait(character) {
  const frame = $('portrait');
  cleanPortraitUrl(); frame.replaceChildren(el('span','silhouette','♟'));
  if (!character.portraitFile || !state.portraitsDir) return;
  const epoch = state.epoch;
  try {
    const file = await (await state.portraitsDir.getFileHandle(character.portraitFile)).getFile();
    if (state.active !== character || epoch !== state.epoch) return;
    const url = URL.createObjectURL(file); state.portraitUrl = url;
    const img = el('img'); img.src = url; img.alt = 'Portrait of ' + character.name;
    frame.replaceChildren(img);
  } catch { /* show default silhouette if photo was removed */ }
}
async function uploadPortrait(event) {
  const file = event.target.files?.[0], character = state.active;
  event.target.value = '';
  if (!file || !character) return;
  if (!['image/png','image/jpeg','image/webp'].includes(file.type)) { toast('Choose a PNG, JPEG, or WebP image.', true); return; }
  if (file.size > 5 * 1024 * 1024) { toast('Portraits must be 5 MB or smaller.', true); return; }
  if (!(await flush())) return;
  try {
    status('Saving portrait…', 'busy');
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const filename = character.id + '.' + ext;
    await putFile(state.portraitsDir, filename, file);
    character.portraitFile = filename;
    queueSave();
    if (await flush()) { await renderPortrait(character); toast('Portrait saved to USB.'); }
  } catch (error) { status('Portrait save failed', 'bad'); toast('Could not save portrait: ' + error.message, true); }
}
async function removePortrait() {
  if (!state.active?.portraitFile) return;
  if (!confirm('Remove the portrait from this profile?')) return;
  state.active.portraitFile = null;
  queueSave();
  if (await flush()) await renderPortrait(state.active);
}
// Never delete a file merely because a small icon was clicked. Both actions
// require a second, explicitly named confirmation. Escape and Cancel do nothing.
let deleteInProgress = false;
function confirmDeletion(kind, name, details) {
  const dialog = $('deleteDialog');
  $('deleteDialogTitle').textContent = 'Are you sure?';
  $('deleteDialogDescription').textContent = 'Delete ' + kind + ' “' + name + '”? ' + details;
  $('confirmDeleteBtn').textContent = kind === 'book' ? 'Yes, delete book' : 'Yes, delete character';
  return new Promise(resolve => {
    const cancel = $('cancelDeleteBtn');
    const proceed = $('confirmDeleteBtn');
    let accepted = false;
    const onCancel = () => dialog.close('cancel');
    const onProceed = () => { accepted = true; dialog.close('confirm'); };
    const onClose = () => {
      cancel.removeEventListener('click', onCancel);
      proceed.removeEventListener('click', onProceed);
      dialog.removeEventListener('close', onClose);
      resolve(accepted && dialog.returnValue === 'confirm');
    };
    cancel.addEventListener('click', onCancel);
    proceed.addEventListener('click', onProceed);
    dialog.addEventListener('close', onClose);
    dialog.showModal();
    // Focus the safe option. Enter cannot accidentally confirm deletion.
    cancel.focus();
  });
}
async function deleteCharacter(id) {
  if (deleteInProgress || !state.novel || !state.charsDir) return;
  const character = state.characters.find(c => c.id === (typeof id === 'string' ? id : state.active?.id));
  if (!character) return;
  const novelId = state.novel.id, writerId = state.writer?.id;
  const approved = await confirmDeletion('character', character.name,
    'Its character profile will be permanently removed from this novel, along with its portrait (if present).');
  if (!approved || deleteInProgress) return;
  // Protect pending changes to this or any other profile.
  if (!(await flush())) { toast('Deletion cancelled because changes could not be saved.', true); return; }
  if (state.novel?.id !== novelId || state.writer?.id !== writerId || !state.characters.includes(character)) return;
  deleteInProgress = true;
  try {
    status('Deleting character…', 'busy');
    await removeTrackedEntry(state.charsDir,character._filename);
    // Only after the character file is removed should the UI forget this character.
    state.characters = state.characters.filter(c => c.id !== character.id);
    clearUndo(); // Permanent file deletion is intentionally not undoable.
    if (state.treeMeta?.positions?.[character.id]) { delete state.treeMeta.positions[character.id]; queueTreeSave(); }
    if (state.active?.id === character.id) {
      state.active = null;
      state.revision = state.savedRevision = 0;
      state.epoch++;
      cleanPortraitUrl();
    }
    // A deleted character's private revision snapshots are also removed.
    try {const revisions=await state.novelDir.getDirectoryHandle('revisions');await removeTrackedEntry(revisions,character.id,{recursive:true});}
    catch(e){if(e.name!=='NotFoundError')console.warn('Could not clean character revisions:',e);}
    let portraitFailure = null;
    if (character.portraitFile && character.portraitFile.startsWith(character.id + '.')) {
      try { await removeTrackedEntry(state.portraitsDir,character.portraitFile); }
      catch (error) { if (error.name !== 'NotFoundError') portraitFailure = error; }
    }
    if(state.timelineEvents.some(e=>e.characterIds.includes(character.id))) {
      try{
        const next=state.timelineEvents.map(e=>({...e,characterIds:e.characterIds.filter(id=>id!==character.id)}));
        await putJSON(state.novelDir,'timeline.json',{type:'character-bookshelf-timeline',version:1,events:next});
        state.timelineEvents=next;
      } catch(e){toast('Character deleted, but timeline links need checking: '+e.message,true);}
    }
    renderCharacterList();
    await showCharacters();
    status(portraitFailure ? 'Character deleted; portrait cleanup incomplete' : 'Saved to folder');
    toast(portraitFailure
      ? 'Character deleted, but its portrait file could not be removed: ' + portraitFailure.message
      : 'Character deleted from USB.', !!portraitFailure);
  } catch (error) {
    status('Delete failed', 'bad');
    toast('Character was not deleted: ' + error.message, true);
  } finally { deleteInProgress = false; }
}
async function deleteBook(id) {
  if (deleteInProgress || !state.writerDir || !state.writer) return;
  const novel = state.novels.find(n => n.id === id);
  if (!novel) return;
  const writerId = state.writer.id;
  const approved = await confirmDeletion('book', novel.name,
    'Its entire novel folder will be deleted, including ALL character profiles, notes, relationships, portraits, and any other files inside that folder.');
  if (!approved || deleteInProgress) return;
  if (!(await flush())) { toast('Deletion cancelled because changes could not be saved.', true); return; }
  if (state.writer?.id !== writerId || !state.novels.includes(novel)) return;
  deleteInProgress = true;
  try {
    status('Deleting book…', 'busy');
    // File System Access API: remove the named book folder and all its contents.
    // Only the selected writer's known novel folder is eligible for deletion.
    await removeTrackedEntry(state.writerDir,novel.folder,{recursive:true});
    state.novels = state.novels.filter(n => n.id !== novel.id);
    if(seriesForBook(novel.id)){
      try{await persistSeries(state.series.map(g=>({...g,bookIds:g.bookIds.filter(x=>x!==novel.id)})));}
      catch(e){toast('Novel deleted, but its series grouping could not be updated. Refresh the library: '+e.message,true);}
    }
    if (state.novel?.id === novel.id) clearNovelState();
    renderNovelSelect();
    await showBookshelf();
    status('Saved to folder');
    clearUndo(); // Permanent deletion cannot be reversed through Undo.
    toast('Book and its character files deleted from USB.');
  } catch (error) {
    status('Delete failed', 'bad');
    toast('Could not delete book. Check the USB folder before trying again: ' + error.message, true);
    // Recursive deletion may partially remove files on an interrupted USB write.
    // We do not claim success; the user should inspect the folder first.
  } finally { deleteInProgress = false; }
}
function downloadUnsavedProfile() {
  const character = state.active;
  if (!character) return;
  const snapshot = { ...diskProfile(character), updatedAt: dateNow() };
  const blob = new Blob([JSON.stringify(snapshot, null, 2) + '\n'], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = character._filename || folderSafe(character.name) + '.json';
  document.body.append(anchor);
  anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 15000);
  toast('Downloaded a recovery copy. The USB file has not been updated.');
}
/* v3.8: self-contained STORE-method ZIP for one selected writer. No network. */
const WRITER_BACKUP_LIMIT = 512 * 1024 * 1024;
const WRITER_BACKUP_FILE_LIMIT = 30000;
let pendingWriterRestore = null;
async function visitBackupFiles(dir,prefix,files,budget){
  for await(const [name,entry] of dir.entries()){
    if(name==='.'||name==='..'||name.includes('/')||name.includes('\\'))throw Error('Unsafe file name in library.');
    const path=prefix+name;
    if(entry.kind==='directory')await visitBackupFiles(entry,path+'/',files,budget);
    else if(entry.kind==='file'){
      const file=await entry.getFile();
      budget.size+=file.size;budget.count++;
      if(budget.size>WRITER_BACKUP_LIMIT||budget.count>WRITER_BACKUP_FILE_LIMIT)throw Error('Backup exceeds browser-safe size or file count. Use Copy full library to another folder instead.');
      files.push([path,new Uint8Array(await file.arrayBuffer())]);
    }
  }
}
async function exportWriterZip(){
  const button=$('exportWriterZipBtn');button.disabled=true;
  try{
    if(!state.writer)throw Error('Select a writer before exporting a writer ZIP.');
    if(!(await flush()))throw Error('Unsaved changes prevented the backup.');
    $('backupDialogStatus').textContent='Reading all files for '+state.writer.name+'…';
    const files=[],budget={count:0,size:0};
    await visitBackupFiles(state.writerDir,'writer/',files,budget);
    const marker={type:'character-bookshelf-writer-backup',version:1,writer:{name:state.writer.name,id:state.writer.id},exportedAt:dateNow(),files:budget.count};
    files.unshift(['backup.json',JSON.stringify(marker,null,2)]);
    const zip=zipBytes(files);
    const blob=new Blob([zip],{type:'application/zip'});
    downloadBlob(blob,'Character-Bookshelf-'+folderSafe(state.writer.name)+'-'+new Date().toISOString().slice(0,10)+'.zip');
    $('backupDialogStatus').textContent='Writer ZIP downloaded: '+budget.count+' files. Keep a copy outside the USB drive.';
    recordBackupExport();renderReminderSettings();
    toast('Writer backup download started. Keep a copy outside the USB drive.');
  }catch(e){$('backupDialogStatus').textContent='Not exported: '+e.message;toast('Backup failed: '+e.message,true);}
  finally{button.disabled=false;}
}
function unpackWriterZip(buffer){
  const bytes=new Uint8Array(buffer),view=new DataView(buffer),decoder=new TextDecoder('utf-8',{fatal:true});
  const files=new Map(),paths=new Set();let offset=0,total=0,count=0;
  if(bytes.length>WRITER_BACKUP_LIMIT+5*1024*1024)throw Error('ZIP exceeds the 512 MB restore limit.');
  while(offset+4<=bytes.length){
    const sig=view.getUint32(offset,true);
    if(sig===0x02014b50||sig===0x06054b50)break;
    if(sig!==0x04034b50)throw Error('Unexpected ZIP entry. Only app-exported writer ZIPs are supported.');
    if(offset+30>bytes.length)throw Error('Truncated ZIP header.');
    const flags=view.getUint16(offset+6,true),method=view.getUint16(offset+8,true);
    if((flags&0x8)!==0||method!==0)throw Error('This ZIP uses unsupported compression. Restore a ZIP exported by Character Bookshelf.');
    const expectedCrc=view.getUint32(offset+14,true),compressed=view.getUint32(offset+18,true),uncompressed=view.getUint32(offset+22,true);
    const nameLen=view.getUint16(offset+26,true),extraLen=view.getUint16(offset+28,true);
    if(compressed!==uncompressed)throw Error('Unexpected ZIP entry size.');
    const start=offset+30+nameLen+extraLen,end=start+compressed;
    if(start>bytes.length||end>bytes.length)throw Error('ZIP file appears truncated.');
    const name=decoder.decode(bytes.slice(offset+30,offset+30+nameLen));
    const segments=name.split('/');
    if(name.startsWith('/')||name.includes('\\')||segments.some(seg=>!seg||seg==='.'||seg==='..'||seg.includes(':')||/[\x00-\x1f]/.test(seg)))throw Error('Unsafe file path inside ZIP.');
    const folded=name.toLocaleLowerCase();if(paths.has(folded))throw Error('Duplicate ZIP entry path.');paths.add(folded);
    const data=bytes.slice(start,end);
    if(crc32(data)!==expectedCrc)throw Error('ZIP checksum mismatch for '+name);
    total+=data.byteLength;count++;if(total>WRITER_BACKUP_LIMIT||count>WRITER_BACKUP_FILE_LIMIT)throw Error('ZIP exceeds restore limits.');
    files.set(name,data);offset=end;
  }
  if(!files.has('backup.json'))throw Error('Not a Character Bookshelf writer backup (backup.json missing).');
  let meta;try{meta=JSON.parse(decoder.decode(files.get('backup.json')));}catch{throw Error('Invalid backup metadata.');}
  if(meta?.type!=='character-bookshelf-writer-backup'||meta.version!==1||!cleanName(meta.writer?.name))throw Error('Not a supported Character Bookshelf writer backup.');
  if(meta.files!==files.size-1)throw Error('Backup manifest file count does not match ZIP contents.');
  const content=[...files].filter(([name])=>name.startsWith('writer/'));
  if(content.length!==files.size-1)throw Error('Unrecognized files at ZIP root.');
  // Refuse malformed book metadata BEFORE offering to restore.
  for(const [name,data] of content){
    if(name.endsWith('/novel.json')){
      let novel;try{novel=JSON.parse(decoder.decode(data));}catch{throw Error('Invalid novel.json: '+name);}
      if(novel.type!=='character-archive-novel'||!novel.id||!novel.name)throw Error('Invalid book data in '+name);
    }
    if(name.includes('/characters/')&&name.endsWith('.json')){
      let character;try{character=JSON.parse(decoder.decode(data));}catch{throw Error('Invalid character JSON: '+name);}
      if(!character.id||typeof character.name!=='string')throw Error('Invalid character in '+name);
    }
  }
  return {meta,content,books:content.filter(([n])=>n.endsWith('/novel.json')).length,characters:content.filter(([n])=>n.includes('/characters/')&&n.endsWith('.json')).length,bytes:total};
}
async function beginRestorePreview(event){
  const file=event.target.files?.[0];event.target.value='';if(!file)return;
  try{
    if(!state.root)throw Error('Select your Character Bookshelf USB library first.');
    if(!(await flush()))throw Error('Save current changes before restoring.');
    if(file.size>WRITER_BACKUP_LIMIT+5*1024*1024)throw Error('This ZIP is over the restore limit.');
    const loaded=unpackWriterZip(await file.arrayBuffer());pendingWriterRestore=loaded;
    $('restorePreviewDetails').textContent='Backup writer: '+loaded.meta.writer.name+' · '+loaded.books+' books · '+loaded.characters+' characters · '+loaded.content.length+' total files · Exported '+formatMoment(loaded.meta.exportedAt)+'.';
    $('restoreWriterName').value=loaded.meta.writer.name+' (Restored)';
    $('restorePreviewStatus').textContent='No changes have been made.';
    $('restorePreviewDialog').showModal();
  }catch(e){pendingWriterRestore=null;toast('Cannot read backup: '+e.message,true);}
}
async function confirmWriterRestore(){
  if(!pendingWriterRestore||!state.root)return;
  const btn=$('confirmRestoreBtn');btn.disabled=true;
  let folder=null,manifestWritten=false;
  try{
    if(!(await flush()))throw Error('Save current changes first.');
    const backup=pendingWriterRestore;
    const name=cleanName($('restoreWriterName').value);
    if(!name||name.length>100)throw Error('Enter a writer name (100 characters maximum).');
    const manifest=await readJSON(await state.root.getFileHandle('character-archive-manifest.json'));validateManifest(manifest);
    if(manifest.writers.some(w=>w.name.toLocaleLowerCase()===name.toLocaleLowerCase()))throw Error('A writer with that name already exists. Choose another name.');
    const writer={id:randomId(),name,folder:''};
    let attempt=folderSafe(name),n=2;
    while(true){
      const alreadyNamed=manifest.writers.some(w=>w.folder.toLocaleLowerCase()===attempt.toLocaleLowerCase());
      let exists=false;
      try{await state.root.getDirectoryHandle(attempt);exists=true;}catch(e){if(e.name!=='NotFoundError')throw e;}
      if(!alreadyNamed&&!exists)break;
      attempt=folderSafe(name)+'-'+n++;
    }
    folder=attempt;writer.folder=folder;
    $('restorePreviewStatus').textContent='Restoring files to a NEW writer folder…';
    const rootDir=await state.root.getDirectoryHandle(folder,{create:true});
    for(const [path,data] of backup.content){
      const segments=path.slice('writer/'.length).split('/');const fileName=segments.pop();
      let current=rootDir;
      for(const segment of segments)current=await current.getDirectoryHandle(segment,{create:true});
      await putFile(current,fileName,data);
    }
    // Make writer visible only after every file is successfully written.
    const next={...manifest,writers:[...manifest.writers,writer]};
    await putJSON(state.root,'character-archive-manifest.json',next);manifestWritten=true;
    state.manifest=next;renderWriterCards();
    pendingWriterRestore=null;$('restorePreviewDialog').close();
    await chooseWriter(writer.id);
    toast('Writer restored as a separate library. Your existing files were untouched.');
  }catch(e){
    if(folder&&!manifestWritten){try{await removeTrackedEntry(state.root,folder,{recursive:true});}catch{toast('Check for incomplete folder '+folder+'; cleanup did not finish.',true);}}
    $('restorePreviewStatus').textContent='NOT restored: '+e.message;
    toast('Restore failed: '+e.message,true);
  }finally{btn.disabled=false;}
}
async function backupLibrary() {
  if (hasUnsaved() || state.saving) {
    toast('Finish saving before backing up. Then click Back up library again.', true);
    void flush();
    return;
  }
  if (typeof window.showDirectoryPicker !== 'function') return;
  let target;
  try { target = await window.showDirectoryPicker({ mode: 'readwrite' }); }
  catch (error) { if (error.name !== 'AbortError') toast('Backup cancelled: ' + error.message, true); return; }
  try {
    if (typeof state.root.isSameEntry === 'function' && await state.root.isSameEntry(target)) throw new Error('Choose a different folder for the backup.');
    if (typeof state.root.resolve !== 'function') throw new Error('Cannot verify that the backup destination is separate. Choose a supported Chrome or Edge version.');
    if (await state.root.resolve(target) !== null) throw new Error('The backup location must not be inside your active library.');
    if (typeof target.queryPermission === 'function' && await target.queryPermission({ mode: 'readwrite' }) !== 'granted') {
      if (await target.requestPermission({mode:'readwrite'}) !== 'granted') throw new Error('Write permission was not granted.');
    }
    const stamp = dateNow().replace(/[:.]/g,'-');
    const folder = await target.getDirectoryHandle('Character-Bookshelf-Backup-' + stamp, {create:true});
    status('Backing up…', 'busy');
    await copyFolder(state.root, folder);
    status('Backup complete');
    toast('Backup copied successfully.');
  } catch (error) { status('Backup failed', 'bad'); toast('Backup could not finish: ' + error.message, true); }
}
async function copyFolder(source, dest) {
  for await (const [name, handle] of source.entries()) {
    if (handle.kind === 'directory') {
      const child = await dest.getDirectoryHandle(name, { create: true });
      await copyFolder(handle, child);
    } else if (handle.kind === 'file') {
      const file = await handle.getFile();
      const output = await dest.getFileHandle(name, { create: true });
      await writeHandle(output, file);
    }
  }
}
/* v3.3 Character Tree: derives connections from saved character relationships.
   Only manual node positions live in character-tree.json; character metadata remains
   in the existing per-character JSON. Unknown relationships are NOT guessed. */
const TREE_TYPES = [
  ['connected','Connected (unspecified)'],
  ['parent','Parent of →'],['child','Child of →'],
  ['sibling','Sibling of'],['partner','Spouse / partner of'],
  ['ex-spouse','Ex-spouse of'],['ex-partner','Ex-partner of'],
  ['fiance','Fiancé(e) of'],['dating','Dating / romantic partner'],
  ['grandparent','Grandparent of →'],['grandchild','Grandchild of →'],
  ['aunt-uncle','Aunt / uncle of →'],['niece-nephew','Niece / nephew of →'],
  ['cousin','Cousin of'],['step-parent','Step-parent of →'],['step-child','Step-child of →'],
  ['adoptive-parent','Adoptive parent of →'],['adopted-child','Adopted child of →'],
  ['friend','Friend of'],['best-friend','Best friend of'],['estranged','Estranged from'],
  ['rival','Rival / enemy of'],['ally','Ally of'],['mentor','Mentor of →'],
  ['student','Student of →'],['coworker','Coworker of'],['other','Other relationship']
];
// Deliberately subdued individual hues for the 28 relationship types. These
// colors are presentation-only: no character or tree JSON schemas change.
const TREE_COLORS = {
  'connected':'#8998a6','parent':'#87a2bb','child':'#91a9c0','sibling':'#83a4a9',
  'partner':'#b58da4','ex-spouse':'#b79caa','ex-partner':'#ae8e9c',
  'fiance':'#bf9bba','dating':'#bf96aa',
  'grandparent':'#92a9ba','grandchild':'#9aadc4','aunt-uncle':'#9ba8b9',
  'niece-nephew':'#8aa6b7','cousin':'#8fa6a2','step-parent':'#99a4bc',
  'step-child':'#99adb4','adoptive-parent':'#8ca9c1','adopted-child':'#93b0af',
  'friend':'#8cae9d','best-friend':'#82b0a5','estranged':'#b6a18c',
  'rival':'#be888a','ally':'#9fae85','mentor':'#b1ab8e','student':'#a9b197',
  'coworker':'#b2a18a','other':'#a99fae'
};
function treeColor(type){return TREE_COLORS[treeType(type)]||TREE_COLORS.connected;}
function renderTreeLegend(){
  const host=$('treeLegendItems');if(!host)return;host.replaceChildren();
  for(const [id,name] of TREE_TYPES){
    const item=el('span','treeLegendItem');
    const marker=el('span','treeLegendMarker');marker.style.background=treeColor(id);
    item.append(marker,el('span','',name.replace(/ →$/,'')));host.append(item);
  }
}
const treeTypeName = type => TREE_TYPES.find(([id]) => id === type)?.[1] || TREE_TYPES[0][1];
const treeType = value => TREE_TYPES.some(([id]) => id === value) ? value : 'connected';
const treeMetaBlank = () => ({type:'character-bookshelf-tree',version:1,positions:{}});
async function loadTreeMeta(directory) {
  try {
    const data = await readJSON(await directory.getFileHandle('character-tree.json'));
    if (data?.type !== 'character-bookshelf-tree' || !data.positions || Array.isArray(data.positions))
      throw new Error('Invalid character-tree.json — leaving existing files untouched.');
    return data;
  } catch (error) {
    if (error.name === 'NotFoundError') return treeMetaBlank();
    throw error;
  }
}
function treeUnsaved() { return state.treeRevision > state.treeSavedRevision; }
function queueTreeSave() {
  if (!state.novelDir || !state.treeMeta) return;
  state.treeRevision++;
  $('treeSaveLabel').textContent = 'Unsaved layout changes';
  $('treeSaveLabel').dataset.kind = 'busy';
  clearTimeout(state.treeTimer);
  state.treeTimer = setTimeout(() => { void flushTree(); }, 450);
}
async function flushTree() {
  clearTimeout(state.treeTimer); state.treeTimer = null;
  if (state.treeSaving) return state.treeSaving;
  if (!treeUnsaved() || !state.novelDir) return true;
  const dir = state.novelDir, meta = state.treeMeta;
  state.treeSaving = (async () => {
    while (treeUnsaved()) {
      const revision = state.treeRevision;
      try {
        $('treeSaveLabel').textContent = 'Saving layout…';
        $('treeSaveLabel').dataset.kind = 'busy';
        await putJSON(dir,'character-tree.json',{...meta,updatedAt:dateNow()});
        state.treeSavedRevision = revision;
      } catch (error) {
        const base=await recoveryPath(dir);
        if(base!==null)memoryRecovery.pending.set([base,'character-tree.json'].filter(Boolean).join('/'),{bytes:encoder.encode(JSON.stringify(meta,null,2)+'\n'),reason:error.message});
        storageFailed(error);
        $('treeSaveLabel').textContent = 'Layout save failed — retry before leaving';
        $('treeSaveLabel').dataset.kind = 'bad';
        status('Tree save failed', 'bad');
        toast('Could not save tree positions: ' + error.message + '. Keep this page open and retry.', true);
        return false;
      }
    }
    $('treeSaveLabel').textContent = 'Layout saved to USB';
    $('treeSaveLabel').dataset.kind = '';
    status('Saved to folder');
    return true;
  })();
  try { return await state.treeSaving; }
  finally { state.treeSaving = null; }
}
// Each pair of characters is one connection, even when both profiles link each other.
function treeConnections() {
  const pairs = new Map(), valid = new Set(state.characters.map(c => c.id));
  for (const source of state.characters) for (const link of source.relationships?.links || []) {
    if (!link?.id || link.id === source.id || !valid.has(link.id)) continue;
    const key = [source.id,link.id].sort().join('|');
    const candidate = {key,from:source.id,to:link.id,type:treeType(link.type)};
    const previous = pairs.get(key);
    if (!previous || (previous.type === 'connected' && candidate.type !== 'connected')) pairs.set(key,candidate);
  }
  return [...pairs.values()];
}
function treeLayout(connections) {
  const chars=state.characters;
  const groupParent=new Map(chars.map(c=>[c.id,c.id]));
  const find=id=>{let p=groupParent.get(id);while(p && p!==groupParent.get(p)){p=groupParent.get(p);}return p || id;};
  const unite=(a,b)=>{const x=find(a),y=find(b);if(x!==y)groupParent.set(y,x);};
  for(const e of connections)if(['partner','sibling','ex-spouse','ex-partner','fiance','dating','cousin'].includes(e.type))unite(e.from,e.to);
  const groups=new Map(); for(const c of chars){const g=find(c.id);if(!groups.has(g))groups.set(g,[]);groups.get(g).push(c);}
  const levels=new Map([...groups.keys()].map(x=>[x,0]));
  const hier=[];
  for(const e of connections){
    let from=e.from,to=e.to;
    if(['child','grandchild','step-child','adopted-child','niece-nephew'].includes(e.type)) [from,to]=[to,from];
    if(!['parent','child','grandparent','grandchild','step-parent','step-child','adoptive-parent','adopted-child','aunt-uncle','niece-nephew'].includes(e.type))continue;
    from=find(from);to=find(to);if(from!==to)hier.push({from,to});
  }
  // Relax parent-child ranks, with a guard against inconsistent cycles.
  for(let pass=0;pass<groups.size;pass++){
    let changed=false;
    for(const e of hier){const next=(levels.get(e.from)||0)+1;
      if(next>(levels.get(e.to)||0) && next<groups.size+1){levels.set(e.to,next);changed=true;}}
    if(!changed)break;
  }
  const ordered=[...groups.entries()].sort((a,b)=>{
    const delta=(levels.get(a[0])||0)-(levels.get(b[0])||0);
    return delta || a[1][0].name.localeCompare(b[1][0].name);
  });
  const rankMembers=new Map();
  for(const [gid,members] of ordered){const rank=levels.get(gid)||0;
    if(!rankMembers.has(rank))rankMembers.set(rank,[]);
    rankMembers.get(rank).push(...members.sort((a,b)=>a.name.localeCompare(b.name)));
  }
  const positions={};let y=65;
  for(const [rank,members] of [...rankMembers.entries()].sort((a,b)=>a[0]-b[0])){
    let maxRow=0;
    members.forEach((c,i)=>{const row=Math.floor(i/5),col=i%5;
      positions[c.id]={x:70+col*220,y:y+row*153};maxRow=Math.max(maxRow,row);});
    y+=(maxRow+1)*153+75;
  }
  return positions;
}
function treePositions(connections) {
  const auto=treeLayout(connections), out={};
  for(const c of state.characters){
    const pos=state.treeMeta?.positions?.[c.id];
    out[c.id]=pos && Number.isFinite(pos.x) && Number.isFinite(pos.y) ?
      {x:Math.max(10,pos.x),y:Math.max(12,pos.y)} : auto[c.id];
  }
  return out;
}
const svgEl = name => document.createElementNS('http://www.w3.org/2000/svg',name);
function drawTreeLines(connections, positions, width, height) {
  const svg=$('treeLines');svg.replaceChildren();
  svg.setAttribute('width',width);svg.setAttribute('height',height);
  svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
  for(const c of connections){
    const a=positions[c.from],b=positions[c.to];if(!a||!b)continue;
    const hierarchy=['parent','child','grandparent','grandchild','step-parent','step-child','adoptive-parent','adopted-child','aunt-uncle','niece-nephew'].includes(c.type);
    // Start/end at the actual card borders, rather than disappearing beneath them.
    const parentReverse=['child','grandchild','step-child','adopted-child','niece-nephew'].includes(c.type);
    const upper=parentReverse?b:a,lower=parentReverse?a:b;
    let startX,startY,endX,endY,pathData;
    if(hierarchy && lower.y>upper.y+90){
      startX=upper.x+90;startY=upper.y+95;endX=lower.x+90;endY=lower.y;
      const mid=(startY+endY)/2;
      pathData=`M ${startX} ${startY} V ${mid} H ${endX} V ${endY}`;
    }else{
      const aCenter={x:a.x+90,y:a.y+48},bCenter={x:b.x+90,y:b.y+48};
      if(Math.abs(aCenter.x-bCenter.x)>Math.abs(aCenter.y-bCenter.y)){
        startX=aCenter.x+(aCenter.x<bCenter.x?90:-90);startY=aCenter.y;
        endX=bCenter.x+(aCenter.x<bCenter.x?-90:90);endY=bCenter.y;
      }else{
        startX=aCenter.x;startY=aCenter.y+(aCenter.y<bCenter.y?47:-47);
        endX=bCenter.x;endY=bCenter.y+(aCenter.y<bCenter.y?-47:47);
      }
      const mx=(startX+endX)/2;
      pathData=`M ${startX} ${startY} C ${mx} ${startY}, ${mx} ${endY}, ${endX} ${endY}`;
    }
    const color=treeColor(c.type);
    const glow=svgEl('path');glow.setAttribute('d',pathData);glow.setAttribute('class','treeEdgeGlow');glow.setAttribute('stroke',color);svg.append(glow);
    const path=svgEl('path');path.setAttribute('d',pathData);
    path.setAttribute('class','treeEdge'+(c.type==='connected'?' treeEdgeOther':''));path.setAttribute('stroke',color);svg.append(path);
    const label=treeTypeName(c.type).replace(/ →$/,'').replace(/ of$/,'');
    const lx=(startX+endX)/2,ly=(startY+endY)/2-10;
    const labelWidth=Math.max(52,Math.min(220,label.length*6.6+18));
    const back=svgEl('rect');back.setAttribute('x',lx-labelWidth/2);back.setAttribute('y',ly-15);
    back.setAttribute('width',labelWidth);back.setAttribute('height',21);back.setAttribute('rx',6);
    back.setAttribute('class','treeEdgeLabelBacking');back.setAttribute('stroke',color);svg.append(back);
    const text=svgEl('text');text.setAttribute('class','treeEdgeLabel');text.setAttribute('fill',color);text.setAttribute('x',lx);text.setAttribute('y',ly);
    text.setAttribute('text-anchor','middle');text.textContent=label;svg.append(text);
  }
}
function addTypes(select,selected='connected') {
  for(const [value,label] of TREE_TYPES) select.add(new Option(label,value));
  select.value=treeType(selected);
}
async function persistTreeLink(source,oldLinks) {
  try {
    const updated={...source,updatedAt:dateNow()};
    await writeHandle(source._handle,JSON.stringify(diskProfile(updated),null,2)+'\n');
    source.updatedAt=updated.updatedAt;
    status('Saved to folder');
    return true;
  } catch(error){
    source.relationships.links=oldLinks;
    status('Relationship save failed','bad');
    toast('Could not save relationship to USB: '+error.message,true);
    return false;
  }
}
async function setTreeConnectionType(edge,type) {
  if(!(await flush()))return false;
  const source=state.characters.find(c=>c.id===edge.from);
  const target=state.characters.find(c=>c.id===edge.to);
  if(!source||!target)return false;
  source.relationships ??={links:[],notes:''};source.relationships.links??=[];
  const old=structuredClone(source.relationships.links);
  const link=source.relationships.links.find(x=>x.id===target.id);
  if(link)link.type=type;
  else source.relationships.links.push({id:target.id,notes:'',type});
  if(await persistTreeLink(source,old)) {
    rememberLinksUndo([source],new Map([[source.id,old]]),'Change relationship');
    renderTree();return true;
  }
  return false;
}
async function addTreeConnections(from, targetIds, type) {
  if(!from || !targetIds.length){toast('Select a source and one or more other characters.',true);return false;}
  if(!(await flush()))return false;
  const source=state.characters.find(c=>c.id===from);
  if(!source)return false;
  source.relationships??={links:[],notes:''};source.relationships.links??=[];
  const old=structuredClone(source.relationships.links);
  let added=0;
  for(const to of [...new Set(targetIds)]) {
    if(to===from||!state.characters.some(c=>c.id===to))continue;
    const key=[from,to].sort().join('|');
    if(treeConnections().some(e=>e.key===key))continue;
    source.relationships.links.push({id:to,notes:'',type});added++;
  }
  if(!added){toast('Those characters are already linked. You can change their relationship below.',true);return false;}
  if(await persistTreeLink(source,old)) {
    rememberLinksUndo([source],new Map([[source.id,old]]),`Link ${added} character${added===1?'':'s'}`);
    renderTree();toast(`Linked ${added} character${added===1?'':'s'}; lines saved to USB.`);
    return true;
  }
  return false;
}
async function addTreeConnection() {
  const from=$('treeFrom').value;
  const targets=[...document.querySelectorAll('#treeTargets input:checked')].map(input=>input.value);
  const ok=await addTreeConnections(from,targets,$('treeNewType').value);
  if(ok) for(const input of document.querySelectorAll('#treeTargets input:checked'))input.checked=false;
}
function askTreeDrop(source,target,existing) {
  const dialog=$('treeDropDialog');
  $('treeDropTitle').textContent=existing?'Change this relationship?':'Link these characters?';
  $('treeDropDescription').textContent=existing?
    `“${source.name}” and “${target.name}” are already linked. Choose a new relationship if you'd like to change it.`:
    `Create a line connecting “${source.name}” to “${target.name}”?`;
  const select=$('treeDropType');select.replaceChildren();addTypes(select,existing?.type||'connected');
  $('treeDropConfirm').textContent=existing?'Change relationship':'Link characters';
  return new Promise(resolve=>{
    const cancel=$('treeDropCancel'),go=$('treeDropConfirm');let confirmed=false;
    const onCancel=()=>dialog.close('cancel');
    const onConfirm=()=>{confirmed=true;dialog.close('confirm')};
    const onClose=()=>{
      cancel.removeEventListener('click',onCancel);go.removeEventListener('click',onConfirm);dialog.removeEventListener('close',onClose);
      resolve(confirmed?select.value:null);
    };
    cancel.addEventListener('click',onCancel);go.addEventListener('click',onConfirm);
    dialog.addEventListener('close',onClose);dialog.showModal();cancel.focus();
  });
}
async function removeTreeConnection(edge){
  const a=state.characters.find(c=>c.id===edge.from),b=state.characters.find(c=>c.id===edge.to);
  if(!a||!b)return;
  if(!confirm(`Remove the connection between ${a.name} and ${b.name}? Their profiles will remain.`))return;
  if(!(await flush()))return;
  const changed=[a,b].filter(c=>(c.relationships?.links||[]).some(x=>x.id===(c===a?b.id:a.id)));
  const before=new Map(changed.map(c=>[c.id,structuredClone(c.relationships.links)]));
  let success=true;
  for(const c of changed){
    const old=structuredClone(c.relationships.links), other=c===a?b:a;
    c.relationships.links=c.relationships.links.filter(x=>x.id!==other.id);
    if(!(await persistTreeLink(c,old))){
      toast('The connection was only partially changed. Reopen the novel to inspect both profiles.',true);
      success=false;break;
    }
  }
  if(success && changed.length)rememberLinksUndo(changed,before,'Remove relationship');
  renderTree();
}
function renderTree() {
  if(!state.novel)return;
  const edges=treeConnections(),positions=treePositions(edges),container=$('treeNodes');
  container.replaceChildren();
  const width=Math.max(940,...Object.values(positions).map(p=>Math.ceil(p.x+230)));
  const height=Math.max(340,...Object.values(positions).map(p=>Math.ceil(p.y+175)));
  $('treeStage').style.width=width+'px';$('treeStage').style.height=height+'px';
  drawTreeLines(edges,positions,width,height);
  for(const character of state.characters){
    const p=positions[character.id];
    const card=el('div','treeNode');card.dataset.nodeId=character.id;card.style.left=p.x+'px';card.style.top=p.y+'px';
    const head=el('div','treeNodeHead');
    const role=el('span','treeNodeRole',character.story?.role||'Character');
    const drag=el('button','treeNodeHandle','⠿');drag.type='button';
    drag.title='Drag to reposition '+character.name;
    drag.setAttribute('aria-label','Drag to reposition '+character.name);
    head.append(role,drag);
    const open=el('button','treeNodeOpen',character.name);open.type='button';
    open.addEventListener('click',()=>void chooseCharacter(character.id));
    card.append(head,open,el('span','treeNodeCaption','Open profile ↗'));
    container.append(card);
    drag.addEventListener('pointerdown',event=>{
      if(event.button!==0)return;
      event.preventDefault();drag.setPointerCapture(event.pointerId);
      const startX=event.clientX,startY=event.clientY,original={...positions[character.id]};
      const previousManual=state.treeMeta?.positions?.[character.id];
      const undoPosition=previousManual?{...previousManual}:null;
      let moved=false;
      const highlightTarget=()=>{
        const p=positions[character.id];
        let candidate=null,best=0;
        for(const c of state.characters){
          if(c.id===character.id)continue;
          const q=positions[c.id];if(!q)continue;
          const overlapX=Math.max(0,Math.min(p.x+180,q.x+180)-Math.max(p.x,q.x));
          const overlapY=Math.max(0,Math.min(p.y+94,q.y+94)-Math.max(p.y,q.y));
          const intersection=overlapX*overlapY;
          if(intersection>1500 && intersection>best){best=intersection;candidate=c;}
        }
        container.querySelectorAll('.treeNode').forEach(n=>n.classList.remove('linkTarget'));
        if(candidate)container.querySelector(`[data-node-id="${candidate.id}"]`)?.classList.add('linkTarget');
        return candidate;
      };
      const move=e=>{
        if(e.pointerId!==event.pointerId)return;
        moved ||= Math.hypot(e.clientX-startX,e.clientY-startY)>5;
        positions[character.id]={x:Math.max(10,original.x+e.clientX-startX),y:Math.max(12,original.y+e.clientY-startY)};
        const next=positions[character.id];card.style.left=next.x+'px';card.style.top=next.y+'px';
        drawTreeLines(edges,positions,width,height);
        highlightTarget();
      };
      const finish=e=>{
        if(e.pointerId!==event.pointerId)return;
        drag.removeEventListener('pointermove',move);
        drag.removeEventListener('pointerup',finish);
        drag.removeEventListener('pointercancel',finish);
        const next=positions[character.id];
        if(e.type==='pointercancel' || !moved){
          positions[character.id]=original;card.style.left=original.x+'px';card.style.top=original.y+'px';
          drawTreeLines(edges,positions,width,height);
          container.querySelectorAll('.linkTarget').forEach(n=>n.classList.remove('linkTarget'));
          return;
        }
        const target=highlightTarget();
        container.querySelectorAll('.linkTarget').forEach(n=>n.classList.remove('linkTarget'));
        if(target){
          // A card-to-card drop is a link gesture, not an overlapping saved position.
          positions[character.id]=original;card.style.left=original.x+'px';card.style.top=original.y+'px';
          drawTreeLines(edges,positions,width,height);
          const edge=edges.find(c=>c.key===[character.id,target.id].sort().join('|'));
          void (async()=>{
            const type=await askTreeDrop(character,target,edge);
            if(type===null)return;
            if(edge)await setTreeConnectionType(edge,type);
            else await addTreeConnections(character.id,[target.id],type);
          })();
        }else if(next.x!==original.x||next.y!==original.y){
          state.treeMeta.positions[character.id]={...next};queueTreeSave();
          rememberUndo('Move character card',async()=>{
            if(undoPosition)state.treeMeta.positions[character.id]={...undoPosition};
            else delete state.treeMeta.positions[character.id];
            queueTreeSave();if(!(await flushTree()))return false;
            if(!$('treeView').classList.contains('hidden'))renderTree();
            return true;
          });
        }
      };
      drag.addEventListener('pointermove',move);drag.addEventListener('pointerup',finish);drag.addEventListener('pointercancel',finish);
    });
  }
  const list=$('treeConnectionList');list.replaceChildren();
  if(!edges.length)list.append(el('p','muted','No connections yet. All characters are shown above. You can connect them using the controls below or their profile relationships.'));
  for(const edge of edges){
    const a=state.characters.find(x=>x.id===edge.from),b=state.characters.find(x=>x.id===edge.to);
    const row=el('div','treeConnectionRow');
    row.append(el('span','treeConnectionNames',`${a.name} → ${b.name}`));
    const select=el('select');select.setAttribute('aria-label',`Relationship between ${a.name} and ${b.name}`);
    addTypes(select,edge.type);select.addEventListener('change',()=>void setTreeConnectionType(edge,select.value));
    const remove=el('button','treeRemoveBtn','Remove link');remove.type='button';
    remove.addEventListener('click',()=>void removeTreeConnection(edge));
    row.append(select,remove);list.append(row);
  }
  const source=$('treeFrom'),was=source.value;source.replaceChildren(new Option('Choose character…',''));
  for(const c of state.characters)source.add(new Option(c.name,c.id));
  if(state.characters.some(c=>c.id===was))source.value=was;
  const targets=$('treeTargets'), checked=new Set([...targets.querySelectorAll('input:checked')].map(input=>input.value));
  targets.replaceChildren();
  for(const c of state.characters){
    if(c.id===source.value)continue;
    const lab=el('label','treeTargetOption');
    const input=el('input');input.type='checkbox';input.value=c.id;input.checked=checked.has(c.id);
    lab.append(input,el('span','',c.name));targets.append(lab);
  }
  $('treeNewType').replaceChildren();addTypes($('treeNewType'));
  $('treeConnectBtn').disabled=state.characters.length<2;
}
async function showTree() {
  if(!(await flush())){toast('Save your changes before opening the tree.',true);return;}
  if(!state.novel){await showBookshelf();return;}
  hideMainViews();cleanGalleryUrls();
  $('treeView').classList.remove('hidden');
  $('treeViewTitle').textContent=state.novel.name+' · Character Tree';
  $('treeSaveLabel').textContent=treeUnsaved()?'Unsaved layout changes':'Layout ready';
  $('treeSaveLabel').dataset.kind=treeUnsaved()?'busy':'';
  setActiveSidebarNavigation('');setWorkspaceView('tree');
  renderTreeLegend();renderTree();
}
async function resetTreeLayout() {
  if(!state.novel || !confirm('Reset all manually arranged tree positions for this novel? Character profiles and connections will remain unchanged.'))return;
  const before=structuredClone(state.treeMeta.positions);
  state.treeMeta.positions={};queueTreeSave();renderTree();
  rememberUndo('Reset tree layout',async()=>{state.treeMeta.positions=structuredClone(before);queueTreeSave();if(!(await flushTree()))return false;if(!$('treeView').classList.contains('hidden'))renderTree();return true;});
}

/* v3.6: Structured Timeline — single event record shared across novel-wide
   and filtered character views. Freeform character notes are NEVER parsed. */
async function loadTimelineEvents(directory) {
  try {
    const data=await readJSON(await directory.getFileHandle('timeline.json'));
    if(data.type!=='character-bookshelf-timeline' || !Array.isArray(data.events))throw Error('Invalid timeline.json; nothing was modified.');
    return data.events.map((e,i)=>({id:String(e.id),title:String(e.title||'Untitled event'),year:e.year===null||e.year===undefined||e.year===''?null:Number(e.year),dateText:String(e.dateText||''),notes:String(e.notes||''),characterIds:Array.isArray(e.characterIds)?e.characterIds.map(String):[],order:Number.isFinite(Number(e.order))?Number(e.order):i,createdAt:e.createdAt||dateNow()}));
  } catch(e){if(e.name==='NotFoundError')return [];throw e;}
}
async function writeTimeline(next, label='Timeline updated', old=null, scope=pageUndoKey()) {
  if(!state.novelDir)throw Error('Choose a novel.');
  const before=structuredClone(old||state.timelineEvents);
  await putJSON(state.novelDir,'timeline.json',{type:'character-bookshelf-timeline',version:1,events:next});
  state.timelineEvents=structuredClone(next);
  rememberUndo(label,async()=>{
    await putJSON(state.novelDir,'timeline.json',{type:'character-bookshelf-timeline',version:1,events:before});
    state.timelineEvents=structuredClone(before);
    if(pageType()==='timeline')renderTimeline();
    if(pageType()==='editor' && state.active)renderEditor();
    return true;
  },null,scope);
  status('Saved to folder');
}
function eventYearKey(event) {return event.year===null||!Number.isFinite(event.year)?'undated':String(event.year);}
function sortedTimelineEvents(events) {
  return [...events].sort((a,b)=>{
    const ya=eventYearKey(a),yb=eventYearKey(b);
    if(ya==='undated'&&yb!=='undated')return 1;
    if(yb==='undated'&&ya!=='undated')return -1;
    if(ya!==yb)return Number(ya)-Number(yb);
    return (a.order??0)-(b.order??0)||a.title.localeCompare(b.title);
  });
}
function renderCharacterTimelineEvents(host,character) {
  const block=el('div','characterTimelineBlock');
  const heading=el('div','characterTimelineHeading');
  heading.append(el('h3','','Timeline events'));
  const add=el('button','quiet','＋ Add event');add.type='button';
  add.onclick=()=>openTimelineEventDialog(null,character.id);
  heading.append(add);block.append(heading);
  const entries=sortedTimelineEvents(state.timelineEvents.filter(e=>e.characterIds.includes(character.id)));
  if(!entries.length)block.append(el('p','muted','No structured timeline events for this character. Add one here or link this character to an event on the novel timeline. Your existing Important Events notes remain unchanged.'));
  for(const entry of entries){
    const btn=el('button','characterEventButton', (entry.year??'Undated')+' · '+entry.title);
    btn.type='button';btn.onclick=async()=>{await showTimeline();openTimelineEventDialog(entry.id);};
    block.append(btn);
  }
  const all=el('button','textButton','View novel timeline →');all.type='button';all.onclick=()=>void showTimeline();block.append(all);
  host.append(block);
}
function openTimelineEventDialog(id=null,prefillCharacterId=null) {
  if(!state.novel)return;
  const event=state.timelineEvents.find(e=>e.id===id)||null;
  const dialog=$('timelineEventDialog');
  dialog.dataset.eventId=event?.id||'';
  dialog.dataset.origin=pageType();
  $('timelineDialogHeading').textContent=event?'Edit Timeline Event':'Add Timeline Event';
  $('eventTitleInput').value=event?.title||'';
  $('eventYearInput').value=event?.year??'';
  $('eventDateInput').value=event?.dateText||'';
  $('eventNotesInput').value=event?.notes||'';
  const host=$('eventCharacterChoices');host.replaceChildren();
  for(const c of state.characters){
    const label=el('label','eventCharacterChoice');const check=el('input');check.type='checkbox';check.value=c.id;
    check.checked=event?event.characterIds.includes(c.id):prefillCharacterId===c.id;
    label.append(check,el('span','',c.name));host.append(label);
  }
  dialog.showModal();$('eventTitleInput').focus();
}
async function saveTimelineEvent(evt) {
  evt.preventDefault();
  const title=cleanName($('eventTitleInput').value);
  if(!title){$('eventTitleInput').focus();return;}
  const rawYear=$('eventYearInput').value.trim();
  const year=rawYear===''?null:Number(rawYear);
  if(year!==null && (!Number.isInteger(year)||year < -9999||year > 9999)){toast('Enter a year from -9999 to 9999, or leave it blank.',true);return;}
  const id=$('timelineEventDialog').dataset.eventId;
  const original=state.timelineEvents.find(e=>e.id===id);
  const before=structuredClone(state.timelineEvents);
  const selected=[...$('eventCharacterChoices').querySelectorAll('input:checked')].map(x=>x.value);
  const changed={id:original?.id||randomId(),title,year,dateText:cleanName($('eventDateInput').value),notes:$('eventNotesInput').value,characterIds:selected,order:original?.order??(Math.max(-1,...state.timelineEvents.filter(e=>eventYearKey(e)===(year===null?'undated':String(year))).map(e=>e.order||0))+1),createdAt:original?.createdAt||dateNow()};
  const next=original?state.timelineEvents.map(e=>e.id===original.id?changed:e):[...state.timelineEvents,changed];
  try{
    if(!(await flush()))throw Error('Please save your character changes first.');
    await writeTimeline(next,original?'Edit event':'Add event',before,pageUndoKey($('timelineEventDialog').dataset.origin||'timeline'));
    $('timelineEventDialog').close();
    if(pageType()==='timeline')renderTimeline();
    if(pageType()==='editor' && state.active)renderEditor();
    toast('Timeline event saved to USB.');
  }catch(e){toast('Could not save event: '+e.message,true);}
}
async function deleteTimelineEvent(id){
  const event=state.timelineEvents.find(e=>e.id===id);if(!event)return;
  if(!confirm('Delete timeline event “'+event.title+'”? This removes it from every linked character timeline.'))return;
  try{await writeTimeline(state.timelineEvents.filter(e=>e.id!==id),'Delete event');renderTimeline();}
  catch(e){toast('Delete failed: '+e.message,true);}
}
async function moveTimelineEvent(id,direction){
  const view=sortedTimelineEvents(state.timelineEvents);
  const at=view.findIndex(e=>e.id===id);if(at<0)return;
  const current=view[at],near=view[at+direction];
  if(!near||eventYearKey(current)!==eventYearKey(near))return;
  const before=structuredClone(state.timelineEvents);
  const group=view.filter(e=>eventYearKey(e)===eventYearKey(current));
  const idx=group.findIndex(e=>e.id===id);if(idx+direction<0||idx+direction>=group.length)return;
  [group[idx],group[idx+direction]]=[group[idx+direction],group[idx]];
  const ord=new Map(group.map((e,i)=>[e.id,i]));
  const next=state.timelineEvents.map(e=>ord.has(e.id)?{...e,order:ord.get(e.id)}:e);
  try{await writeTimeline(next,'Reorder events',before);renderTimeline();}
  catch(e){toast('Could not reorder events: '+e.message,true);}
}
async function dragTimelineEvent(sourceId,targetId) {
  if(sourceId===targetId)return;
  const sorted=sortedTimelineEvents(state.timelineEvents);
  const source=sorted.find(e=>e.id===sourceId),target=sorted.find(e=>e.id===targetId);
  if(!source||!target||eventYearKey(source)!==eventYearKey(target)){
    toast('Change the year first to move an event into another year.',true);return;
  }
  const before=structuredClone(state.timelineEvents),group=sorted.filter(e=>eventYearKey(e)===eventYearKey(source));
  const from=group.findIndex(e=>e.id===sourceId),to=group.findIndex(e=>e.id===targetId);
  const [removed]=group.splice(from,1);group.splice(to,0,removed);
  const orders=new Map(group.map((e,i)=>[e.id,i]));
  try {await writeTimeline(state.timelineEvents.map(e=>orders.has(e.id)?{...e,order:orders.get(e.id)}:e),'Reorder events',before);renderTimeline();}
  catch(e){toast('Timeline reorder failed: '+e.message,true);}
}
function renderTimeline(){
  if(!state.novel)return;
  $('timelineViewTitle').textContent=state.novel.name+' · Timeline';
  const picker=$('timelineCharacterFilter');const previous=state.timelineFilter||'all';picker.replaceChildren();
  for(const c of state.characters)picker.add(new Option(c.name,c.id));
  const byCharacter=previous!=='all';
  if(byCharacter && !state.characters.some(c=>c.id===previous))state.timelineFilter='all';
  picker.value=state.timelineFilter==='all'?(state.characters[0]?.id||''):state.timelineFilter;
  $('timelineAllMode').classList.toggle('selected',state.timelineFilter==='all');
  $('timelineCharacterMode').classList.toggle('selected',state.timelineFilter!=='all');
  $('timelineFilterWrap').classList.toggle('hidden',state.timelineFilter==='all');
  const visible=sortedTimelineEvents(state.timelineEvents.filter(e=>state.timelineFilter==='all'||e.characterIds.includes(state.timelineFilter)));
  $('timelineEventCount').textContent=visible.length+' event'+(visible.length===1?'':'s');
  const host=$('timelineEntries');host.replaceChildren();
  if(!visible.length){host.append(el('div','noCharacters',state.timelineFilter==='all'?'No timeline events yet. Add your first event to begin.':'No events linked to this character yet.'));return;}
  const groups=new Map();for(const e of visible){const key=eventYearKey(e);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(e);}
  for(const [key,events] of groups){
    const group=el('section','timelineGroup');group.append(el('h2','timelineYear',key==='undated'?'Relative / Unknown Dates':key));
    const rail=el('div','timelineRail');
    for(const event of events){
      const row=el('div','timelineRow');
      const bullet=el('span','timelineBullet','');
      const card=el('div','timelineCard');
      card.draggable=true;
      card.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',event.id);e.dataTransfer.effectAllowed='move';});
      card.addEventListener('dragover',e=>{e.preventDefault();card.classList.add('dragOver');});
      card.addEventListener('dragleave',()=>card.classList.remove('dragOver'));
      card.addEventListener('drop',e=>{e.preventDefault();card.classList.remove('dragOver');void dragTimelineEvent(e.dataTransfer.getData('text/plain'),event.id);});
      card.addEventListener('dragend',()=>document.querySelectorAll('.timelineCard.dragOver').forEach(c=>c.classList.remove('dragOver')));
      const content=el('button','timelineEventOpen');content.type='button';
      content.append(el('strong','',event.title));
      if(event.dateText)content.append(el('span','muted',event.dateText));
      if(event.notes)content.append(el('span','timelineExcerpt',event.notes.slice(0,160)));
      const names=event.characterIds.map(id=>state.characters.find(c=>c.id===id)?.name).filter(Boolean);
      content.append(el('span','timelineTags',names.length?names.join(' · '):'No characters assigned'));
      content.onclick=()=>openTimelineEventDialog(event.id);
      const controls=el('div','timelineRowActions');
      for(const [symbol,d] of [['↑',-1],['↓',1]]){
        const b=el('button','quiet',symbol);b.type='button';b.title=(d<0?'Move earlier':'Move later')+' within year';
        const idx=events.indexOf(event);b.disabled=d<0?idx===0:idx===events.length-1;
        b.onclick=()=>void moveTimelineEvent(event.id,d);controls.append(b);
      }
      const remove=el('button','dangerText','×');remove.title='Delete timeline event';remove.onclick=()=>void deleteTimelineEvent(event.id);controls.append(remove);
      card.append(content,controls);row.append(bullet,card);rail.append(row);
    }
    group.append(rail);host.append(group);
  }
}
async function showTimeline(){
  if(!(await flush()))return;
  if(!state.novel)return;
  hideMainViews();cleanGalleryUrls();$('timelineView').classList.remove('hidden');
  setWorkspaceView('timeline');renderTimeline();
}
/* v3.8: Whole-word, within-writer search. Search only the selected writer's folder. */
async function showLibrarySearch(){
  if(!(await flush()))return;
  if(!state.writer)return;
  hideMainViews();cleanGalleryUrls();$('librarySearchView').classList.remove('hidden');
  setWorkspaceView('search');
  if($('globalSearchInput').value.trim())await runLibrarySearch();
}
function matchWholeWord(value,query){
  // Unicode letter/digit boundaries reject 'Ron' within 'chronic', but accept Ron's.
  const source=String(value??'');if(!query||!source)return -1;
  const hay=source.toLocaleLowerCase(),needle=query.toLocaleLowerCase();
  let from=0;
  while(from<hay.length){
    const at=hay.indexOf(needle,from);if(at<0)return -1;
    const previous=at>0?source[at-1]:'';
    const following=source[at+needle.length]||'';
    if((!previous||!/[\p{L}\p{N}]/u.test(previous))&&(!following||!/[\p{L}\p{N}]/u.test(following)))return at;
    from=at+1;
  }
  return -1;
}
function collectSearchableParts(profile,lookup){
  const parts=[{label:'Character name',value:profile.name,section:'basic',key:'fullName',priority:0}];
  if(Array.isArray(profile.tags))for(const tag of profile.tags)if(typeof tag==='string')parts.push({label:'Character tag',value:tag,section:'basic',key:'tags',priority:1});
  for(const section of sections){
    const object=profile[section.key]||{};
    for(const [key,value] of Object.entries(object)){
      if(key==='links'&&Array.isArray(value)){
        for(const link of value){
          if(lookup.has(link.id))parts.push({label:'Related character',value:lookup.get(link.id),section:'relationships',key:'links',priority:2});
          if(link.notes)parts.push({label:'Relationship notes',value:link.notes,section:'relationships',key:'links',priority:3});
        }
      }else if(typeof value==='string')parts.push({label:section.title+' / '+key,value,section:section.key,key,priority:key==='fullName'?0:section.key==='story'?2:3});
    }
  }
  return parts;
}
function searchExcerpt(value,at,len){
  const source=String(value||'');return source.slice(Math.max(0,at-65),Math.min(source.length,at+len+100));
}
function highlightSearchTarget(match,term){
  let node=null;
  if(match.section==='relationships')node=$('section-relationships');
  else node=[...$('sections').querySelectorAll('.field')].find(f=>f.dataset.section===match.section&&f.dataset.field===match.key);
  if(!node)return;
  const section=node.closest('details');if(section)section.open=true;
  node.classList.add('searchTarget');node.scrollIntoView({block:'center',behavior:'smooth'});
  const input=node.querySelector('textarea,input');
  if(input){const at=matchWholeWord(input.value,term);if(at>=0){input.focus({preventScroll:true});try{input.setSelectionRange(at,at+term.length);}catch{}}}
  setTimeout(()=>node.classList.remove('searchTarget'),6500);
}
/* v4.1: Repeated searches use a volatile in-memory index. Never persist it.
   Change/version invalidation happens on tracked writes, refresh and writer
   switches; a periodic rebuild also catches edits from other programs. */
const SEARCH_INDEX_TTL=90000;
function invalidateSearchIndex(){state.searchIndex=null;state.searchIndexEpoch++;}
async function loadSearchIndex(){
  if(!state.writerDir)return null;
  const writerId=state.writer?.id,epoch=state.searchIndexEpoch;
  const cached=state.searchIndex;
  if(cached?.writerId===writerId && Date.now()-cached.at<SEARCH_INDEX_TTL)return cached;
  const books=[];
  for(const novel of state.novels){
    const dir=await state.writerDir.getDirectoryHandle(novel.folder);
    const chars=await dir.getDirectoryHandle('characters');
    const profiles=[];
    for await(const [name,handle] of chars.entries()){
      if(handle.kind!=='file'||!name.toLowerCase().endsWith('.json'))continue;
      profiles.push(await readJSON(handle));
    }
    const lookup=new Map(profiles.map(p=>[p.id,p.name]));
    const events=await loadTimelineEvents(dir);
    const novelNotes=await readNovelNotesForSearch(dir);
    books.push({novel,profiles,lookup,events,novelNotes});
  }
  if(writerId!==state.writer?.id||epoch!==state.searchIndexEpoch)return null;
  const index={writerId,at:Date.now(),books};state.searchIndex=index;return index;
}
async function runLibrarySearch(){
  const text=$('globalSearchInput').value.trim();
  const host=$('searchResults');host.replaceChildren();
  if(!text){host.append(el('p','muted','Enter a word or phrase to search this writer’s library.'));return;}
  const token=++state.searchEpoch,writerId=state.writer?.id;
  host.append(el('p','muted','Searching character profiles, tags, novel notes, books, and timelines…'));
  const matches=[];
  try{
    const index=await loadSearchIndex();
    if(!index || writerId!==state.writer?.id) return;
    for(const {novel,profiles,lookup,events,novelNotes=[]} of index.books){
      const titleAt=matchWholeWord(novel.name,text);
      if(titleAt>=0)matches.push({kind:'book',novel,match:{label:'Novel title',value:novel.name,priority:0,at:titleAt}});
      for(const profile of profiles){
        const hits=collectSearchableParts(profile,lookup).map(part=>({...part,at:matchWholeWord(part.value,text)})).filter(part=>part.at>=0).sort((a,b)=>a.priority-b.priority);
        if(hits.length)matches.push({kind:'character',novel,profile,match:hits[0]});
      }
      for(const note of novelNotes){const at=matchWholeWord(note.text,text);if(at>=0)matches.push({kind:'novel-note',novel,note,match:{label:'Novel note',value:note.text,priority:3,at}});}
      for(const event of events){
        const fields=[['Event title',event.title,'title',1],['Event notes',event.notes,'notes',3],['Event date',event.dateText,'dateText',3]];
        for(const [label,value,key,priority] of fields){
          const at=matchWholeWord(value,text);
          if(at>=0){matches.push({kind:'event',novel,event,match:{label,value,key,priority,at}});break;}
        }
      }
    }
    if(token!==state.searchEpoch||pageType()!=='search'||writerId!==state.writer?.id)return;
    matches.sort((a,b)=>a.match.priority-b.match.priority||a.novel.name.localeCompare(b.novel.name));
    const booksMatched=new Set(matches.map(m=>m.novel.id)).size;
    host.replaceChildren(el('p','searchSummary',matches.length+' result'+(matches.length===1?'':'s')+' across '+booksMatched+' matching book'+(booksMatched===1?'':'s')));
    if(!matches.length)host.append(el('p','muted','No whole-word matches. Try another word or phrase.'));
    const groups=new Map();for(const result of matches.slice(0,200)){
      if(!groups.has(result.novel.id))groups.set(result.novel.id,[]);groups.get(result.novel.id).push(result);
    }
    for(const [id,results] of groups){
      const group=el('section','searchResultGroup');group.append(el('h3','',results[0].novel.name));
      for(const result of results){
        const button=el('button','searchHit');button.type='button';
        button.append(el('strong','',result.kind==='book'?result.novel.name:result.kind==='event'?result.event.title:result.kind==='novel-note'?'Novel note':result.profile.name));
        button.append(el('span','muted',result.match.label));
        const excerpt=el('span','searchExcerpt');
        const value=String(result.match.value||''),at=result.match.at;
        const start=Math.max(0,at-65),end=Math.min(value.length,at+text.length+100);
        excerpt.append(document.createTextNode(value.slice(start,at)));
        excerpt.append(el('mark','',value.slice(at,at+text.length)));
        excerpt.append(document.createTextNode(value.slice(at+text.length,end)));
        button.append(excerpt);
        button.onclick=async()=>{
          await chooseNovel(result.novel.id);
          if(result.kind==='book')return;
          if(result.kind==='character'){
            await chooseCharacter(result.profile.id);
            highlightSearchTarget(result.match,text);
          }else if(result.kind==='novel-note'){
            await showNovelNotes();focusNovelNote(result.note.id);
          }else{
            await showTimeline();openTimelineEventDialog(result.event.id);
            const fieldId={title:'eventTitleInput',notes:'eventNotesInput',dateText:'eventDateInput'}[result.match.key];
            const field=$(fieldId);if(field){const at=matchWholeWord(field.value,text);field.classList.add('searchTarget');field.focus();if(at>=0)field.setSelectionRange(at,at+text.length);setTimeout(()=>field.classList.remove('searchTarget'),6500);}
          }
        };
        group.append(button);
      }
      host.append(group);
    }
    if(matches.length>200)host.append(el('p','muted','Showing first 200 results. Narrow your search for more.'));
  }catch(e){if(token!==state.searchEpoch)return;host.replaceChildren(el('p','errorText','Search could not complete: '+e.message));}
}
/* v3.6: Upload-only book cover. The bitmap stays on the USB in its novel. */
function cleanCoverUrls(){for(const u of state.coverUrls||[])URL.revokeObjectURL(u);state.coverUrls=[];}
async function showBookCover(novel, frame){
  if(!novel.coverFile || !state.writerDir)return;
  try{
    const dir=await state.writerDir.getDirectoryHandle(novel.folder);
    const file=await(await dir.getFileHandle(novel.coverFile)).getFile();
    if(!frame.isConnected)return;
    const url=URL.createObjectURL(file);state.coverUrls.push(url);
    frame.replaceChildren();const img=el('img','uploadedBookImage');img.src=url;img.alt='';frame.append(img);
  }catch(e){console.warn('Could not load cover:',e);}
}
async function uploadBookCover(evt){
  const file=evt.target.files?.[0];evt.target.value='';if(!file||!state.novel)return;
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>10*1024*1024){toast('Choose a JPG, PNG, or WebP image under 10 MB.',true);return;}
  if(!(await flush()))return;
  const novel=state.novel,old=novel.coverFile;
  const next='cover.'+({'image/png':'png','image/jpeg':'jpg','image/webp':'webp'}[file.type]);
  try{
    await putFile(state.novelDir,next,file);
    const updated={...novel,coverFile:next};delete updated.folder;
    await putJSON(state.novelDir,'novel.json',updated);
    novel.coverFile=next;
    if(old && old!==next){try{await removeTrackedEntry(state.novelDir,old);}catch(e){toast('New cover saved, but old cover cleanup failed.',true);}}
    $('removeCoverBtn').disabled=false;toast('Book cover saved to USB.');
  }catch(e){toast('Cover upload failed: '+e.message,true);}
}
async function removeBookCover(){
  if(!state.novel?.coverFile)return;
  if(!confirm('Remove the uploaded book cover? The default cover will be shown again.'))return;
  const novel=state.novel,previous=novel.coverFile;
  const clean={...novel,coverFile:null};delete clean.folder;
  try{await putJSON(state.novelDir,'novel.json',clean);novel.coverFile=null;
    try{await removeTrackedEntry(state.novelDir,previous);}catch(e){toast('Cover hidden, but the old image could not be deleted: '+e.message,true);}
    $('removeCoverBtn').disabled=true;toast('Restored default book cover.');
  }catch(e){toast('Could not remove cover: '+e.message,true);}
}

/* v4.0 — Read-only manuscript reference copies.
   No document contents are uploaded; all parsing happens in this browser.
   DOCX is rendered as readable text/headings, PDF uses native browser viewer.
   The working source file is never modified by this feature. */
const MANUSCRIPT_MAX_BYTES = 64*1024*1024;
const DOCX_XML_MAX_BYTES = 24*1024*1024;
const READER_POS_KEY='cb-reader-position-v4:';
const manuscriptState={id:0,pdfUrl:null,format:null,chapters:[],chapterIndex:0,textSize:16,positionTimer:null,loadedFile:null};
function releaseManuscriptResources(){
  manuscriptState.id++;
  clearTimeout(manuscriptState.positionTimer);manuscriptState.positionTimer=null;
  if(manuscriptState.pdfUrl){URL.revokeObjectURL(manuscriptState.pdfUrl);manuscriptState.pdfUrl=null;}
  $('manuscriptPdfFrame').removeAttribute('src');
  manuscriptState.loadedFile=null;manuscriptState.chapters=[];manuscriptState.chapterIndex=0;
  resetMentions();
}
function readerPositionKey(){
  return READER_POS_KEY + (state.writer?.id||'writer')+':'+(state.novel?.id||'novel')+':'+(state.novel?.manuscriptFile||'none');
}
function storedReadingPosition(){
  try{const v=JSON.parse(localStorage.getItem(readerPositionKey())||'null');return v&&typeof v==='object'?v:null;}catch{return null;}
}
function rememberReadingPosition(value){
  try{localStorage.setItem(readerPositionKey(),JSON.stringify(value));}catch{}
}
function changeReaderFont(delta){
  manuscriptState.textSize=Math.max(12,Math.min(25,manuscriptState.textSize+delta));
  $('manuscriptText').style.fontSize=manuscriptState.textSize+'px';
  // Reader appearance stays per-tab; the manuscript itself is never modified.
}
function looksLikeChapter(para){
  const txt=para.text.trim();if(!txt||txt.length>115)return false;
  return para.heading || /^(?:chapter|part)\s+(?:[0-9]+|[ivxlcdm]+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)(?:\b|\s*[:—–-])/i.test(txt);
}
function paragraphsFromText(raw){
  return raw.replace(/\r\n?/g,'\n').split('\n').map(line=>({text:line,heading:false}));
}
async function paragraphsFromDOCX(file){
  if(typeof JSZip==='undefined')throw Error('The bundled Word document reader did not load. Refresh the website after updating all files.');
  const zip=await JSZip.loadAsync(await file.arrayBuffer(),{checkCRC32:true});
  const xmlFile=zip.file('word/document.xml');
  if(!xmlFile)throw Error('This DOCX does not contain word/document.xml.');
  if(xmlFile._data?.uncompressedSize>DOCX_XML_MAX_BYTES)throw Error('The DOCX document text is too large to open safely in this reader.');
  const text=await xmlFile.async('string');
  if(text.length>DOCX_XML_MAX_BYTES)throw Error('The DOCX content is too large to open safely.');
  const xml=new DOMParser().parseFromString(text,'application/xml');
  if(xml.querySelector('parsererror'))throw Error('The Word document XML is damaged.');
  const ns='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const paragraphs=[...xml.getElementsByTagNameNS(ns,'p')];
  const result=[];
  for(const para of paragraphs){
    const style=para.getElementsByTagNameNS(ns,'pStyle')[0];
    const styleName=style?.getAttributeNS(ns,'val')||style?.getAttribute('w:val')||'';
    const tokens=[];
    const iterator=xml.createTreeWalker(para,NodeFilter.SHOW_ELEMENT);
    let item;
    while((item=iterator.nextNode())){
      if(item.namespaceURI!==ns)continue;
      if(item.localName==='t')tokens.push(item.textContent);
      if(item.localName==='tab')tokens.push('\t');
      if(item.localName==='br'||item.localName==='cr')tokens.push('\n');
    }
    const content=tokens.join('');
    const heading=/^(heading[1-6]|title|subtitle)$/i.test(styleName);
    if(content.trim()||heading)result.push({text:content,heading});
  }
  if(!result.length)throw Error('No readable paragraphs were found. This DOCX may contain images or unsupported objects rather than document text.');
  return result;
}
function renderManuscriptParagraphs(paragraphs,restore=true){
  const host=$('manuscriptText'),toc=$('manuscriptChapters');host.replaceChildren();toc.replaceChildren();
  const chapters=[];
  const fragment=document.createDocumentFragment();
  paragraphs.forEach((item,i)=>{
    const content=item.text||'';
    if(!content.trim()&&!item.heading){
      // Blank text lines create breathing room, not editable input elements.
      fragment.append(el('div','manuscriptSpacer'));return;
    }
    const heading=looksLikeChapter(item);
    const block=el(heading?'h2':'p',heading?'manuscriptChapterTitle':'manuscriptParagraph',content);
    block.dataset.paragraphIndex=String(i);
    if(heading){block.id='manuscript-chapter-'+chapters.length;
      chapters.push({title:content.trim().slice(0,140),id:block.id});}
    fragment.append(block);
  });
  host.append(fragment);
  void initializeMentionNavigation(paragraphs);
  if(!chapters.length)chapters.push({title:'Full manuscript',id:null});
  manuscriptState.chapters=chapters;
  for(const [i,ch] of chapters.entries()){
    const b=el('button','manuscriptChapterButton',ch.title);b.type='button';b.dataset.chapter=String(i);
    b.onclick=()=>jumpManuscriptChapter(i);
    toc.append(b);
  }
  const saved=restore?storedReadingPosition():null;
  manuscriptState.textSize=Number.isFinite(saved?.fontSize)?Math.max(12,Math.min(25,saved.fontSize)):16;
  host.style.fontSize=manuscriptState.textSize+'px';
  const selected=Math.max(0,Math.min(chapters.length-1,saved?.chapter||0));
  manuscriptState.chapterIndex=selected;updateReaderChapterIndicator();
  requestAnimationFrame(()=>{
    if(!host.isConnected)return;
    if(saved && typeof saved.scrollTop==='number')host.scrollTop=saved.scrollTop;
  });
}
function updateReaderChapterIndicator(){
  const ch=manuscriptState.chapters[manuscriptState.chapterIndex];
  $('manuscriptChapterIndicator').textContent=ch?.title||'Reading view';
  $('manuscriptChapters').querySelectorAll('button').forEach((b,i)=>{
    b.classList.toggle('selected',i===manuscriptState.chapterIndex);
    if(i===manuscriptState.chapterIndex)b.setAttribute('aria-current','location');else b.removeAttribute('aria-current');
  });
}
function jumpManuscriptChapter(index){
  const chapter=manuscriptState.chapters[index];if(!chapter)return;
  manuscriptState.chapterIndex=index;
  const host=$('manuscriptText');
  if(chapter.id){const node=document.getElementById(chapter.id);if(node)host.scrollTop+=node.getBoundingClientRect().top-host.getBoundingClientRect().top-18;}
  else host.scrollTop=0;
  updateReaderChapterIndicator();
  rememberReadingPosition({scrollTop:host.scrollTop,chapter:index,fontSize:manuscriptState.textSize});
}
function onManuscriptScroll(){
  if($('manuscriptView').classList.contains('hidden') || manuscriptState.format==='pdf')return;
  clearTimeout(manuscriptState.positionTimer);
  manuscriptState.positionTimer=setTimeout(()=>{
    const host=$('manuscriptText');
    let index=0;
    for(let i=1;i<manuscriptState.chapters.length;i++){
      const node=document.getElementById(manuscriptState.chapters[i].id);
      if(node && node.getBoundingClientRect().top-host.getBoundingClientRect().top<=85)index=i;
    }
    manuscriptState.chapterIndex=index;updateReaderChapterIndicator();
    rememberReadingPosition({scrollTop:host.scrollTop,chapter:index,fontSize:manuscriptState.textSize});
  },230);
}
function jumpPdfPage(){
  if(!manuscriptState.pdfUrl)return;
  const page=Math.floor(Number($('manuscriptPdfPage').value));
  if(!Number.isFinite(page)||page<1||page>100000){toast('Enter a valid PDF page number.',true);return;}
  $('manuscriptPdfFrame').src=manuscriptState.pdfUrl+'#page='+page;
  rememberReadingPosition({page});
}
async function showManuscript(){
  if(!(await flush())){toast('Save your current character edits before opening the manuscript.',true);return;}
  if(!state.novel || !state.novelDir){await showBookshelf();return;}
  hideMainViews();cleanGalleryUrls();
  $('manuscriptView').classList.remove('hidden');
  $('manuscriptTitle').textContent=state.novel.name+' · Manuscript';
  $('manuscriptDescription').textContent='A read-only reference copy, separate from your working draft.';
  $('manuscriptEmpty').classList.toggle('hidden',!!state.novel.manuscriptFile);
  $('manuscriptReady').classList.toggle('hidden',!state.novel.manuscriptFile);
  $('manuscriptImportLabel').textContent=state.novel.manuscriptFile?'↻ Replace manuscript':'↑ Import manuscript';
  $('manuscriptRemoveBtn').classList.toggle('hidden',!state.novel.manuscriptFile);
  setActiveSidebarNavigation('');setWorkspaceView('manuscript');
  releaseManuscriptResources();
  if(!state.novel.manuscriptFile)return;
  const request=++manuscriptState.id;
  try{
    $('manuscriptReaderStatus').textContent='Opening manuscript from your selected folder…';
    const file=await (await state.novelDir.getFileHandle(state.novel.manuscriptFile)).getFile();
    if(request!==manuscriptState.id || $('manuscriptView').classList.contains('hidden'))return;
    if(file.size>MANUSCRIPT_MAX_BYTES)throw Error('This manuscript is larger than the 64 MiB reader limit.');
    const ext=state.novel.manuscriptFile.split('.').pop().toLowerCase();
    manuscriptState.format=ext;manuscriptState.loadedFile=file;
    $('manuscriptFileName').textContent=state.novel.manuscriptOriginalName||file.name;
    $('manuscriptFileDetails').textContent=(file.size/1024/1024).toFixed(2)+' MiB · '+ext.toUpperCase();
    $('manuscriptPdfLayout').classList.toggle('hidden',ext!=='pdf');
    $('manuscriptTextLayout').classList.toggle('hidden',ext==='pdf');
    if(ext==='pdf'){
      const url=URL.createObjectURL(new Blob([file],{type:'application/pdf'}));
      manuscriptState.pdfUrl=url;
      const saved=storedReadingPosition();
      const page=Number.isInteger(saved?.page)&&saved.page>0?saved.page:1;
      $('manuscriptPdfPage').value=String(page);
      $('manuscriptPdfFrame').src=url+'#page='+page;
      $('manuscriptReaderStatus').textContent='PDF rendered by your browser. Use its built-in bookmark and page navigation.';
      indicatePdfMentionLimit();
    }else{
      const paragraphs=ext==='docx'?await paragraphsFromDOCX(file):paragraphsFromText(await file.text());
      if(request!==manuscriptState.id)return;
      renderManuscriptParagraphs(paragraphs);
      $('manuscriptReaderStatus').textContent=ext==='docx'?'Word document shown as readable text. Complex formatting and embedded images may not appear.':'Plain-text manuscript loaded.';
    }
  }catch(error){
    if(request!==manuscriptState.id)return;
    $('manuscriptReady').classList.remove('hidden');
    $('manuscriptPdfLayout').classList.add('hidden');$('manuscriptTextLayout').classList.add('hidden');
    $('manuscriptReaderStatus').textContent='Could not open this manuscript: '+error.message;
    toast('Manuscript reader: '+error.message,true);
  }
}
async function removePriorManuscriptIfUnchanged(filename, expectedChecksum=null){
  const handle=await state.novelDir.getFileHandle(filename);
  const path=await recoveryPath(handle);
  const baseline=path!==null?memoryRecovery.files.get(path):null;
  const current=new Uint8Array(await (await handle.getFile()).arrayBuffer());
  const matched=expectedChecksum ? await manuscriptChecksum(current)===expectedChecksum : !!baseline&&sameBytes(current,baseline);
  if(!matched){toast('Old manuscript copy kept for safety because no matching original checksum is available.',true);return;}
  await removeTrackedEntry(state.novelDir,filename);
}
async function manuscriptChecksum(bytes){
  if(!crypto?.subtle)throw Error('Secure browser cryptography is needed to verify manuscript copies.');
  const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',bytes));
  return [...digest].map(b=>b.toString(16).padStart(2,'0')).join('');
}
async function importManuscript(evt){
  const file=evt.target.files?.[0];evt.target.value='';if(!file || !state.novel || !state.novelDir)return;
  const name=file.name||'manuscript';const ext=name.split('.').pop().toLowerCase();
  if(!['docx','pdf','txt'].includes(ext)){toast('Use a DOCX, PDF, or TXT manuscript.',true);return;}
  if(file.size===0||file.size>MANUSCRIPT_MAX_BYTES){toast('Choose a nonempty manuscript no larger than 64 MiB.',true);return;}
  const previous=state.novel.manuscriptFile||null, previousChecksum=state.novel.manuscriptChecksum||null;
  if(previous&&!confirm('Replace the imported manuscript reference copy for '+state.novel.name+'? Your working source document will not be changed.'))return;
  let created=null;
  try{
    if(!(await flush()))throw Error('Save any pending changes before importing.');
    if(ext==='pdf'){
      const header=new Uint8Array(await file.slice(0,5).arrayBuffer());
      if(new TextDecoder().decode(header)!=='%PDF-')throw Error('This file does not appear to be a valid PDF.');
    }
    if(ext==='docx'){
      // Validate before writing: the copy must be readable by our bundled parser.
      await paragraphsFromDOCX(file);
    }
    const timestamp=Date.now().toString(36),identifier=randomId().slice(0,8);
    created='manuscript-'+timestamp+'-'+identifier+'.'+ext;
    $('manuscriptReaderStatus').textContent='Saving manuscript copy…';
    const manuscriptBytes=new Uint8Array(await file.arrayBuffer());
    const checksum=await manuscriptChecksum(manuscriptBytes);
    await putFile(state.novelDir,created,manuscriptBytes);
    // Store metadata only after the new file has passed read-back verification.
    const updated={...state.novel,manuscriptFile:created,manuscriptOriginalName:name,manuscriptChecksum:checksum,manuscriptImportedAt:dateNow()};
    delete updated.folder;
    await putJSON(state.novelDir,'novel.json',updated);
    state.novel.manuscriptFile=created;state.novel.manuscriptOriginalName=name;state.novel.manuscriptChecksum=checksum;state.novel.manuscriptImportedAt=updated.manuscriptImportedAt;
    const entry=state.novels.find(n=>n.id===state.novel.id);
    if(entry)Object.assign(entry,{manuscriptFile:created,manuscriptOriginalName:name,manuscriptChecksum:checksum,manuscriptImportedAt:updated.manuscriptImportedAt});
    if(previous&&previous!==created){
      try{await removePriorManuscriptIfUnchanged(previous,previousChecksum);}catch(e){toast('Updated manuscript saved, but the previous copy could not be removed. '+e.message,true);}
    }
    toast('Read-only manuscript copy imported. The original file was not changed.');
    await showManuscript();
  }catch(error){
    toast('Could not import manuscript: '+error.message,true);
    // Do not alter the existing metadata or manuscript. A newly written but
    // unreferenced file can be removed only after checking that metadata did not change.
    if(created && state.novel?.manuscriptFile!==created){
      // If metadata was written but verification failed, never delete the
      // referenced manuscript and leave a broken novel.json behind.
      try{
        const onDisk=await readJSON(await state.novelDir.getFileHandle('novel.json'));
        if(onDisk.manuscriptFile!==created)await removeTrackedEntry(state.novelDir,created);
      }catch{/* Keep an uncertain file intact until storage can be inspected. */}
    }
  }
}
async function removeManuscript(){
  if(!state.novel?.manuscriptFile || !confirm('Remove this novel’s imported manuscript copy? Your original working document will not be touched.'))return;
  const previous=state.novel.manuscriptFile,previousChecksum=state.novel.manuscriptChecksum||null;
  try{
    if(!(await flush()))throw Error('Save pending changes first.');
    const updated={...state.novel};delete updated.folder;
    delete updated.manuscriptFile;delete updated.manuscriptOriginalName;delete updated.manuscriptChecksum;delete updated.manuscriptImportedAt;
    await putJSON(state.novelDir,'novel.json',updated);
    for(const field of ['manuscriptFile','manuscriptOriginalName','manuscriptChecksum','manuscriptImportedAt']){
      delete state.novel[field];
      const record=state.novels.find(n=>n.id===state.novel.id);if(record)delete record[field];
    }
    try{await removePriorManuscriptIfUnchanged(previous,previousChecksum);}catch(error){toast('Reference removed, but the old file remains on the drive: '+error.message,true);}
    releaseManuscriptResources();await showManuscript();
    toast('Imported manuscript removed. Your source document was not affected.');
  }catch(error){toast('Could not remove imported manuscript: '+error.message,true);}
}

/* v3.6: complete tree export, including offscreen manually arranged nodes. */
function exportTreeSVG(){
  const connections=treeConnections(),positions=treePositions(connections);
  const w=Math.max(940,...Object.values(positions).map(p=>Math.ceil(p.x+240)));
  const nodeHeight=Math.max(340,...Object.values(positions).map(p=>Math.ceil(p.y+150)));
  const h=nodeHeight+(connections.length?85+connections.length*25:40);
  const lines=connections.map(edge=>{
    const a=positions[edge.from],b=positions[edge.to];if(!a||!b)return '';
    const x1=a.x+90,y1=a.y+48,x2=b.x+90,y2=b.y+48;
    return `<path d="M${x1} ${y1} C${(x1+x2)/2} ${y1},${(x1+x2)/2} ${y2},${x2} ${y2}" stroke="${treeColor(edge.type)}" stroke-width="3.5" fill="none"/>`;
  }).join('');
  const nodes=state.characters.map(c=>{
    const p=positions[c.id];if(!p)return '';
    return `<g transform="translate(${p.x} ${p.y})"><rect width="180" height="96" rx="12" fill="#20364e" stroke="#7d9fc7" stroke-width="2"/><text x="14" y="35" fill="#f7faff" font-size="15" font-family="Arial,sans-serif" font-weight="bold">${safeXml(c.name.slice(0,65))}</text><text x="14" y="62" fill="#b8cee5" font-size="12" font-family="Arial,sans-serif">${safeXml((c.story?.role||'Character').slice(0,65))}</text></g>`;
  }).join('');
  const legend=connections.length?
    `<line x1="22" x2="${w-22}" y1="${nodeHeight+8}" y2="${nodeHeight+8}" stroke="#547394" stroke-width="1"/><text x="24" y="${nodeHeight+33}" fill="#e3f0ff" font-family="Arial,sans-serif" font-size="17" font-weight="bold">Relationships</text>`+
    connections.map((edge,i)=>{
      const a=state.characters.find(c=>c.id===edge.from),b=state.characters.find(c=>c.id===edge.to);
      return `<text x="25" y="${nodeHeight+58+i*25}" fill="${treeColor(edge.type)}" font-family="Arial,sans-serif" font-size="14">${safeXml((a?.name||'?')+' — '+treeTypeName(edge.type)+' — '+(b?.name||'?'))}</text>`;
    }).join(''):'';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="#101a28"/>${lines}${nodes}${legend}</svg>`;
}
async function treePNGBlob(){
  const svg=exportTreeSVG(),url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
  try{
    const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('Image could not be rendered'));img.src=url;});
    const scale=Math.min(2,8192/Math.max(img.width,img.height));
    const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));
    canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    if(!blob)throw Error('PNG encoder failed');return blob;
  }finally{URL.revokeObjectURL(url);}
}
async function exportTreePNG(){
  if(!state.novel||!(await flush()))return;
  try{const blob=await treePNGBlob();downloadBlob(blob,folderSafe(state.novel.name)+'-character-tree.png');toast('Full character tree exported as PNG.');}
  catch(e){toast('Tree export failed: '+e.message,true);}
}
async function exportTreePDF(){
  if(!state.novel)return;
  const popup=window.open('','_blank');
  if(!popup){toast('Allow popups for the printable PDF.',true);return;}
  popup.document.write('<p style="font-family:sans-serif;padding:30px">Preparing your tree…</p>');
  try{
    if(!(await flush()))throw Error('Save changes first.');
    const png=await treePNGBlob();const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(png);});
    popup.document.open();popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${safeHtml(state.novel.name)} — Character Tree</title><style>@page{size:landscape;margin:.4in}body{font:14px Arial;color:#243346}h1{font-size:19px;margin:0 0 10px}img{display:block;max-width:100%;max-height:85vh;object-fit:contain;margin:auto}@media print{button{display:none}}</style></head><body><h1>${safeHtml(state.novel.name)} — Character Tree</h1><button onclick="window.print()">Print / Save as PDF</button><img src="${data}" alt="Character tree"></body></html>`);popup.document.close();
    popup.focus();toast('Tree print view opened. Choose Save as PDF in the print dialog.');
  }catch(e){popup.close();toast('Tree PDF failed: '+e.message,true);}
}

/* Character export tools. No external libraries or network APIs.
   PDF uses the browser's Print > Save as PDF. Word is a genuine .docx ZIP package. */
function safeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function safeXml(value) {
  return String(value ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
}
function exportCollection(scope) {
  if (scope === 'novel') return [...state.characters].sort((a,b) => a.name.localeCompare(b.name));
  return state.active ? [state.active] : [];
}
function exportLabel(scope) {
  return scope === 'novel' ? (state.novel?.name || 'Novel') + ' - Character Collection' : (state.active?.name || 'Character');
}
function exportSections(character) {
  return sections.map(section => {
    const data = character[section.key] || {};
    const entries = characterSectionFields(section,character).map(([key,label]) => ({label, value: String(data[key] ?? '').trim()}));
    if(section.key==='basic' && Array.isArray(character.tags) && character.tags.length)entries.push({label:'Tags',value:character.tags.join(', ')});
    if (section.key === 'relationships') {
      for (const link of relatedCharacters(character)) {
        const target = state.characters.find(c => c.id === link.id);
        if (!target) continue;
        entries.push({label:'Linked character',value: target.name + (link.incoming ? ' (linked from their profile)' : '') + (link.type ? ' — ' + treeTypeName(link.type) : '')});
        if (link.notes?.trim()) entries.push({label:'Relationship notes about '+target.name,value:link.notes.trim()});
      }
    }
    if (data.notes?.trim()) entries.push({label: section.key === 'freeform' ? 'Notes' : 'Additional notes',value:data.notes.trim()});
    return {title:section.title, entries};
  });
}
async function portraitAsPNG(character) {
  if (!character.portraitFile || !state.portraitsDir) return null;
  try {
    const file = await (await state.portraitsDir.getFileHandle(character.portraitFile)).getFile();
    const bitmap = await createImageBitmap(file);
    try {
      const max = 480;
      const ratio = Math.min(1, max / Math.max(bitmap.width,bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1,Math.round(bitmap.width*ratio));
      canvas.height = Math.max(1,Math.round(bitmap.height*ratio));
      canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);
      const png = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!png) return null;
      return new Uint8Array(await png.arrayBuffer());
    } finally { bitmap.close(); }
  } catch (error) {
    console.warn('Portrait could not be included in export:', error);
    return null;
  }
}
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 20000);
}
async function exportPdf(scope) {
  if (!state.novel) return;
  // Open synchronously in the click handler's activation window to avoid popup blocking.
  const popup = window.open('', '_blank');
  if (!popup) { toast('Please allow pop-ups for this site to export a PDF.', true); return; }
  popup.document.write('<!doctype html><title>Preparing character export...</title><p style="font-family:sans-serif;padding:32px">Preparing printable character sheets...</p>');
  try {
    if (!(await flush())) throw new Error('Save the current character before exporting.');
    const items = exportCollection(scope);
    if (!items.length) throw new Error('No characters to export.');
    const portraitUrls = [];
    const pages = [];
    for (const character of items) {
      const png = await portraitAsPNG(character);
      const blob = png ? new Blob([png],{type:'image/png'}) : null;
      const portrait = blob ? await new Promise(resolve => {
        const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = () => resolve(null); r.readAsDataURL(blob);
      }) : null;
      if (portrait) portraitUrls.push(portrait);
      const parts = [];
      for (const section of exportSections(character)) {
        const rows = section.entries.filter(r => r.value).map(r => `<div class="field"><div class="key">${safeHtml(r.label)}</div><div class="value">${safeHtml(r.value).replace(/\r?\n/g,'<br>')}</div></div>`).join('');
        parts.push(`<section><h2>${safeHtml(section.title)}</h2>${rows || '<p class="empty">Not yet documented.</p>'}</section>`);
      }
      pages.push(`<article class="person"><header><div><div class="kicker">CHARACTER BOOKSHELF · ${safeHtml(state.novel.name)}</div><h1>${safeHtml(character.name)}</h1><p>Character profile</p></div>${portrait?`<img src="${portrait}" alt="">`:''}</header>${parts.join('')}</article>`);
    }
    const title = safeHtml(exportLabel(scope));
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>
      @page{size:letter;margin:0.72in}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#202b38;background:#fff;margin:0}
      .person{page-break-after:always;break-after:page}.person:last-child{page-break-after:auto;break-after:auto}
      header{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;border-bottom:3px solid #344d6f;padding-bottom:18px;margin-bottom:22px}
      header img{width:105px;max-height:145px;object-fit:cover;border:1px solid #bac8d7;border-radius:5px}
      h1{font-size:29px;margin:6px 0 8px}header p{color:#637085;margin:0}.kicker{letter-spacing:1.6px;font-size:10px;color:#59779c;font-weight:700}
      section{break-inside:avoid;margin:0 0 22px}section h2{font-size:14px;color:#29466a;border-bottom:1px solid #cad4df;padding-bottom:6px;margin:0 0 12px}
      .field{margin:0 0 10px;break-inside:avoid}.key{font-size:10px;font-weight:bold;color:#536479;text-transform:uppercase;letter-spacing:.4px;margin-bottom:3px}
      .value{font-size:12px;line-height:1.55;overflow-wrap:anywhere;white-space:normal}.empty{color:#8793a2;font-size:11px;font-style:italic}
      @media screen{body{background:#e9eef4;padding:30px}.person{max-width:850px;margin:0 auto 25px;background:#fff;padding:55px;box-shadow:0 8px 35px #192b3e2b}}
      </style></head><body>${pages.join('')}<script>window.addEventListener('load',()=>setTimeout(()=>window.print(),500));</script></body></html>`;
    popup.document.open(); popup.document.write(html); popup.document.close();
    toast('Print window opened. Choose “Save as PDF” as the destination.');
  } catch(error) {
    popup.document.open(); popup.document.write('<p style="font-family:Arial;padding:24px">Export could not complete: '+safeHtml(error.message)+'</p>'); popup.document.close();
    toast('PDF export failed: ' + error.message, true);
  }
}

/* Minimal ZIP writer (STORE method) for standalone DOCX exports. */
const utf8 = new TextEncoder();
function crc32(bytes) {
  let crc = -1;
  for (const byte of bytes) {
    crc ^= byte;
    for (let k=0;k<8;k++) crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
  }
  return (crc ^ -1) >>> 0;
}
function zipBytes(files) {
  const parts = [], central = [];
  let offset = 0;
  const u16 = (view,off,n)=>view.setUint16(off,n,true);
  const u32 = (view,off,n)=>view.setUint32(off,n>>>0,true);
  for (const [name,raw] of files) {
    const filename = utf8.encode(name);
    const data = typeof raw === 'string' ? utf8.encode(raw) : raw;
    const crc = crc32(data);
    const local = new Uint8Array(30+filename.length);
    const a = new DataView(local.buffer);
    u32(a,0,0x04034b50);u16(a,4,20);u16(a,6,0x0800);u16(a,8,0);u32(a,14,crc);u32(a,18,data.length);u32(a,22,data.length);u16(a,26,filename.length);
    local.set(filename,30);
    parts.push(local,data);
    const cd = new Uint8Array(46+filename.length);
    const v = new DataView(cd.buffer);
    u32(v,0,0x02014b50);u16(v,4,20);u16(v,6,20);u16(v,8,0x0800);u16(v,10,0);
    u32(v,16,crc);u32(v,20,data.length);u32(v,24,data.length);u16(v,28,filename.length);
    u32(v,42,offset);cd.set(filename,46);
    central.push(cd);offset += local.length+data.length;
  }
  const centralLen = central.reduce((n,part)=>n+part.length,0);
  const end = new Uint8Array(22), d = new DataView(end.buffer);
  u32(d,0,0x06054b50);u16(d,8,files.length);u16(d,10,files.length);u32(d,12,centralLen);u32(d,16,offset);
  return new Blob([...parts,...central,end],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
}
function wordRun(value,bold=false){
  const lines = String(value ?? '').split(/\r?\n/);
  return lines.map((line,i)=>`${i?'<w:br/>':''}<w:t xml:space="preserve">${safeXml(line)}</w:t>`).join('').replace(/^/,bold?'<w:r><w:rPr><w:b/></w:rPr>':'<w:r>')+'</w:r>';
}
function wordParagraph(value,style='') {
  const ppr = style ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>` : '';
  return `<w:p>${ppr}${wordRun(value)}</w:p>`;
}
function wordImage(rid,id) {
  return `<w:p><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="1500000" cy="1500000"/><wp:docPr id="${id}" name="Character portrait"/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="0" name="Portrait.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="1500000" cy="1500000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
}
async function exportDocx(scope) {
  try {
    if (!(await flush())) throw new Error('Save the current character before exporting.');
    const characters = exportCollection(scope);
    if (!characters.length) throw new Error('No characters to export.');
    toast('Preparing Word document…');
    const files = [];
    const imageRels = [];
    const paragraphs = scope === 'novel' ?
      [wordParagraph(exportLabel(scope), 'Title'), wordParagraph((state.writer?.name || '') + ' · Character Bookshelf', 'Subtitle')] :
      [wordParagraph((state.novel?.name || '') + ' · Character Bookshelf', 'Subtitle')];
    let imageId = 1;
    for (let i=0; i<characters.length; i++) {
      const character = characters[i];
      if (i) paragraphs.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
      paragraphs.push(wordParagraph(character.name,'Title'));
      const png = await portraitAsPNG(character);
      if (png) {
        const id='rIdPortrait'+(imageId);
        files.push(['word/media/portrait'+imageId+'.png',png]);
        imageRels.push(`<Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/portrait${imageId}.png"/>`);
        paragraphs.push(wordImage(id,imageId));
        imageId++;
      }
      for (const section of exportSections(character)) {
        paragraphs.push(wordParagraph(section.title,'Heading1'));
        const entries = section.entries.filter(r=>r.value);
        if (!entries.length) { paragraphs.push(wordParagraph('Not yet documented.')); continue; }
        for (const field of entries) {
          paragraphs.push(`<w:p>${wordRun(field.label+': ',true)}${wordRun(field.value)}</w:p>`);
        }
      }
    }
    const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>${paragraphs.join('')}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1000" w:right="1100" w:bottom="1000" w:left="1100"/></w:sectPr></w:body></w:document>`;
    files.push(['[Content_Types].xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`]);
    files.push(['_rels/.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>']);
    files.push(['word/document.xml',xml]);
    files.push(['word/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:style w:type="paragraph" w:styleId="Normal" w:default="1"><w:name w:val="Normal"/><w:pPr><w:spacing w:after="110" w:line="270" w:lineRule="auto"/></w:pPr><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:sz w:val="21"/><w:color w:val="263342"/></w:rPr></w:style>
      <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="120" w:after="210"/></w:pPr><w:rPr><w:b/><w:sz w:val="38"/><w:color w:val="233F5E"/></w:rPr></w:style>
      <w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="170"/></w:pPr><w:rPr><w:sz w:val="18"/><w:color w:val="687B91"/></w:rPr></w:style>
      <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="280" w:after="95"/><w:keepNext/></w:pPr><w:rPr><w:b/><w:sz w:val="25"/><w:color w:val="2F5279"/></w:rPr></w:style>
      </w:styles>`]);
    files.push(['word/_rels/document.xml.rels',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>${imageRels.join('')}</Relationships>`]);
    const blob = zipBytes(files);
    downloadBlob(blob,folderSafe(exportLabel(scope))+'.docx');
    toast('Word document exported.');
  } catch (error) { toast('Word export failed: ' + error.message,true); }
}

/* v3.7 — USB character update import. These modal editors stage changes in
   memory and never touch an existing file until the user explicitly saves. */
let pendingImport = null;
const IMPORT_MAX_BYTES = 1024 * 1024;
const IMPORT_FIELDS = [
  ['basic','Basic Information', [['fullName','Full name'],['age','Age / ages'],['aliases','Aliases & nicknames (comma-separated)',true],['occupation','Occupation'],['appearance','Physical appearance'],['notes','Additional notes']]],
  ['personality','Personality', [['traits','Personality traits'],['fears','Fears'],['beliefs','Beliefs'],['motivations','Motivations'],['lie','The Lie'],['truth','The Truth'],['want','The Want'],['need','The Need'],['notes','Additional notes']]],
  ['background','Background', [['history','Personal history'],['experiences','Significant experiences'],['formativeExperience','Formative experience'],['startingCircumstances','Starting circumstances'],['notes','Additional notes']]],
  ['relationships','Relationships', [['notes','Relationship notes']]],
  ['story','Story Information', [['role','Role in story'],['timeline','Timeline'],['events','Important events'],['arcType','Character arc type'],['notes','Additional notes']]],
  ['freeform','Freeform Notes', [['notes','Notes']]]
];
const importFieldsArePlainObject = val => val !== null && typeof val === 'object' && !Array.isArray(val);
function importScalar(value, field) {
  if (typeof value === 'string') return value.slice(0, 100000);
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (value === null || value === undefined) return '';
  throw new Error('The imported field “' + field + '” must contain text, not an array or object.');
}
function normalizeCharacterImport(raw) {
  if (!importFieldsArePlainObject(raw)) throw new Error('The JSON must contain a character update object.');
  if (raw.format && raw.format !== 'character-bookshelf-update') {
    throw new Error('This file uses an unknown import format.');
  }
  if (raw.format && raw.version !== 1) throw new Error('Unsupported character update version.');
  const entity = importFieldsArePlainObject(raw.character) ? raw.character :
    importFieldsArePlainObject(raw.profile) ? raw.profile : raw;
  const info = importFieldsArePlainObject(raw.sections) ? raw.sections :
    importFieldsArePlainObject(entity.sections) ? entity.sections : entity;
  const name = cleanName(entity.name || info.basic?.fullName || raw.name).slice(0,100);
  if (!name) throw new Error('The imported character needs a name.');
  const incomingId = typeof entity.id === 'string' && entity.id.length < 160 ? entity.id : null;
  const fields = {};
  let fieldCount = 0;
  for (const [section, , keys] of IMPORT_FIELDS) {
    fields[section] = {};
    const source = info[section];
    if (source === undefined) continue;
    if (!importFieldsArePlainObject(source)) throw new Error('The “'+section+'” section must be an object.');
    for (const [key] of keys) {
      if (!Object.hasOwn(source,key)) continue;
      fields[section][key] = importScalar(source[key],section+'.'+key);
      fieldCount++;
    }
  }
  // A name is always provided. In updates, only explicitly present fields
  // are offered to the user, so missing properties never mean “delete”.
  if (!Object.hasOwn(fields.basic,'fullName') && !fieldCount) fields.basic.fullName = name;
  return {name,id:incomingId,fields,sourceIsComplete:raw.schema===1,warning:raw.relationships?.links?.length || entity.relationships?.links?.length ? 'Imported character ID links are not copied. Manage linked relationships in Character Tree.' : ''};
}
function importLookupName(name) {return cleanName(name).toLocaleLowerCase().replace(/\s+/g,' ');}
function importEditDistance(a,b) {
  if (Math.abs(a.length-b.length)>2) return 3;
  const previous=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++) {
    const row=[i];for(let j=1;j<=b.length;j++)
      row[j]=Math.min(previous[j]+1,row[j-1]+1,previous[j-1]+(a[i-1]===b[j-1]?0:1));
    for(let j=0;j<row.length;j++) previous[j]=row[j];
  }
  return previous[b.length];
}
function importNearMatch(left,right) {
  const a=importLookupName(left),b=importLookupName(right);
  if (!a || !b) return false;
  if (a===b) return true;
  // Flag close names for human review, not as proof of identity.
  if (a.length>=5 && b.length>=5 && (a.includes(b) || b.includes(a) || importEditDistance(a,b)<=2)) return true;
  const aa=a.split(' '), bb=b.split(' ');
  return aa.length>1 && bb.length>1 && aa[0]===bb[0] && aa[aa.length-1]===bb[bb.length-1];
}
function clearPendingImport() { pendingImport=null; }
function openImportPicker() {
  if (!state.novel || !state.charsDir) {toast('Choose a novel first.',true);return;}
  if (hasUnsaved() || !!state.saving || treeUnsaved() || !!state.treeSaving) {
    toast('Finish saving before opening an import. Try again after Saved to folder.',true);
    void flush();return;
  }
  // Keep the file picker inside the direct click gesture. Awaiting file writes
  // first can lose browser user activation and silently block the chooser.
  $('characterImportFile').value='';
  $('characterImportFile').click();
}
async function importCharacterFile(event) {
  const file = event.target.files?.[0];event.target.value='';
  if (!file) return;
  if (!state.novel) {toast('Select a novel first.',true);return;}
  if (file.size>IMPORT_MAX_BYTES) {toast('Import file must be under 1 MB.',true);return;}
  if (!/\.json$/i.test(file.name)) {toast('Choose a .json character update file.',true);return;}
  try {
    if (!(await flush())) return;
    const data=JSON.parse(await file.text());
    const parsed=normalizeCharacterImport(data);
    pendingImport={parsed,novelId:state.novel.id,writerId:state.writer.id};
    const matchedById=parsed.id ? state.characters.find(c=>c.id===parsed.id) : null;
    const matchedByName=state.characters.filter(c=>importLookupName(c.name)===importLookupName(parsed.name));
    if (matchedById && matchedByName.length && !matchedByName.includes(matchedById)) {
      showImportMatches([matchedById,...matchedByName]);return;
    }
    if (matchedById || matchedByName.length===1) {
      await openImportCompare(matchedById||matchedByName[0]);return;
    }
    if (matchedByName.length>1) {showImportMatches(matchedByName);return;}
    const similar=state.characters.filter(c=>importNearMatch(c.name,parsed.name));
    if (similar.length) showImportMatches(similar);
    else openImportedNewEditor();
  } catch(error) {clearPendingImport();toast('Import could not be opened: '+error.message,true);}
}
function showImportMatches(candidates) {
  if (!pendingImport) return;
  const host=$('importMatchList');host.replaceChildren();
  $('importMatchDescription').textContent='“'+pendingImport.parsed.name+'” may already exist in '+state.novel.name+'. Choose a character to compare, or intentionally create a new one.';
  for(const candidate of candidates) {
    const button=el('button','importMatchOption');button.type='button';button.textContent='Compare with '+candidate.name;
    button.onclick=()=>{$('importMatchDialog').close();void openImportCompare(candidate);};host.append(button);
  }
  $('importMatchDialog').showModal();
}
function importDraftFromCharacter(character) {
  const result=diskProfile(character);
  for (const [section,,keys] of IMPORT_FIELDS) {
    result[section] ??= {};
    for (const [key] of keys) result[section][key]=String(result[section][key] ?? '');
  }
  return result;
}
function addImportFieldGrid(host,model,proposal,editable=true) {
  for (const [section,title,keys] of IMPORT_FIELDS) {
    const proposalCount=editable ? keys.filter(([key])=>proposal?.[section] && Object.hasOwn(proposal[section],key)).length : 0;
    const group=el('details','importSection');group.open=editable ? proposalCount>0 : true;
    const summary=el('summary');summary.textContent=title+(editable ? ' · '+(proposalCount ? proposalCount+' proposed field'+(proposalCount>1?'s':'') : 'no proposed fields') : '');group.append(summary);
    const content=el('div','importSectionBody');
    const orderedKeys=editable ? [...keys.filter(([key])=>proposal?.[section] && Object.hasOwn(proposal[section],key)),...keys.filter(([key])=>!(proposal?.[section] && Object.hasOwn(proposal[section],key)))] : keys;
    for (const [key,label] of orderedKeys) {
      const row=el('div',editable?'importFieldPair':'importFieldSingle');
      const existing=el('label','importFieldCell');
      existing.append(el('span','importFieldName',label));
      const input=el(key==='fullName'||key==='age'||key==='occupation'||key==='role'?'input':'textarea','importExistingInput');
      if (input.tagName==='TEXTAREA') input.rows=3;
      input.value=model[section]?.[key] ?? '';
      input.addEventListener('input',()=>{
        model[section] ??= {};model[section][key]=input.value;
        if (section==='basic' && key==='fullName') model.name=input.value;
      });
      existing.append(input);row.append(existing);
      if (editable) {
        const proposed=el('div','importFieldCell');
        proposed.append(el('span','importFieldName','Proposed '+label));
        const value=proposal?.[section] && Object.hasOwn(proposal[section],key) ? proposal[section][key] : null;
        const reader=el('textarea','importProposedInput');reader.readOnly=true;reader.rows=3;
        if (value===null){reader.placeholder='No proposed change';reader.value='';}
        else {reader.value=value;reader.dataset.proposed='true';}
        const copy=el('button','quiet importCopy','Copy proposed');copy.type='button';copy.disabled=value===null;
        copy.onclick=async()=>{
          reader.focus();reader.select();
          try{await navigator.clipboard.writeText(value);toast('Copied '+label+' to clipboard.');}
          catch{toast('Select the proposed text and use Ctrl+C to copy.');}
        };
        proposed.append(reader,copy);row.append(proposed);
      }
      content.append(row);
    }
    group.append(content);host.append(group);
  }
}
async function openImportCompare(character) {
  if (!pendingImport || !state.characters.some(c=>c.id===character.id)) return;
  try {
    if (!(await flush()))return;
    const disk=await readJSON(character._handle);
    if (disk.id!==character.id) throw new Error('Character file ID differs from the loaded profile.');
    const draft=importDraftFromCharacter(character);
    pendingImport.mode='compare';pendingImport.targetId=character.id;
    pendingImport.baseline=JSON.stringify(disk);pendingImport.draft=draft;
    $('importCompareTitle').textContent='Compare: '+character.name;
    const idWarning = pendingImport.parsed.id && pendingImport.parsed.id!==character.id ? ' IDs differ; matched by name. Verify the character before saving. ' :
      pendingImport.parsed.id === character.id && importLookupName(pendingImport.parsed.name)!==importLookupName(character.name) ? ' Names differ; matched by ID. Verify the character before saving. ' : '';
    $('importCompareHint').textContent='Left: make your edits. Right: reference or copy what you want. Nothing changes on USB until Save. '+idWarning+pendingImport.parsed.warning;
    const host=$('importComparisonFields');host.replaceChildren();addImportFieldGrid(host,draft,pendingImport.parsed.fields,true);
    $('importCompareStatus').textContent='Review first. Nothing has been saved.';
    $('importCompareDialog').showModal();
  }catch(error){toast('Cannot review imported profile: '+error.message,true);}
}
function openImportedNewEditor() {
  if (!pendingImport) return;
  pendingImport.mode='new';
  const parsed=pendingImport.parsed,draft=blankCharacter(parsed.name);
  // An imported legacy profile must keep its older prompts visible after saving.
  if(['beliefs','motivations'].some(k=>Object.hasOwn(parsed.fields.personality||{},k)) || Object.hasOwn(parsed.fields.background||{},'experiences'))draft.developmentPrompts=1;
  for (const [section,,keys] of IMPORT_FIELDS) for(const [key] of keys) {
    if (Object.hasOwn(parsed.fields[section]||{},key)) draft[section][key]=parsed.fields[section][key];
  }
  // New imports always receive a new ID; relationship UUIDs from other books
  // cannot be trusted. Editor keeps the profile in memory until Save.
  pendingImport.draft=draft;
  $('importNewTitle').textContent='New Character: '+parsed.name;
  const host=$('importNewFields');host.replaceChildren();addImportFieldGrid(host,draft,null,false);
  $('importNewStatus').textContent='Nothing has been written to the USB yet. '+parsed.warning;
  $('importNewDialog').showModal();
}
function importContextIsCurrent() {
  return pendingImport && state.writer?.id===pendingImport.writerId && state.novel?.id===pendingImport.novelId;
}
async function saveImportedExisting() {
  if (!importContextIsCurrent() || pendingImport.mode!=='compare') return;
  const button=$('importCompareSave');button.disabled=true;
  try {
    if (!(await flush())) throw Error('Unsaved changes elsewhere prevented the import.');
    const target=state.characters.find(c=>c.id===pendingImport.targetId);
    if (!target)throw Error('Target character no longer exists.');
    const disk=await readJSON(target._handle);
    if(JSON.stringify(disk)!==pendingImport.baseline) {
      throw Error('This character changed on USB since the comparison opened. Cancel and import again; nothing was overwritten.');
    }
    const draft=pendingImport.draft;
    const newName=cleanName(draft.basic?.fullName || draft.name);
    if(!newName)throw Error('Full name cannot be empty.');
    if(state.characters.some(c=>c.id!==target.id && importLookupName(c.name)===importLookupName(newName)))throw Error('Another character already has that name.');
    const updated=structuredClone(disk);
    for (const [section,,keys] of IMPORT_FIELDS) {
      updated[section] ??= {};
      for (const [key] of keys) updated[section][key]=draft[section][key]??'';
    }
    // Preserve the original link UUIDs, picture, timestamps, and unknown fields.
    updated.name=newName;
    const changed = updated.name!==disk.name || IMPORT_FIELDS.some(([section,,keys]) =>
      keys.some(([key]) => String(updated[section]?.[key] ?? '') !== String(disk[section]?.[key] ?? '')));
    if (!changed) { $('importCompareDialog').close();clearPendingImport();toast('No changes needed.');return; }
    updated.updatedAt=dateNow();
    await saveRevisionBeforeChange(target,true);
    await writeHandle(target._handle,JSON.stringify(updated,null,2)+'\n');
    const handle=target._handle,filename=target._filename;
    for (const key of Object.keys(target))if(!key.startsWith('_'))delete target[key];
    Object.assign(target,updated,{_handle:handle,_filename:filename});
    state.characters.sort((a,b)=>a.name.localeCompare(b.name));
    const importUndoScope=[state.manifest?.createdAt||state.root?.name||'library',state.writer.id,state.novel.id,'editor',target.id].join('/');
    clearUndo(importUndoScope); // No stale pre-import Undo may overwrite a reviewed change.
    if (state.active===target){state.savedRevision=state.revision;renderEditor();}
    else {renderCharacterList();if(!$('novelView').classList.contains('hidden'))await showCharacters();}
    $('importCompareDialog').close();clearPendingImport();status('Saved to folder');toast('Reviewed character changes saved to USB.');
  }catch(error){$('importCompareStatus').textContent='NOT SAVED: '+error.message;toast(error.message,true);}
  finally{button.disabled=false;}
}
async function saveImportedNew() {
  if (!importContextIsCurrent() || pendingImport.mode!=='new')return;
  const button=$('importNewSave');button.disabled=true;
  try {
    if (!(await flush()))throw Error('Unsaved edits elsewhere prevented saving.');
    const draft=pendingImport.draft;
    const name=cleanName(draft.basic?.fullName || draft.name);
    if(!name)throw Error('Enter a character name first.');
    if(state.characters.some(c=>importLookupName(c.name)===importLookupName(name)))throw Error('A character with that name already exists. Cancel and compare with the existing profile instead.');
    const fileName=folderSafe(name)+'--'+draft.id.slice(0,8)+'.json';
    // A collision is exceptional, but never overwrite a pre-existing file.
    try { await state.charsDir.getFileHandle(fileName);throw Error('The filename already exists. No files were overwritten.'); }
    catch(err){if(err.name!=='NotFoundError')throw err;}
    draft.name=name;draft.createdAt=dateNow();draft.updatedAt=draft.createdAt;
    const handle=await putJSON(state.charsDir,fileName,draft);
    draft._handle=handle;draft._filename=fileName;
    state.characters.push(draft);state.characters.sort((a,b)=>a.name.localeCompare(b.name));
    $('importNewDialog').close();clearPendingImport();await chooseCharacter(draft.id);
    status('Saved to folder');toast('New character created from reviewed import.');
  }catch(error){$('importNewStatus').textContent='NOT SAVED: '+error.message;toast('Could not save imported character: '+error.message,true);}
  finally{button.disabled=false;}
}
function initImportTools(){
  $('importCharacterNovelBtn').onclick=()=>void openImportPicker();
  $('importCharacterProfileBtn').onclick=()=>void openImportPicker();
  $('characterImportFile').addEventListener('change',e=>void importCharacterFile(e));
  $('importMatchCancel').onclick=()=>{$('importMatchDialog').close();clearPendingImport();};
  $('importMatchCreate').onclick=()=>{$('importMatchDialog').close();openImportedNewEditor();};
  $('importCompareClose').onclick=$('importCompareCancel').onclick=()=>{$('importCompareDialog').close();clearPendingImport();};
  $('importCompareCreateDifferent').onclick=()=>{$('importCompareDialog').close();openImportedNewEditor();};
  $('importCompareSave').onclick=()=>void saveImportedExisting();
  $('importNewClose').onclick=$('importNewCancel').onclick=()=>{$('importNewDialog').close();clearPendingImport();};
  $('importNewSave').onclick=()=>void saveImportedNew();
  for (const id of ['importMatchDialog','importCompareDialog','importNewDialog']) {
    $(id).addEventListener('close',()=>{
      // Escape closes without applying changes. Explicitly clear staged state
      // unless a different import modal was opened by the transition.
      if (!['importMatchDialog','importCompareDialog','importNewDialog'].some(other=>$(other).open)) clearPendingImport();
    });
  }
}

function openTutorial(){
  const dialog=$('tutorialDialog');
  if(!dialog.open)dialog.showModal();
}
function popOutTutorial(){
  const win=window.open('tutorial.html?v=4.2.0','characterBookshelfTutorial','width=1100,height=780,resizable=yes,scrollbars=yes');
  if(win){win.focus();$('tutorialDialog').close();}
  else toast('Pop-up blocked. Allow pop-ups for this site or use the tutorial in this window.',true);
}
function init() {
  $('footerVersion').textContent='v'+APP_VERSION;
  $('gettingStartedBtn').onclick=openTutorial;
  $('footerTutorialBtn').onclick=openTutorial;
  $('tutorialCloseBtn').onclick=()=>$('tutorialDialog').close();
  $('tutorialPopBtn').onclick=popOutTutorial;
  renderReleaseHistory();
  $('releaseNotesBtn').onclick=()=>$('releaseHistoryDialog').showModal();
  $('closeReleaseHistoryBtn').onclick=()=>$('releaseHistoryDialog').close();
  $('footerStorageBtn').onclick=()=>{if(!state.root){toast('Connect your library to view storage status.');return;}renderStorageStatus();renderReminderSettings();$('storageStatusDialog').showModal();};
  renderTreeLegend();

  initImportTools();
  $('undoBtn').onclick=()=>void undoLast();updateUndoButton();
  $('refreshViewBtn').onclick=()=>void refreshCurrentView();
  $('globalSearchBtn').onclick=()=>void showLibrarySearch();
  $('seriesNavBtn').onclick=()=>void showSeries();
  $('bookshelfSeriesBtn').onclick=()=>void showSeries();
  $('seriesBackShelfBtn').onclick=()=>void showBookshelf();
  $('newSeriesBtn').onclick=()=>void createSeries();
  $('searchShelfBtn').onclick=()=>void showBookshelf();
  $('runSearchBtn').onclick=()=>void runLibrarySearch();
  $('globalSearchInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();void runLibrarySearch();}});
  $('addTimelineEventBtn').onclick=()=>openTimelineEventDialog();
  $('timelineEventForm').addEventListener('submit',e=>void saveTimelineEvent(e));
  $('cancelEventBtn').onclick=()=>$('timelineEventDialog').close();
  $('closeRevisionsBtn').onclick=()=>$('revisionHistoryDialog').close();
  $('closeRevisionCompareBtn').onclick=()=>$('revisionCompareDialog').close();
  $('compareRevisionLeft').onchange=()=>void renderRevisionComparison();
  $('compareRevisionRight').onchange=()=>void renderRevisionComparison();
  $('brandHomeBtn').onclick=()=>{if(state.writer)void showBookshelf();else if(state.root){setStage('writer');} };
  $('gallerySort').onchange=()=>{if(state.novel)void showCharacters();};
  $('revisionHistoryBtn').onclick=()=>void showRevisionHistory();
  $('timelineAllMode').onclick=()=>{state.timelineFilter='all';renderTimeline();};
  $('timelineCharacterMode').onclick=()=>{state.timelineFilter=state.characters[0]?.id||'all';renderTimeline();};
  $('timelineCharacterFilter').onchange=e=>{state.timelineFilter=e.target.value;renderTimeline();};
  $('novelTimelineBtn').onclick=()=>void showTimeline();
  $('novelManuscriptBtn').onclick=()=>void showManuscript();
  $('manuscriptShelfBtn').onclick=()=>void showBookshelf();
  $('manuscriptNovelBtn').onclick=()=>void showCharacters();
  $('manuscriptFileInput').onchange=event=>void importManuscript(event);
  $('manuscriptRemoveBtn').onclick=()=>void removeManuscript();
  $('readerSmallerBtn').onclick=()=>changeReaderFont(-1);
  $('readerLargerBtn').onclick=()=>changeReaderFont(1);
  $('manuscriptPdfGo').onclick=()=>jumpPdfPage();
  $('manuscriptPdfOpen').onclick=()=>{if(manuscriptState.pdfUrl)window.open(manuscriptState.pdfUrl,'_blank','noopener,noreferrer');};
  $('manuscriptText').addEventListener('scroll',onManuscriptScroll,{passive:true});
  $('manuscriptPrevMatch').onclick=()=>jumpToManuscriptMention(mentionState.currentPosition-1);
  $('manuscriptNextMatch').onclick=()=>jumpToManuscriptMention(mentionState.currentPosition+1);

  $('treeTimelineBtn').onclick=()=>void showTimeline();
  $('editorTimelineBtn').onclick=()=>void showTimeline();
  $('profileTimelineBtn').onclick=()=>void showTimeline();
  $('timelineShelfBtn').onclick=()=>void showBookshelf();
  $('timelineCharsBtn').onclick=()=>void showCharacters();
  $('timelineTreeBtn').onclick=()=>void showTree();
  $('coverInput').onchange=e=>void uploadBookCover(e);
  $('removeCoverBtn').onclick=()=>void removeBookCover();
  $('exportTreePngBtn').onclick=()=>void exportTreePNG();
  $('exportTreePdfBtn').onclick=()=>void exportTreePDF();
  $('selectFolderBtn').onclick = selectFolder;
  $('reselectFolderBtn').onclick = selectFolder;
  $('changeFolderBtn').onclick = selectFolder;
  $('newWriterBtn').onclick = createWriter;
  $('storageStatusBtn').onclick=()=>{renderStorageStatus();renderReminderSettings();$('storageStatusDialog').showModal();};
  $('closeStorageStatusBtn').onclick=()=>$('storageStatusDialog').close();
  $('backupReminderDays').onchange=event=>{setBackupReminderDays(Number(event.target.value));renderReminderSettings();};
  $('saveRecoveryElsewhereBtn').onclick=()=>void emergencySaveElsewhere();
  $('closeRecoveryDialogBtn').onclick=()=>$('recoveryDialog').close();
  $('downloadRecoveryReportBtn').onclick=downloadRecoveryReport;
  $('openRecoveredLibraryBtn').onclick=()=>void openRecoveredLibrary();
  const switchWriter = async () => {
    if (!(await flush())) return;
    state.writer = null; state.writerDir = null; state.novels = [];state.series=[];state.activeSeries=null;invalidateSearchIndex();clearNovelState();
    renderWriterCards(); setStage('writer'); status('Choose writer');
  };
  $('switchWriterBtn').onclick = switchWriter;
  $('topSwitchWriterBtn').onclick = switchWriter;
  $('newNovelBtn').onclick = createNovel;
  $('bookshelfNewNovelBtn').onclick = createNovel;
  $('bookshelfBtn').onclick = () => void showBookshelf();
  $('novelCharactersBtn').onclick = () => void showCharacters();
  $('novelBackToShelfBtn').onclick = () => void showBookshelf();
  $('novelViewNewCharacterBtn').onclick = createCharacter;
  $('novelTreeBtn').onclick = () => void showTree();
  $('treeShelfBtn').onclick = () => void showBookshelf();
  $('treeCharactersBtn').onclick = () => void showCharacters();
  $('treeAutoLayoutBtn').onclick = () => void resetTreeLayout();
  $('treeConnectBtn').onclick = () => void addTreeConnection();
  $('treeFrom').addEventListener('change',()=>{if(state.novel && !$('treeView').classList.contains('hidden'))renderTree();});
  $('editorTreeBtn').onclick = () => void showTree();
  $('profileTreeBtn').onclick = () => void showTree();
  $('novelViewDeleteBookBtn').onclick = () => { if (state.novel) void deleteBook(state.novel.id); };
  $('profileShelfBtn').onclick = () => void showBookshelf();
  $('profileNovelBtn').onclick = () => void showCharacters();
  $('novelSelect').onchange = event => {
    if (event.target.value) void chooseNovel(event.target.value);
    else void showBookshelf();
  };
  $('newCharacterBtn').onclick = createCharacter;
  $('searchInput').oninput = renderCharacterList;
  $('portraitInput').onchange = event => void uploadPortrait(event);
  $('removePortraitBtn').onclick = removePortrait;
  $('deleteCharacterBtn').onclick = deleteCharacter;
  $('retrySaveBtn').onclick = () => void refreshCurrentView();
  $('downloadUnsavedBtn').onclick = downloadUnsavedProfile;
  $('backupBtn').onclick = ()=>$('backupDialog').showModal();
  $('closeBackupBtn').onclick=()=>$('backupDialog').close();
  $('exportWriterZipBtn').onclick=()=>void exportWriterZip();
  $('restoreWriterZipBtn').onclick=()=>{$('backupDialog').close();$('writerBackupFileInput').click();};
  $('writerBackupFileInput').onchange=e=>void beginRestorePreview(e);
  $('cancelRestoreBtn').onclick=()=>{pendingWriterRestore=null;$('restorePreviewDialog').close();};
  $('confirmRestoreBtn').onclick=()=>void confirmWriterRestore();
  $('copyLibraryFolderBtn').onclick=()=>void backupLibrary();
  $('editorBackCharactersBtn').onclick = () => void showCharacters();
  $('editorBackBookshelfBtn').onclick = () => void showBookshelf();
  for (const button of document.querySelectorAll('[data-jump]')) {
    button.addEventListener('click', () => {
      const section = $('section-' + button.dataset.jump);
      if (!section) return;
      section.open = true;
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
  $('exportPdfCharacterBtn').onclick = () => void exportPdf('character');
  $('exportDocxCharacterBtn').onclick = () => void exportDocx('character');
  $('exportPdfNovelBtn').onclick = () => void exportPdf('novel');
  $('exportDocxNovelBtn').onclick = () => void exportDocx('novel');
  window.addEventListener('beforeunload', event => {
    if (memoryRecovery.pending.size || memoryRecovery.lastFailure || hasUnsaved() || !!state.saving || treeUnsaved() || !!state.treeSaving || !!pendingImport || !!pendingWriterRestore) { event.preventDefault(); event.returnValue = ''; }
  });
  setStage('folder');
}
document.addEventListener('DOMContentLoaded', init);
