import PropTypes from 'prop-types';
import React, { Component } from 'react';

import {
  Checkbox,
  Input,
  Form,
  FormGroup,
  FormSummary,
  SubmitButton,
  Textarea,
} from 'linode-components';
import { onChange } from 'linode-components';

import api from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';
import { DistributionSelect } from '~/linodes/components';


export default class Settings extends Component {
  constructor() {
    super();

    this.state = {
      errors: {},
      loading: false,
    };

    this.componentWillReceiveProps = this.componentWillMount;
    this.onChange = onChange.bind(this);
  }

  componentWillMount(nextProps) {
    const {
      images, label, description, is_public: isPublic,
    } = (nextProps || this.props).stackscript;

    this.setState({
      label,
      description,
      isPublic: isPublic || false,
      images: images,
    });
  }

  onSubmit = () => {
    const { dispatch, stackscript: { id } } = this.props;
    const { label, description, isPublic, images } = this.state;
    const data = {
      label,
      description,
      images,
      is_public: isPublic,
    };

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => api.stackscripts.put(data, id),
      () => this.setState({ images: data.images }),
    ]));
  }

  render() {
    const { errors, loading, label, description, images, isPublic } = this.state;

    return (
      <Form onSubmit={this.onSubmit}>
        <FormGroup>
          <div>
            <label htmlFor="label" className="col-form-label">Label</label>
          </div>
          <div>
            <Input
              value={label}
              onChange={this.onChange}
              name="label"
              id="label"
            />
          </div>
        </FormGroup>
        <FormGroup>
          <div>
            <label htmlFor="description" className="col-form-label">Description</label>
          </div>
          <div>
            <Textarea
              value={description}
              onChange={this.onChange}
              id="description"
              name="description"
            />
          </div>
        </FormGroup>
        <FormGroup>
          <div>
            <label htmlFor="images" className="col-form-label">Target Images</label>
          </div>
          <div>
            <DistributionSelect
              onChange={this.onChange}
              value={images}
              images={this.props.images}
              id="images"
              name="images"
              multi
            />
          </div>
        </FormGroup>
        <FormGroup>
          <div>
            <Checkbox
              label="Make public"
              onChange={this.onChange}
              value={isPublic}
              checked={isPublic}
              id="isPublic"
              name="isPublic"
              disabled={this.props.stackscript.is_public}
            />
            <div>
              <small className="text-muted">
                Once you've made a StackScript public, you cannot make it private.
              </small>
            </div>
          </div>
        </FormGroup>
        <FormGroup>
          <SubmitButton disabled={loading} />
          <FormSummary errors={errors} success="Settings saved." />
        </FormGroup>
      </Form>
    );
  }
}

Settings.propTypes = {
  dispatch: PropTypes.func.isRequired,
  stackscript: PropTypes.object.isRequired,
  images: PropTypes.object.isRequired,
};
