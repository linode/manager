import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { push } from 'react-router-redux';

import { Tabs } from 'linode-components/tabs';
import { PrimaryButton } from 'linode-components/buttons';
import { Card, CardHeader } from 'linode-components/cards';

import { setSource } from '~/actions/source';
import { setError } from '~/actions/errors';
import { enableBackup } from '~/api/backups';
import { linodeBackups } from '~/api/linodes';
import { getObjectByLabelLazily } from '~/api/util';
import { FormSummary, reduceErrors } from '~/components/forms';

import { selectLinode } from '../../utilities';


export class IndexPage extends Component {
  static async preload({ dispatch, getState }, { linodeLabel }) {
    try {
      const { id } = await dispatch(getObjectByLabelLazily('linodes', linodeLabel));
      await dispatch(linodeBackups([id]));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      await dispatch(setError(e));
    }
  }

  constructor() {
    super();

    this.enableBackups = this.enableBackups.bind(this);
    this.state = { errors: {} };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  async enableBackups(e) {
    e.preventDefault();
    const { dispatch, linode } = this.props;
    try {
      await dispatch(enableBackup(linode.id));
    } catch (response) {
      const errors = await reduceErrors(response);
      // Promisify result for tests.
      await new Promise(resolve => this.setState({ errors }, resolve));
    }
  }

  render() {
    const { linode } = this.props;

    if (!linode.backups.enabled) {
      const { errors } = this.state;

      return (
        <Card header={<CardHeader title="Enable backups" />}>
          <form onSubmit={this.enableBackups}>
            <p>
              Backups not enabled. Enable backups for
              ${(linode.type.backups_price / 100).toFixed(2)}/mo.
            </p>
            <PrimaryButton type="submit">Enable backups</PrimaryButton>
            <FormSummary errors={errors} />
          </form>
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
