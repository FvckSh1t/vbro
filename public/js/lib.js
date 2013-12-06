_.allKeys = function(o){
	var k = [];
	for (var p in o) k.push(p);
	return k;
}

var ban = ['_', '$'];
var $vbro, $home, $vm;
var winCopy = _.clone(window);
var win;
var vmHref = '';

function init(){
	var store = $('vbro').html();
	document.removeChild(document.documentElement);
	document.appendChild(document.createElement('vbro'));
	document.title = 'V-Browser';
	$vbro = $('vbro').html(store);
	$home = $('home');
	$vm = $('vm');
}

function vmBuildWin(){
	var loc = (function(){
		var o = _.clone(location);
		o.__defineSetter__('href', function(s){
			vmLoad(s);
		});
		o.__defineGetter__('href', function(s){
			return vmHref;
		});
		return o;
	})();
	var win = _.clone(winCopy);
	_.each(_.methods(window), function(key){
		win[key] = _.bind(window[key], window);
	});
	win.__defineSetter__('location', function(s){
		vmLoad(s);
	});
	win.__defineGetter__('location', function(){
		return loc;
	});
	_.each(ban, function(val){
		delete win[val];
	});
	win.window = win;
	return win;
}
function vmLoad(s){
	console.log('loading:', s);
	$.ajax({
		url: s,
		success: function(data){
			vmHref = s;
			win = vmBuildWin();
			var $html = $('<html>');
			var $tmp = $('<html>');
			$tmp.get(0).innerHTML = data;
			$html.append($tmp.children());
			win.document.__defineGetter__('documentElement', function(){return $('html').get(0)});
			win.document.__defineGetter__('body', function(){return $('body').get(0)});
			$vm.empty().append($html);
			var $title = $vm.find('head title');
			if ($title.length) document.title = $title.text();
		}
	});
}

function tranUrl(url, ref){
	url = absUrl(url, ref);
	url = '/request?vbrref='+ ref +'&vbrurl=' + encodeURIComponent(url);
	return url;
}
function absUrl(url, ref){
	if (/^[^\/]*\/\//.test(url)) {
		url = url;
	} else if (/^\//.test(url)) {
		var refHost = getHost(ref);
		url = refHost + url;
	} else {
		var refPath = getPath(ref);
		url = refPath + '/' + url;
	}
	return url;
}
function getHost(url){
	return url.match(/[^\/]*\/\/[^\/]+/)[0];
}
function getPath(url){
	return url.match(/^([^\/]*\/\/.+)\/[^\/]*/)[1];
}