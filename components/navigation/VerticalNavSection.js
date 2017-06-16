import React from 'react';


export default function VerticalNavSection(props) {
  const { navItems, title } = props;

  return (
    <div className="VerticalNav-section">
      <h3>{title}</h3>
      <ul>
        {navItems.map(function(item) {
          return (
            <li><link to=""></link></li>
          );
        })}
      </ul>
    </div>
  );
};
