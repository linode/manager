import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { selectLinode } from '../../utilities';
import { linodes } from '~/api';
import { Card, CardHeader } from 'linode-components/cards';
import { Form, FormGroup, FormGroupError, Input, SubmitButton } from 'linode-components/forms';
import { ErrorSummary, reduceErrors } from '~/components/forms';
import { setSource } from '~/actions/source';

export class DisplayPage extends Component {
  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
    const { group, label } = props.linode;
    this.state = { group, label, errors: {}, loading: false };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  async onSubmit() {
    const { dispatch, linode } = this.props;
    const { id, label: oldLabel, group: oldGroup } = linode;
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
      <Card header={<CardHeader title="Display" />}>
        <Form onSubmit={this.onSubmit}>
          <FormGroup errors={errors} className="row" name="group">
            <label htmlFor="group" className="col-sm-1 col-form-label">Group:</label>
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
            <label htmlFor="label" className="col-sm-1 col-form-label">Label:</label>
            <div className="col-sm-11">
              <Input
                id="label"
                className="LinodesLinodeSettingsDisplay-label"
                value={label}
                onChange={e => this.setState({ label: e.target.value })}
              />
              <FormGroupError errors={errors} name="label" />
            </div>
          </FormGroup>
          <FormGroup className="row">
            <div className="offset-sm-1 col-sm-11">
              <SubmitButton />
            </div>
          </FormGroup>
          <ErrorSummary errors={errors} />
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
