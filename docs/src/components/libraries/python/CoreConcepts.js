import React from 'react';
import { Link } from 'react-router';
import { API_ROOT, API_VERSION } from '~/constants';
import { Breadcrumbs } from 'linode-components/breadcrumbs';

import { Table } from 'linode-components/tables';


export default function CoreConcepts(props) {
  const { route } = props;
  const { crumbs } = route;
  return (
    <section className="Article">
      <div className="Endpoint-breadcrumbsContainer">
        <Breadcrumbs crumbs={crumbs} />
      </div>
      <header>
        <h1>Core Concepts</h1>
        <h5>by William Smith; last updated May 22nd, 2017</h5>
      </header>
      <section>
        <h2>Filtering</h2>
        <p>
          All listing methods of the LinodeClient object can be "filtered," allowing you to query for only the objects you desire. Filtering uses a SQLAlchemy-inspired syntax. All attributes that are filterable are marked with a Filterable <i className="fa fa-filter"></i> icon below.
        </p>
        <table>
          <tr><td><code>==</code></td><td>Fields must be exactly equal</td></tr>
          <tr><td><code>contains</code></td><td>Equivalent to "b in a"</td></tr>
          <tr><td><code>&gt;</code></td><td>Greater than (numeric)</td></tr>
          <tr><td><code>&gt;=</code></td><td>Greater than or equal to (numeric)</td></tr>
          <tr><td><code>&lt;</code></td><td>Less than (numeric)</td></tr>
          <tr><td><code>&lt;=</code></td><td>Less than or equal to (numeric)</td></tr>
        </table>
        <p>
          Logical operators are provided to combine filters. They are listed below:
        </p>
        <table>
          <tr><td>linode.and_</td><td><code>&amp;</code></td><td>
            Both filters must match for the composite filter to match.  The single character method
            requires the filter statements to both be in parenthesis.<br/>&nbsp;
          </td></tr>
          <tr><td>linode.or_</td><td><code>|</code></td><td>
            Either filter must match for the composite filter to match. The single character method requires the filters statements to both be in parenthesis.<br/>&nbsp;
          </td></tr>
        </table>
      </section>
      <section>
        <h2>Volatile Attributes</h2>
        <p>
          Many API Objects have attributes labeled Volatile <i className="fa fa-flash"></i>. Volatile attributes are refreshed when requested if they were last updated before a certain time (at time of writing, this interval is 15 seconds). This allows you to get a current value for potentially-changing attributes when required, without having to write extra calls into your code. All volatile attributes are labeled in the object reference below as such.
        </p>
        <p>
          While it <em>is</em> possible to poll on volatile attributes to detect changes, doing so without a timeout is not advised, and is not guaranteed to ever exit. For example, this code should <em>not</em> live in a production system:
        </p>
        <pre>
          <code>
{`linode.boot()
while not linode.state == 'running':
    pass`}
          </code>
        </pre>
        <p>
          This code may work most of the time, but it is not guaranteed that <code>linode.state</code> will ever be seen as running just because you called <code>boot</code>. For instance, another process could delete the linode and our poll may not hit during any window where the state is "running".
        </p>
      </section>
      <section>
        <h2>Updating and Deleting Objects</h2>
        <p>
          All API resources are represented as objects, and all objects you own can be updated and deleted (an object you own would be a Linode or a DNS Zone, as opposed to a Datacenter or Service, which are accessible to you but cannot be modified or removed).
        </p>
        <p>
          Any attribute of any object that you can update will be marked Editable <i className="fa fa-pencil"></i>in the object reference below. These attributes can be assigned as normal, and updated in the server with a call to <code>save()</code>.
        </p>
        <p>
          Any object you own can be removed from your account with a call to <code>delete()</code>. This is non-reversible, so be careful calling this function.
        </p>
      </section>
      <section>
        <h2>Pagination</h2>
        <p>
          While many API requests are paginated, all listing calls in the Python Library return <code>PaginatedLists</code> that handle loading additional pages seamlessly. While these lists are not intended to be long-lived (i.e. do not store a PaginatedList that you expect to change, as it will not update itself), it does allow easy iteration over all resources without having to worry about when a page transition occurs.
        </p>
      </section>
    </section>
  );
}

