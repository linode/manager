import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import { ExternalLink } from 'linode-components/buttons';
import { Breadcrumbs } from 'linode-components/breadcrumbs';
import { Code } from 'linode-components/formats';

import { API_ROOT,
  API_VERSION,
  MANAGER_ROOT,
} from '~/constants';


export default function Introduction(props) {
  const { route } = props;
  const { crumbs } = route;

  return (
    <section className="Article">
      <div className="Endpoint-breadcrumbsContainer">
        <Breadcrumbs crumbs={crumbs} />
      </div>
      <header>
        <h1>Testing with cURL</h1>
        <h5>by William Smith; last updated May 22nd, 2017</h5>
      </header>
      <section>
        <p>
          <ExternalLink to="http://curl.haxx.se/">cURL</ExternalLink>
          &nbsp;is a simple and popular command line tool that allows you to perform various kinds
          of HTTP requests. It may already be installed on your system - run
          <code>curl --version</code> in your shell to check. Once you've confirmed that
          you have it installed, we can use it to test out the Linode API from the comfort
          of your shell.
        </p>
      </section>
      <section>
        <h2>Unauthenticated Requests</h2>
        <p>
          You can perform anonymous HTTP requests against various resources on the API.
          You can tell which ones are anonymous from the
          <small className="text-muted"><i className="fa fa-lock"></i> Authenticated</small>
          indicator in the reference documentation. For API endpoints where this indicator is
          missing, you're able to use curl to test them without any additional steps.
          For example, we could&nbsp;
          <Link to={`/${API_VERSION}/reference/endpoints/linode/distributions`}>
            list supported distributions
          </Link>:
        </p>
        <Code example={`curl ${API_ROOT}/${API_VERSION}/linode/distributions`} name="bash" />
        <p>
          This will give you a response like this:
        </p>
        <Code
          example={`{
  "distributions": [
      {
          "updated": "2014-10-24T15:48:04",
          "id": "linode/ubuntu14.10",
          "label": "Ubuntu 14.10",
          "disk_minimum": 650,
          "recommended": true,
          "vendor": "Ubuntu",
          "architecture": "x86_64"
      }
      /* and so on */
  ],
  "page": 1,
  "pages": 2,
  "results": 34
}`}
          name="json"
          noclipboard
        />
      </section>
      <section>
        <h2>Authenticated Requests</h2>
        <p>
          For many requests, you will have to authenticate as a particular user. For now, we’re
          going to use a personal access token to make things easier. If you’d like to learn
          how to make a full blown OAuth client, read the&nbsp;
          <Link to={`/${API_VERSION}/access`}>
            authentication documentation
          </Link>.
        </p>
        <p>
          To generate a personal access token,&nbsp;
          <ExternalLink to={`${MANAGER_ROOT}/profile/integrations/tokens`}>
            visit the new manager
          </ExternalLink>
          . These tokens can be used to make authenticated API requests with your Linode
          account and can have full access to all OAuth scopes. You’ll only see the full
          OAuth token once, so be sure to write it down somewhere. If you’re in the shell,
          running something like this might work well:
        </p>
        <Code example='token="that token"' name="bash" />
      </section>
      <section>
        <h2>Authentication Header</h2>
        <p>
          Now you can make requests with curl using your access token by adding
          <code>-H "Authorization: Bearer $token"</code>.
          The <small className="text-muted"><i className="fa fa-lock"></i> Authenticated</small>
          requests on the reference page include this header in the curl examples. For example:
        </p>
        <Code
          example={`curl -H "Authorization: token $token" \\
  ${API_ROOT}/${API_VERSION}/linode/instances`}
          name="bash"
        />
        <p>
          This will give you a response like this:
        </p>
        <Code
          example={`{
  "linodes": [
    {
       "id": 2019697,
       "label": "prod-1",
       "ipv4": "97.107.143.73",
       "ipv6": "2600:3c03::f03c:91ff:fe0a:18c6/64",
       "region": {
          "label": "Newark, NJ",
          "id": "us-east-1a",
          "country": "us"
       },
       "backups": {
          "last_backup": null,
          "snapshot": null,
          "schedule": {
             "day": null,
             "window": null
          },
          "enabled": false
       },
       "status": "running",
       "group": "",
       "hypervisor": "kvm",
       "updated": "2016-11-10T19:38:00",
       "distribution": {
          "disk_minimum": 900,
          "id": "linode/debian8",
          "updated": "2015-04-27T16:26:41",
          "recommended": true,
          "vendor": "Debian",
          "label": "Debian 8.1",
          "architecture": "x86_64"
       },
       "alerts": {
          "io": {
             "threshold": 10000,
             "enabled": true
          },
          "transfer_out": {
             "enabled": true,
             "threshold": 10
          },
          "transfer_in": {
             "enabled": true,
             "threshold": 10
          },
          "transfer_quota": {
             "enabled": true,
             "threshold": 80
          },
          "cpu": {
             "enabled": true,
             "threshold": 90
          }
       },
       "type": [
          {
             "backups_price": 2.5,
             "label": "Linode 2048",
             "disk": 24576,
             "transfer": 2000,
             "vcpus": 1,
             "id": "g5-standard-1",
             "price_hourly": 1,
             "memory": 2048,
             "price_monthly": 10.0,
             "network_out": 125,
             "class": "standard"
          }
       ],
       "transfer_total": 2000,
       "updated": "2016-11-10T19:39:36"
    }
    /* and so on */
  ],
  "page": 1,
  "pages": 1,
  "results": 1
}`}
          name="json"
          noclipboard
        />
      </section>
      <div className="text-sm-center">
        <Link to={`/${API_VERSION}/guides/curl/creating-a-linode`}>
          Creating a Linode &raquo;
        </Link>
      </div>
    </section>
  );
}

Introduction.propTypes = {
  route: PropTypes.object,
};
