import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';


export default class VerticalNavSection extends Component {
  constructor(props) {
    super(props);

    this.state = { expanded: {} };

    this.componentWillReceiveProps = this.componentWillMount;
  }

  componentWillMount(nextProps) {
    const props = nextProps || this.props;

    props.navItems.forEach((item) => {
      if (this.props.checkActiveItem(props.path, item.href)) {
        this.setState({ expanded: { [item.label]: true } });
      }
    });
  }

  renderNavListItems() {
    const { navItems } = this.props;

    return navItems.map((item, index) => {
      const groups = (item.groups || []).filter(g => g.label !== '');

      const isExpanded = this.state.expanded[item.label];
      const expandedClass = isExpanded ? 'active' : '';

      const nestedClassname = (group, item) => {
        const itemHref = `${item.href}#${group.label.toLowerCase()}`;
        return this.props.checkActiveItem(this.props.path, itemHref) ? 'active' : '';
      };

      return (
        <li key={index} className={expandedClass}>
          <Link to={item.href} id={`NavLink-${index}`}>{item.label}</Link>
          {!groups.length || !this.state.expanded[item.label] ? null : (
            <ul className="VerticalNav-subsection">
              {groups.map(group => group.label === '' ? null : (
                <li
                  key={group.label}
                  className={nestedClassname(group, item)}
                >
                  <Link to={`${item.href}#${group.label.toLowerCase()}`}>{group.label}</Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      );
    });
  }

  render() {
    const { title } = this.props;

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
