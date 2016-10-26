import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { getLinode, loadLinode } from '~/linodes/linode/layouts/IndexPage';
import { linodes } from '~/api';
import { ErrorSummary, FormGroup, reduceErrors } from '~/errors';
import { setSource } from '~/actions/source';

export class DisplayPage extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.loadLinode = loadLinode.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.state = { group: '', label: '', errors: {} };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
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
              <label htmlFor="">Group</label>
            </div>
            <div className="col-sm-4">
              <input
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
  linodes: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(DisplayPage);
