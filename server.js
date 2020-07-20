const http = require('http');
const mysql = require('mysql');
const pug = require('pug');
const qs = require('querystring');
const url = require('url');
const fs = require('fs')

let listPug = './templates/list.pug';
let tambahPug = './templates/tambah.pug';
let ubahPug = './templates/ubah.pug';

const db = mysql.createConnection({
    host: 'localhost',
    user: 'nazir',
    password: 'nazir',
    database: 'rpl',
});

const server = http.createServer((req, res) => {
    res.writeHead(200, {
        'Content-type': 'text/html'
    });
    if (req.url === '/') {
        db.query('SELECT * FROM siswa', function (error, result) {
            if (error) throw error;
            let template = pug.renderFile(listPug, {
                data: result,
            });
            res.end(template);
        });
    } else if (req.url === '/tambah') {
        switch (req.method) {
            case 'GET':
                let template = pug.renderFile(tambahPug);
                res.end(template)
                break;
            case 'POST':
                let body = '';

                req.on('data', (data) => {
                    body += data;
                });

                req.on('end', () => {
                    let form = qs.parse(body);
                    let newRow = [
                        form['nis'],
                        form['nama'],
                        form['kelas'],
                        form['jurusan'],
                    ];

                    let sql = `INSERT INTO siswa VALUES(?,?,?,?)`;
                    db.query(sql, newRow, function (error, result) {
                        if (error) {
                            if (error.code === 'ER_DUP_ENTRY') {
                                //
                            } else {
                                throw error;
                            }
                        };

                        res.writeHead(302, {
                            'Location': '/'
                        });
                        res.end();
                    });
                });
                break;
        }
    } else if (url.parse(req.url).pathname === '/ubah') {
        switch (req.method) {
            case 'GET':
                let nis = qs.parse(url.parse(req.url).query).nis;
                console.log(nis)
                let sql = 'SELECT * FROM siswa WHERE nis = ?';
                db.query(sql, nis, function (error, result) {
                    if (error) {
                        //
                        throw error;
                    }
                    let template = pug.renderFile(ubahPug, {
                        siswa: result[0]
                    });
                    res.end(template);
                });
                break;

            case 'POST':
                let body = '';

                req.on('data', (data) => {
                    body += data;
                });

                req.on('end', () => {
                    let form = qs.parse(body);
                    let params = [
                        form['nama'],
                        form['kelas'],
                        form['jurusan'],
                        form['nis']
                    ];

                    let sql = `UPDATE siswa SET nama = ?, kelas = ?, jurusan = ? WHERE nis = ?`;

                    db.query(sql, params, function (error, result) {
                        if (error) throw error;

                        res.writeHead(302, {
                            'Location': '/',
                        })
                        res.end();
                    });
                });
                break;
        }
    } else if(url.parse(req.url).pathname === '/hapus'){
        let nis = qs.parse(url.parse(req.url).query).nis;

        let sql = `DELETE FROM siswa WHERE nis = ?`;

        db.query(sql, nis, function(error, result){
            if (error) throw error;

            res.writeHead(302, {'Location':'/'});
            res.end();
        });
    }
});

server.listen(8000);
console.log('Server aktif!');