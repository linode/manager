import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import filter from 'lodash/filter';
import { DeleteModalBody } from 'linode-components';
import { PrimaryButton } from 'linode-components';
import { Input } from 'linode-components';
import { List } from 'linode-components';
import { Table } from 'linode-components';
import { Dropdown } from 'linode-components';
import { MassEditControl } from 'linode-components';
import { ListHeader } from 'linode-components';
import { ListBody } from 'linode-components';
import { setAnalytics, setSource } from '~/actions';
import {
  LabelCell,
  CheckboxCell,
  TableCell,
} from 'linode-components';


import { default as toggleSelected } from '~/actions/select';
import api from '~/api';
import { transform } from '~/api/util';
import { ChainedDocumentTitle } from '~/components';
import { PortalModal } from '~/components/modal';
import CreateHelper from '~/components/CreateHelper';
import { TimeCell } from '~/components/tables/cells';
import { hideModal, deleteModalProps } from '~/utilities';

import { AddImage, EditImage } from '../components';
import { ComponentPreload as Preload } from '~/decorators/Preload';


const OBJECT_TYPE = 'images';

export class ImagesList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filter: '',
      modal: null,
    };

    this.hideModal = hideModal.bind(this);
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    dispatch(setAnalytics(['images']));
  }

  deleteImagesModal = (images) => {
    const { dispatch } = this.props;
    this.setState({
      modal: {
        ...deleteModalProps(
          dispatch, images, api.images.delete,
          'Image', OBJECT_TYPE, this.hideModal),
        name: 'massDeleteImage',
      },
    });
  };

  addImageModal = () => {
    this.setState({
      modal: {
        name: 'addImage',
        title: AddImage.title,
      },
    });
  };

  editImageModal = (image) => {
    this.setState({
      modal: {
        name: 'editImage',
        title: EditImage.title,
        image: image,
      },
    });
  }

  renderModal = () => {
    const { dispatch, linodes } = this.props;
    if (!this.state.modal) {
      return null;
    }
    const { name, title, image } = this.state.modal;
    return (
      <PortalModal
        title={title}
        onClose={this.hideModal}
      >
        {(name === 'massDeleteImage') &&
          <DeleteModalBody
            {...this.state.modal}
          />
        }
        {(name === 'addImage') &&
          <AddImage
            dispatch={dispatch}
            linodes={linodes}
            title={AddImage.title}
            close={this.hideModal}
          />
        }
        {(name === 'editImage') &&
          <EditImage
            dispatch={dispatch}
            image={image}
            close={this.hideModal}
          />
        }
      </PortalModal>
    );
  }

  renderImageActions = ({ column, record }) => {
    const groups = [
      { elements: [{ name: 'Edit', action: () => this.editImageModal(record) }] },
      { elements: [{ name: 'Delete', action: () => this.deleteImagesModal([record]) }] },
    ];

    return (
      <TableCell column={column} record={record} className="ActionsCell">
        <Dropdown
          groups={groups}
          analytics={{ title: 'Disk actions' }}
        />
      </TableCell>
    );
  }

  renderImages(images) {
    const { dispatch, selectedMap } = this.props;
    const { filter } = this.state;

    const { sorted } = transform(images, {
      filterBy: filter,
    });

    return (
      <List>
        <ListHeader className="Menu">
          <div className="Menu-item">
            <MassEditControl
              data={sorted}
              dispatch={dispatch}
              massEditGroups={[{ elements: [
                { name: 'Delete', action: this.deleteImagesModal },
              ] }]}
              selectedMap={selectedMap}
              objectType={OBJECT_TYPE}
              toggleSelected={toggleSelected}
            />
          </div>
          <div className="Menu-item">
            <Input
              placeholder="Filter..."
              onChange={({ target: { value } }) => this.setState({ filter: value })}
              value={this.state.filter}
            />
          </div>
        </ListHeader>
        <ListBody>
          <Table
            columns={[
              { cellComponent: CheckboxCell, headerClassName: 'CheckboxColumn' },
              {
                cellComponent: LabelCell,
                headerClassName: 'LabelColumn',
                label: 'Label',
                dataKey: 'label',
                titleKey: 'label',
              },
              {
                label: 'Size',
                dataFn: (image) => {
                  const size = image.size;
                  return `${size} MB`;
                },
              },
              {
                cellComponent: TimeCell,
                timeKey: 'created',
                label: 'Created',
              },
              { cellComponent: this.renderImageActions },
            ]}
            data={sorted}
            selectedMap={selectedMap}
            onToggleSelect={(record) => {
              dispatch(toggleSelected(OBJECT_TYPE, record.id));
            }}
          />
        </ListBody>
      </List>
    );
  }

  render() {
    const { images } = this.props;
    const privateImages = filter(images.images, i => !i.is_public);

    return (
      <div className="PrimaryPage container">
        {this.renderModal()}
        <ChainedDocumentTitle title="Images" />
        <header className="PrimaryPage-header">
          <div className="PrimaryPage-headerRow clearfix">
            <h1 className="float-sm-left">Images</h1>
            <PrimaryButton
              className="float-sm-right"
              onClick={() => this.addImageModal()}
            >
              Add an Image
            </PrimaryButton>
          </div>
        </header>
        <div className="PrimaryPage-body">
          {Object.keys(privateImages).length ?
            this.renderImages(privateImages) :
            <CreateHelper
              label="Images"
              onClick={() => this.addImageModal()}
              linkText="Add an Image"
            />
          }
        </div>
      </div>
    );
  }
}

ImagesList.propTypes = {
  dispatch: PropTypes.func,
  images: PropTypes.object,
  linodes: PropTypes.object,
  selectedMap: PropTypes.object.isRequired,
};


function mapStateToProps(state) {
  return {
    images: state.api.images,
    linodes: state.api.linodes,
    selectedMap: state.select.selected[OBJECT_TYPE] || {},
  };
}

const preloadRequest = async (dispatch) => {
  await Promise.all([
    api.images.all(),
    api.linodes.all(),
  ].map(dispatch));
};

export default compose(
  connect(mapStateToProps),
  Preload(preloadRequest)
)(ImagesList);
