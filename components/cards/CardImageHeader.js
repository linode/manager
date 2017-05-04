import React, { PropTypes } from 'react';


export default function CardImageHeader(props) {
  const { icon, iconClass, nav, title, subtitle } = props;

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
    headerTitle = (
      <div className="float-sm-left">
        <h2 className="CardImageHeader-title">{title}</h2>
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
};

CardImageHeader.defaultProps = {
  iconClass: '',
  title: '',
};
