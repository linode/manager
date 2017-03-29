import React, { PropTypes } from 'react';


export default function CardImageHeader(props) {
  const { icon, iconClass, nav, title } = props;

  let img;
  if (icon) {
    img = (<img
      className={`CardImageHeader-icon float-sm-left ${iconClass}`}
      src={icon}
      alt="Client thumbnail"
    />);
  }

  let headerTitle;
  if (title) {
    headerTitle = (<h2 className="CardImageHeader-title float-sm-left">{title}</h2>);
  }

  let navItems;
  if (nav) {
    navItems = (<div className="float-sm-right">{nav}</div>);
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
  nav: PropTypes.node,
};

CardImageHeader.defaultProps = {
  iconClass: '',
  title: '',
};
