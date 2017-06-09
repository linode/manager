import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components/cards';

import { setSource } from '~/actions/source';
import { IPV4_DNS_RESOLVERS, IPV6_DNS_RESOLVERS } from '~/constants';


export class DNSResolversPage extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  render() {
    return (
      <div className="row">
        <section className="col-lg-6 col-md-12 col-sm-12">
          <Card className="full-height" header={<CardHeader title="IPv4 Resolvers" />}>
            {IPV4_DNS_RESOLVERS.map(r => <div key={r}>{r}</div>)}
          </Card>
        </section>
        <section className="col-lg-6 col-md-12 col-sm-12">
          <Card className="full-height" header={<CardHeader title="IPv6 Resolvers" />}>
            {IPV6_DNS_RESOLVERS.map(r => <div key={r}>{r}</div>)}
          </Card>
        </section>
      </div>
    );
  }
}

DNSResolversPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default connect()(DNSResolversPage);
