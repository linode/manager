import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { setAnalytics, setSource } from '~/actions';
import api from '~/api';
import { getObjectByLabelLazily } from '~/api/util';
import { ChainedDocumentTitle } from '~/components';

import MasterZone from '../components/MasterZone';
import SlaveZone from '../components/SlaveZone';


export class ZonePage extends Component {
  static async preload({ dispatch, getState }, { domainLabel }) {
    const { id } = await dispatch(getObjectByLabelLazily('domains', domainLabel, 'domain'));
    await dispatch(api.domains.records.all([id]));
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    dispatch(setAnalytics(['domains', 'domain']));
  }

  render() {
    const { domain, dispatch } = this.props;

    if (!domain) {
      return null;
    }

    if (domain.type === 'slave') {
      return (
        <SlaveZone
          dispatch={dispatch}
          domain={domain}
        />
      );
    }

    return (
      <ChainedDocumentTitle title={domain.domain}>
        <MasterZone
          dispatch={dispatch}
          domain={domain}
        />
      </ChainedDocumentTitle>
    );
  }
}

ZonePage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  domain: PropTypes.object.isRequired,
};

function select(state, ownProps) {
  const { domains } = state.api;
  const { params } = ownProps;
  let domain = Object.values(domains.domains).filter(
    d => d.domain === params.domainLabel)[0];

  if (domain) {
    domain = {
      ...domain,
      _groupedRecords: _.groupBy(domain._records.records, 'type'),
    };
  }
  return { domain };
}

export default connect(select)(ZonePage);
