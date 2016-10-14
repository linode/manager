import React, { PropTypes } from 'react';

export default function Infobar(props) {
  const { title, link } = props;
  return (
    <nav>
      <div className="pull-right">
        {!title ? null :
          <span>
            <span className="new">New</span>
            <a href={link} target="_blank" rel="noopener noreferrer">{title}</a>
          </span>
        }
        <a href="https://github.com/linode" target="_blank" rel="noopener noreferrer">
          <span className="fa fa-github" />
        </a>
        <a href="https://twitter.com/linode" target="_blank" rel="noopener noreferrer">
          <span className="fa fa-twitter" />
        </a>
      </div>
    </nav>
  );
}

Infobar.propTypes = {
  title: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
};
