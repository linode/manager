import PropTypes from 'prop-types';
import React from 'react';


export default function Error(props) {
  const { status, href } = props;
  let statusString = status.toString();
  const explicitlyHandled = [404, 521];
  if (status >= 400 && status < 404) {
    statusString = '40x';
  } else if (explicitlyHandled.indexOf(status) === -1) {
    statusString = '50x';
  }

  const { title, msg } = {
    404: {
      title: 'Whoops!',
      msg: 'The page you\'re trying to reach does not exist.',
    },
    '40x': {
      title: 'Doh!',
      msg: 'You are not authorized to access this page.',
    },
    521: {
      title: 'Hang on!',
      msg: (
        <div>
          <div>You are unable to connect to our servers.</div>
          <div>Check your internet connection and refresh.</div>
        </div>
      ),
    },
    '50x': {
      title: 'Uh-oh!',
      msg: (
        <div>
          <div>There was an issue on our end. Sorry about that!</div>
          <div>Please try again later or <a href={href}>contact support</a>.</div>
        </div>
      ),
    },
  }[statusString];

  return (
    <div className="Error">
      <h1>{status}</h1>
      <h2>{title}</h2>
      <div className="Error-body">{msg}</div>
    </div>
  );
}

Error.propTypes = {
  status: PropTypes.number.isRequired,
  href: PropTypes.string,
};

Error.defaultProps = {
  href: 'mailto:support@linode.com',
};
