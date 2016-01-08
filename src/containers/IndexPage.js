import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { update_linodes } from '../actions/linodes';
import { Linode } from '../components/Linode';

class IndexPage extends Component {
  componentDidMount() {
    const { linodes, authentication, dispatch } = this.props;
    console.log(linodes);
    if (linodes.page === -1) {
      update_linodes(authentication.token)(dispatch);
    }
  }

  render() {
    const { linodes } = this.props.linodes;
    console.log(linodes);
    return (
      <div>
        {linodes.map(l => <Linode key={l.id} linode={l} />)}
      </div>
    );
  }
}

function select(state) {
  return { linodes: state.linodes, authentication: state.authentication };
}

export default connect(select)(IndexPage);
