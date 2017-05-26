import React from 'react';
import { Link } from 'react-router';
import { API_ROOT, API_VERSION } from '~/constants';

import { Table } from 'linode-components/tables';


export default function BasicSetup() {
  return (
    <section className="Article">
      <header>
        <h1>Basic Setup</h1>
        <h5>by William Smith; last updated May 22nd, 2017</h5>
      </header>
      <section>
        <p>
          With API V4, Linode has released an official Python Library. This document details its use and functions. For a brief walkthrough of using this library, see our <Link to="/guides/python/introduction">Python Introduction</Link>. This package is hosted <a href="https://github.com/linode/python-linode-api">on Github</a>.
        </p>
        <pre>
          <code>
            pip install linode-api
          </code>
        </pre>
        <p>
          In order to connect to the API, you will need an Personal Access Token or a Client ID and Client Secret. Either set of credentials can be generated at <a href="login.alpha.linode.com">login.alpha.linode.com</a> and used where appropriate. A Personal Access Token is used for a single-user application (where all Linodes you intend to manage belong to the account you control), a Client ID and Client Secret are used in multi-user applications (where a user will log in to your application with Linode and grant you access to some of the account's resources).
        </p>
      </section>
    </section>
  );
}

