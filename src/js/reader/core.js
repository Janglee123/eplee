var EPUBJS = EPUBJS || {};
EPUBJS.core = {};

var ELEMENT_NODE = 1;
var TEXT_NODE = 3;
var COMMENT_NODE = 8;
var DOCUMENT_NODE = 9;

EPUBJS.core.defaults = function(obj) {
	for (var i = 1, length = arguments.length; i < length; i++) {

		var source = arguments[i];

		for (var prop in source) {
			if (obj[prop] === void 0) obj[prop] = source[prop];
		}
	}
	return obj;
};

EPUBJS.core.uuid = function() {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c=='x' ? r : (r&0x7|0x8)).toString(16);
	});
	return uuid;
};
