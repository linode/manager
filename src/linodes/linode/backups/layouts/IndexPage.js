import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { push } from 'react-router-redux';

import { Card, CardHeader } from 'linode-components/cards';
import { Tabs } from 'linode-components/tabs';
import { Form, SubmitButton } from 'linode-components/forms';

import { setSource } from '~/actions/source';
import { enableBackup } from '~/api/backups';
import { linodeBackups } from '~/api/linodes';
import { getObjectByLabelLazily } from '~/api/util';
import { dispatchOrStoreErrors, FormSummary } from '~/components/forms';

import { selectLinode } from '../../utilities';


export class IndexPage extends Component {
  static async preload({ dispatch, getState }, { linodeLabel }) {
    const { id, backups } = await dispatch(getObjectByLabelLazily('linodes', linodeLabel));
    if (backups.enabled) {
      await dispatch(linodeBackups([id]));
    }
  }

  constructor() {
    super();

    this.state = { loading: false, errors: {} };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  onSubmit = () => {
    const { dispatch, linode } = this.props;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => enableBackup(linode.id),
    ]));
  }

  render() {
    const { linode } = this.props;

    if (!linode.backups.enabled) {
      const { loading, errors } = this.state;

      return (
        <Card header={<CardHeader title="Enable backups" />}>
          <Form onSubmit={this.onSubmit}>
            <p>
              Backups not enabled. Enable backups for
              ${(linode.type.backups_price).toFixed(2)}/mo.
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
      { name: 'Summary', link: '/' },
      { name: 'Settings', link: '/settings' },
    ].map(t => ({ ...t, link: `/linodes/${linode.label}/backups${t.link}` }));

    return (
      <Tabs
        tabs={tabs}
        isSubTabs
        onClick={(e, tabIndex) => {
          e.stopPropagation();
          this.props.dispatch(push(tabs[tabIndex].link));
        }}
        pathname={location.pathname}
      >
        {this.props.children}
      </Tabs>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linode: PropTypes.object.isRequired,
  children: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
};

export default withRouter(connect(selectLinode)(IndexPage));
