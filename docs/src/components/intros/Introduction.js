import React from 'react';
const API_ROOT = 'api.alpha.linode.com';
const API_VERSION = 'v4';
export default function Introduction() {
  return (
    <div className="GettingStartedPage">
      <div className="GettingStartedPage-header">
        <div className="GettingStartedPage-title">
          <h1>Introduction</h1>
        </div>
      </div>
      <div className="GettingStartedPage-body">
        <p>
          The Linode API is an HTTP service that follows (to a large extent)&nbsp;
          <a href="https://en.wikipedia.org/wiki/Representational_state_transfer" target="_blank">REST</a>
          &nbsp;style. Resources (like Linodes) have predictable URLs that use standard
          HTTP methods to manipulate and return standard HTTP status codes to tell you how
          it went.
          </p>
          <p>
            All API endpoints (starting from version 4) are located at:
          </p>
          <pre>
            <code>{'https://{ API_ROOT}/{ API_VERSION }/*'}</code>
          </pre>
          <p>
            Occasionally we will add features and improvements to our API - only certain changes will trigger a
            version bump, including:
          </p>
          <ul>
            <li>Endpoint path changes</li>
            <li>JSON properties removed or changed</li>
            <li>Core changes (authentication, RESTful principles, etc)</li>
          </ul>
          <p>
            Notably, the addition of new API endpoints and new properties on JSON blobs does
            not imply a new version number.
          </p>
        <div className="GettingStartedPage-section">
          <h2>
            HTTP Methods
            <span className="anchor" id="http-methods">&nbsp;</span>
          </h2>
          <dl>
            <dt>GET</dt>
            <dd>Gets information about a resource or resources</dd>
            <dt>PUT</dt>
            <dd>Edits information about a resource</dd>
            <dt>POST</dt>
            <dd>Creates a new resource</dd>
            <dt>DELETE</dt>
            <dd>Deletes a resource</dd>
          </dl>
        </div>
        <div>
          <p>
            The API exposes <strong>resources</strong> through various HTTP endpoints.
            You work with these resources through consistent use of HTTP verbs and
            a consistent tree of endpoints.
          </p>
        </div>
      </div>
    </div>
  );
}
