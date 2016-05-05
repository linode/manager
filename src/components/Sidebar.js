import React, { Component } from 'react';
import { Link } from 'react-router';

export default class Sidebar extends Component {
  render() {
    const { username } = this.props;
    return (
      <div className="sidebar">
        <ul className="list-unstyled">
          <li>
            <Link to="/">
              <span className="fa fa-th" />
              <span>Linodes</span>
            </Link>
          </li>
          <li>
            <Link to="/nodebalancers">
              <span className="fa fa-code-fork" />
              <span>NodeBalancers</span>
            </Link>
          </li>
          <li>
            <Link to="/longview">
              <span className="fa fa-bar-chart-o" />
              <span>Longview</span>
            </Link>
          </li>
          <li>
            <Link to="/dns">
              <span className="fa fa-share-alt" />
              <span>DNS Manager</span>
            </Link>
          </li>
          <li>
            <Link to="/support">
              <span className="fa fa-users" />
              <span>Support</span>
            </Link>
          </li>
        </ul>
      </div>
    );
  }
};

Sidebar.contextTypes = {
  router: React.PropTypes.object.isRequired  
};
