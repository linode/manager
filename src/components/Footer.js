import React, { PropTypes } from 'react';

export default function Footer(props) {
  return (
    <footer className="footer text-muted text-xs-center">
      <span>&copy; {props.year} Linode, LLC</span>
      <span><a href="https://www.linode.com/tos">Terms of Service</a></span>
      <span><a href="https://www.linode.com/privacy">Privacy Policy</a></span>
    </footer>
  );
}

Footer.propTypes = {
  year: PropTypes.string.isRequired,
};
