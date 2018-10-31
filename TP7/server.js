var express = require('express')
var formidable = require('formidable')
var fs = require('fs')
var http = require('http')
var jsonfile = require('jsonfile');
var logger = require('morgan');
var pug = require('pug')

const app = express();

app.use(logger('combined'));

app.use('/uploadedFiles', express.static('uploaded'));

app.all('*', (req, res, next) => {
    if (req.url != '/w3.css') {
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    }
    next();
});

app.get('/form', (req, res) => {
    res.write(pug.renderFile('file-form.pug'));
    res.end();
});

app.get('/w3.css', (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/css'});
    fs.readFile('stylesheets/w3.css', (err, dados) => {
        if (!err) {
            res.write(dados);
        }
        else {
            res.write(pug.renderFile('error.pug', {e: err}));
        }
        res.end();
    });
});

app.get('/ficheiros', (req, res) => {
    jsonfile.readFile('stored_files.json', (err, stored_files) => {
        if (!err) {
            res.write(pug.renderFile('file-list.pug', {files: stored_files}));
            res.end();
        }
        else {
            res.end(pug.renderFile('error.pug', {e: err}));
        }
    });
});

app.get('/', (req, res) => {
    jsonfile.readFile('stored_files.json', (err, stored_files) => {
        if (!err) {
            res.write(pug.renderFile('aio.pug', {files: stored_files}));
            res.end();
        }
        else {
            res.write(pug.renderFile('error.pug', {e: err}));
            res.end();
        }
    });
});

app.post('/', (req, res) => {
    var form = new formidable.IncomingForm();
    form.uploadDir = './uploaded';
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        var fsent = files.ficheiro.path;
        var newf = 'uploaded/' + files.ficheiro.name;
        fs.rename(fsent, newf, (err) => {
            if (!err) {
                const fileObj = {"name": files.ficheiro.name, "desc": fields.desc};
                jsonfile.readFile('stored_files.json', (err, stored_files) => {
                    if (!err) {
                        stored_files.push(fileObj);
                        jsonfile.writeFile('stored_files.json', stored_files, (err) => {
                            if (!err) {
                                res.write(pug.renderFile('aio.pug', {files: stored_files}));
                            }
                            else {
                                res.write(pug.renderFile('error.pug',
                                    {e: 'Ocorreram erros no armazenamento do ficheiro!'}
                                ));
                            }
                            res.end();
                        });
                    }
                });
            }
            else {
                res.write(pug.renderFile('error.pug',
                    {e: 'Ocorreram erros no armazenamento do ficheiro!'}
                ));
                res.end();
            }
        });
    });
});

app.post('/processaFormSolo', (req, res) => {
    var form = new formidable.IncomingForm();
    form.uploadDir = './uploaded';
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        var fsent = files.ficheiro.path;
        var newf = 'uploaded/' + files.ficheiro.name;
        fs.rename(fsent, newf, (err) => {
            if (!err) {
                jsonfile.readFile('stored_files.json', (err, stored_files) => {
                    if (!err) {
                        const fileObj = 
                            {"name": files.ficheiro.name, "desc": fields.desc};
                        stored_files.push(fileObj);
                        jsonfile.writeFile('stored_files.json', stored_files, (err) => {
                            if (!err) {
                                res.write(pug.renderFile('file-received.pug',
                                {
                                    file: files.ficheiro.name,
                                    desc: fields.desc,
                                    status: 'Ficheiro recebido e guardado com sucesso.'
                                }));
                            }
                            else {
                                res.write(pug.renderFile('error.pug',
                                    {e: 'Ocorreram erros no armazenamento do ficheiro!'}
                                ));
                            }
                            res.end();
                        });
                    }
                });
            }
            else {
                res.write(pug.renderFile('error.pug',
                    {e: 'Ocorreram erros no armazenamento do ficheiro!'}
                ));
                res.end();
            }
        });
    });
});

var myServer = http.createServer(app);

myServer.listen(7777, () => {
    console.log('Servidor à escuta na porta 7777...');
});