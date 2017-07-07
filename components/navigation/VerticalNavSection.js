import React from 'react';
import { Link } from 'react-router';


function renderNavListItems(navItems, path, checkActiveItem) {
  return navItems.map((item, index) => {
    let nameOfClass;
    if (checkActiveItem) {
      nameOfClass = checkActiveItem(path, item.href) ? 'active': '';
    } else {
      nameOfClass = item.href === path ? 'active': '';
    }
    return (
      <li
        key={index}
        className={nameOfClass}
      >
        <Link to={item.href} id={`NavLink-${index}`}>{item.label}</Link>
      </li>
    )
  });
}


export default function VerticalNavSection(props) {
  const { navItems, title, path, checkActiveItem } = props;

  return (
    <div className="VerticalNav-section">
      <h3>{title}</h3>
      <ul>
        {renderNavListItems(navItems, path, checkActiveItem)}
      </ul>
    </div>
  );
};
