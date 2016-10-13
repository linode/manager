import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { getLinode, loadLinode } from '~/linodes/linode/layouts/IndexPage';
import { linodes } from '~/api';
import { ErrorSummary, FormGroup, reduceErrors } from '~/errors';

export class DisplayPage extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.loadLinode = loadLinode.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.state = { group: '', label: '', errors: {} };
  }

  async componentDidMount() {
    await this.loadLinode();
    const { group, label } = this.getLinode();
    this.setState({ group, label });
  }

  async onSubmit(e) {
    e.preventDefault();
    const { dispatch } = this.props;
    const { id } = this.getLinode();
    const { group, label } = this.state;
    try {
      await dispatch(linodes.put({ group, label }, id));
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors });
    }
  }

  render() {
    const { group, label, errors } = this.state;
    return (
      <section className="card">
        <header>
          <h2>Display</h2>
        </header>
        <form>
          <FormGroup errors={errors} className="row" field="group">
            <div className="col-sm-2">
              <label htmlFor="group">Group</label>
            </div>
            <div className="col-sm-4">
              <input
                id="group"
                className="form-control"
                name="group"
                value={group}
                onChange={e => this.setState({ group: e.target.value })}
              />
            </div>
          </FormGroup>
          <FormGroup errors={errors} className="row" field="label">
            <div className="col-sm-2">
              <label htmlFor="label">Label</label>
            </div>
            <div className="col-sm-4">
              <input
                className="form-control"
                name="label"
                value={label}
                onChange={e => this.setState({ label: e.target.value })}
              />
            </div>
          </FormGroup>
          <ErrorSummary errors={errors} />
          <button className="btn btn-primary" type="submit" onClick={this.onSubmit}>Save</button>
        </form>
      </section>
    );
  }
}

DisplayPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default connect()(DisplayPage);
