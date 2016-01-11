import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { updateLinodesIfNecessary } from '../actions/linodes';
import { Linode } from '../components/Linode';

class IndexPage extends Component {
  componentDidMount() {
    const { authentication, dispatch } = this.props;
    dispatch(updateLinodesIfNecessary(authentication.token));
  }

  render() {
    const { linodes } = this.props.linodes;
    return (
      <div className="row">
        <div className="col-md-9">
          <div className="row">
            {linodes.map(l => {
              return (
              <div key={l.id} className="col-md-6">
                <Linode linode={l} />
              </div>);
            })}
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <h4 className="text-centered">
              Support Tickets
            </h4>
          </div>
          <div className="card">
            <h4 className="text-centered">
              Recent Events
            </h4>
          </div>
          <div className="card">
            <h4 className="text-centered">
              Account Info
            </h4>
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
