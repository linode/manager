import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { PrimaryButton } from 'linode-components/buttons';
import { Input } from 'linode-components/forms';
import { List, ScrollingList } from 'linode-components/lists';
import { ListBody, ListGroup } from 'linode-components/lists/bodies';
import { MassEditControl } from 'linode-components/lists/controls';
import { ListHeader } from 'linode-components/lists/headers';
import { ConfirmModalBody } from 'linode-components/modals';
import { Table } from 'linode-components/tables';
import { CheckboxCell, LinkCell } from 'linode-components/tables/cells';

import { setAnalytics, setSource, setTitle } from '~/actions';
import { showModal, hideModal } from '~/actions/modal';
import toggleSelected from '~/actions/select';
import * as api from '~/api';
import { powerOnLinode, powerOffLinode, rebootLinode } from '~/api/linodes';
import { fullyLoadedObject, transform } from '~/api/util';
import CreateHelper from '~/components/CreateHelper';
import { IPAddressCell, RegionCell, BackupsCell } from '~/components/tables/cells';
import StatusDropdownCell from '~/linodes/components/StatusDropdownCell';
import { confirmThenDelete } from '~/utilities';

import { planStats } from '../components/PlanStyle';
import { AddLinode, CloneLinode, RestoreLinode } from '../components';


const OBJECT_TYPE = 'linodes';

export class IndexPage extends Component {
  static async preload({ dispatch }) {
    await dispatch(api.linodes.all());

    ['distributions', 'types'].map(f => dispatch(api[f].all()));
  }

  constructor(props) {
    super(props);

    this.state = { filter: '' };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    dispatch(setTitle('Linodes'));
    dispatch(setAnalytics(['linodes']));
  }

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

  powerOn = (linodes) => this.genericAction(powerOnLinode, linodes)
  powerOff = (linodes) => this.genericAction(powerOffLinode, linodes, 'Power Off')
  reboot = (linodes) => this.genericAction(rebootLinode, linodes, 'Reboot')

  deleteLinodes = confirmThenDelete(
    this.props.dispatch,
    'Linode',
    api.linodes.delete,
    OBJECT_TYPE).bind(this)

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
                      subtitleFn: linode => planStats(linode.type),
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
    const { dispatch, linodes, distributions, types } = this.props;

    const addLinode = () => AddLinode.trigger(dispatch, distributions, types);
    const cloneLinode = () => CloneLinode.trigger(dispatch, linodes, types);
    const restoreLinode = () => RestoreLinode.trigger(dispatch, linodes, types);

    const addOptions = [
      { name: 'Create from Backup', action: restoreLinode },
      { name: 'Clone a Linode', action: cloneLinode },
    ];

    return (
      <div className="PrimaryPage container">
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
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func,
  linodes: PropTypes.object.isRequired,
  types: PropTypes.object.isRequired,
  distributions: PropTypes.object.isRequired,
  selectedMap: PropTypes.object.isRequired,
};

function select(state) {
  const linodes = _.pickBy(state.api.linodes.linodes, fullyLoadedObject);
  const distributions = state.api.distributions.distributions;
  const types = state.api.types.types;

  return {
    linodes,
    distributions,
    types,
    selectedMap: state.select.selected[OBJECT_TYPE] || {},
  };
}

export default connect(select)(IndexPage);
