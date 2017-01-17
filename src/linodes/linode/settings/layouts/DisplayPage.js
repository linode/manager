import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { getLinode } from '~/linodes/linode/layouts/IndexPage';
import { linodes } from '~/api';
import { Card } from '~/components';
import { Form, FormGroup, SubmitButton } from '~/components/form';
import { ErrorSummary, reduceErrors } from '~/errors';
import { setSource } from '~/actions/source';

export class DisplayPage extends Component {
  constructor(props) {
    super(props);
    this.getLinode = getLinode.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    const { group, label } = this.getLinode();
    this.state = { group, label, errors: {} };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  async onSubmit(e) {
    const { dispatch } = this.props;
    const { id } = this.getLinode();
    const { group, label } = this.state;
    const labelChanged = this.getLinode().label !== label;
    try {
      await dispatch(linodes.put({ group, label }, id));
      if (labelChanged) {
        await dispatch(push(`/linodes/${label}/settings`));
      }
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors });
    }
  }

  render() {
    const { group, label, errors } = this.state;
    return (
      <Card title="Display">
        <Form onSubmit={this.onSubmit}>
          <FormGroup name="group" className="row" errors={errors}>
            <label htmlFor="group" className="col-sm-1">Group</label>
            <div className="col-sm-4">
              <input
                id="group"
                name="group"
                className="form-control"
                value={group}
                onChange={e => this.setState({ group: e.target.value })}
              />
            </div>
          </FormGroup>
          <FormGroup name="label" className="row" errors={errors}>
            <label htmlFor="label" className="col-sm-1">Label</label>
            <div className="col-sm-4">
              <input
                id="label"
                name="label"
                className="form-control LinodesLinodeSettingsDisplay-label"
                value={label}
                onChange={e => this.setState({ label: e.target.value })}
              />
            </div>
          </FormGroup>
          <ErrorSummary errors={errors} />
          <FormGroup className="row">
            <div className="offset-sm-1 col-sm-4">
              <SubmitButton/>
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
