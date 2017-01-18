import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { getLinode } from '~/linodes/linode/layouts/IndexPage';
import { linodes } from '~/api';
import { Card } from '~/components';
import { Form, FormGroup, FormGroupError, Input, SubmitButton } from '~/components/form';
import { ErrorSummary, reduceErrors } from '~/errors';
import { setSource } from '~/actions/source';

export class DisplayPage extends Component {
  constructor(props) {
    super(props);
    this.getLinode = getLinode.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    const { group, label } = this.getLinode();
    this.state = { group, label, errors: {}, loading: false };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  async onSubmit() {
    const { dispatch } = this.props;
    const { id, label: oldLabel, group: oldGroup } = this.getLinode();
    const { group, label } = this.state;

    this.setState({ loading: true, errors: {} });

    try {
      await dispatch(linodes.put({ group, label }, id));
      if (oldLabel !== label || oldGroup !== group) {
        await dispatch(push(`/linodes/${label}/settings`));
      }
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors });
    }

    this.setState({ loading: false });
  }

  render() {
    const { group, label, errors } = this.state;
    return (
      <Card title="Display">
        <Form onSubmit={this.onSubmit}>
          <FormGroup errors={errors} className="row" name="group">
            <div className="col-sm-1 label-col">
              <label htmlFor="group">Group:</label>
            </div>
            <div className="col-sm-11">
              <Input
                id="group"
                value={group}
                className="LinodesLinodeSettingsDisplay-group"
                onChange={e => this.setState({ group: e.target.value })}
              />
              <FormGroupError errors={errors} name="group" />
            </div>
          </FormGroup>
          <FormGroup errors={errors} className="row" name="label">
            <div className="col-sm-1 label-col">
              <label htmlFor="label">Label:</label>
            </div>
            <div className="col-sm-11 content-col">
              <Input
                id="label"
                className="LinodesLinodeSettingsDisplay-label"
                value={label}
                onChange={e => this.setState({ label: e.target.value })}
              />
              <FormGroupError errors={errors} name="label" />
            </div>
          </FormGroup>
          <ErrorSummary errors={errors} />
          <FormGroup className="row">
            <div className="offset-sm-1 col-sm-11">
              <SubmitButton />
            </div>
          </FormGroup>
        </Form>
      </Card>
    );
  }
}

DisplayPage.propTypes = {
  linodes: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(DisplayPage);
