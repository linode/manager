import React from 'react';
export default function Pagination() {
  return (
    <div>
      <div className="row reference white">
        <div className="col-lg-6 text-justify left">
          <h4>Pagination
              <span className="anchor" id="pagination">&nbsp;</span>
          </h4>
          <p>
            Resource lists are always paginated. The response will look similar to this:
          </p>
          <pre><code>
{`{
    "linodes": [ ... ],
    "page": 1,
    "total_pages": 10,
    "total_results": 248
}`}
          </code></pre>
          <p>Pages start at 1. You may get a particular page by adding <code>?page=2</code>
          to your URL. Each page has at most 25 results.</p>
        </div>
      </div>
    </div>
  );
}
