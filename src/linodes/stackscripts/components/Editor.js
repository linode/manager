import React, { Component, PropTypes } from 'react';

import { CodeEditor } from 'linode-components/editors';
import {
  Form,
  FormGroup,
  FormSummary,
  Input,
  SubmitButton,
} from 'linode-components/forms';
import * as utilities from 'linode-components/forms/utilities';

import { stackscripts } from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';


export default class Editor extends Component {
  constructor() {
    super();

    this.state = {
      errors: {},
      loading: false,
      revision: '',
    };

    this.componentWillReceiveProps = this.componentWillMount;
    this.onChange = utilities.onChange.bind(this);
  }

  componentWillMount(nextProps) {
    const { script } = (nextProps || this.props).stackscript;
    this.setState({ script });
  }

  onSubmit = () => {
    const { dispatch, stackscript: { id } } = this.props;
    const { revision, script } = this.state;

    const data = { script, rev_note: revision };

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => stackscripts.put(data, id),
      () => this.setState({ revision: '' }),
    ]));
  }

  render() {
    const { rev_note: lastRevision } = this.props.stackscript;
    const { errors, loading, script, revision } = this.state;

    return (
      <Form onSubmit={this.onSubmit}>
        <FormGroup>
          <CodeEditor
            value={script}
            onChange={this.onChange}
            name="script"
          />
        </FormGroup>
        <FormGroup className="row">
          <label htmlFor="revision" className="col-sm-3 col-form-label">
            Last Revision Note
          </label>
          <div className="col-sm-9"><Input value={lastRevision} disabled /></div>
        </FormGroup>
        <FormGroup className="row">
          <label htmlFor="revision" className="col-sm-3 col-form-label">Next Revision Note</label>
          <div className="col-sm-9">
            <Input
              value={revision}
              name="revision"
              id="revision"
              onChange={this.onChange}
            />
          </div>
        </FormGroup>
        <FormGroup className="row">
          <div className="offset-sm-3 col-sm-9">
            <SubmitButton disabled={loading} />
            <FormSummary errors={errors} success="Revision saved." />
          </div>
        </FormGroup>
      </Form>
    );
  }
}

Editor.propTypes = {
  dispatch: PropTypes.func.isRequired,
  stackscript: PropTypes.object.isRequired,
};
