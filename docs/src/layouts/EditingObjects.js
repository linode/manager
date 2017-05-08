import React from 'react';

export default function EditingObjects() {
  return (
    <div>
      <div className="row reference white">
        <div className="col-lg-6 text-justify left">
          <h4>
            Editing Objects
            <span className="anchor" id="editing-objects">&nbsp;</span>
          </h4>
          <p>
            Some resource objects may be modified, however, these objects contain both
            mutable and immutable properties. The properties that are mutable in an object
            are indicated in the <a href="#objects">objects reference section</a>, with this
            indicator: <span className="text-muted"><i className="fa fa-pencil"></i> Editable</span>.
          </p>
          <p>
            To edit these objects, you can perform a <code>PUT</code> request against
            the resource whose body is the updated JSON. You can omit any of the fields or
            include fields you are not permitted to edit, however, changes to the latter will
            be ignored.
            This makes it simple for you to <code>GET</code> a resource, change a property in
            the JSON that is returned, and then <code>PUT</code> that JSON back to the same URL
            to update the object.
          </p>
        </div>
      </div>
    </div>
  );
}
