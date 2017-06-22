import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { Link } from 'react-router';
import { Tabs } from 'linode-components/tabs';

import { setTitle } from '~/actions/title';
import { linodes } from '~/api';
import { getObjectByLabelLazily } from '~/api/util';
import { GroupLabel } from '~/components';
import StatusDropdown from '~/linodes/components/StatusDropdown';

import { selectLinode } from '../utilities';

export class IndexPage extends Component {
  static async preload({ dispatch, getState }, { linodeLabel }) {
    const { id } = await dispatch(getObjectByLabelLazily('linodes', linodeLabel));
    await dispatch(linodes.configs.all([id]));
  }

  constructor(props) {
    super(props);

    const { linode: { _configs: { configs }, label, group } } = props;
    const config = configs[0] ? configs[0].id : '';
    this.state = { config, label, group };
  }

  async componentDidMount() {
    const { dispatch, linode } = this.props;
    dispatch(setTitle(linode.label));
  }

  render() {
    const { linode } = this.props;

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
        <header className="main-header">
          <div className="container">
            <div className="float-sm-left">
              <Link to="/linodes">Linodes</Link>
              <h1 title={linode.id}>
                <Link to={`/linodes/${linode.label}`}>
                  <GroupLabel object={linode} />
                </Link>
              </h1>
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
