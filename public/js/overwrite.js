eval = (function(fn){
	return function(s){
		var c = 'with ((window && window.console && window.console._commandLineAPI) || {}) {';
		if (s.trim().indexOf(c) === 0) {
			return fn(s);
		}
		var k = _.allKeys(win);
		return fn([
			'(function('+ k.join(',') +'){',
				'try{', s, '\n}catch(e){console.dir(e)}',
			'}).apply(win, ['+ k.map(function(v){return 'win["'+v+'"]'}).join(',') +'])'
		].join(';'));
	}
})(eval);

DocumentFragment.prototype.appendChild = createAppend(DocumentFragment.prototype.appendChild);
Element.prototype.appendChild = createAppend(Element.prototype.appendChild);
function createAppend(fn){
	return function(child){
		//console.log('appending child:', arguments);
		// if this is inside the document
		if ($(this).closest('vm').length) {
			$(child).find('*').add(child).each(function(i, el){
				var nodeName = el.nodeName.toLowerCase();
				var type = el.type && el.type.toLowerCase();
				if (
					nodeName === 'script'
					&& (! type || _.contains([
						'text/javascript',
						'text/ecmascript',
						'application/javascript',
						'application/ecmascript'
					], type))
				) {
					// script
					el.type = 'text/vbr-done';
					if (el.src) {
						$.ajax({
							url: $(el).attr('src'),
							async: false,
							success: function(data){
								eval(data);
							}
						});
					} else {
						eval(el.text);
					}
				} else if (nodeName === 'link') {
					// todo
				} else if (nodeName === 'meta') {
					// meta
					if (el.httpEquiv.toLowerCase() === 'refresh') {
						var mat = el.content.match(/;url=([^;]+)/);
						if (mat && mat[1]) {
							vmLoad(mat[1]);
							$(el).remove();
						}
					}
				}
			});
		}
		var ret = fn.apply(this, arguments);
		return ret;
	}
}

XMLHttpRequest.prototype.open = (function(fn){
	return function(method, url, async, user, pass){
		this.url = url;
		var _url;
		if (/^\$/.test(url)) {
			_url = url.slice(1);
		} else {
			_url = tranUrl(url, vmHref);
		}
		return fn.call(this, method, _url, async, user, pass);
	}
})(XMLHttpRequest.prototype.open);