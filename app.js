var http = require('http'),
	URL = require('url'),
	request = require('request'),
	express = require('express'),
	app = express();

app.set('env', 'development');
app.set('port', 3760);

app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({secret: 'keyboard cat'}));
app.use(express.static(__dirname + '/public'));

app.get('/request', function(req, res){
	var url = req.query.vbrurl;
	if (! url) res.end();
	var host = URL.parse(url).hostname;
	var referer = req.query.vbrref;
	delete req.query.vbrhref;
	console.log('requesting:', url);
	request({
		url: url,
		qs: req.query,
		form: req.body,
		headers: {
			'connection': 'keep-alive',
			'user-agent': 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.57 Safari/537.36',
			'host': host,
			'referer': referer
		}
	}).pipe(res);
});

var port = app.get('port');
http.createServer(app).on('error', function(err) {
	throw new Error('Port ' + port + ' occupied');
}).listen(port, function() {
	console.log('Listening on port ' + port);
});