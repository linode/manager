import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { PrimaryButton } from 'linode-components';
import { Input } from 'linode-components';
import { List } from 'linode-components';
import { Table } from 'linode-components';
import { Dropdown } from 'linode-components';
import { MassEditControl } from 'linode-components';
import { ListHeader } from 'linode-components';
import { ListBody } from 'linode-components';
import { setAnalytics, setSource } from '~/actions';
import { showModal, hideModal } from '~/actions/modal';
import { DeleteModalBody } from 'linode-components';
import {
  LabelCell,
  CheckboxCell,
  TableCell,
} from 'linode-components';

import { default as toggleSelected } from '~/actions/select';
import api from '~/api';
import { transform } from '~/api/util';
import { ChainedDocumentTitle } from '~/components';
import CreateHelper from '~/components/CreateHelper';
import { TimeCell } from '~/components/tables/cells';

import { AddImage, EditImage } from '../components';


const OBJECT_TYPE = 'images';

export class IndexPage extends Component {
  static async preload({ dispatch }) {
    await dispatch(api.images.all());
    await dispatch(api.linodes.all());
  }

  constructor(props) {
    super(props);

    this.state = { filter: '' };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    dispatch(setAnalytics(['images']));
  }

  deleteImages = (imagesToDelete) => {
    const { dispatch } = this.props;
    const imagesArr = Array.isArray(imagesToDelete) ? imagesToDelete : [imagesToDelete];

    const selectedStackimages = imagesArr.map(l => l.label);

    dispatch(showModal('Delete Image(s)', (
      <DeleteModalBody
        onSubmit={async () => {
          const ids = imagesArr.map(function (image) { return image.id; });

          await Promise.all(ids.map(id => dispatch(api.images.delete(id))));
          dispatch(toggleSelected(OBJECT_TYPE, ids));
          dispatch(hideModal());
        }}
        items={selectedStackimages}
        typeOfItem="Images"
        onCancel={() => dispatch(hideModal())}
      />
    )));
  }

  renderImageActions = ({ column, record }) => {
    const { dispatch } = this.props;

    const groups = [
      { elements: [{ name: 'Edit', action: () =>
        EditImage.trigger(dispatch, record) }] },
      { elements: [{ name: 'Delete', action: () => this.deleteImages(record) }] },
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
                { name: 'Delete', action: this.deleteImages },
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
                  const size = image.min_deploy_size;
                  return `${size} MB`;
                },
              },
              {
                cellComponent: TimeCell,
                timeKey: 'created',
                label: 'Created',
              },
              {
                cellComponent: TimeCell,
                timeKey: 'last_used',
                label: 'Deployed',
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
    const { dispatch, images, linodes } = this.props;

    return (
      <div className="PrimaryPage container">
        <ChainedDocumentTitle title="Images" />
        <header className="PrimaryPage-header">
          <div className="PrimaryPage-headerRow clearfix">
            <h1 className="float-sm-left">Images</h1>
            <PrimaryButton
              className="float-sm-right"
              onClick={() => AddImage.trigger(dispatch, linodes)}
            >
              Add an Image
            </PrimaryButton>
          </div>
        </header>
        <div className="PrimaryPage-body">
          {Object.keys(images.images).length ?
            this.renderImages(images.images) :
            <CreateHelper
              label="Images"
              onClick={() => AddImage.trigger(dispatch, linodes)}
              linkText="Add an Image"
            />
          }
        </div>
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func,
  images: PropTypes.object,
  linodes: PropTypes.object,
  selectedMap: PropTypes.object.isRequired,
};


function select(state) {
  return {
    images: state.api.images,
    linodes: state.api.linodes,
    selectedMap: state.select.selected[OBJECT_TYPE] || {},
  };
}

export default connect(select)(IndexPage);
