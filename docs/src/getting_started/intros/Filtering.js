import React from 'react';
import { Link } from 'react-router';
import { Table } from 'linode-components/tables';

import Example from '~/components/Example';
import { API_ROOT, API_VERSION } from '~/constants';


export default function Filtering() {
  return (
    <section className="Article">
      <h1>Filtering &amp; Sorting</h1>
      <section>
        <p>
          Resource lists are searchable by most fields they include.
        </p>
        <p>
          Filters are passed in the <code>X-Filter</code> header,
          and are formated as JSON objects.  Here is a request for
          all distributions whose vendor is "Debian":
        </p>
        <Example
          example={`curl "${API_ROOT}/${API_VERSION}/linode/distributions" \\
  -H 'X-Filter: {
    "vendor": "Debian"
  }'`}
          name="bash"
        />
        <p>
            The filter object's keys are the keys of the object you're filtering,
            and the values are accepted values. You can add multiple filters by
          including more than one key (in this case, all recommended Debians):
        </p>
        <Example
          example={`curl "${API_ROOT}/${API_VERSION}/linode/distributions" \\
  -H 'X-Filter: {
    "vendor": "Debian",
    "recommended": true
  }'`}
          name="bash"
        />
        <p>
          In the above example, both filters are combined with an "and" operation.
          However, if you wanted either Debian or recommended distributions,
          you can add an operator:
        </p>
        <Example
          example={`curl "${API_ROOT}/${API_VERSION}/linode/distributions" \\
  -H 'X-Filter: {
    "+or": [
      { "vendor": "Debian" },
      { "recommended": true }
    ]
  }'`}
          name="bash"
        />
        <p>
          Each filter in the <code>+or</code> array is its own filter object,
          and all conditions in it are combined with an "and"
          operator as they were in the first example. Other operators are available:
        </p>
        <Example
          example={`curl "${API_ROOT}/${API_VERSION}/linode/distributions" \\
  -H 'X-Filter: {
    "minimum_storage_size": {
      "+lte": 500
    }
}'`}
          name="bash"
        />
        <p>
          You can combine and nest operators to construct arbitrarily-complex queries - say,
          give me all distributions which are either recommended or whose vendor is Debian,
          or who have a minimum_storage_size between 100 and 500 (inclusive).
        </p>
        <Example
          example={`curl "${API_ROOT}/${API_VERSION}/linode/distributions" \\
  -H 'X-Filter: {
    "+or": [
      {
        "+or": [
          {
            "vendor": "Debian"
          },
          {
            "recommended": true
          }
        ]
      },
      {
        "+and": [
          {
            "minimum_storage_size": {
              "+lte": 500
            }
          },
          {
            "minimum_storage_size": {
              "+gte": 100
            }
          }
        ]
      }
    ]
  }'`}
          name="bash"
        />
        <p>
          Below is a list of all available operators. Operators are keys of a Filter JSON object.
          Their value must be of the appropriate type, and they are evaluated as described below.
        </p>
        <Table
          className="Table--secondary"
          columns={[
            { dataKey: 'operator', label: 'Operator', headerClassName: 'OperatorColumn' },
            { dataKey: 'type', label: 'Type', headerClassName: 'TypeColumn' },
            { dataKey: 'description', label: 'Description', headerClassName: 'DescriptionColumn' },
          ]}
          data={[
            { operator: '+and', type: 'array', description: 'All conditions must be true' },
            { operator: '+or', type: 'array', description: 'One condition must be true' },
            { operator: '+gt', type: 'number', description: 'Value must be greater than number' },
            {
              operator: '+gte',
              type: 'number',
              description: 'Value must be greater than or equal to that number',
            },
            { operator: '+lt', type: 'number', description: 'Value must be less than number' },
            {
              operator: '+lte',
              type: 'number',
              description: 'Value must be less than or equal to that number',
            },
            {
              operator: '+contains',
              type: 'string',
              description: 'Given string must be in the value',
            },
            { operator: '+neq', type: 'string', description: 'Does not equal the value' },
            {
              operator: '+order-by',
              type: 'string',
              description: 'Attribute to order the results by - must be filterable',
            },
            {
              operator: '+order',
              type: 'string',
              description: 'Either "asc" or "desc". ' +
                'Defaults to "asc". Requires an "+order-by" be given.',
            },
          ]}
        />
      </section>
      <div className="text-sm-center">
        <Link to={`/${API_VERSION}/errors`}>
          How errors are reported &raquo;
        </Link>
      </div>
    </section>
  );
}
