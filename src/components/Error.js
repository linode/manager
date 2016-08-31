import React, { PropTypes } from 'react';

import NotFound from './NotFound';

export default function Error(props) {
  const { errors } = props;
  if (errors.status === 404) {
    return <NotFound />;
  }

  return (
    <div className="error text-xs-center">
      <h1>{`${errors.status} ${errors.statusText}`}</h1>
      <p>Something broke. Sorry about that.</p>
      <div>
        <button
          style={{ margin: '0 0.51rem' }}
          className="btn btn-default"
          onClick={() => window.location.reload(true)}
        >Reload</button>
        <a
          style={{ margin: '0 0.5rem' }}
          href={`mailto:support@linode.com?subject=${
              encodeURIComponent(`${errors.status} ${errors.statusText}`)
            }&body=${
              encodeURIComponent(
                `I'm getting the following error on ${
                  window.location.href
                }:\n\n${
                  JSON.stringify(errors.json, null, 4)
                }`
              )
            }`}
          className="btn btn-default"
        >Contact support</a>
      </div>
      {props.children}
    </div>
  );
}

Error.propTypes = {
  errors: PropTypes.shape({
    json: PropTypes.object,
    status: PropTypes.int,
    statusText: PropTypes.string,
  }),
  children: PropTypes.node,
};
