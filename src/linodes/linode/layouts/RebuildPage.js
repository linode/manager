import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import Card from 'linode-components/dist/cards/Card';
import CardHeader from 'linode-components/dist/cards/CardHeader';
import FormGroup from 'linode-components/dist/forms/FormGroup';
import FormGroupError from 'linode-components/dist/forms/FormGroupError';
import Form from 'linode-components/dist/forms/Form';
import FormSummary from 'linode-components/dist/forms/FormSummary';
import Input from 'linode-components/dist/forms/Input';
import SubmitButton from 'linode-components/dist/forms/SubmitButton';
import PasswordInput from 'linode-components/dist/forms/PasswordInput';
import ConfirmModalBody from 'linode-components/dist/modals/ConfirmModalBody';
import { onChange } from 'linode-components/dist/forms/utilities';

import { hideModal, showModal } from '~/actions/modal';
import { setSource } from '~/actions/source';
import { rebuildLinode } from '~/api/ad-hoc/linodes';
import { dispatchOrStoreErrors } from '~/api/util';
import ChainedDocumentTitle from '~/components/ChainedDocumentTitle';
import { DistributionSelect } from '~/linodes/components';
import { getLinodeByLabel } from '~/utilities';

export class RebuildPage extends Component {
  constructor(props) {
    super(props);

    const image = props.image;

    this.state = {
      image: image ? image.id : undefined,
      password: '',
      errors: {},
      loading: false,
    };

    this.onChange = onChange.bind(this);
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  onSubmit = () => {
    const { images, dispatch, linode: { id, label } } = this.props;
    const { password, image } = this.state;

    const data = {
      image: image,
      root_pass: password,
    };

    const callback = async () => {
      await dispatch(dispatchOrStoreErrors.call(this, [
        () => rebuildLinode(id, data),
        () => this.setState({ password: '', image }),
      ], ['image']));

      // We want to hide the modal regardless of the status of the call.
      dispatch(hideModal());
    };

    return dispatch(showModal('Rebuild Linode', (
      <ConfirmModalBody
        onCancel={() => dispatch(hideModal())}
        onSubmit={callback}
      >
        <p>
          Rebuilding will destroy all data, wipe your Linode clean, and start fresh.
          Are you sure you want to rebuild <strong>{label}</strong> with {images[image].label}?
        </p>
      </ConfirmModalBody>
    )));
  }

  render() {
    const { images, image: currentImage } = this.props;
    const { image, errors, loading } = this.state;

    return (
      <Card header={<CardHeader title="Rebuild" />}>
        <ChainedDocumentTitle title="Rebuild" />
        <p>
          Rebuilding will destroy all data, wipe your Linode clean, and start fresh.
        </p>
        <Form
          onSubmit={this.onSubmit}
          analytics={{ title: 'Rebuild Linode' }}
        >
          <FormGroup className="row" name="image">
            <label className="col-sm-3 col-form-label">Current Image</label>
            <div className="col-sm-9">
              <Input
                disabled
                value={currentImage.label}
              />
            </div>
          </FormGroup>
          <FormGroup errors={errors} name="image" className="row">
            <label className="col-sm-3 col-form-label">New Image</label>
            <div className="col-sm-9">
              <DistributionSelect
                images={images}
                value={image}
                name="image"
                id="image"
                onChange={this.onChange}
              />
              <FormGroupError errors={errors} name="image" inline={false} />
            </div>
          </FormGroup>
          <FormGroup errors={errors} name="root_pass" className="row">
            <label htmlFor="password" className="col-sm-3 col-form-label">Root password</label>
            <div className="col-sm-9 clearfix">
              <PasswordInput
                name="password"
                id="password"
                value={this.state.password}
                onChange={this.onChange}
                className="float-sm-left"
              />
              <FormGroupError className="float-sm-left" errors={errors} name="root_pass" />
            </div>
          </FormGroup>
          <FormGroup className="row" name="submit">
            <div className="col-sm-9 offset-sm-3">
              <SubmitButton
                disabled={loading}
                disabledChildren="Rebuilding"
              >Rebuild</SubmitButton>
              <FormSummary errors={errors} success="Linode is being rebuilt." />
            </div>
          </FormGroup>
        </Form>
      </Card>
    );
  }
}

RebuildPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  images: PropTypes.object.isRequired,
  linode: PropTypes.object.isRequired,
  image: PropTypes.object.isRequired,
};


function mapStateToProps({ api }, { match: { params: { linodeLabel } } }) {
  const linode = getLinodeByLabel(api.linodes.linodes, linodeLabel);
  const images = api.images.images;
  const image = linode && api.images.images[linode.image];
  return {
    linode,
    images,
    image,
  };
}

export default compose(
  connect(mapStateToProps),
)(RebuildPage);
