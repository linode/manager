import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';


export default class VerticalNavSection extends Component {
  constructor(props) {
    super(props);

    this.state = { expanded: {} };
  }

  componentWillReceiveProps(props) {
    if (this.props.checkActiveItem(props.path, props.item.href)) {
      this.setState({ expanded: true });
    }
  }

  renderNavListItems() {
    const { navItems, path, checkActiveItem } = this.props;

    return navItems.map((item, index) => {
      let nameOfClass;
      if (checkActiveItem) {
        nameOfClass = checkActiveItem(path, item.href) ? 'active' : '';
      } else {
        nameOfClass = item.href === path ? 'active' : '';
      }

      return (
        <li
          key={index}
          className={nameOfClass}
        >
          <Link to={item.href} id={`NavLink-${index}`}>{item.label}</Link>
        </li>
      );
    });
  }
  
  render() {
    const { title } = props;

    const navListItems = this.renderNavListItems();

    return (
      <div className="VerticalNav-section">
        <h3>{title}</h3>
        <ul>{navListItems}</ul>
      </div>
    );
  }
}

VerticalNavSection.propTypes = {
  navItems: PropTypes.array,
  title: PropTypes.string,
  path: PropTypes.string,
  checkActiveItem: PropTypes.func,
};
