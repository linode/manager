import React, { PropTypes } from 'react';

const DEFAULT_TITLE = "Internal error";
const DEFAULT_MSG = "Something broke. You can try again later or reach out to support.";

const NOT_FOUND_TITLE = "Page not found";
const NOT_FOUND_MSG = "The page you were looking for was not found. Bummer!";

function renderGeneric(title=DEFAULT_TITLE, msg=DEFAULT_MSG, rest=null) {
  return (
    <div>
      <h1>{title}</h1>
      <p>{msg}</p>
      {rest}
    </div>
  )
}

export default function Error(props) {
  const { error } = props;
  return (
    <div className="error text-xs-center">
      {error.status === 404 ?
        renderGeneric(NOT_FOUND_TITLE, NOT_FOUND_MSG) :
        renderGeneric()
      }
    </div>
  );
}

Error.propTypes = {
  error: PropTypes.shape({
    json: PropTypes.object,
    status: PropTypes.int,
    statusText: PropTypes.string,
  }),
  children: PropTypes.node,
};

export function NotFound() {
  return <Error error={({ status: 404 })} />;
}
