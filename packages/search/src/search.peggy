start
  = orQuery

orQuery
  = left:andQuery Or right:orQuery { return { "+or": [left, right] }; }
  / andQuery
  / DefaultQuery

andQuery
  = left:subQuery And right:andQuery { return { "+and": [left, right] }; }
  / subQuery

subQuery
  = '(' ws* query:orQuery ws* ')' { return query; }
  / EqualQuery
  / TagQuery
  / ContainsQuery
  / NotEqualQuery
  / LessThanQuery
  / LessThenOrEqualTo
  / GreaterThanQuery
  / GreaterThanOrEqualTo

DefaultQuery
  = input:String {
      const keys = options.searchableFieldsWithoutOperator;
      return { "+or": keys.map((key) => ({ [key]: { "+contains": input } })) };
    }

EqualQuery
  = key:FilterableField ws* Equal ws* value:Number { return { [key]: value }; }
  / key:FilterableField ws* Equal ws* value:String { return { [key]: value }; }

ContainsQuery
  = key:FilterableField ws* Contains ws* value:String {
    console.log(options, value);
    if (options.containsOverride && key === options.containsOverride.field) {
      return options.containsOverride.filter(value);
    }
    return { [key]: { "+contains": value } };
  }

TagQuery
  = "tag" ws* Contains ws* value:String { return { "tags": { "+contains": value } }; }

NotEqualQuery
  = Not key:FilterableField ws* Equal ws* value:String { return { [key]: { "+neq": value } }; }

LessThanQuery
  = key:FilterableField ws* Less ws* value:Number { return { [key]: { "+lt": value } }; }

GreaterThanQuery
  = key:FilterableField ws* Greater ws* value:Number { return { [key]: { "+gt": value } }; }

GreaterThanOrEqualTo
  = key:FilterableField ws* Gte ws* value:Number { return { [key]: { "+gte": value } }; }

LessThenOrEqualTo
  = key:FilterableField ws* Lte ws* value:Number { return { [key]: { "+lte": value } }; }

Or
  = ws+ 'or'i ws+
  / ws* '||' ws*
  / ws* '|' ws*

And
  = ws+ 'and'i ws+
  / ws* '&&' ws*
  / ws* '&' ws*
  / ws

Not
  = '!'
  / '-'

Less
  = '<'

Greater
  = '>'

Gte
  = '>='

Lte
  = '<='

Equal
  = "="

Contains
  = "~"
  / ":"

Quote
  = "\""
  / "\'"

FilterableField "filterable field"
  = [a-zA-Z0-9\-\.]+ { return text(); }

String "search value"
  = Quote value:StringWithSpaces Quote { return value }
  / Word

Word "word"
  = [a-zA-Z0-9\-\.]+ { return text(); }

StringWithSpaces "string with spaces"
  = [a-zA-Z0-9\-\. ]+ { return text(); }

Number "numeric search value"
  = number:[0-9\.]+ { return parseFloat(number.join("")); }
  / number:[0-9]+ { return parseInt(number.join(""), 10); }

ws "whitespace"
  = [ \t\r\n]
