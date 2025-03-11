/*
 * JsonSQL
 * By: Trent Richardson [http://trentrichardson.com]
 * Version 0.1
 * Last Modified: 1/1/2008
 *
 * Copyright 2008 Trent Richardson
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

window.jsonsql = {

    query: function(sql,json){

        var returnfields = sql.match(/^(select)\s+([a-z0-9_\,\.\s\*]+)\s+from\s+([a-z0-9_\.]+)(?: where\s+\((.+)\))?\s*(?:order\sby\s+([a-z0-9_\,]+))?\s*(asc|desc|ascnum|descnum)?\s*(?:limit\s+([0-9_\,]+))?/i);

        var ops = {
            fields: returnfields[2].replace(' ','').split(','),
            from: returnfields[3].replace(' ',''),
            where: (returnfields[4] == undefined)? "true":returnfields[4],
            orderby: (returnfields[5] == undefined)? []:returnfields[5].replace(' ','').split(','),
            order: (returnfields[6] == undefined)? "asc":returnfields[6],
            limit: (returnfields[7] == undefined)? []:returnfields[7].replace(' ','').split(',')
        };

        return this.parse(json, ops);
    },

    parse: function(json,ops){
        var o = { fields:["*"], from:"json", where:"", orderby:[], order: "asc", limit:[] };
        for(i in ops) o[i] = ops[i];

        var result = [];
        result = this.returnFilter(json,o);
        result = this.returnOrderBy(result,o.orderby,o.order);
        result = this.returnLimit(result,o.limit);

        return result;
    },

    returnFilter: function(json,jsonsql_o){

        var jsonsql_scope = eval(jsonsql_o.from);
        var jsonsql_result = [];
        var jsonsql_rc = 0;

        if(jsonsql_o.where == "")
            jsonsql_o.where = "true";

        for(var jsonsql_i in jsonsql_scope){
            with(jsonsql_scope[jsonsql_i]){
                if(eval(jsonsql_o.where)){
                    jsonsql_result[jsonsql_rc++] = this.returnFields(jsonsql_scope[jsonsql_i],jsonsql_o.fields);
                }
           }
        }

        return jsonsql_result;
    },

    returnFields: function(scope,fields){
        if(fields.length == 0)
            fields = ["*"];

        if(fields[0] == "*")
            return scope;

        var returnobj = {};
        for(var i in fields)
            returnobj[fields[i]] = scope[fields[i]];

        return returnobj;
    },

    returnOrderBy: function(result,orderby,order){
        if(orderby.length == 0)
            return result;

        result.sort(function(a,b){
            switch(order.toLowerCase()){
                case "desc": return (eval('a.'+ orderby[0] +' < b.'+ orderby[0]))? 1:-1;
                case "asc":  return (eval('a.'+ orderby[0] +' > b.'+ orderby[0]))? 1:-1;
                case "descnum": return (eval('a.'+ orderby[0] +' - b.'+ orderby[0]));
                case "ascnum":  return (eval('b.'+ orderby[0] +' - a.'+ orderby[0]));
            }
        });

        return result;
    },

    returnLimit: function(result,limit){
        switch(limit.length){
            case 0: return result;
            case 1: return result.splice(0,limit[0]);
            case 2: return result.splice(limit[0]-1,limit[1]);
        }
    }

};