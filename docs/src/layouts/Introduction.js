import React from 'react';
const API_ROOT = 'api.alpha.linode.com';
const API_VERSION = 'v4';
export default function Introduction() {
  return (
    <div>
      <h2>Introduction</h2>
      <p>
        The Linode API is an HTTP service that follows (to a large extent)
        <a href="https://en.wikipedia.org/wiki/Representational_state_transfer" target="_blank">REST</a>
        style. Resources (like Linodes) have predictable, sane URLs that use standard
        HTTP methods to manipulate and return standard HTTP status codes to tell you how
        it went.
        </p>
        <p>
        All API endpoints (starting from version 4) are located at
        <code>https://{ API_ROOT}/{ API_VERSION }/*</code>. Occasionally we will add
        features and improvements to our API - only certain changes will trigger a
        version bump:
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
      <div className="col-lg-6 right">
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
      <div className="row reference white">
        <div className="col-lg-6 text-justify left">
          <p>
            The API exposes <strong>resources</strong> through various HTTP endpoints.
            You work with these resources through consistent use of HTTP verbs and
            a consistent tree of endpoints. The schema for the various resources
            available is documented in the <a href="#objects">objects</a> section.
          </p>
        </div>
      </div>
    </div>
  );
}
