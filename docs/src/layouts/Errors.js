import React from 'react';

export default function Errors() {
  return (
    <div>
      <div>
      <div>
        <h4>
          Errors
          <span className="anchor" id="errors">&nbsp;</span>
        </h4>
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
    <pre><code>{`
    {
      "errors": [
        {
          "field": "region",
          "reason": "Record not found"
        }
      ]
    }
    `}</code></pre>
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
      <div className="col-lg-6 right">
        <h4>HTTP Status Codes</h4>
        <table className="table">
          <tbody>
            <tr>
              <td>200 OK</td>
              <td>The request was successful</td>
            </tr>
            <tr>
              <td>400 Bad Request</td>
              <td>You submitted an invalid request (missing parameters, etc)</td>
            </tr>
            <tr>
              <td>401 Unauthorized</td>
              <td>You failed to authenticate for this resource.</td>
            </tr>
            <tr>
              <td>403 Forbidden</td>
              <td>You are authenticated, but don't have permission to do this.</td>
            </tr>
            <tr>
              <td>404 Not Found</td>
              <td>The resource you're asking for does not exist.</td>
            </tr>
            <tr>
              <td>420 Enhance Your Calm</td>
              <td>You've hit some sort of rate limit.</td>
            </tr>
            <tr>
              <td>500 Internal Server Error</td>
              <td>We screwed up. Let support know (we probably already know).</td>
            </tr>
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}
