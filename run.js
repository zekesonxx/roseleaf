'use strict';
var fs = require('fs');
var path = require('path');
var rlt = require('./new');

var output = rlt.parse(fs.readFileSync(path.join(__dirname, 'first.rlt'), 'utf8'));

console.log(require('util').inspect(output, {  depth: null, colors: true }));