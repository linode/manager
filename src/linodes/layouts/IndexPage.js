import pickBy from 'lodash/pickBy';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { PrimaryButton } from 'linode-components';
import { Input } from 'linode-components';
import { List, ScrollingList } from 'linode-components';
import { ListBody, ListGroup } from 'linode-components';
import { MassEditControl } from 'linode-components';
import { ListHeader } from 'linode-components';
import { ConfirmModalBody } from 'linode-components';
import { Table } from 'linode-components';
import { CheckboxCell, LinkCell } from 'linode-components';

import { setAnalytics, setSource } from '~/actions';
import { showModal, hideModal } from '~/actions/modal';
import toggleSelected from '~/actions/select';
import api from '~/api';
import * as linodeTypes from '~/api/linodeTypes';
import { transferPool } from '~/api/ad-hoc/account';
import { powerOnLinode, powerOffLinode, rebootLinode } from '~/api/ad-hoc/linodes';
import { fullyLoadedObject, transform } from '~/api/util';
import { ChainedDocumentTitle } from '~/components';
import CreateHelper from '~/components/CreateHelper';
import { IPAddressCell, RegionCell, BackupsCell } from '~/components/tables/cells';
import StatusDropdownCell from '~/linodes/components/StatusDropdownCell';
import { confirmThenDelete } from '~/utilities';

import { planStyle } from '../components/PlanStyle';
import { AddLinode, CloneLinode, RestoreLinode } from '../components';
import { TransferPool } from '../../components';


const OBJECT_TYPE = 'linodes';

export class IndexPage extends Component {
  static async preload({ dispatch }) {
    await dispatch(api.linodes.all());
    await dispatch(api.images.all());
    await dispatch(transferPool());
  }

  constructor(props) {
    super(props);

    this.state = { filter: '' };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    dispatch(setAnalytics(['linodes']));

    dispatch(api.images.all());
    dispatch(linodeTypes.getAll());
  }

  deleteLinodes = confirmThenDelete(
    this.props.dispatch,
    'Linode',
    api.linodes.delete,
    OBJECT_TYPE).bind(this)

  genericAction(actionToDispatch, linodes, confirmType) {
    const { dispatch } = this.props;

    const callback = () => {
      linodes.forEach(linode => dispatch(actionToDispatch(linode.id)));
      dispatch(hideModal());
    };

    if (!confirmType) {
      return callback();
    }

    let modalBody = (
      <div>
        <p>Are you sure you want to {confirmType.toLowerCase()} these Linodes?</p>
        <ScrollingList items={linodes.map(l => l.label)} />
      </div>
    );
    if (linodes.length === 1) {
      modalBody = (
        <p>
          Are you sure you want to {confirmType.toLowerCase()} <strong>{linodes[0].label}</strong>?
        </p>
      );
    }

    const title = `Confirm ${confirmType}`;
    dispatch(showModal(title, (
      <ConfirmModalBody
        onCancel={() => dispatch(hideModal())}
        onSubmit={callback}
        analytics={{ title }}
      >{modalBody}</ConfirmModalBody>
    )));
  }

  powerOff = (linodes) => this.genericAction(powerOffLinode, linodes, 'Power Off')

  powerOn = (linodes) => this.genericAction(powerOnLinode, linodes)
  reboot = (linodes) => this.genericAction(rebootLinode, linodes, 'Reboot')

  renderLinodes(linodes) {
    const { dispatch, selectedMap } = this.props;
    const { filter } = this.state;

    const { groups, sorted: sortedLinodes } = transform(linodes, {
      filterBy: filter,
    });

    return (
      <List>
        <ListHeader className="Menu">
          <div className="Menu-item">
            <MassEditControl
              data={sortedLinodes}
              dispatch={dispatch}
              massEditGroups={[
                { elements: [{ name: 'Reboot', action: this.reboot }] },
                { elements: [
                  { name: 'Power On', action: this.powerOn },
                  { name: 'Power Off', action: this.powerOff },
                ] },
                { elements: [{ name: 'Delete', action: this.deleteLinodes }] },
              ]}
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
          {groups.map((group, index) => {
            return (
              <ListGroup
                key={index}
                name={group.name}
              >
                <Table
                  columns={[
                    { cellComponent: CheckboxCell, headerClassName: 'CheckboxColumn' },
                    {
                      cellComponent: LinkCell,
                      headerClassName: 'LabelColumn',
                      hrefFn: (linode) => `/linodes/${linode.label}`,
                      tooltipEnabled: true,
                      subtitleFn: linode => planStyle(linode.type),
                    },
                    { cellComponent: IPAddressCell, headerClassName: 'LinodeIPAddressColumn' },
                    {
                      cellComponent: RegionCell,
                      headerClassName: 'RegionColumn',
                    },
                    {
                      cellComponent: BackupsCell,
                      className: 'BackupsCell hidden-lg-down',
                      disableTooltip: true,
                      headerClassName: 'BackupsColumn hidden-lg-down',
                      hrefFn: (linode) => `/linodes/${linode.label}/backups`,
                    },
                    {
                      cellComponent: StatusDropdownCell,
                      headerClassName: 'StatusDropdownColumn',
                      dispatch: dispatch,
                    },
                  ]}
                  noDataMessage="No Linodes found."
                  data={group.data}
                  selectedMap={selectedMap}
                  disableHeader
                  onToggleSelect={(record) => {
                    dispatch(toggleSelected(OBJECT_TYPE, record.id));
                  }}
                />
              </ListGroup>
            );
          })}
        </ListBody>
      </List>
    );
  }

  render() {
    const { dispatch, linodes, images, types, transfer } = this.props;

    const addLinode = () => AddLinode.trigger(dispatch, images, types);
    const cloneLinode = () => CloneLinode.trigger(dispatch, linodes, types);
    const restoreLinode = () => RestoreLinode.trigger(dispatch, linodes, types);

    const addOptions = [
      { name: 'Create from Backup', action: restoreLinode },
      { name: 'Clone a Linode', action: cloneLinode },
    ];

    return (
      <div className="PrimaryPage container">
        <ChainedDocumentTitle title="Linodes" />
        <header className="PrimaryPage-header">
          <div className="PrimaryPage-headerRow clearfix">
            <h1 className="float-left">Linodes</h1>
            <PrimaryButton
              className="float-right"
              onClick={addLinode}
              options={addOptions}
            >
              Add a Linode
            </PrimaryButton>
          </div>
        </header>
        <div className="PrimaryPage-body">
          {Object.keys(linodes).length ? this.renderLinodes(linodes) : (
            <CreateHelper
              label="Linodes"
              linkText="Add a Linode"
              onClick={addLinode}
            />
          )}
        </div>
        <TransferPool transfer={transfer} />
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func,
  linodes: PropTypes.object.isRequired,
  transfer: PropTypes.object.isRequired,
  types: PropTypes.object.isRequired,
  images: PropTypes.object.isRequired,
  selectedMap: PropTypes.object.isRequired,
};

function select(state) {
  const linodes = pickBy(state.api.linodes.linodes, fullyLoadedObject);
  const images = state.api.images.images;
  const types = state.api.linodeTypes.linodeTypes;
  const transfer = state.api.account._transferpool;

  return {
    linodes,
    images,
    types,
    transfer,
    selectedMap: state.select.selected[OBJECT_TYPE] || {},
  };
}

export default connect(select)(IndexPage);
