import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PrimaryButton from 'linode-components/dist/buttons/PrimaryButton';
import Input from 'linode-components/dist/forms/Input';
import CreateHelper from '~/components/CreateHelper';
import List from 'linode-components/dist/lists/List';
import Table from 'linode-components/dist/tables/Table';
import ListBody from 'linode-components/dist/lists/bodies/ListBody';
import ListHeader from 'linode-components/dist/lists/headers/ListHeader';
import ButtonCell from 'linode-components/dist/tables/cells/ButtonCell';
import CheckboxCell from 'linode-components/dist/tables/cells/CheckboxCell';
import LinkCell from 'linode-components/dist/tables/cells/LinkCell';
import MassEditControl from 'linode-components/dist/lists/controls/MassEditControl';

import { RegionCell, IPAddressCell } from '~/components/tables/cells';
import { setAnalytics, setSource } from '~/actions';
import { default as toggleSelected } from '~/actions/select';
import api from '~/api';
import { transferPool } from '~/api/ad-hoc/account';
import { transform } from '~/api/util';
import ChainedDocumentTitle from '~/components/ChainedDocumentTitle';
import { confirmThenDelete } from '~/utilities';

import { AddNodeBalancer } from '../components';
import { TransferPool } from '../../components';
import { ComponentPreload as Preload } from '~/decorators/Preload';


const OBJECT_TYPE = 'nodebalancers';

export class NodeBalancersList extends Component {
  constructor(props) {
    super(props);

    this.state = { filter: '' };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    dispatch(setAnalytics(['nodebalancers']));
  }

  deleteNodeBalancers = confirmThenDelete(
    this.props.dispatch,
    'NodeBalancer',
    api.nodebalancers.delete,
    OBJECT_TYPE).bind(this)

  render() {
    const { dispatch, nodebalancers, selectedMap, transfer } = this.props;
    const { filter } = this.state;

    const { sorted } = transform(nodebalancers.nodebalancers, {
      filterBy: filter,
    });

    const renderNodeBalancers = () => (
      <List>
        <ListHeader className="Menu">
          <div className="Menu-item">
            <MassEditControl
              data={sorted}
              dispatch={dispatch}
              massEditGroups={[{
                elements: [
                  { name: 'Delete', action: this.deleteNodeBalancers },
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
                cellComponent: LinkCell,
                hrefFn: (nodebalancer) => { return `/nodebalancers/${nodebalancer.label}`; },
                tooltipEnabled: true,
              },
              { cellComponent: IPAddressCell, headerClassName: 'LinodeIPAddressColumn' },
              { cellComponent: RegionCell },
              {
                cellComponent: ButtonCell,
                headerClassName: 'ButtonColumn',
                onClick: (nodebalancer) => { this.deleteNodeBalancers([nodebalancer]); },
                text: 'Delete',
              },
            ]}
            noDataMessage={'No NodeBalancers found.'}
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

    const addNodeBalancer = () => AddNodeBalancer.trigger(dispatch);

    return (
      <div className="PrimaryPage container">
        <ChainedDocumentTitle title="NodeBalancers" />
        <header className="PrimaryPage-header">
          <div className="PrimaryPage-headerRow clearfix">
            <h1 className="float-left">NodeBalancers</h1>
            <PrimaryButton onClick={addNodeBalancer} className="float-right">
              Add a NodeBalancer
            </PrimaryButton>
          </div>
        </header>
        <div className="PrimaryPage-body">
          {Object.values(nodebalancers.nodebalancers).length ? renderNodeBalancers() : (
            <CreateHelper
              label="NodeBalancers"
              linkText="Add a NodeBalancer"
              onClick={addNodeBalancer}
            />
          )}
        </div>
        <TransferPool
          transfer={transfer}
        />
      </div>
    );
  }
}

NodeBalancersList.propTypes = {
  dispatch: PropTypes.func,
  transfer: PropTypes.object.isRequired,
  nodebalancers: PropTypes.object,
  selectedMap: PropTypes.object.isRequired,
};


function mapStateToProps(state) {
  const transfer = state.api.account._transferpool;

  return {
    transfer,
    nodebalancers: state.api.nodebalancers,
    selectedMap: state.select.selected[OBJECT_TYPE] || {},
  };
}

const preloadRequest = async (dispatch) => {
  await Promise.all([
    api.nodebalancers.all(),
    transferPool(),
  ].map(dispatch));
};

export default compose(
  connect(mapStateToProps),
  Preload(preloadRequest)
)(NodeBalancersList);
