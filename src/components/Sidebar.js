import React, { Component } from 'react';
import { Link } from 'react-router';

export default class Sidebar extends Component {
  render() {
    const { username } = this.props;
    const links = [
      { icon: "th", name: "Linodes", link: "/" },
      { icon: "code-fork", name: "NodeBalancers", link: "/nodebalancers" },
      { icon: "bar-chart-o", name: "Longview", link: "/longview" },
      { icon: "share-alt", name: "DNS Manager", link: "dnsmanager" },
      { icon: "users", name: "Support", link: "/support" }
    ];

    return (
      <div className="sidebar">
        <ul className="list-unstyled">
        {
          links.map(({icon, name, link}) =>
            <li>
              <Link to={link}>
                <span className={`fa fa-${icon}`} />
                <span>{name}</span>
              </Link>
            </li>
          )
        }
        </ul>
      </div>
    );
  }
};

Sidebar.contextTypes = {
  router: React.PropTypes.object.isRequired  
};
