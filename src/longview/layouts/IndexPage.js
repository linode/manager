import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { fullyLoadedObject } from '~/api/util';

import { PrimaryButton } from 'linode-components/buttons';
import { Input } from 'linode-components/forms';
import CreateHelper from '~/components/CreateHelper';
import { List } from 'linode-components/lists';
import { Table } from 'linode-components/tables';
import { ListBody } from 'linode-components/lists/bodies';
import { ListHeader } from 'linode-components/lists/headers';
import {
  ButtonCell,
  CheckboxCell,
  LinkCell,
} from 'linode-components/tables/cells';
import { MassEditControl } from 'linode-components/lists/controls';

import { setAnalytics, setSource, setTitle } from '~/actions';
import { default as toggleSelected } from '~/actions/select';
import api from '~/api';
import { transform } from '~/api/util';
import { confirmThenDelete } from '~/utilities';
import AddLVClient from '../components/AddLVClient';

const OBJECT_TYPE = 'longview';

export class IndexPage extends Component {
  static async preload({ dispatch }) {
    await Promise.all([
      api.lvclients.all(),
    ].map(r => dispatch(r)));
  }

  constructor(props) {
    super(props);

    this.state = { filter: '' };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    dispatch(setTitle('Longview Clients'));
    dispatch(setAnalytics(['lvclients']));
  }

  deleteLVClients = confirmThenDelete(
    this.props.dispatch,
    'Longview Client',
    api.lvclients.delete,
    OBJECT_TYPE).bind(this)


  renderLVClients() {
    const { dispatch, lvclients, selectedMap } = this.props;
    const { filter } = this.state;
    const { sorted } = transform(lvclients, {
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
                { name: 'Delete', action: this.deleteLVClients },
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
                cellComponent: LinkCell,
                hrefFn: (lvclient) => { return `/longview/${lvclient.label}`; },
                tooltipEnabled: true,
              },
              {
                cellComponent: ButtonCell,
                headerClassName: 'ButtonColumn',
                onClick: this.deleteLVClients,
                text: 'Delete',
              },
            ]}
            noDataMessage={"No Longview Clients found."}
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
    const { dispatch, lvclients } = this.props;

    const addLVClient = () => AddLVClient.trigger(dispatch);

    return (
      <div className="PrimaryPage container">
        <header className="PrimaryPage-header">
          <div className="PrimaryPage-headerRow clearfix">
            <h1 className="float-left">Longview Clients</h1>
            <PrimaryButton onClick={addLVClient} className="float-right">
              Add a Longview Client
            </PrimaryButton>
          </div>
        </header>
        <div className="PrimaryPage-body">
          {Object.values(lvclients).length ? this.renderLVClients() : (
            <CreateHelper
              label="Longview Clients"
              linkText="Add a Longview Client"
              onClick={addLVClient}
            />
          )}
        </div>
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func,
  lvclients: PropTypes.object.isRequired,
  selectedMap: PropTypes.object.isRequired,
};

function select(state) {
  const lvclients = _.pickBy(state.api.lvclients.lvclients, fullyLoadedObject);

  return {
    lvclients,
    selectedMap: state.select.selected[OBJECT_TYPE] || {},
  };
}

export default connect(select)(IndexPage);
