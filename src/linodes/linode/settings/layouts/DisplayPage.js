import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { Card, CardHeader } from 'linode-components/cards';
import { Form, FormGroup, FormGroupError, Input, SubmitButton } from 'linode-components/forms';

import { linodes } from '~/api';
import { setSource } from '~/actions/source';
import { dispatchOrStoreErrors, FormSummary } from '~/components/forms';

import { selectLinode } from '../../utilities';


export class DisplayPage extends Component {
  constructor(props) {
    super(props);

    const { group, label } = props.linode;
    this.state = { group, label, errors: {}, loading: false };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  onSubmit = () => {
    const { dispatch, linode: { id, label: oldLabel } } = this.props;
    const { group, label } = this.state;

    const requests = [
      () => linodes.put({ group, label }, id),
    ];

    if (oldLabel !== label) {
      requests.push(() => push(`/linodes/${label}/settings`));
    }

    return dispatch(dispatchOrStoreErrors.call(this, requests));
  }

  render() {
    const { group, label, loading, errors } = this.state;

    return (
      <Card header={<CardHeader title="Display" />}>
        <Form onSubmit={this.onSubmit}>
          <FormGroup errors={errors} className="row" name="group">
            <label htmlFor="group" className="col-sm-1 col-form-label">Group</label>
            <div className="col-sm-11">
              <Input
                id="group"
                name="group"
                value={group}
                onChange={e => this.setState({ group: e.target.value })}
              />
              <FormGroupError errors={errors} name="group" />
            </div>
          </FormGroup>
          <FormGroup errors={errors} className="row" name="label">
            <label htmlFor="label" className="col-sm-1 col-form-label">Label</label>
            <div className="col-sm-11">
              <Input
                id="label"
                name="label"
                value={label}
                onChange={e => this.setState({ label: e.target.value })}
              />
              <FormGroupError errors={errors} name="label" />
            </div>
          </FormGroup>
          <FormGroup className="row">
            <div className="offset-sm-1 col-sm-11">
              <SubmitButton disabled={loading} />
              <FormSummary errors={errors} success="Display settings saved." />
            </div>
          </FormGroup>
        </Form>
      </Card>
    );
  }
}

DisplayPage.propTypes = {
  linode: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(selectLinode)(DisplayPage);
