import React, { PropTypes } from 'react';

export default function Infobar(props) {
  const { title, link } = props;
  return (
    <nav>
      <div className="float-xs-right">
        {title ?
          <span>
            <span className="new">New</span>
            <a href={link} target="_blank">{title}</a>
          </span>
         : null}
        <a href="https://github.com/linode" target="_blank"><span className="fa fa-github"></span></a>
        <a href="https://twitter.com/linode" target="_blank"><span className="fa fa-twitter"></span></a>
      </div>
    </nav>
  );
}

Infobar.propTypes = {
  title: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
};
