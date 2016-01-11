import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { updateLinodesIfNecessary } from '../actions/linodes';
import { Linode } from '../components/Linode';
import { NewLinode } from '../components/Linode';
import _ from 'underscore';

const sortOrder = {
  "running": 0,
  "powered_off": 1,
  "brand_new": 2
};

class IndexPage extends Component {
  componentDidMount() {
    const { authentication, dispatch } = this.props;
    dispatch(updateLinodesIfNecessary(authentication.token));
  }

  renderGroup(linodes, group) {
    return (
      <div key={group} className="row linodes" style={{marginBottom: "2rem"}}>
        {group ? <div className="col-md-12 display-group">
          <h2 className="text-muted">{group}</h2>
        </div> : ""}
        {_.sortBy(linodes, l => sortOrder[l.status]).map(l => {
          return (
          <div key={l.id} className="col-md-6">
            <Linode linode={l} />
          </div>);
        })}
        <div className="col-md-6">
          <NewLinode />
        </div>
      </div>
    );
  }

  render() {
    const { linodes } = this.props.linodes;
    return (
      <div className="row">
        <div className="col-md-9">
          {_.map(_.groupBy(linodes, l => l.group), this.renderGroup)}
        </div>
        <div className="col-md-3">
          <div className="card" style={{padding: "1rem"}}>
            <h4 className="text-centered">
              Recent Events
            </h4>
            <ul className="list-unstyled">
              <li>
                <i className="fa fa-check text-success" style={{marginRight: "0.5rem"}}></i>
                test_linode_15 booted
              </li>
              <li>
                <i className="fa fa-check text-success" style={{marginRight: "0.5rem"}}></i>
                test_linode_15 created
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

function select(state) {
  return { linodes: state.linodes, authentication: state.authentication };
}

export default connect(select)(IndexPage);
