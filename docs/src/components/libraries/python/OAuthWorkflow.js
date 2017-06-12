import React from 'react';
import { Link } from 'react-router';
import { API_ROOT, API_VERSION, LOGIN_ROOT } from '~/constants';

import { Table } from 'linode-components/tables';


export default function BasicSetup() {
  return (
    <section className="Article">
      <header>
        <h1>OAuth Workflow</h1>
        <h5>by William Smith; last updated May 22nd, 2017</h5>
      </header>
      <section>
        <p>
          The Python Library includes an OAuth Client tailored to Linode's OAuth 2 implementation, making it easy to allow users to authenticate against Linode and grant your applications certain rights to their account. All communication between <a href="{LOGIN_ROOT}" target="_blank" rel="nofollow noopener noreferrer">{LOGIN_ROOT}</a> and your application is handled by the <code>LinodeLoginClient</code>.
        </p>
      </section>
      <section>
        <h2>OAuthScopes</h2>
        <p>
          The <code>linode.OAuthScopes</code> object contains all OAuth Scopes your application can request. If you require access to more than a user's email address and username, you will need to include OAuth Scopes in your request for authentication. See the table to the right for all available OAuth Scopes.
        </p>
      </section>
    </section>
  );
}

