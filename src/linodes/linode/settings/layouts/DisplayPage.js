import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { getLinode } from '~/linodes/linode/layouts/IndexPage';
import { linodes } from '~/api';
import { FormGroup, FormGroupError } from '~/components/form';
import { ErrorSummary, reduceErrors } from '~/errors';
import { setSource } from '~/actions/source';
import Input from '~/components/Input';

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

  async onSubmit(e) {
    e.preventDefault();
    const { dispatch } = this.props;
    const { id } = this.getLinode();
    const { group, label } = this.state;
    const labelChanged = this.getLinode().label !== label;

    this.setState({ loading: true, errors: {} });

    try {
      await dispatch(linodes.put({ group, label }, id));
      if (labelChanged) {
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
      <section className="card">
        <header>
          <h2>Display</h2>
        </header>
        <form>
          <FormGroup errors={errors} className="row" name="group">
            <div className="col-sm-1 label-col">
              <label htmlFor="">Group:</label>
            </div>
            <div className="col-sm-11 content-col">
              <Input
                value={group}
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
                className="LinodesLinodeSettingsDisplay-label"
                value={label}
                onChange={e => this.setState({ label: e.target.value })}
              />
              <FormGroupError errors={errors} name="label" />
            </div>
          </FormGroup>
          <ErrorSummary errors={errors} />
          <div className="row">
            <div className="offset-sm-1 col-sm-11">
              <button
                className="btn btn-default"
                onClick={this.onSubmit}
                disabled={this.loading}
              >Save</button>
            </div>
          </div>
        </form>
      </section>
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
