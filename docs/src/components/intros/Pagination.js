import React from 'react';

export default function Pagination() {
  return (
    <section className="Article">
      <h1>Pagination</h1>
      <section>
        <p>
          Resource lists are always paginated. The response will look similar to this:
        </p>
        <pre>
          <code>
{`{
  "linodes": [ ... ],
  "page": 1,
  "total_pages": 10,
  "total_results": 248
}`}
          </code>
        </pre>
        <p>
          Pages start at 1. You may get a particular page by adding <code>?page=2</code> to your URL. Each page has at most 25 results.
        </p>
      </section>
      <section>
        <h2>
          Lists &amp; Objects
          <span className="anchor" id="lists-and-objects">&nbsp;</span>
        </h2>
        <p>
          There are generally two kinds of resources you can retrieve with a GET
          request: objects and lists. An object is a representation of an individual resource.
          It has an ID that can be used to retrieve it directly. A list is a collection of objects.
          You'll generally find lists of objects at <code>/:type/:subtype</code>, and an individual object
          at <code>/:type/:subtype/:id</code>.
        </p>
        <p>
          Some objects contain lists of other objects, which you can get at <code>/:type/:subtype/:id/:subtype</code>.
          You can get an individual sub-object at <code>/:type/:subtype/:id/:subtype/:id</code>.
        </p>
        <p>
          For example, you can list your Linodes at <code>/linode/instances</code>, and get
          a specific Linode with <code>/linode/instances/123456</code>. You can get the configs
          for this Linode from <code>/linode/instances/123456/configs</code> and a specific config
          profile from <code>/linode/instances/123456/configs/5678</code>.
        </p>
      </section>
    </section>
  );
}
