import React from 'react';

import { Table } from 'linode-components/tables';
import Example from '~/components/Example';
import { LOGIN_ROOT } from '~/constants';



export default function Authentication() {
  return (
    <section className="Article">
      <h1>Authentication</h1>
      <section>
        <p>
          To use some API endpoints, authentication is required. We use the basic OAuth workflow where you can create
          <em>&nbsp;applications</em> that integrate with Linode by registering those applications with us.
          You then use OAuth to authenticate on behalf of the user to request access to resources from their account.
        </p>
      </section>
      <section>
        <h2>The Access Code</h2>
        <p>
          In the OAuth workflow it is a two step process to authenticate a user before you can start making API calls.
          You will first need to request an <strong>access code</strong> that can then be exchanged for an
          <strong>&nbsp;authorization token</strong>. To aid as many application developers as possible with their
          design we provide two methods for requesting an access code.
        </p>
      </section>
      <section>
        <h2>Through The Web</h2>
        <p>
          If you are making a web based application this is the recommended method for getting a user's authorization.
          When you want a user to log into your service, you can direct them to a URL similar to this:
        </p>
        <Example example={`${LOGIN_ROOT}/oauth/authorize?client_id=client_id`} name="bash" noclipboard />
        <p>
          The user logs in to Linode and is presented the scope levels your application is requesting.
          Once the user accepts your request for access, we redirect them back to you with an <em>access code</em>.
          You may then exchange the access code for an <em>authorization token</em>.
        </p>
        <p>
          There are additional parameters that you can supply in the query string of the above request.
          If you provided a redirect_uri when you sent the user to { LOGIN_ROOT },
          they will be redirected to that URI. Otherwise, the default redirect URI associated with your
          OAuth client application will be used.
        </p>
        <p>
          When the user is redirected, two parameters will be added to the query string:
          <code>code</code> and <code>state</code>.
          The last parameter will match the state you gave us at the start of the flow. This allows you to ensure
          that the OAuth flow was initiated by your application, rather than by someone manually navigating to { LOGIN_ROOT } with
          your <code>client_id</code>.
          The important parameter is the code, this is the <em>access code</em> you need to continue the OAuth flow.
        </p>
        <p>
          You can include the following parameters in the query string when
          you direct your users to { LOGIN_ROOT }:
        </p>
        <Table
          className="Table--secondary"
          columns={[
            { dataKey: 'parameter', label: 'Parameter', headerClassName: 'ParameterColumn' },
            { dataKey: 'description', label: 'Description', headerClassName: 'DescriptionColumn' }
          ]}
          data={[
            {
              parameter: 'client_id',
              description: 'Required. Your application\'s client ID.'
            },
            {
              parameter: 'scopes',
              description: 'A comma-delimited list of OAuth scopes you need.'
            },
            {
              parameter: 'redirect_uri',
              description: 'Where to redirect the user after login. If provided, the redirect URI you ' +
              'registered your application with should match the start of this string. If you registered ' +
              ' your app with http://example.org as the redirect URI, then this parameter must start with ' +
              '"http://example.org".'
            },
            {
              parameter: 'state',
              description: 'An arbitrary token that will be returned to you at the end of the process.'
            }
          ]}
        />
      </section>
      <section>
        <h2>Access Token</h2>
        <p>
          Once the user has logged in to Linode and you have received an <em>access code</em>, you
          will need to exchange that access code for an <em>Authorization token</em>. You do this by
          making the following HTTP POST request:
        </p>
        <Example example={`${LOGIN_ROOT}/oauth/token`} name="bash" noclipboard />
        <p>
          Make this request as <code>application/x-www-form-urlencoded</code> or
          as <code>multipart/form-data</code> and include the following parameters
          in the POST body:
        </p>
        <Table
          className="Table--secondary"
          columns={[
            { dataKey: 'parameter', label: 'Parameter', headerClassName: 'ParameterColumn' },
            { dataKey: 'description', label: 'Description', headerClassName: 'DescriptionColumn' }
          ]}
          data={[
            { parameter: 'client_id', description: 'Your app\'s client ID' },
            { parameter: 'client_secret', description: 'Your app\'s client secret' },
            { parameter: 'code', description: 'The code you just received from the redirect' }
          ]}
        />
        <p>
          You'll get a response like this:
        </p>
        <Example
          example={`{
  "scopes": "linodes:create",
  "access_token": "03d084436a6c91fbafd5c4b20c82e5056a2e9ce1635920c30dc8d81dc7a6665c"
}`}
          name="json"
          noclipboard
        />
        <p>
          Note that we include the scopes here. In the future, we may change the
          login flow to allow the user to deny access to specific scopes. You
          should consider this list of scopes returned in the response as the final
          level granted as it may be different than the ones you asked for. Also
          included is the actual <code>access_token</code>. With this token, you
          can proceed to make authenticated HTTP requests with the API by adding
          this header to each request:
        </p>
        <Example example="Authorization: token 03d084436a6c91fbafd5c4b20c82e5056a2e9ce1635920c30dc8d81dc7a6665c" name="bash" noclipboard />
      </section>
      <section>
        <h2>OAuth Scopes</h2>
        <p>
          The above login flow will give you the minimum amount of access to a user's account.
          That is, you are only allowed to see their username and email address. If you
          want more access, you need to add <em>OAuth scopes</em> to the query string.
          An OAuth scope defines the level of access your OAuth token will receive.
          You can request a comma-delimited list of scopes by adding <code>scopes=a,b,c</code>
          to the query string of the <code>{ LOGIN_ROOT }</code> URL.
        </p>
        <p>
          A scope takes the form of <code>resource:access</code>, where the
          <strong>access</strong> to that particular <strong>resource</strong> is limited
          by the level the user grants to your application.
        </p>
        <p>
          You may request the following levels of access for any given resource:
        </p>
        <ul>
          <li><strong>view</strong> - <em>lowest level</em></li>
          <li><strong>modify</strong></li>
          <li><strong>create</strong></li>
          <li><strong>delete</strong> - <em>highest level</em></li>
        </ul>
        <p>
          In addition to the level of access you request,
          you will be granted each access level below it. For example, requesting <em>modify</em> access
          will also grant you <em>view</em> access, and requesting <em>delete</em> access
          will grant you <em>full</em> access to that resource (<code>resource:*</code> has
          the same effect).
        </p>
        <p>
          Each API endpoint documented on these pages includes the OAuth scope necessary
          to use that resource. It will look like this: <span className="text-muted">&nbsp;OAuth scopes:&nbsp;linodes:view</span>.
          You may also request <code>*</code> to get full access to a user's account,
          but this is highly discouraged. You should do your best to request the least amount
          of access needed for your application to function.
        </p>
      </section>
    </section>
  );
}
