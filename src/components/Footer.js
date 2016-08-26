import React, { PropTypes } from 'react';

import { LOGIN_ROOT } from '~/constants';

export default function Footer(props) {
  return (
    <footer className="footer text-muted text-xs-center">
      <span>&copy; {props.year} Linode, LLC</span>
      <span><a href="https://www.linode.com/tos">Terms of Service</a></span>
      <span><a href="https://www.linode.com/privacy">Privacy Policy</a></span>
      <span>
        <a href={`${LOGIN_ROOT}/developers`} className="btn-secondary developers">Developers</a>
      </span>
    </footer>
  );
}

Footer.propTypes = {
  year: PropTypes.string.isRequired,
};
