import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import filter from 'lodash/filter';
import PrimaryButton from 'linode-components/dist/buttons/PrimaryButton';
import Input from 'linode-components/dist/forms/Input';
import List from 'linode-components/dist/lists/List';
import Table from 'linode-components/dist/tables/Table';
import Dropdown from 'linode-components/dist/dropdowns/Dropdown';
import MassEditControl from 'linode-components/dist/lists/controls/MassEditControl';
import ListHeader from 'linode-components/dist/lists/headers/ListHeader';
import ListBody from 'linode-components/dist/lists/bodies/ListBody';
import { setAnalytics, setSource } from '~/actions';
import { confirmThenDelete } from '~/utilities';
import LabelCell from 'linode-components/dist/tables/cells/LabelCell';
import CheckboxCell from 'linode-components/dist/tables/cells/CheckboxCell';
import TableCell from 'linode-components/dist/tables/cells/TableCell';

import { default as toggleSelected } from '~/actions/select';
import api from '~/api';
import { transform } from '~/api/util';
import ChainedDocumentTitle from '~/components/ChainedDocumentTitle';
import CreateHelper from '~/components/CreateHelper';
import { TimeCell } from '~/components/tables/cells';

import { AddImage, EditImage } from '../components';
import { ComponentPreload as Preload } from '~/decorators/Preload';


const OBJECT_TYPE = 'images';

export class ImagesList extends Component {
  constructor(props) {
    super(props);

    this.state = { filter: '' };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    dispatch(setAnalytics(['images']));
  }

  deleteImages = confirmThenDelete(
    this.props.dispatch,
    'Image',
    api.images.delete,
    OBJECT_TYPE).bind(this);

  renderImageActions = ({ column, record }) => {
    const { dispatch } = this.props;

    const groups = [
      {
        elements: [{
          name: 'Edit', action: () =>
            EditImage.trigger(dispatch, record),
        }],
      },
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
              massEditGroups={[{
                elements: [
                  { name: 'Delete', action: this.deleteImages },
                ],
              }]}
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
    const { dispatch, images, linodes } = this.props;
    const privateImages = filter(images.images, i => !i.is_public);

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
          {Object.keys(privateImages).length ?
            this.renderImages(privateImages) :
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
