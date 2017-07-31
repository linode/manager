import React from 'react';
import { Link } from 'react-router';

import { ExternalLink } from 'linode-components/buttons';
import { Table } from 'linode-components/tables';

import Example from '~/components/Example';
import { API_ROOT, API_VERSION } from '~/constants';


export default function Introduction() {
  return (
    <section className="Article">
      <h1>Introduction</h1>
      <section>
        <p>
          The Linode APIv4 is an HTTP service that follows (to a large extent)&nbsp;
          <ExternalLink to="https://en.wikipedia.org/wiki/Representational_state_transfer">REST</ExternalLink>
          &nbsp;style. Resources (like Linodes) have predictable URLs that use standard
          HTTP methods to manipulate and return standard HTTP status codes to tell you how
          it went.
        </p>
        <div className="alert alert-info" role="alert">
          <Link to={`/${API_VERSION}/guides/curl/testing-with-curl`}>
            Check out the Testing with cURL guide
          </Link> to get started making API calls using a Personal Access Token (PAT).
        </div>
        <p>
          All APIv4 endpoints are located at:
        </p>
        <Example example={`${API_ROOT}/${API_VERSION}/*`} name="bash" noclipboard />
        <p>
          Occasionally we will add features and improvements to our API -
          only certain changes will trigger a version bump, including:
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
            {
              dataKey: 'description',
              label: 'Description',
              headerClassName: 'DescriptionColumn',
            },
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
      <div className="text-sm-center">
        <Link to={`/${API_VERSION}/access`}>
          Create an OAuth client and get an OAuth token &raquo;
        </Link>
      </div>
    </section>
  );
}
