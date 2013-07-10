#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + restler
   - https://github.com/danwrong/restler

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var util = require('util');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var TMPFILE_DEFAULT = "tmpfile.html";
var URLPATH_DEFAULT = "http://shielded-fortress-7464.herokuapp.com/";
var CHECKSFILE_DEFAULT = "checks.json";


var buildfn = function(tmpwebfile) {
    var response2console = function(result, response) {
        if (result instanceof Error) {
            console.error('Error: ' + util.format(response.message));
        } else {
            console.log("Wrote %s", tmpwebfile);
            fs.writeFileSync(tmpwebfile, result);
        }
    };
    return response2console;
};

var checkURL = function(url, tmpwebfile) {
    tmpwebfile = tmpwebfile || TMPFILE_DEFAULT;
    url = url || URLPATH_DEFAULT;
    rest.get(url).on('complete', function(result) {
        if (result instanceof Error) {
            console.error('Error: ' + util.format(result.message));
        } else {
            console.log("Wrote %s", tmpwebfile);
            fs.writeFileSync(tmpwebfile, result);
            assertFileExists(tmpwebfile, result);
            var checkJson = checkHtmlFile(tmpwebfile, program.checks);
            var outJson = JSON.stringify(checkJson, null, 4);
            console.log(outJson);
        }});

    //rest.get(url).on('complete', response2console);
    //console.log('Retrieving %s and putting it in tmp file = %s', url, tmpwebfile);
};

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

if(require.main == module) {
    program
        .option('-c, --checks ', 'Path to checks.json', assertFileExists, CHECKSFILE_DEFAULT)
        .option('-f, --file ', 'Path to index.html', assertFileExists, HTMLFILE_DEFAULT)
        .option('-u, --url ', "Path to bitstarter website", toString, URLPATH_DEFAULT)
        .parse(process.argv);
    if (program.file) { 
      var checkJson = checkHtmlFile(program.file, program.checks);
      console.log(outJson);
    }
    else { 
        var tmpfile = 'tmphtml.html';
        checkURL(program.url, tmpfile);

       	}
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
