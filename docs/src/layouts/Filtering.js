import React from 'react';
const API_ROOT = 'api.alpha.linode.com';
const API_VERSION = 'v4';

export default function Filtering() {
  return (
    <div>
      <div className="row reference white">
        <div className="col-lg-6 left">
          <h4>
            Filtering
            <span className="anchor" id="filtering">&nbsp;</span>
          </h4>
          <p>
            Resource lists are searchable by most fields they include (filterable fields are marked with
            a <i className="fa fa-filter"></i> icon in the <a href="#">object reference</a>).
          </p>
        </div>
      </div>
      <div className="row reference white">
        <div className="col-lg-6 left">
          <p>
          Filters are passed in the <code>X-Filter</code> header, and are formated as JSON objects.  Here is a
          request for all distributions whose vendor is "Debian":
          </p>
        </div>
        <div className="col-lg-6 right">
      <pre><code>curl "https://{ API_ROOT }/{ API_VERSION }/linode/distributions" \
        {`-H 'X-Filter: {
          "vendor": "Debian"
        }'
        `}</code></pre>
        </div>
      </div>
      <br/>
      <div className="row reference white">
        <div className="col-lg-6 left">
            The filter object's keys are the keys of the object you're filtering, and the values are accepted values.
            You can add multiple filters by including more than one key (in this case, all recommended Debians):
        </div>
        <div className="col-lg-6 right">
      <pre><code>curl "https://{ API_ROOT }/{ API_VERSION }/linode/distributions" \
        {`-H 'X-Filter: {
          "vendor": "Debian",
          "recommended": true
        }'
        `}</code></pre>
       </div>
      </div>
      <br/>
      <div className="row reference white">
       <div className="col-lg-6 left">
            In the above example, both filters are combined with an "and" operation.  However, if you wanted either Debian or recommended
            distributions, you can add an operator:
       </div>
        <div className="col-lg-6 right">
      <pre><code>curl "https://{ API_ROOT }/{ API_VERSION }/linode/distributions" \
        {`-H 'X-Filter: {
          "+or": [
            { "vendor": "Debian" },
            { "recommended": true }
          ]
        }'
        `}</code></pre>
        </div>
      </div>
      <br/>
      <div className="row reference white">
        <div className="col-lg-6 left">
          <p>
          Each filter in the <code>+or</code> array is its own filter object, and all conditions in it are combined with an "and" operator
          as they were in the first example.  Other operators are available:
          </p>
        </div>
        <div className="col-lg-6 right">
      <pre><code>curl "https://{ API_ROOT }/{ API_VERSION }/linode/distributions" \
        {`-H 'X-Filter: {
          "minimum_storage_size": {
            "+lte": 500
          }
        }'
        `}</code></pre>
        </div>
      </div>
      <br/>
      <div className="row reference white">
        <div className="col-lg-6 left">
          <p>
          You can combine and nest operators to construct arbitrarily-complex queries - say, give me all distributions which are either
          recommended or whose vendor is Debian, or who have a minimum_storage_size between 100 and 500 (inclusive).
          </p>
          <p>
          Below is a list of all available operators. Operators are keys of a Filter JSON object, their value must be of the appropriate
          type, and they are evaluated as described below.
          </p>
          <table className="table">
            <tr>
              <td>+and</td>
              <td>array</td>
              <td>All conditions must be true</td>
            </tr>
            <tr>
              <td>+or</td>
              <td>array</td>
              <td>One condition must be true.</td>
            </tr>
            <tr>
              <td>+gt</td>
              <td>number</td>
              <td>Value must be greater than number</td>
            </tr>
            <tr>
              <td>+gte</td>
              <td>number</td>
              <td>Value must be greater than or equal to that number</td>
            </tr>
            <tr>
              <td>+lt</td>
              <td>number</td>
              <td>Value must be less than number</td>
            </tr>
            <tr>
              <td>+lte</td>
              <td>number</td>
              <td>Value must be less than or equal to that number</td>
            </tr>
            <tr>
              <td>+contains</td>
              <td>string</td>
              <td>Given string must be in the value</td>
            </tr>
            <tr>
              <td>+neq</td>
              <td>string</td>
              <td>Does not equal the value</td>
            </tr>
            <tr>
              <td>+order-by</td>
              <td>string</td>
              <td>Attribute to order the results by - must be filterable</td>
            </tr>
            <tr>
              <td>+order</td>
              <td>string</td>
              <td>Either "asc" or "desc".  Defaults to "asc".  Requires an '+order-by' be given.</td>
            </tr>
          </table>
        </div>
        <div className="col-lg-6 right">
      <pre><code>curl "https://{ API_ROOT }/{ API_VERSION }/linode/distributions" \
        {`-H 'X-Filter: {
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
        }'
        `}</code></pre>
        </div>
      </div>
    </div>
  );
}
