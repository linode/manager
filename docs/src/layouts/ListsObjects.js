import React from 'react';
export default function ListsObjects() {
  return (
    <div>
      <div className="row reference white">
        <div className="col-lg-6 text-justify left">
          <h4>
            Lists &amp; Objects
            <span className="anchor" id="lists-and-objects">&nbsp;</span>
          </h4>
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
        </div>
      </div>
    </div>
  );
}
