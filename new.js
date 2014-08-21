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
  input = input.replace(/"/g, '\\"');
  if (input.match(regex.insert) === null) {
    //no variables placements, no sense in making it all fancy
    fn += input;
  } else {
    //has variables in it
    input += input.replace(regex.insert, function(match, name) {
      if (params.indexOf(name.trim()) !== -1) {
        return '\" + (' + name + ' || \"\") + \"';
      } else {
        return '[BADVAR]';
      }
    });
  }
  fn += input;
  fn += '\";';
  fn += '';
  return new Function(params.join(','), fn).toString();
}

exports.parse = function (input) {

  var split = input.split('\n').map(function(i) {
    //remove any extra stuff without ruining indentation
    return i.trimRight(); 
  });
  var indentation = detectIndent(input) || '  ';
  debug('Indentation recorded as ['+indentation+'] ('+indentation.length+')');
  var output = {};
  var inBlock = false, inComment = false; //if in a block statement

  fast.forEach(split, function(line) {
    debug('New Line ['+line+']');

    //Comments
    if (startsWith(line, '#') || startsWith(line, '//')) {
      debug('Line is comment');
      return;
    }
    //Block Statements
    if (line.match(/|\s*$/) && line.indexOf(':') === -1) {
      debug('Starting new block statement');
      inBlock = true;
    }

    var name; //fuck jshint
    var colon = line.indexOf(':');
    var value = line.substr(colon);
  });
  return output;
};