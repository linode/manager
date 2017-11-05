import PropTypes from 'prop-types';
import React from 'react';


export default function CardImageHeader(props) {
  const { icon, iconClass, nav, title, subtitle, tags } = props;

  let img;
  if (icon) {
    img = (
      <img
        className={`CardImageHeader-icon float-sm-left ${iconClass}`}
        src={icon}
        alt="Client thumbnail"
      />
    );
  }

  let headerTags;
  if (tags) {
    headerTags = (
      <div className="CardImageHeader-tags float-sm-left">
        {tags.map(tag => <div key={tag} className="CardImageHeader-tag">{tag}</div>)}
      </div>
    );
  }

  let headerTitle;
  if (title) {
    headerTitle = (
      <div className="float-sm-left">
        <div className="clearfix">
          <h2 className="CardImageHeader-title float-sm-left">{title}</h2>
          {headerTags}
        </div>
        {subtitle ? <div><small className="text-muted">{subtitle}</small></div> : null}
      </div>
    );
  }

  let navItems;
  if (nav) {
    navItems = (<div className="CardImageHeader-nav float-sm-right">{nav}</div>);
  }

  return (
    <header className="CardImageHeader clearfix">
      {img}
      {headerTitle}
      {navItems}
    </header>
  );
}

CardImageHeader.propTypes = {
  icon: PropTypes.string,
  iconClass: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.object,
  nav: PropTypes.node,
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
};

CardImageHeader.defaultProps = {
  iconClass: '',
  title: '',
  tags: [],
};
