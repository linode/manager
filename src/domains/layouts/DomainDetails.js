import groupBy from 'lodash/groupBy';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { setAnalytics, setSource } from '~/actions';
import api from '~/api';
import { getObjectByLabelLazily } from '~/api/util';
import { ChainedDocumentTitle } from '~/components';

import MasterZone from '../components/MasterZone';
import SlaveZone from '../components/SlaveZone';
import { ComponentPreload as Preload } from '~/decorators/Preload';


export class DomainDetails extends Component {
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

DomainDetails.propTypes = {
  dispatch: PropTypes.func.isRequired,
  domain: PropTypes.object.isRequired,
};

function mapStateToProps(state, { match: { params: { domainLabel } } }) {
  const { domains } = state.api;

  let domain = Object.values(domains.domains).filter(
    d => d.domain === domainLabel)[0];

  if (domain) {
    domain = {
      ...domain,
      _groupedRecords: groupBy(domain._records.records, 'type'),
    };
  }
  return { domain };
}

const preloadRequest = async (dispatch, { match: { params: { domainLabel } } }) => {
  const { id } = await dispatch(getObjectByLabelLazily('domains', domainLabel, 'domain'));
  await dispatch(api.domains.records.all([id]));
};

export default compose(
  connect(mapStateToProps),
  Preload(preloadRequest)
)(DomainDetails);
