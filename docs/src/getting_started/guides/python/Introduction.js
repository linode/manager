import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import { Breadcrumbs } from 'linode-components/breadcrumbs';
import { ExternalLink } from 'linode-components/buttons';
import { Code } from 'linode-components/formats';

import { API_VERSION } from '~/constants';


export default function Introduction(props) {
  const { route } = props;
  const { crumbs } = route;

  return (
    <section className="Article">
      <div className="Endpoint-breadcrumbsContainer">
        <Breadcrumbs crumbs={crumbs} />
      </div>
      <header>
        <h1>Getting started with Linode Python</h1>
        <h5>by William Smith; last updated May 22nd, 2017</h5>
      </header>
      <section>
        <p>
          With the release of API V4, Linode has also released an official Python library.
          This guide is a simple introduction to working with the Python library.
          The official Linode Python library is open source on&nbsp;
          <ExternalLink to="http://github.com/Linode/python-linode-api">
            Github
          </ExternalLink>
          , and can be installed:
        </p>
        <Code example="pip install linode-api" name="bash" />
        <p>
          In order to make requests to the API, you're going to need an OAuth Token.
          You can make a personal access token at&nbsp;
          <ExternalLink
            to="https://cloud.linode.com/profile/integrations/tokens"
          >cloud.linode.com</ExternalLink>.
        </p>
      </section>
      <section>
        <h2>Connecting to the API</h2>
        <p>
          The Python library connects to the Linode API V4 using the LinodeClient class,
          which expects an OAuth Token in his constructor.
        </p>
        <i>All example code in this guide is executed in a Python shell.</i>
        <Code
          example={`>>> import linode
>>> client = linode.LinodeClient('my-oauth-token')`}
          name="bash"
          noclipboard
        />
      </section>
      <section>
        <h2>Requirements for Creating a Linode</h2>
        <p>
          In order to create a Linode, we need a Regions (which defines where it will live)
          and a Service (which defines the size of the Linode).
          Since we don’t know the IDs of any objects in the API,
          we’ll list them to see what we want:
        </p>
        <Code
          example={`>>> for r in client.get_regions():
...   print(r.label)
...
Dallas, TX
Fremont, CA
Atlanta, GA
Newark, NJ
London, UK
Singapore, SG
Frankfurt, DE
Tokyo 2, JP
Tokyo, JP`}
          name="bash"
          noclipboard
        />
        <p>
          We've got a lot of regions to pick from - let's just use the first one and move on.
        </p>
        <Code
          example=">>> region = client.get_regions()[0]"
          name="bash"
          noclipboard
        />
        <p>
          For a Service, we know that we want "Linode 2048". Since we know the service
          type’s label, we don’t need to list all services, we can just use the label:
        </p>
        <Code
          example=">>> serv = linode.Service(client, 'g5-standard-1')
>>> serv.label
'Linode 2048'"
          name="bash"
          noclipboard
        />
        <p>
          Here we are creating the service object by label - the label is used where IDs are
          used for other objects. While creating objects this way can be useful, we can
          also use the label in place of the service object in all places it would be used.
        </p>
      </section>
      <section>
        <h2>Making a Linode</h2>
        <p>
          Since we have everything we need to make a Linode, we can create one with the
          LinodeClient:
        </p>
        <Code
          example=">>> l = client.linode.create_instance(serv, region)"
          name="bash"
          noclipboard
        />
        <p>
          And that’s it! Now we’ve got a fresh new Linode. Let’s check it out:
        </p>
        <Code
          example={`>>> l.label
'linode263'
>>> l.ipv4
['97.107.143.33']
>>> l.state
'offline'`}
          name="bash"
          noclipboard
        />
        <p>
          That’s great, but this Linode is empty, and booting it wouldn’t make sense, since we
          created it without disks or a distribution. Let’s make another Linode, this time
          with Debian on it, and boot it so we can ssh in.
        </p>
      </section>
      <section>
        <h2>Getting a Distribution</h2>
        <p>
          We already know how to retrieve objects from the API, but this time we want something
          more vague - a Debian template. Which version? What are our options?
          Let’s have a look at all of the recommended Debian templates:
        </p>
        <Code
          // eslint-disable-next-line max-len
          example={`>>> for d in client.linode.get_distributions(linode.Distribution.vendor == 'Debian', linode.Distribution.recommended == True):
...   print("{}: {}".format(d.label, d.id))
...
Debian 7: linode/debian7
Debian 8.8: linode/debian8`}
          name="bash"
          noclipboard
        />
        <p>
          The Python library uses SQLAlchemy-like filtering syntax - any field marked filterable
          can be searched by in this manner. We can chain filters together to run more
          complex searches, and even use SQLAlchemy operators like and_ and or_ if needed.
          This search reveals some options. Since Debian 8 is the newest Debian template
          available, let’s use it.

          Since we have the id for the distribution, we don’t need to construct an object.
        </p>
      </section>
      <section>
        <h2>Creating a Linode (with a Distribution)</h2>
        <p>
          Now that we have a distribution, let’s make a new Linode running it! But first,
          let’s clean up that first Linode that we don’t really need:
        </p>
        <Code
          example={`>>> l.delete()
True`}
          name="bash"
          noclipboard
        />
        <p>
          Now that that’s gone, we can create a new Linode running Debian 8:
        </p>
        <Code
          // eslint-disable-next-line max-len
          example='>>> l, pw = client.linode.create_instance(serv, region, distribution="linode/debian8")'
          name="bash"
          noclipboard
        />
        <p>
          This time, we called <code>create_instance</code> with a "distribution" keyword argument.
          This tells the API what we want on the new Linode, and it will do "the right thing"
          to give you a working configuration. Since a Distribution needs a root password
          and we didn’t provide one, the client helpfully generated one for us and returned
          it as well. Let’s boot it and wait for it to come online:
        </p>
        <Code
          example={`>>> l.boot()
True
>>> while not l.state == 'running':
    ...   pass
  ...
  >>> l.ipv4
['97.107.143.34']
>>> pw
'663Iso_f1y4Zb5xeClY13fBGdeu5l&f3'`}
          name="bash"
          noclipboard
        />
        <p>
          <code>boot()</code> does just what you’d expect. Once we’ve requested a boot, we
          wait for the Linode’s state to be "running". Since state is a "volatile" attribute
          of a Linode, we can poll it. At fixed intervals, the value will be updated via a
          background API request. Once that loop exists, we can ssh in.
        </p>
        <Code
          example={`>>> exit()
$ ssh root@97.107.143.34
The authenticity of host '97.107.143.34 (97.107.143.34)' can't be established.
ECDSA key fingerprint is SHA256:+/zkZlskou45MscmID8Upp5egrBBEssvL0PEx24C5Zw.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '97.107.143.34' (ECDSA) to the list of known hosts.
root@97.107.143.34's password:

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
root@localhost:~#`}
          name="bash"
          noclipboard
        />
      </section>
      <section>
        <h2>Further Reading</h2>
        <p>
          Now that you’ve had an overview of the features and concepts in the Python library,
          check out the Python library reference for in-depth documentation, or look at the&nbsp;
          <ExternalLink
            // eslint-disable-next-line max-len
            to="https://github.com/linode/python-linode-api/tree/master/examples/install-on-linode"
          >
            Install on Linode sample project
          </ExternalLink>
          &nbsp;for an example multi-user application using the library.
        </p>
      </section>
      <div className="text-sm-center">
        <Link to={`/${API_VERSION}/guides/python/oauth-workflow`}>
          OAuth Workflow &raquo;
        </Link>
      </div>
    </section>
  );
}

Introduction.propTypes = {
  route: PropTypes.object,
};
