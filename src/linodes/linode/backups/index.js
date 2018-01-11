import React, { Component } from 'react';
import { Route, Switch, matchPath, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import Card from 'linode-components/dist/cards/Card';
import CardHeader from 'linode-components/dist/cards/CardHeader';
import Form from 'linode-components/dist/forms/Form';
import FormSummary from 'linode-components/dist/forms/FormSummary';
import SubmitButton from 'linode-components/dist/forms/SubmitButton';

import { selectLinode } from '../utilities/selectLinode';
import { ComponentPreload as Preload } from '~/decorators/Preload';
import { setSource } from '~/actions/source';
import { enableBackup } from '~/api/ad-hoc/backups';
import { linodeBackups } from '~/api/ad-hoc/linodes';
import { dispatchOrStoreErrors, getObjectByLabelLazily } from '~/api/util';

import ChainedDocumentTitle from '~/components/ChainedDocumentTitle';
import Currency from '~/components/Currency';
import TabsComponent from '~/components/Tabs';

import SettingsPage from './layouts/SettingsPage';
import SummaryPage from './layouts/SummaryPage';
import BackupPage from './layouts/BackupPage';
class LinodeBackupsIndex extends Component {
  componentDidMount() {
    this.props.setSource();
  }

  render() {
    const {
      match: { url, path },
      location: { pathname },
      onSubmit,
      linode,
    } = this.props;

    const matched = (path, options) => Boolean(
      matchPath(pathname, { path, ...options })
    );

    if (!linode.backups.enabled) {
      const { loading, errors } = this.state;
      const backupPrice = linode.type.addons.backups.price.monthly;

      return (
        <Card header={<CardHeader title="Enable backups" />}>
          <Form
            onSubmit={onSubmit}
            analytics={{ title: 'Enable Backups' }}
          >
            <p>
              Backups not enabled. Enable backups for {<Currency value={backupPrice} />}/mo.
            </p>
            <SubmitButton
              className="btn-primary"
              disabled={loading}
              disabledChildren="Enabling backups"
            >Enable backups</SubmitButton>
            <FormSummary errors={errors} />
          </Form>
        </Card>
      );
    }

    const tabs = [
      { name: 'Summary', to: url, selected: matched(url, { exact: true }) },
      { name: 'Settings', to: `${url}/settings`, selected: matched(`${url}/settings`) },
    ];

    return (
      <div>
        <TabsComponent tabs={tabs} parentClass="linode-tabs--sub" />
        <ChainedDocumentTitle title="Backups" />
        <Switch>
          <Route path={`${path}/settings`} component={(SettingsPage)} />
          <Route path={`${path}/:backupId`} component={(BackupPage)} />
          <Route exact component={(SummaryPage)} />
          <Redirect to="/not-found" />
        </Switch>
      </div>
    );
  }
}

LinodeBackupsIndex.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
  }).isRequired,
  setSource: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  linode: PropTypes.object.isRequired, // @todo Define the shape of a Linode.
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  dispatch,
  setSource() {
    dispatch(setSource(__filename));
  },

  onSubmit() {
    const { linode } = ownProps;
    return dispatch(dispatchOrStoreErrors.call(this, [
      () => enableBackup(linode.id),
      () => linodeBackups(linode.id),
    ]));
  },
});

const preloadRequest = async (dispatch, { match: { params: { linodeLabel } } }) => {
  const { id, backups } = await dispatch(getObjectByLabelLazily('linodes', linodeLabel));
  if (backups.enabled) {
    await dispatch(linodeBackups(id));
  }
};

export default compose(
  connect(selectLinode, mapDispatchToProps),
  Preload(preloadRequest),
)(LinodeBackupsIndex);
