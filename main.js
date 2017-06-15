var Nightmare = require('nightmare'),
    fs = require("fs");
var vo = require('vo')
var request = require('request');
var colors = require('colors');
require('nightmare-inline-download')(Nightmare);
var bottom = process.argv[2];
var top = process.argv[3];

//var dino = fs.readFile('dino.txt', 'utf8');

if (!process.argv[3]){
    console.log('CLI ARGUMENTS MISSING:');
    console.log('    node main [first comic desired] [last comic desired]'.red);
}

//FUNCTION FACTORY!
vo(run)(function (err, result) {
    if (err) throw err
})

function* run() {
    console.log(colors.inverse('Preparing to download comics ' + bottom + ' through ' + top + '.'));
    //console.log(colors.rainbow(dino));

    //SPAWN NIGHTMARE, LOG IN, GET TO HOME PAGE
    var nightmare = Nightmare({
        show: false,
        typeInterval: 20,
        /*openDevTools: {
            mode: 'detach'
        },*/
        alwaysOnTop: false,
        waitTimeout: 20 * 60 * 1000
    });

    var comicsrc;
    //GRAB THE GRADE TABLES
    for (var i = bottom; i <= top; i++) {

        //http://www.qwantz.com/index.php?comic=1

        yield nightmare
            .goto('http://mobile.qwantz.com/index.php?comic=' + i)
            .wait('img.comic')
            .evaluate(function () {
                return document.querySelector('img.comic').src;
            })
            .then(function (result) {
                comicsrc = result;
            })
            .catch(function (err) {
                console.log(err);
            })


        var download = function (uri, filename, callback) {
            request.head(uri, function (err, res, body) {
                request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
            });
        };


        download(comicsrc, './comics/' + comicsrc.split('/')[4], function () {
            console.log('downloaded comic: ' + (i - 1)) /*Where is increasing and why?*/;
        });

    }
    yield nightmare.end()


}
