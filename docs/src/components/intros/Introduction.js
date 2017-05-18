import React from 'react';
import { API_ROOT, API_VERSION } from '~/constants';

import { Table } from 'linode-components/tables';


export default function Introduction() {
  return (
    <section className="GettingStartedPage">
      <h1>Introduction</h1>
      <section>
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
            <code>{`${ API_ROOT}/${ API_VERSION }/*`}</code>
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
      </section>
      <section>
        <h2>
          HTTP Methods
          <span className="anchor" id="http-methods">&nbsp;</span>
        </h2>
        <Table
          className="Table--secondary"
          columns={[
            { dataKey: 'method', label: 'Method', headerClassName: 'MethodColumn' },
            { dataKey: 'description', label: 'Description', headerClassName: 'DescriptionColumn' }
          ]}
          data={[
            { method: 'GET', description: 'Gets information about a resource or resources' },
            { method: 'PUT', description: 'Edits information about a resource' },
            { method: 'POST', description: 'Creates a new resource' },
            { method: 'DELETE', description: 'Deletes a resource' },
          ]}
        />
        <p>
          The API exposes <strong>resources</strong> through various HTTP endpoints.
          You work with these resources through consistent use of HTTP verbs and
          a consistent tree of endpoints.
        </p>
      </section>
    </section>
  );
}
