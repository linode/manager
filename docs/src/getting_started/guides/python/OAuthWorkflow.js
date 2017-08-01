import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import { API_VERSION, LOGIN_ROOT } from '~/constants';
import { Breadcrumbs } from 'linode-components/breadcrumbs';


export default function BasicSetup(props) {
  const { route } = props;
  const { crumbs } = route;

  return (
    <section className="Article">
      <div className="Endpoint-breadcrumbsContainer">
        <Breadcrumbs crumbs={crumbs} />
      </div>
      <header>
        <h1>OAuth Workflow</h1>
        <h5>by William Smith; last updated May 22nd, 2017</h5>
      </header>
      <section>
        <p>
          The Python Library includes an OAuth Client tailored to Linode's OAuth 2 implementation,
          making it easy to allow users to authenticate against Linode and grant your applications
          certain rights to their account. All communication between&nbsp;
          <a href={LOGIN_ROOT} target="_blank" rel="nofollow noopener noreferrer">
            {LOGIN_ROOT}
          </a>
          &nbsp;and your application is handled by the <code>LinodeLoginClient</code>.
        </p>
      </section>
      <section>
        <h2>OAuthScopes</h2>
        <p>
          The <code>linode.OAuthScopes</code> object contains all OAuth Scopes your application
          can request. If you require access to more than a user's email address and username,
          you will need to include OAuth Scopes in your request for authentication.
          See the table to the right for all available OAuth Scopes.
        </p>
      </section>
      <div className="text-sm-center">
        <Link to={`/${API_VERSION}/guides/python/core-concepts`}>
          Linode Python Core Concepts &raquo;
        </Link>
      </div>
    </section>
  );
}

BasicSetup.propTypes = {
  route: PropTypes.object,
};
