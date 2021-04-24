'use strict'

import React      from 'react'
import ReactDOM   from 'react-dom'
import Codemirror from 'medis-react-codemirror'

require('codemirror/mode/javascript/javascript')
require('codemirror/addon/lint/json-lint')
require('codemirror/addon/lint/lint')
require('codemirror/addon/selection/active-line')
require('codemirror/addon/edit/closebrackets')
require('codemirror/addon/edit/matchbrackets')
require('codemirror/addon/search/search')
require('codemirror/addon/search/searchcursor')
require('codemirror/addon/search/jump-to-line')
require('codemirror/addon/dialog/dialog')
require('codemirror/addon/dialog/dialog.css')
import jsonlint   from 'jsonlint'

window.jsonlint = jsonlint.parser
require('codemirror/lib/codemirror.css')
require('codemirror/addon/lint/lint.css')
const msgpack = require('msgpack5')()

/**
 * Unserialize data taken from PHP's serialize() output
 *
 * Taken from https://github.com/kvz/phpjs/blob/master/functions/var/unserialize.js
 * Fixed window reference to make it nodejs-compatible
 *
 * @return unserialized data
 * @throws
 * @param data
 */
function php_unserialize(data) {
  // http://kevin.vanzonneveld.net
  // +     original by: Arpad Ray (mailto:arpad@php.net)
  // +     improved by: Pedro Tainha (http://www.pedrotainha.com)
  // +     bugfixed by: dptr1988
  // +      revised by: d3x
  // +     improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +        input by: Brett Zamir (http://brett-zamir.me)
  // +     improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +     improved by: Chris
  // +     improved by: James
  // +        input by: Martin (http://www.erlenwiese.de/)
  // +     bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +     improved by: Le Torbi
  // +     input by: kilops
  // +     bugfixed by: Brett Zamir (http://brett-zamir.me)
  // +      input by: Jaroslaw Czarniak
  // %            note: We feel the main purpose of this function should be to ease the transport of data between php & js
  // %            note: Aiming for PHP-compatibility, we have to translate objects to arrays
  // *       example 1: unserialize('a:3:{i:0;s:5:"Kevin";i:1;s:3:"van";i:2;s:9:"Zonneveld";}');
  // *       returns 1: ['Kevin', 'van', 'Zonneveld']
  // *       example 2: unserialize('a:3:{s:9:"firstName";s:5:"Kevin";s:7:"midName";s:3:"van";s:7:"surName";s:9:"Zonneveld";}');
  // *       returns 2: {firstName: 'Kevin', midName: 'van', surName: 'Zonneveld'}
  let that         = this,
      utf8Overhead = function (chr) {
        // http://phpjs.org/functions/unserialize:571#comment_95906
        let code = chr.charCodeAt(0);
        if (code < 0x0080) {
          return 0;
        }
        if (code < 0x0800) {
          return 1;
        }
        return 2;
      },
      error        = function (type, msg, filename, line) {
        throw new window[type](msg, filename, line);
      },
      read_until   = function (data, offset, stopchr) {
        let i = 2, buf = [], chr = data.slice(offset, offset + 1);

        while (chr != stopchr) {
          if ((i + offset) > data.length) {
            error('Error', 'Invalid');
          }
          buf.push(chr);
          chr = data.slice(offset + (i - 1), offset + i);
          i += 1;
        }
        return [buf.length, buf.join('')];
      },
      read_chrs    = function (data, offset, length) {
        let i, chr, buf;

        buf = [];
        for (i = 0; i < length; i++) {
          chr = data.slice(offset + (i - 1), offset + i);
          buf.push(chr);
          length -= utf8Overhead(chr);
        }
        return [buf.length, buf.join('')];
      },
      _unserialize = function (data, offset) {
        let dtype, dataoffset, keyandchrs, keys,
            readdata, readData, ccount, stringlength,
            i, key, kprops, kchrs, vprops, vchrs, value,
            chrs        = 0,
            typeconvert = function (x) {
              return x;
            };

        if (!offset) {
          offset = 0;
        }
        dtype = (data.slice(offset, offset + 1)).toLowerCase();

        dataoffset = offset + 2;

        switch (dtype) {
          case 'i':
            typeconvert = function (x) {
              return parseInt(x, 10);
            };
            readData = read_until(data, dataoffset, ';');
            chrs = readData[0];
            readdata = readData[1];
            dataoffset += chrs + 1;
            break;
          case 'b':
            typeconvert = function (x) {
              return parseInt(x, 10) !== 0;
            };
            readData = read_until(data, dataoffset, ';');
            chrs = readData[0];
            readdata = readData[1];
            dataoffset += chrs + 1;
            break;
          case 'd':
            typeconvert = function (x) {
              return parseFloat(x);
            };
            readData = read_until(data, dataoffset, ';');
            chrs = readData[0];
            readdata = readData[1];
            dataoffset += chrs + 1;
            break;
          case 'n':
            readdata = null;
            break;
          case 's':
            ccount = read_until(data, dataoffset, ':');
            chrs = ccount[0];
            stringlength = ccount[1];
            dataoffset += chrs + 2;

            readData = read_chrs(data, dataoffset + 1, parseInt(stringlength, 10));
            chrs = readData[0];
            readdata = readData[1];
            dataoffset += chrs + 2;
            if (chrs != parseInt(stringlength, 10) && chrs != readdata.length) {
              error('SyntaxError', 'String length mismatch');
            }
            break;
          case 'a':
            readdata = {};

            keyandchrs = read_until(data, dataoffset, ':');
            chrs = keyandchrs[0];
            keys = keyandchrs[1];
            dataoffset += chrs + 2;

            for (i = 0; i < parseInt(keys, 10); i++) {
              kprops = _unserialize(data, dataoffset);
              kchrs = kprops[1];
              key = kprops[2];
              dataoffset += kchrs;

              vprops = _unserialize(data, dataoffset);
              vchrs = vprops[1];
              value = vprops[2];
              dataoffset += vchrs;

              readdata[key] = value;
            }

            dataoffset += 1;
            break;
          default:
            error('SyntaxError', 'Unknown / Unhandled data type(s): ' + dtype);
            break;
        }
        return [dtype, dataoffset - offset, typeconvert(readdata)];
      }
  ;

  return _unserialize((data + ''), 0)[2];
}

require('./index.scss')

class Editor extends React.PureComponent {
  constructor() {
    super()

    this.resizeObserver = new ResizeObserver(() => {
      this.updateLayout()
    })

    this.state = {
      currentMode: '',
      wrapping   : true,
      changed    : false,
      modes      : {
        raw        : false,
        json       : false,
        serializer : false,
        messagepack: false
      }
    }
  }

  updateLayout() {
    const {wrapSelector, codemirror} = this.refs

    const $this = $(ReactDOM.findDOMNode(this))
    if ($this.width() < 372) {
      $(ReactDOM.findDOMNode(wrapSelector))
      .hide()
    } else {
      $(ReactDOM.findDOMNode(wrapSelector))
      .show()
    }
    if (codemirror) {
      codemirror.getCodeMirror()
                .refresh()
    }
  }

  componentDidMount() {
    this.init(this.props.buffer)
    this.resizeObserver.observe(ReactDOM.findDOMNode(this))
  }

  componentWillUnmount() {
    this.resizeObserver.disconnect()
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.buffer !== this.props.buffer) {
      this.init(nextProps.buffer)
    }
  }

  init(buffer) {
    if (!buffer) {
      this.setState({currentMode: '', changed: false})
      return
    }
    const content = buffer.toString()
    const modes = {}
    modes.raw = content
    modes.json = tryFormatJSON(content, true)
    modes.serializer = modes.json ? false : tryFormatSerializer(content, true)
    modes.messagepack = modes.json ? false : tryFormatMessagepack(buffer, true)
    let currentMode = 'raw'
    if (modes.messagepack) {
      currentMode = 'messagepack'
    } else if (modes.json) {
      currentMode = 'json'
    } else if (modes.serializer) {
      currentMode = 'serializer'
    }
    this.setState({modes, currentMode, changed: false}, () => {
      this.updateLayout()
    })
  }

  save() {
    let content = this.state.modes.raw
    if (this.state.currentMode === 'json') {
      content = tryFormatJSON(this.state.modes.json)
      if (!content) {
        alert('The json is invalid. Please check again.')
        return
      }
    } else if (this.state.currentMode === 'messagepack') {
      content = tryFormatMessagepack(this.state.modes.messagepack)
      if (!content) {
        alert('The json is invalid. Please check again.')
        return
      }
      content = msgpack.encode(JSON.parse(content))
    } else if (this.state.currentMode === 'serializer') {
      alert('The serializer not allow to save, Switch to raw saveable.')
      return
    }
    this.props.onSave(content, err => {
      if (err) {
        alert(`Redis save failed: ${err.message}`)
      } else {
        this.init(typeof content === 'string' ? Buffer.from(content) : content)
      }
    })
  }

  updateContent(mode, content) {
    if (this.state.modes[mode] !== content) {
      this.state.modes[mode] = content
      this.setState({modes: this.state.modes, changed: true})
    }
  }

  updateMode(evt) {
    const newMode = evt.target.value
    this.setState({currentMode: newMode})
  }

  focus() {
    const codemirror = this.refs.codemirror
    if (codemirror) {
      const node = ReactDOM.findDOMNode(codemirror)
      if (node) {
        node.focus()
      }
    }
  }

  handleKeyDown(evt) {
    if (!evt.ctrlKey && evt.metaKey && evt.keyCode === 83) {
      this.save()
      evt.preventDefault()
      evt.stopPropagation()
    }
  }

  render() {
    let viewer
    if (this.state.currentMode === 'raw') {
      viewer = (<Codemirror
        ref="codemirror"
        key="raw"
        value={this.state.modes.raw}
        onChange={this.updateContent.bind(this, 'raw')}
        options={{
          mode           : 'none',
          styleActiveLine: true,
          lineWrapping   : this.state.wrapping,
          gutters        : ['CodeMirror-lint-markers'],
          lineNumbers    : true
        }}
      />)
    } else if (this.state.currentMode === 'json') {
      viewer = (<Codemirror
        ref="codemirror"
        key="json"
        value={this.state.modes.json}
        onChange={this.updateContent.bind(this, 'json')}
        options={{
          mode             : {
            name: 'javascript',
            json: true
          },
          tabSize          : 2,
          indentWithTabs   : true,
          styleActiveLine  : true,
          lineNumbers      : true,
          lineWrapping     : this.state.wrapping,
          gutters          : ['CodeMirror-lint-markers'],
          autoCloseBrackets: true,
          matchTags        : true,
          lint             : Boolean(this.state.modes.raw)
        }}
      />)
    } else if (this.state.currentMode === 'serializer') {
      viewer = (<Codemirror
        ref="codemirror"
        key="serializer"
        value={this.state.modes.serializer}
        options={{
          disableInput     : true,
          readOnly         : true,
          mode             : {
            name: 'javascript',
            json: true
          },
          tabSize          : 2,
          indentWithTabs   : true,
          styleActiveLine  : true,
          lineNumbers      : true,
          lineWrapping     : this.state.wrapping,
          gutters          : ['CodeMirror-lint-markers'],
          autoCloseBrackets: true,
          matchTags        : true,
          lint             : Boolean(this.state.modes.raw)
        }}
      />)
    } else if (this.state.currentMode === 'messagepack') {
      viewer = (<Codemirror
        ref="codemirror"
        key="messagepack"
        value={this.state.modes.messagepack}
        onChange={this.updateContent.bind(this, 'messagepack')}
        options={{
          mode             : {
            name: 'javascript',
            json: true
          },
          tabSize          : 2,
          indentWithTabs   : true,
          styleActiveLine  : true,
          lineNumbers      : true,
          lineWrapping     : this.state.wrapping,
          gutters          : ['CodeMirror-lint-markers'],
          autoCloseBrackets: true,
          matchTags        : true,
          lint             : Boolean(this.state.modes.raw)
        }}
      />)
    } else {
      viewer = <div/>
    }
    return (<div
      style={{flex: 1, display: 'flex', flexDirection: 'column'}}
      className="Editor"
      onKeyDown={this.handleKeyDown.bind(this)}
    >
      {viewer}
      <div
        className="operation-pannel"
      >
        <label className="wrap-selector"
               ref="wrapSelector"> <input
          type="checkbox"
          checked={this.state.wrapping}
          onChange={evt => this.setState({wrapping: evt.target.checked})}
        /> <span>Wrapping</span> </label> <select
        className="mode-selector"
        value={this.state.currentMode}
        onChange={this.updateMode.bind(this)}
      >
        <option value="raw"
                disabled={typeof this.state.modes.raw !== 'string'}>Raw
        </option>
        <option value="json"
                disabled={typeof this.state.modes.json !== 'string'}>JSON
        </option>
        <option value="serializer"
                disabled={typeof this.state.modes.serializer !== 'string'}>Serializer
        </option>
        <option value="messagepack"
                disabled={typeof this.state.modes.messagepack !== 'string'}>MessagePack
        </option>
      </select>
        <button
          className="nt-button"
          disabled={!this.state.changed || this.state.currentMode == 'serializer'}
          onClick={this.save.bind(this)}
        >{this.state.currentMode == 'serializer' ? 'Read Only, Switch to raw saveable' : 'Save Changes'}</button>
      </div>
    </div>)
  }
}

export default Editor

function tryFormatJSON(jsonString, beautify) {
  try {
    const o = JSON.parse(jsonString)
    if (o && typeof o === 'object' && o !== null) {
      if (beautify) {
        return JSON.stringify(o, null, '\t')
      }
      return JSON.stringify(o)
    }
  } catch (e) { /**/
  }

  return false
}

function tryFormatSerializer(serializerString, beautify) {
  try {
    let isSerializer = serializerString
                       && typeof serializerString === 'string'
                       && (serializerString.indexOf('__iserializer__format__::') === 0
                           || serializerString.indexOf('think_serialize:') === 0)

    if (isSerializer) {
      let tmp = serializerString
      tmp = tmp.replace('__iserializer__format__::', '')
      tmp = tmp.replace('think_serialize:', '')

      tmp = php_unserialize(tmp);
      return JSON.stringify(tmp, null, '\t')
    }

  } catch (e) { /**/
  }

  return false
}

function tryFormatMessagepack(buffer, beautify) {
  try {
    let o
    if (typeof buffer === 'string') {
      o = JSON.parse(buffer)
    } else {
      o = msgpack.decode(buffer)
    }
    if (o && typeof o === 'object' && o !== null) {
      if (beautify) {
        return JSON.stringify(o, null, '\t')
      }
      return JSON.stringify(o)
    }
  } catch (e) { /**/
  }

  return false
}
