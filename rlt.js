'use strict';
var detectIndent = require('detect-indent');
var fast = require('fast.js');
var debug = require('debug')('roseleaf:rlt');

/**
 * Roseleaf Translation File Parser
 * @author Zeke Sonxx <zeke@zekesonxx.com>
 * @license MIT
 */

var regex = {
  basic: /^[A-Za-z0-9-_]+\: .+/, // apple: apple
  block: /^[A-Za-z0-9-_]+\|[\s]*$/, //footer|
  cmd: /^[A-Za-z0-9-_]+\(([A-Za-z0-9-_(\s*,\s*)*])+\)\: .+/, // bacon(lad): bacon#{lad}
  insert: /#{([A-Za-z0-9-_]+)}/g // #{bacon}
};

function startsWith(input, check) {
  return input.lastIndexOf(check, 0) === 0;
}

function genFunction(input, params) {
  /* jshint evil: true */ //allow new Function(); because I'm an evil sack of shit
  var fn = 'return \"';
  fn += input.replace(/"/g, '\\"').replace(regex.insert, function(match, name) {
    if (params.indexOf(name.trim()) !== -1) {
      return '\" + (' + name + ' || \"\") + \"';
    } else {
      return '[BADVAR]';
    }
  });
  fn += '\";';
  fn += '';
  return new Function(params.join(','), fn).toString();
}

exports.parse = function (input) {

  var split = input.split('\n').map(function(i) {
    return i.trimRight(); //remove any extra stuff without ruining indentation
  });
  var indentation = detectIndent(input) || '  ';
  debug('Indentation recorded as ['+indentation+'] ('+indentation.length+')');
  var output = {};
  var inBlock = false, inComment = false; //if in a block statement

  fast.forEach(split, function(line) {
    var name, value, colon; //fuck jshint
    debug('New Line ['+line+']');

    // Comments
    // No block comments because that would be annoying
    // Or indented comments because fuck that.
    if (startsWith(line, '//') || startsWith(line, '#')) return;

    if (inBlock && startsWith(line, indentation)) {
      //continuing block statement
      debug(inBlock+' added to');
      output[inBlock] += line.substr(indentation.length)+'\n';
      return;
    } else if (inBlock) {
      //block statement over
      debug('Block statement '+inBlock+' finished.');
      output[inBlock] = output[inBlock].trim(); //remove the extra \n at the end
      inBlock = false;
    }
    // match actions
    if (line.match(regex.basic)) { //basic line
      colon = line.indexOf(':');
      name = line.slice(0, colon);
      value = line.slice(colon+2); //colon itself and the space
      output[name] = value;
      debug('Basic line '+name+'');
    } else if (line.match(regex.block)) {
      inBlock = line.slice(0, line.indexOf('|'));
      debug('Block statement '+inBlock+' started');
      output[inBlock] = '';
    } else if (line.match(regex.cmd)) {
      var openPar = line.indexOf('(');
      var closePar = line.indexOf(')');
      name = line.slice(0, openPar);
      value = line.slice(closePar+3); //[): ]
      var paramString = line.slice(openPar+1, closePar);
      var params = paramString.split(/\s*,\s*/);
      output[name] = genFunction(value, params);
    } else {
      debug('Bad Line Found: '+line);
    }
  });
  return output;
};