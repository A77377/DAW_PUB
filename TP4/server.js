var http = require('http')
var fs = require('fs')

http.createServer((req, res) => {
    const {method, url} = req;
    var urlSegs = url.split('/');
    var sndSeg = urlSegs[1];
    var filepath = '';
    if (sndSeg !== 'favicon.ico') {
        if (sndSeg === 'arqelem') {
            filepath = 'website/arqelems/' + urlSegs[2] + '.html';
            if (!fs.existsSync(filepath)) {
                filepath = '';
            }
        }
        else if ((urlSegs.length === 2 &&
                 urlSegs[0] === urlSegs[1] &&
                 urlSegs[0] === '') || urlSegs[1] === 'index') {
                    filepath = 'website/index.html';
        }
        fs.readFile(filepath, (erro, dados) => {
            if (!erro) {
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(dados);
            }
            else {
                res.writeHead(404, {'Content-Type': 'text/html'});
                res.write('<p><b>ERRO: </b>' + erro + '</p>\n<address>[<a href="http://localhost:4444/index">INDEX</a>]</address>');
            }
            res.end();
        })
    }
}).listen(4444, () => {
    console.log('Servidor à escuta na porta 4444...');
})