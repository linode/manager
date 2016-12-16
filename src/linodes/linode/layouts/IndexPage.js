import React, { Component, PropTypes } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import StatusDropdown from '~/linodes/components/StatusDropdown';
import { setError } from '~/actions/errors';
import { linodes } from '~/api';
import { setSource } from '~/actions/source';

export function getLinode() {
  const { linodes } = this.props.linodes;
  const linodeId = parseInt(this.props.params.linodeId, 10);
  return linodes ? linodes[linodeId] : null;
}

class LinodeTabs extends Tabs {
  constructor(props) {
    super(props);

    // By default, when a tab is clicked, the body of the control changes to
    // blank before anything's actually been loaded to replace it. This just
    // prevents that.
    this.handleClick = () => {};
  }
}

export function renderTabs(tabList, selected, isSubtab = false) {
  const { dispatch } = this.props;

  return (
    <LinodeTabs
      selectedIndex={tabList.indexOf(selected)}
    >
      <TabList>
        {tabList.map(t => (
          <Tab key={t.name} onClick={() => dispatch(push(t.link))}>
            {t.name}
          </Tab>
        ))}
      </TabList>
      {tabList.map(t => (
        <TabPanel key={t.name}>
          <div className={isSubtab ? '' : 'container'}>
            {t === selected ? this.props.children : null}
          </div>
        </TabPanel>
       ))}
    </LinodeTabs>
  );
}

export class IndexPage extends Component {
  static async preload(store, newParams) {
    const { linodeId } = newParams;

    try {
      await store.dispatch(linodes.one([linodeId]));
      await store.dispatch(linodes.configs.all([linodeId]));
    } catch (e) {
      store.dispatch(setError(e));
    }
  }

  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.render = this.render.bind(this);
    this.renderLabel = this.renderLabel.bind(this);
    this.renderTabs = renderTabs.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.state = { config: '', label: '', group: '' };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));

    const linode = this.getLinode();
    const defaultConfig = Object.values(linode._configs.configs)[0];
    this.setState({
      config: defaultConfig ? defaultConfig.id : '',
      label: linode.label,
      group: linode.group,
    });
  }

  renderLabel(linode) {
    const label = linode.group ?
      <span>{linode.group} / {linode.label}</span> :
      <span>{linode.label}</span>;

    return (
      <div style={{ display: 'inline-block' }}>
        <h1>{label}</h1>
      </div>
    );
  }

  renderHeader() {
    const linode = this.getLinode();

    return (
      <header className="main-header">
        <div className="container">
          {this.renderLabel(linode)}
          <span className="float-xs-right">
            <StatusDropdown
              shortcuts={false}
              linode={linode}
              short
              dispatch={this.props.dispatch}
            />
          </span>
        </div>
      </header>
    );
  }

  render() {
    const linode = this.getLinode();
    if (!linode) return <span></span>;

    const tabList = [
      { name: 'Dashboard', link: '' },
      { name: 'Networking', link: '/networking' },
      { name: 'Rebuild', link: '/rebuild' },
      { name: 'Resize', link: '/resize' },
      { name: 'Rescue', link: '/rescue' },
      { name: 'Backups', link: '/backups' },
      { name: 'Settings', link: '/settings' },
    ].map(t => ({ ...t, link: `/linodes/${linode.id}${t.link}` }));

    const pathname = location ? location.pathname : tabList[0].link;
    const selected = tabList.reduce((last, current) =>
      (pathname.indexOf(current.link) === 0 ? current : last));

    return (
      <div className="details-page">
        {this.renderHeader(linode)}
        <div className="main-header-fix"></div>
        {this.renderTabs(tabList, selected)}
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func,
  username: PropTypes.string,
  linodes: PropTypes.object,
  params: PropTypes.shape({
    linodeId: PropTypes.string,
  }),
  detail: PropTypes.object,
  children: PropTypes.node,
};

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(IndexPage);
