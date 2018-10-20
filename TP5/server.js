var http = require('http');
var fs = require('fs');
var pug = require('pug');

var musurl = /\/mus\//;

http.createServer((req, res) => {
    const {_, url} = req;
    if (url === '/' || url === '/index') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        fs.readdir('./json/', (err, files) => {
            if (!err) {
                var tempArrays = files.map((value, index, array) => {
                    return value.match(/[0-9]+/);
                });
                var ufileIDs = tempArrays.map((value, index, array) => {
                    return value[0];
                });
                var fileIDs = ufileIDs.sort((a, b) => a - b);
                res.write(pug.renderFile('index.pug', {musicalPiecesIDs: fileIDs}));
            }
            else {
                res.write('<p><b>Erro: </b> ' + err + '</p>');
            }
            res.end();
        });
    }
    else if (musurl.test(url)) {
        var fileID = url.split('/')[2];
        res.writeHead(200, {'Content-Type': 'text/html'});
        fs.readFile('json/' + fileID + '.json', (err, data) => {
            if (!err) {
                res.write(pug.renderFile('musical_piece.pug', {musical_piece: JSON.parse(data)}));
            }
            else {
                res.write('<p><b>Erro: </b> ' + err + '</p>');
            }
            res.end();
        });
    }
    else if (url == '/w3.css') {
        res.writeHead(200, {'Content-Type': 'text/css'});
        fs.readFile('stylo/w3.css', (err, data) => {
            if (!err) {
                res.write(data);
            }
            else {
                res.write('<p><b>Erro: </b> ' + err + '</p>');
            }
            res.end();
        });
    }
    else {
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.write('<p><b>Erro: Pedido desconhecido.</b> ' + url + '</p>');
        res.end();
    }
}).listen(5555, () => {
    console.log('Servidor à escuta na porta 5555...');
});