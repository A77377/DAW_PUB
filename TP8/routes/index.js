var express = require('express');
var router = express.Router();
var formidable = require('formidable')
var jsonfile = require('jsonfile')
var fs = require('fs')

const myDB = __dirname + '/stored_files.json'

router.get('/', (req, res, next) => {
  res.render('spa');
});

router.get('/files', (req, res, next) => {
  jsonfile.readFile(myDB, (err, file_info) => {
    if (!err) {
      res.render('file-list', {files : file_info});
    }
    else {
      // Seria mais correto usar uma alternativa a 'error' para este caso, de modo a não renderizar uma página HTML dentro de outra
      res.render('error', {e : err});
    }
  });
});

router.post('/upload', (req, res, next) => {
  var form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    console.log(fields);
    console.log(files);
    var fsent = files.file.path;
    var newf = __dirname + '/../public/uploaded/' + files.file.name;
    console.log(fsent);
    console.log(newf);
    fs.copyFile(fsent, newf, (err) => {
      if (!err) {
          const fileObj = {"name": files.file.name, "desc": fields.desc, "time": fields.time};
          jsonfile.readFile(myDB, (err, stored_files) => {
              if (!err) {
                  stored_files.push(fileObj);
                  jsonfile.writeFile(myDB, stored_files, (err) => {
                      if (!err) {
                        console.log('Gravado com sucesso.')
                      }
                      else {
                          res.render('error', {e: 'Ocorreram erros no registo do ficheiro.'});
                      }
                  });
              }
          });
      }
      else {
          res.render('error', {e: 'Ocorreram erros ao copiar o ficheiro.'});
      }
    });   
  })
});

module.exports = router;
