import React from 'react';

import { Table } from 'linode-components/tables';


export default function Errors() {
  return (
    <div className="GettingStartedPage">
      <div className="GettingStartedPage-header">
        <div className="GettingStartedPage-title">
          <h1>Errors</h1>
        </div>
      </div>
      <div className="GettingStartedPage-body">
        <div className="GettingStartedPage-section">
          <p>
            Success is indicated via
            <a href="https://en.wikipedia.org/wiki/List_of_HTTP_status_codes">
              standard HTTP status codes
            </a>. Generally speaking, <code>2xx</code> codes indicate success,
            <code>4xx</code> codes indicate an error on your side, and
            <code>5xx</code> codes indicate an error on our side. An error on your
            side might be an invalid input, a required parameter being omitted, and
            so on. Errors on our side are not going to happen often and we're
            probably going to be running around with our hair on fire if you ever
            see them.
          </p>
          <p>
            Every request that returns errors will look something like this:
          </p>
          <pre>
            <code>{`
          {
            "errors": [
              {
                "field": "region",
                "reason": "Record not found"
              }
            ]
          }
          `}
            </code>
          </pre>
          <p>
            The <code>errors</code> field is an array of the things that went
            wrong with your request. We will try to include as many of the
            problems in the response as possible, but it's possible that fixing
            these errors and resubmitting may result in new errors coming back
            once we are able to get further along in the process of handling
            your request.
          </p>
          <p>
            Within each error object, the <code>field</code> parameter will be
            included if the error pertains to a specific field in the JSON
            you've submitted. This will be omitted if there is no relevant
            field. The <code>reason</code> is a human-readable reason for the
            error, and will always be included.
          </p>
        </div>
        <div className="GettingStartedPage-section">
          <h4>HTTP Status Codes</h4>
          <Table
            className="Table--secondary"
            columns={[
              { dataKey: 'status', label: 'Status', headerClassName: 'StatusCodeColumn' },
              { dataKey: 'description', label: 'Description', headerClassName: 'DescriptionColumn' }
            ]}
            data={[
              { status: '200 OK', description: 'The request was successful' },
              { status: '400 Bad Request', description: 'You submitted an invalid request (missing parameters, etc)' },
              { status: '401 Unauthorized', description: 'You failed to authenticate for this resource.' },
              { status: '403 Forbidden', description: 'You are authenticated, but don\'t have permission to do this.' },
              { status: '404 Not Found', description: 'The resource you\'re asking for does not exist.' },
              { status: '420 Enhance Your Calm', description: 'You\'ve hit some sort of rate limit.' },
              { status: '500 Internal Server Error', description: 'We screwed up. Let support know (we probably already know).' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
