import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Link } from 'react-router';

import { Tabs } from 'linode-components';

import { setAnalytics } from '~/actions';
import api from '~/api';
import * as linodeTypes from '~/api/linodeTypes';
import { getObjectByLabelLazily } from '~/api/util';
import { ChainedDocumentTitle, GroupLabel } from '~/components';
import { planStyle } from '~/linodes/components/PlanStyle';
import StatusDropdown from '~/linodes/components/StatusDropdown';

import { selectLinode } from '../utilities';


export class IndexPage extends Component {
  static async preload({ dispatch }, { linodeLabel }) {
    const { id, type } = await dispatch(getObjectByLabelLazily('linodes', linodeLabel));
    const requests = [
      linodeTypes.getOne(type.id),
      api.linodes.configs.all([id]),
    ];

    await Promise.all(requests.map(dispatch));
  }

  constructor(props) {
    super(props);

    const { linode: { _configs: { configs }, label, group } } = props;
    const config = configs[0] ? configs[0].id : '';
    this.state = { config, label, group };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setAnalytics(['linodes', 'linode']));
  }

  render() {
    const { linode } = this.props;

    if (!linode) { return null; }

    const tabs = [
      { name: 'Dashboard', link: '' },
      { name: 'Networking', link: '/networking' },
      { name: 'Rebuild', link: '/rebuild' },
      { name: 'Resize', link: '/resize' },
      { name: 'Rescue', link: '/rescue' },
      { name: 'Backups', link: '/backups' },
      { name: 'Settings', link: '/settings' },
    ].map(t => ({ ...t, link: `/linodes/${linode.label}${t.link}` }));

    return (
      <div>
        <ChainedDocumentTitle title={linode.label} />
        <header className="main-header">
          <div className="container">
            <div className="float-sm-left">
              <Link to="/linodes">Linodes</Link>
              <h1 title={linode.id}>
                <Link to={`/linodes/${linode.label}`}>
                  <GroupLabel object={linode} />
                </Link>
              </h1>
              <div>{planStyle(linode.type)}</div>
            </div>
            <span className="float-sm-right">
              <StatusDropdown
                shortcuts={false}
                linode={linode}
                short
                dispatch={this.props.dispatch}
              />
            </span>
          </div>
        </header>
        <div className="main-header-fix"></div>
        <Tabs
          tabs={tabs}
          onClick={(e, tabIndex) => {
            e.stopPropagation();
            this.props.dispatch(push(tabs[tabIndex].link));
          }}
          pathname={location.pathname}
        >
          {this.props.children}
        </Tabs>
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linode: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
};

export default connect(selectLinode)(IndexPage);
