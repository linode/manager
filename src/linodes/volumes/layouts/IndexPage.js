import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { PrimaryButton } from 'linode-components/buttons';
import { Input } from 'linode-components/forms';
import { List } from 'linode-components/lists';
import { Table } from 'linode-components/tables';
import { MassEditControl } from 'linode-components/lists/controls';
import { ListHeader } from 'linode-components/lists/headers';
import { ListBody } from 'linode-components/lists/bodies';
import { DeleteModalBody } from 'linode-components/modals';
import {
  ButtonCell,
  CheckboxCell,
  LabelCell,
} from 'linode-components/tables/cells';
import { RegionCell } from '~/components/tables/cells';

import { setAnalytics, setSource, setTitle } from '~/actions';
import { showModal, hideModal } from '~/actions/modal';
import { default as toggleSelected } from '~/actions/select';
import { volumes } from '~/api';
import { transform } from '~/api/util';
import CreateHelper from '~/components/CreateHelper';


const OBJECT_TYPE = 'volumes';

export class IndexPage extends Component {
  static async preload({ dispatch }) {
    await dispatch(volumes.all());
  }

  constructor(props) {
    super(props);

    this.state = { filter: '' };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    dispatch(setAnalytics(['volumes']));
    dispatch(setTitle('Volumes'));
  }

  deleteVolumes = (volumesToDelete) => {
    const { dispatch } = this.props;
    const volumesArr = Array.isArray(volumesToDelete) ? volumesToDelete : [volumesToDelete];

    const selectedVolumes = volumesArr.map(l => l.label);

    dispatch(showModal('Delete Volume(s)', (
      <DeleteModalBody
        onSubmit={async () => {
          const ids = volumesArr.map(function (volume) { return volume.id; });

          await Promise.all(ids.map(id => dispatch(volumes.delete(id))));
          dispatch(toggleSelected(OBJECT_TYPE, ids));
          dispatch(hideModal());
        }}
        items={selectedVolumes}
        typeOfItem="Volumes"
        onCancel={() => dispatch(hideModal())}
      />
    )));
  }

  renderVolumes(volumes) {
    const { dispatch, selectedMap } = this.props;
    const { filter } = this.state;

    const { sorted } = transform(volumes, {
      filterBy: filter,
      sortBy: v => v.label.toLowerCase(),
    });

    return (
      <List>
        <ListHeader className="Menu">
          <div className="Menu-item">
            <MassEditControl
              data={sorted}
              dispatch={dispatch}
              massEditGroups={[{ elements: [
                { name: 'Delete', action: this.deleteVolumes },
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
                dataKey: 'label',
                titleKey: 'label',
                tooltipEnabled: true,
              },
              { dataFn: (volume) => {
                const { size } = volume;
                return `${size} GiB`;
              } },
              {
                cellComponent: RegionCell,
                headerClassName: 'RegionColumn',
              },
              { dataFn: (volume) => {
                const { linode_id: linodeId } = volume;
                if (!linodeId) {
                  return 'Unattached';
                }
                return `Attached to ${linodeId}`;
              } },
              {
                cellComponent: ButtonCell,
                headerClassName: 'ButtonColumn',
                text: 'Delete',
                onClick: (volume) => { this.deleteVolumes(volume); },
              },
            ]}
            data={sorted}
            selectedMap={selectedMap}
            disableHeader
            onToggleSelect={(record) => {
              dispatch(toggleSelected(OBJECT_TYPE, record.id));
            }}
          />
        </ListBody>
      </List>
    );
  }

  render() {
    return (
      <div className="PrimaryPage container">
        <header className="PrimaryPage-header">
          <div className="PrimaryPage-headerRow clearfix">
            <h1 className="float-sm-left">Volumes</h1>
            <PrimaryButton
              className="float-sm-right"
              onClick={() => {}}
            >
              Add a Volume
            </PrimaryButton>
          </div>
        </header>
        <div className="PrimaryPage-body">
          {Object.keys(this.props.volumes.volumes).length ?
            this.renderVolumes(this.props.volumes.volumes) :
            <CreateHelper
              label="Volumes"
              onClick={() => {}}
              linkText="Add a Volume"
            />
          }
        </div>
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func,
  volumes: PropTypes.object,
  selectedMap: PropTypes.object.isRequired,
};


function select(state) {
  return {
    volumes: state.api.volumes,
    selectedMap: state.select.selected[OBJECT_TYPE] || {},
  };
}

export default connect(select)(IndexPage);
