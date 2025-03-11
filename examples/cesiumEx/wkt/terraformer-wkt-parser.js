(function (root, factory) {

  // Node.
  if(typeof module === 'object' && typeof module.exports === 'object') {
    exports = module.exports = factory(require("terraformer"));
  } else if(typeof navigator === "object") {
    // Browser Global.
    if (!root.Terraformer){
      throw new Error("Terraformer.WKT requires the core Terraformer library. http://github.com/esri/terraformer")
    }
    root.Terraformer.WKT = factory(root.Terraformer);
  }

}(this, function(Terraformer) {
  var exports = { };

  /* Jison generated parser */
var parser = (function(){
var parser = {trace: function trace () { },
yy: {},
symbols_: {"error":2,"expressions":3,"point":4,"EOF":5,"linestring":6,"polygon":7,"multipoint":8,"multilinestring":9,"multipolygon":10,"coordinate":11,"DOUBLE_TOK":12,"ptarray":13,"COMMA":14,"ring_list":15,"ring":16,"(":17,")":18,"POINT":19,"Z":20,"ZM":21,"M":22,"EMPTY":23,"point_untagged":24,"polygon_list":25,"polygon_untagged":26,"point_list":27,"LINESTRING":28,"POLYGON":29,"MULTIPOINT":30,"MULTILINESTRING":31,"MULTIPOLYGON":32,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",12:"DOUBLE_TOK",14:"COMMA",17:"(",18:")",19:"POINT",20:"Z",21:"ZM",22:"M",23:"EMPTY",28:"LINESTRING",29:"POLYGON",30:"MULTIPOINT",31:"MULTILINESTRING",32:"MULTIPOLYGON"},
productions_: [0,[3,2],[3,2],[3,2],[3,2],[3,2],[3,2],[11,2],[11,3],[11,4],[13,3],[13,1],[15,3],[15,1],[16,3],[4,4],[4,5],[4,5],[4,5],[4,2],[24,1],[24,3],[25,3],[25,1],[26,3],[27,3],[27,1],[6,4],[6,5],[6,5],[6,5],[6,2],[7,4],[7,5],[7,5],[7,5],[7,2],[8,4],[8,5],[8,5],[8,5],[8,2],[9,4],[9,5],[9,5],[9,5],[9,2],[10,4],[10,5],[10,5],[10,5],[10,2]],
performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$,_$
) {

var $0 = $.length - 1;
switch (yystate) {
case 1: return $[$0-1]; 
break;
case 2: return $[$0-1]; 
break;
case 3: return $[$0-1]; 
break;
case 4: return $[$0-1]; 
break;
case 5: return $[$0-1]; 
break;
case 6: return $[$0-1]; 
break;
case 7: this.$ = new PointArray([ Number($[$0-1]), Number($[$0]) ]); 
break;
case 8: this.$ = new PointArray([ Number($[$0-2]), Number($[$0-1]), Number($[$0]) ]); 
break;
case 9: this.$ = new PointArray([ Number($[$0-3]), Number($[$0-2]), Number($[$0-1]), Number($[$0]) ]); 
break;
case 10: this.$ = $[$0-2].addPoint($[$0]); 
break;
case 11: this.$ = $[$0]; 
break;
case 12: this.$ = $[$0-2].addRing($[$0]); 
break;
case 13: this.$ = new RingList($[$0]); 
break;
case 14: this.$ = new Ring($[$0-1]); 
break;
case 15: this.$ = { "type": "Point", "coordinates": $[$0-1].data[0] }; 
break;
case 16: this.$ = { "type": "Point", "coordinates": $[$0-1].data[0], "properties": { z: true } }; 
break;
case 17: this.$ = { "type": "Point", "coordinates": $[$0-1].data[0], "properties": { z: true, m: true } }; 
break;
case 18: this.$ = { "type": "Point", "coordinates": $[$0-1].data[0], "properties": { m: true } }; 
break;
case 19: this.$ = { "type": "Point", "coordinates": [ ] }; 
break;
case 20: this.$ = $[$0]; 
break;
case 21: this.$ = $[$0-1]; 
break;
case 22: this.$ = $[$0-2].addPolygon($[$0]); 
break;
case 23: this.$ = new PolygonList($[$0]); 
break;
case 24: this.$ = $[$0-1]; 
break;
case 25: this.$ = $[$0-2].addPoint($[$0]); 
break;
case 26: this.$ = $[$0]; 
break;
case 27: this.$ = { "type": "LineString", "coordinates": $[$0-1].data }; 
break;
case 28: this.$ = { "type": "LineString", "coordinates": $[$0-1].data, "properties": { z: true } }; 
break;
case 29: this.$ = { "type": "LineString", "coordinates": $[$0-1].data, "properties": { m: true } }; 
break;
case 30: this.$ = { "type": "LineString", "coordinates": $[$0-1].data, "properties": { z: true, m: true } }; 
break;
case 31: this.$ = { "type": "LineString", "coordinates": [ ] }; 
break;
case 32: this.$ = { "type": "Polygon", "coordinates": $[$0-1].toJSON() }; 
break;
case 33: this.$ = { "type": "Polygon", "coordinates": $[$0-1].toJSON(), "properties": { z: true } }; 
break;
case 34: this.$ = { "type": "Polygon", "coordinates": $[$0-1].toJSON(), "properties": { m: true } }; 
break;
case 35: this.$ = { "type": "Polygon", "coordinates": $[$0-1].toJSON(), "properties": { z: true, m: true } }; 
break;
case 36: this.$ = { "type": "Polygon", "coordinates": [ ] }; 
break;
case 37: this.$ = { "type": "MultiPoint", "coordinates": $[$0-1].data }; 
break;
case 38: this.$ = { "type": "MultiPoint", "coordinates": $[$0-1].data, "properties": { z: true } }; 
break;
case 39: this.$ = { "type": "MultiPoint", "coordinates": $[$0-1].data, "properties": { m: true } }; 
break;
case 40: this.$ = { "type": "MultiPoint", "coordinates": $[$0-1].data, "properties": { z: true, m: true } }; 
break;
case 41: this.$ = { "type": "MultiPoint", "coordinates": [ ] } 
break;
case 42: this.$ = { "type": "MultiLineString", "coordinates": $[$0-1].toJSON() }; 
break;
case 43: this.$ = { "type": "MultiLineString", "coordinates": $[$0-1].toJSON(), "properties": { z: true } }; 
break;
case 44: this.$ = { "type": "MultiLineString", "coordinates": $[$0-1].toJSON(), "properties": { m: true } }; 
break;
case 45: this.$ = { "type": "MultiLineString", "coordinates": $[$0-1].toJSON(), "properties": { z: true, m: true } }; 
break;
case 46: this.$ = { "type": "MultiLineString", "coordinates": [ ] }; 
break;
case 47: this.$ = { "type": "MultiPolygon", "coordinates": $[$0-1].toJSON() }; 
break;
case 48: this.$ = { "type": "MultiPolygon", "coordinates": $[$0-1].toJSON(), "properties": { z: true } }; 
break;
case 49: this.$ = { "type": "MultiPolygon", "coordinates": $[$0-1].toJSON(), "properties": { m: true } }; 
break;
case 50: this.$ = { "type": "MultiPolygon", "coordinates": $[$0-1].toJSON(), "properties": { z: true, m: true } }; 
break;
case 51: this.$ = { "type": "MultiPolygon", "coordinates": [ ] }; 
break;
}
},
table: [{3:1,4:2,6:3,7:4,8:5,9:6,10:7,19:[1,8],28:[1,9],29:[1,10],30:[1,11],31:[1,12],32:[1,13]},{1:[3]},{5:[1,14]},{5:[1,15]},{5:[1,16]},{5:[1,17]},{5:[1,18]},{5:[1,19]},{17:[1,20],20:[1,21],21:[1,22],22:[1,23],23:[1,24]},{17:[1,25],20:[1,26],21:[1,28],22:[1,27],23:[1,29]},{17:[1,30],20:[1,31],21:[1,33],22:[1,32],23:[1,34]},{17:[1,35],20:[1,36],21:[1,38],22:[1,37],23:[1,39]},{17:[1,40],20:[1,41],21:[1,43],22:[1,42],23:[1,44]},{17:[1,45],20:[1,46],21:[1,48],22:[1,47],23:[1,49]},{1:[2,1]},{1:[2,2]},{1:[2,3]},{1:[2,4]},{1:[2,5]},{1:[2,6]},{11:51,12:[1,52],13:50},{17:[1,53]},{17:[1,54]},{17:[1,55]},{5:[2,19]},{11:58,12:[1,52],17:[1,59],24:57,27:56},{17:[1,60]},{17:[1,61]},{17:[1,62]},{5:[2,31]},{15:63,16:64,17:[1,65]},{17:[1,66]},{17:[1,67]},{17:[1,68]},{5:[2,36]},{11:58,12:[1,52],17:[1,59],24:57,27:69},{17:[1,70]},{17:[1,71]},{17:[1,72]},{5:[2,41]},{15:73,16:64,17:[1,65]},{17:[1,74]},{17:[1,75]},{17:[1,76]},{5:[2,46]},{17:[1,79],25:77,26:78},{17:[1,80]},{17:[1,81]},{17:[1,82]},{5:[2,51]},{14:[1,84],18:[1,83]},{14:[2,11],18:[2,11]},{12:[1,85]},{11:51,12:[1,52],13:86},{11:51,12:[1,52],13:87},{11:51,12:[1,52],13:88},{14:[1,90],18:[1,89]},{14:[2,26],18:[2,26]},{14:[2,20],18:[2,20]},{11:91,12:[1,52]},{11:58,12:[1,52],17:[1,59],24:57,27:92},{11:58,12:[1,52],17:[1,59],24:57,27:93},{11:58,12:[1,52],17:[1,59],24:57,27:94},{14:[1,96],18:[1,95]},{14:[2,13],18:[2,13]},{11:51,12:[1,52],13:97},{15:98,16:64,17:[1,65]},{15:99,16:64,17:[1,65]},{15:100,16:64,17:[1,65]},{14:[1,90],18:[1,101]},{11:58,12:[1,52],17:[1,59],24:57,27:102},{11:58,12:[1,52],17:[1,59],24:57,27:103},{11:58,12:[1,52],17:[1,59],24:57,27:104},{14:[1,96],18:[1,105]},{15:106,16:64,17:[1,65]},{15:107,16:64,17:[1,65]},{15:108,16:64,17:[1,65]},{14:[1,110],18:[1,109]},{14:[2,23],18:[2,23]},{15:111,16:64,17:[1,65]},{17:[1,79],25:112,26:78},{17:[1,79],25:113,26:78},{17:[1,79],25:114,26:78},{5:[2,15]},{11:115,12:[1,52]},{12:[1,116],14:[2,7],18:[2,7]},{14:[1,84],18:[1,117]},{14:[1,84],18:[1,118]},{14:[1,84],18:[1,119]},{5:[2,27]},{11:58,12:[1,52],17:[1,59],24:120},{18:[1,121]},{14:[1,90],18:[1,122]},{14:[1,90],18:[1,123]},{14:[1,90],18:[1,124]},{5:[2,32]},{16:125,17:[1,65]},{14:[1,84],18:[1,126]},{14:[1,96],18:[1,127]},{14:[1,96],18:[1,128]},{14:[1,96],18:[1,129]},{5:[2,37]},{14:[1,90],18:[1,130]},{14:[1,90],18:[1,131]},{14:[1,90],18:[1,132]},{5:[2,42]},{14:[1,96],18:[1,133]},{14:[1,96],18:[1,134]},{14:[1,96],18:[1,135]},{5:[2,47]},{17:[1,79],26:136},{14:[1,96],18:[1,137]},{14:[1,110],18:[1,138]},{14:[1,110],18:[1,139]},{14:[1,110],18:[1,140]},{14:[2,10],18:[2,10]},{12:[1,141],14:[2,8],18:[2,8]},{5:[2,16]},{5:[2,17]},{5:[2,18]},{14:[2,25],18:[2,25]},{14:[2,21],18:[2,21]},{5:[2,28]},{5:[2,29]},{5:[2,30]},{14:[2,12],18:[2,12]},{14:[2,14],18:[2,14]},{5:[2,33]},{5:[2,34]},{5:[2,35]},{5:[2,38]},{5:[2,39]},{5:[2,40]},{5:[2,43]},{5:[2,44]},{5:[2,45]},{14:[2,22],18:[2,22]},{14:[2,24],18:[2,24]},{5:[2,48]},{5:[2,49]},{5:[2,50]},{14:[2,9],18:[2,9]}],
defaultActions: {14:[2,1],15:[2,2],16:[2,3],17:[2,4],18:[2,5],19:[2,6],24:[2,19],29:[2,31],34:[2,36],39:[2,41],44:[2,46],49:[2,51],83:[2,15],89:[2,27],95:[2,32],101:[2,37],105:[2,42],109:[2,47],117:[2,16],118:[2,17],119:[2,18],122:[2,28],123:[2,29],124:[2,30],127:[2,33],128:[2,34],129:[2,35],130:[2,38],131:[2,39],132:[2,40],133:[2,43],134:[2,44],135:[2,45],138:[2,48],139:[2,49],140:[2,50]},
parseError: function parseError (str, hash) {
    throw new Error(str);
},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    this.yy.parser = this;
    if (typeof this.lexer.yylloc == "undefined")
        this.lexer.yylloc = {};
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    var ranges = this.lexer.options && this.lexer.options.ranges;
    if (typeof this.yy.parseError === "function")
        this.parseError = this.yy.parseError;
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || 1;
        if (typeof token !== "number") {
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == "undefined") {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
        if (typeof action === "undefined" || !action.length || !action[0]) {
            var errStr = "";
            if (!recovering) {
                expected = [];
                for (p in table[state])
                    if (this.terminals_[p] && p > 2) {
                        expected.push("'" + this.terminals_[p] + "'");
                    }
                if (this.lexer.showPosition) {
                    errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
                } else {
                    errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1?"end of input":"'" + (this.terminals_[symbol] || symbol) + "'");
                }
                this.parseError(errStr, {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
            }
        }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0)
                    recovering--;
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {first_line: lstack[lstack.length - (len || 1)].first_line, last_line: lstack[lstack.length - 1].last_line, first_column: lstack[lstack.length - (len || 1)].first_column, last_column: lstack[lstack.length - 1].last_column};
            if (ranges) {
                yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
            }
            r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
            if (typeof r !== "undefined") {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}
};
undefined/* Jison generated lexer */
var lexer = (function(){
var lexer = ({EOF:1,
parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },
setInput:function (input) {
        this._input = input;
        this._more = this._less = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {first_line:1,first_column:0,last_line:1,last_column:0};
        if (this.options.ranges) this.yylloc.range = [0,0];
        this.offset = 0;
        return this;
    },
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) this.yylloc.range[1]++;

        this._input = this._input.slice(1);
        return ch;
    },
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length-len-1);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length-1);
        this.matched = this.matched.substr(0, this.matched.length-1);

        if (lines.length-1) this.yylineno -= lines.length-1;
        var r = this.yylloc.range;

        this.yylloc = {first_line: this.yylloc.first_line,
          last_line: this.yylineno+1,
          first_column: this.yylloc.first_column,
          last_column: lines ?
              (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length:
              this.yylloc.first_column - len
          };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        return this;
    },
more:function () {
        this._more = true;
        return this;
    },
less:function (n) {
        this.unput(this.match.slice(n));
    },
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20)+(next.length > 20 ? '...':'')).replace(/\n/g, "");
    },
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c+"^";
    },
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) this.done = true;

        var token,
            match,
            tempMatch,
            index,
            col,
            lines;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i=0;i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (!this.options.flex) break;
            }
        }
        if (match) {
            lines = match[0].match(/(?:\r\n?|\n).*/g);
            if (lines) this.yylineno += lines.length;
            this.yylloc = {first_line: this.yylloc.last_line,
                           last_line: this.yylineno+1,
                           first_column: this.yylloc.last_column,
                           last_column: lines ? lines[lines.length-1].length-lines[lines.length-1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length};
            this.yytext += match[0];
            this.match += match[0];
            this.matches = match;
            this.yyleng = this.yytext.length;
            if (this.options.ranges) {
                this.yylloc.range = [this.offset, this.offset += this.yyleng];
            }
            this._more = false;
            this._input = this._input.slice(match[0].length);
            this.matched += match[0];
            token = this.performAction.call(this, this.yy, this, rules[index],this.conditionStack[this.conditionStack.length-1]);
            if (this.done && this._input) this.done = false;
            if (token) return token;
            else return;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line '+(this.yylineno+1)+'. Unrecognized text.\n'+this.showPosition(),
                    {text: "", token: null, line: this.yylineno});
        }
    },
lex:function lex () {
        var r = this.next();
        if (typeof r !== 'undefined') {
            return r;
        } else {
            return this.lex();
        }
    },
begin:function begin (condition) {
        this.conditionStack.push(condition);
    },
popState:function popState () {
        return this.conditionStack.pop();
    },
_currentRules:function _currentRules () {
        return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules;
    },
topState:function () {
        return this.conditionStack[this.conditionStack.length-2];
    },
pushState:function begin (condition) {
        this.begin(condition);
    }});
lexer.options = {};
lexer.performAction = function anonymous(yy,yy_,$avoiding_name_collisions,YY_START
) {

var YYSTATE=YY_START
switch($avoiding_name_collisions) {
case 0:// ignore
break;
case 1:return 17
break;
case 2:return 18
break;
case 3:return 12
break;
case 4:return 19
break;
case 5:return 28
break;
case 6:return 29
break;
case 7:return 30
break;
case 8:return 31
break;
case 9:return 32
break;
case 10:return 14
break;
case 11:return 23
break;
case 12:return 22
break;
case 13:return 20
break;
case 14:return 21
break;
case 15:return 5
break;
case 16:return "INVALID"
break;
}
};
lexer.rules = [/^(?:\s+)/,/^(?:\()/,/^(?:\))/,/^(?:-?[0-9]+(\.[0-9]+)?([eE][\-\+]?[0-9]+)?)/,/^(?:POINT\b)/,/^(?:LINESTRING\b)/,/^(?:POLYGON\b)/,/^(?:MULTIPOINT\b)/,/^(?:MULTILINESTRING\b)/,/^(?:MULTIPOLYGON\b)/,/^(?:,)/,/^(?:EMPTY\b)/,/^(?:M\b)/,/^(?:Z\b)/,/^(?:ZM\b)/,/^(?:$)/,/^(?:.)/];
lexer.conditions = {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],"inclusive":true}};
return lexer;})()
parser.lexer = lexer;
function Parser () { this.yy = {}; }Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();

  function PointArray (point) {
    this.data = [ point ];
    this.type = 'PointArray';
  }

  PointArray.prototype.addPoint = function (point) {
    if (point.type === 'PointArray') {
      this.data = this.data.concat(point.data);
    } else {
      this.data.push(point);
    }

    return this;
  };

  PointArray.prototype.toJSON = function () {
    return this.data;
  };

  function Ring (point) {
    this.data = point;
    this.type = 'Ring';
  }

  Ring.prototype.toJSON = function () {
    var data = [ ];

    for (var i = 0; i < this.data.data.length; i++) {
      data.push(this.data.data[i]);
    }

    return data;
  };

  function RingList (ring) {
    this.data = [ ring ];
    this.type = 'RingList';
  }

  RingList.prototype.addRing = function (ring) {
    this.data.push(ring);

    return this;
  };

  RingList.prototype.toJSON = function () {
    var data = [ ];

    for (var i = 0; i < this.data.length; i++) {
      data.push(this.data[i].toJSON());
    }

    if (data.length === 1) {
      return data;
    } else {
      return data;
    }
  };

  function PolygonList (polygon) {
    this.data = [ polygon ];
    this.type = 'PolygonList';
  }

  PolygonList.prototype.addPolygon = function (polygon) {
    this.data.push(polygon);

    return this;
  };

  PolygonList.prototype.toJSON = function () {
    var data = [ ];

    for (var i = 0; i < this.data.length; i++) {
      data = data.concat( [ this.data[i].toJSON() ] );
    }

    return data;
  };

  function _parse () {
    return parser.parse.apply(parser, arguments);
  }

  function parse (element) {
    var res, primitive;

    try {
      res = parser.parse(element);
    } catch (err) {
      throw Error("Unable to parse: " + err);
    }

    return Terraformer.Primitive(res);
  }

  function arrayToRing (arr) {
    var parts = [ ], ret = '';

    for (var i = 0; i < arr.length; i++) {
      parts.push(arr[i].join(' '));
    }

    ret += '(' + parts.join(', ') + ')';

    return ret;

  }

  function pointToWKTPoint (primitive) {
    var ret = 'POINT ';

    if (primitive.coordinates === undefined || primitive.coordinates.length === 0) {
      ret += 'EMPTY';

      return ret;
    } else if (primitive.coordinates.length === 3) {
      // 3d or time? default to 3d
      if (primitive.properties && primitive.properties.m === true) {
        ret += 'M ';
      } else {
        ret += 'Z ';
      }
    } else if (primitive.coordinates.length === 4) {
      // 3d and time
      ret += 'ZM ';
    }

    // include coordinates
    ret += '(' + primitive.coordinates.join(' ') + ')';

    return ret;
  }

  function lineStringToWKTLineString (primitive) {
    var ret = 'LINESTRING ';

    if (primitive.coordinates === undefined || primitive.coordinates.length === 0 || primitive.coordinates[0].length === 0) {
      ret += 'EMPTY';

      return ret;
    } else if (primitive.coordinates[0].length === 3) {
      if (primitive.properties && primitive.properties.m === true) {
        ret += 'M ';
      } else {
        ret += 'Z ';
      }
    } else if (primitive.coordinates[0].length === 4) {
      ret += 'ZM ';
    }

    ret += arrayToRing(primitive.coordinates);

    return ret;
  }

  function polygonToWKTPolygon (primitive) {
    var ret = 'POLYGON ';

    if (primitive.coordinates === undefined || primitive.coordinates.length === 0 || primitive.coordinates[0].length === 0) {
      ret += 'EMPTY';

      return ret;
    } else if (primitive.coordinates[0][0].length === 3) {
      if (primitive.properties && primitive.properties.m === true) {
        ret += 'M ';
      } else {
        ret += 'Z ';
      }
    } else if (primitive.coordinates[0][0].length === 4) {
      ret += 'ZM ';
    }

    ret += '(';
    var parts = [ ];
    for (var i = 0; i < primitive.coordinates.length; i++) {
      parts.push(arrayToRing(primitive.coordinates[i]));
    }

    ret += parts.join(', ');
    ret += ')';

    return ret;
  }

  function multiPointToWKTMultiPoint (primitive) {
    var ret = 'MULTIPOINT ';

    if (primitive.coordinates === undefined || primitive.coordinates.length === 0 || primitive.coordinates[0].length === 0) {
      ret += 'EMPTY';

      return ret;
    } else if (primitive.coordinates[0].length === 3) {
      if (primitive.properties && primitive.properties.m === true) {
        ret += 'M ';
      } else {
        ret += 'Z ';
      }
    } else if (primitive.coordinates[0].length === 4) {
      ret += 'ZM ';
    }

    ret += arrayToRing(primitive.coordinates);

    return ret;
  }

  function multiLineStringToWKTMultiLineString (primitive) {
    var ret = 'MULTILINESTRING ';

    if (primitive.coordinates === undefined || primitive.coordinates.length === 0 || primitive.coordinates[0].length === 0) {
      ret += 'EMPTY';

      return ret;
    } else if (primitive.coordinates[0][0].length === 3) {
      if (primitive.properties && primitive.properties.m === true) {
        ret += 'M ';
      } else {
        ret += 'Z ';
      }
    } else if (primitive.coordinates[0][0].length === 4) {
      ret += 'ZM ';
    }

    ret += '(';
    var parts = [ ];
    for (var i = 0; i < primitive.coordinates.length; i++) {
      parts.push(arrayToRing(primitive.coordinates[i]));
    }

    ret += parts.join(', ');
    ret += ')';

    return ret;
  }

  function multiPolygonToWKTMultiPolygon (primitive) {
    var ret = 'MULTIPOLYGON ';

    if (primitive.coordinates === undefined || primitive.coordinates.length === 0 || primitive.coordinates[0].length === 0 || primitive.coordinates[0][0].length === 0) {
      ret += 'EMPTY';

      return ret;
    } else if (primitive.coordinates[0][0][0].length === 3) {
      if (primitive.properties && primitive.properties.m === true) {
        ret += 'M ';
      } else {
        ret += 'Z ';
      }
    } else if (primitive.coordinates[0][0][0].length === 4) {
      ret += 'ZM ';
    }

    ret += '(';
    var inner = [ ];
    for (var c = 0; c < primitive.coordinates.length; c++) {
      var it = '(';
      var parts = [ ];
      for (var i = 0; i < primitive.coordinates[c].length; i++) {
        parts.push(arrayToRing(primitive.coordinates[c][i]));
      }

      it += parts.join(', ');
      it += ')';

      inner.push(it);
    }

    ret += inner.join(', ');
    ret += ')';

    return ret;
  }

  function convert (primitive) {
    switch (primitive.type) {
      case 'Point':
        return pointToWKTPoint(primitive);
      case 'LineString':
        return lineStringToWKTLineString(primitive);
      case 'Polygon':
        return polygonToWKTPolygon(primitive);
      case 'MultiPoint':
        return multiPointToWKTMultiPoint(primitive);
      case 'MultiLineString':
        return multiLineStringToWKTMultiLineString(primitive);
      case 'MultiPolygon':
        return multiPolygonToWKTMultiPolygon(primitive);
      case 'GeometryCollection':
        var ret = 'GEOMETRYCOLLECTION';
        var parts = [ ];
        for (i = 0; i < primitive.geometries.length; i++){
          parts.push(convert(primitive.geometries[i]));
        }
        return ret + '(' + parts.join(', ') + ')';
      default:
        throw Error ("Unknown Type: " + primitive.type);
    }
  }

  exports.parser  = parser;
  exports.Parser  = parser.Parser;
  exports.parse   = parse;
  exports.convert = convert;

  return exports;
}));
