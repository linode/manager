import React from 'react';
import { Link } from 'react-router';

import { Breadcrumbs } from 'linode-components/breadcrumbs';
import { Table } from 'linode-components/tables';
import { Example } from '~/components';

import { API_ROOT, API_VERSION, LOGIN_ROOT } from '~/constants';


export default function BasicSetup(props) {
  const { route } = props;
  const { crumbs } = route;
  return (
    <section className="Article">
      <div className="Endpoint-breadcrumbsContainer">
        <Breadcrumbs crumbs={crumbs} />
      </div>
      <header>
        <h1>Basic Setup</h1>
        <h5>by William Smith; last updated May 22nd, 2017</h5>
      </header>
      <section>
        <p>
          With API V4, Linode has released an official Python Library. This document details its use and functions. For a brief walkthrough of using this library, see our <Link to={`${API_VERSION}/guides/python/introduction`}>Python Introduction</Link>. This package is hosted <a href="https://github.com/linode/python-linode-api" target="_blank" rel="nofollow noopener noreferrer">on Github</a>.
        </p>
        <Example example="pip install linode-api" name="bash" />
        <p>
          In order to connect to the API, you will need an Personal Access Token or a Client ID and Client Secret. Either set of credentials can be generated at <a href="{LOGIN_ROOT}" target="_blank" rel="nofollow noopener noreferrer">{LOGIN_ROOT}</a> and used where appropriate. A Personal Access Token is used for a single-user application (where all Linodes you intend to manage belong to the account you control), a Client ID and Client Secret are used in multi-user applications (where a user will log in to your application with Linode and grant you access to some of the account's resources).
        </p>
      </section>
    </section>
  );
}

