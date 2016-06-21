import React, { Component, PropTypes } from 'react';
import { updateLinode } from '~/actions/api/linodes';
import { connect } from 'react-redux';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

export class SettingsPage extends Component {
  constructor() {
    super();
    this.componentDidMount = this.componentDidMount.bind(this);
    this.getLinode = this.getLinode.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const linode = this.getLinode();
    if (!linode) {
      const { linodeId } = this.props.params;
      dispatch(updateLinode(linodeId));
    }
  }

  getLinode() {
    const { linodes } = this.props.linodes;
    const { linodeId } = this.props.params;
    return linodes[linodeId];
  }

  render() {
    const linode = this.getLinode();
    if (!linode) return null;
    return (
      <Tabs>
        <TabList>
          <Tab>Boot Settings</Tab>
          <Tab>Alerts</Tab>
          <Tab>Advanced</Tab>
        </TabList>
        <TabPanel>Boot Settings</TabPanel>
        <TabPanel>Alerts</TabPanel>
        <TabPanel>Advanced</TabPanel>
      </Tabs>
    );
  }
}

SettingsPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linodes: PropTypes.object.isRequired,
  params: PropTypes.shape({
    linodeId: PropTypes.string.isRequired,
  }).isRequired,
};

function select(state) {
  return {
    linodes: state.api.linodes,
  };
}

export default connect(select)(SettingsPage);
