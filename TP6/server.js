var http = require('http');
var url = require('url');
var pug = require('pug');
var fs = require('fs');
var jsonfile = require('jsonfile');

var {parse} = require('querystring');

var myBD = "tasklist.json";

var myServer = http.createServer((req, res) => {
    var purl = url.parse(req.url, true);
    var query = purl.query;

    console.log('Recebi o pedido: ' + purl.pathname);
    console.log('Com o método: ' + req.method);

    if (req.method == 'GET') {
        if (purl.pathname == '/' || purl.pathname == '/index') {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.write(pug.renderFile('index.pug'));
            res.end();
        }
        else if (purl.pathname == '/registo') {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.write(pug.renderFile('form-task.pug'));
            res.end();
        }
        else if (purl.pathname == '/lista') {
            jsonfile.readFile(myBD, (erro, tasks) => {
                if (!erro) {
                    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                    res.write(pug.renderFile('lista-tasks.pug', {tasklist: tasks}));
                    res.end();
                }
                else {
                    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                    res.write(pug.renderFile('erro.pug', {e: 'Erro na leitura da BD.'}));
                    res.end();
                }
            });
        } 
        else if (purl.pathname == '/apaga') {
            jsonfile.writeFile(myBD, [], (erro) => {
                if (erro) {
                    console.log(erro);
                }
                else {
                    console.log('Lista de tarefas apagada com sucesso.');
                }
            });
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.write(pug.renderFile('apagada-conf.pug', {task: query}));
            res.end();
        }
        else if (purl.pathname == '/processaForm') {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.write(pug.renderFile('task-recebida.pug', {task: query}));
            res.end();
        }
        else if (purl.pathname == '/w3.css') {
            res.writeHead(200, {'Content-Type': 'text/css'});
            fs.readFile('stylesheets/w3.css', (erro, dados) => {
                if (!erro) {
                    res.write(dados);
                }
                else {
                    res.write(pug.renderFile('erro.pug', {e: erro}));
                }
                res.end();
            });
        }
        else {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.write(pug.renderFile('erro.pug', {e: "Erro no path: " + purl.pathname + " não está implementado!"}));
            res.end();
        }
    }
    else if (req.method == 'POST') {
        if (purl.pathname == '/processaForm') {
            recuperaInfo(req, resultado => {
                jsonfile.readFile(myBD, (erro, tasks) => {
                    if (!erro) {
                        tasks.push(resultado);
                        console.dir(tasks);
                        jsonfile.writeFile(myBD, tasks, (erro) => {
                            if (erro) {
                                console.log(erro);
                            }
                            else {
                                console.log('Registo gravado com sucesso.');
                            }
                        });
                    }
                    res.end(pug.renderFile('task-recebida.pug', {task: resultado}));
                });
            });
        }
        else {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.write(pug.renderFile('erro.pug', {e: "Erro " + purl.pathname + " não está implementado!"}));
            res.end();
        }
    }
    else {
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.write(pug.renderFile('erro.pug', {e: "Método " + req.method + " não está suportado!"}));
        res.end();
    }

});

myServer.listen(4006, () => {
    console.log("Servidor à escuta na porta 4006...")
});

function recuperaInfo(request, callback) {
    if (request.headers['content-type'] === 'application/x-www-form-urlencoded') {
        let body = '';
        request.on('data', bloco => {
            body += bloco.toString();
        });
        request.on('end', () => {
            callback(parse(body));
        })
    }
    else {
        callback(null);
    }
}