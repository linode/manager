import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { push } from 'react-router-redux';
import { compose } from 'redux';

import { ChainedDocumentTitle } from '~/components';
import { Tabs } from 'linode-components';

import { getIPs } from '~/api/ad-hoc/networking';
import { getObjectByLabelLazily } from '~/api/util';

import { selectLinode } from '../../utilities';
import { ComponentPreload as Preload } from '~/decorators/Preload';


export const IndexPage = (props) => {
  const { linode, dispatch, children } = props;

  const tabs = [
    { name: 'Summary', link: '/' },
    { name: 'IP Transfer', link: '/transfer' },
    { name: 'IP Sharing', link: '/sharing' },
    { name: 'DNS Resolvers', link: '/resolvers' },
  ].map(t => ({ ...t, link: `/linodes/${linode.label}/networking${t.link}` }));

  return (
    <Tabs
      tabs={tabs}
      isSubTabs
      onClick={(e, tabIndex) => {
        e.stopPropagation();
        dispatch(push(tabs[tabIndex].link));
      }}
      pathname={location.pathname}
    >
      <ChainedDocumentTitle title="Networking" />
      {children}
    </Tabs>
  );
};

IndexPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linode: PropTypes.object.isRequired,
  children: PropTypes.object,
  location: PropTypes.object,
};

export default compose(
  connect(selectLinode),
  withRouter,
  Preload(
    async function (dispatch, { params: { linodeLabel } }) {
      const { id } = await dispatch(getObjectByLabelLazily('linodes', linodeLabel));
      await dispatch(getIPs(id));
    }
  )
)(IndexPage);
