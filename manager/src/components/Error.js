import React, { PropTypes } from 'react';

export default function Error(props) {
  const { status, href, description } = props;
  let statusString = status.toString();
  if (status >= 400 && status < 404) {
    statusString = '40x';
  } else if (status !== 404) {
    statusString = '50x';
  }

  const { title, msg } = {
    404: {
      title: 'Whoops!',
      msg: 'The page you\'re trying to reach does not exist. Bummer!',
    },
    '40x': {
      title: 'Doh!',
      msg: `You are not authorized to access this page. ${description}`,
    },
    '50x': {
      title: 'Uh-oh!',
      msg: (
        <span>
          There was an issue on our end. Sorry about that!
          <br />
          Please try again later or <a href={href}>contact support</a>.
        </span>
      ),
    },
  }[statusString];

  return (
    <div className="error text-sm-center">
      <h1>{status}</h1>
      <h2>{title}</h2>
      <p>{msg}</p>
    </div>
  );
}

Error.propTypes = {
  status: PropTypes.number.isRequired,
  href: PropTypes.string,
  description: PropTypes.string,
};

Error.defaultProps = {
  href: 'mailto:support@linode.com',
};

export const NotFound = () => <Error status={404} />;
