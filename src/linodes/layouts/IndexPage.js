import _ from 'lodash';
import moment from 'moment';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { ScrollingList } from 'linode-components/lists';
import { ListBody, ListGroup } from 'linode-components/lists/bodies';
import { MassEditControl } from 'linode-components/lists/controls';
import { ListHeader } from 'linode-components/lists/headers';
import { List } from 'linode-components/lists';
import { ConfirmModalBody, DeleteModalBody } from 'linode-components/modals';
import StatusDropdownCell from '~/linodes/components/StatusDropdownCell';
import { Table } from 'linode-components/tables';
import {
  CheckboxCell,
  LinkCell,
} from 'linode-components/tables/cells';
import {
  IPAddressCell,
  RegionCell,
  BackupsCell,
} from '~/components/tables/cells';

import { setError } from '~/actions/errors';
import { default as toggleSelected } from '~/actions/select';
import { showModal, hideModal } from '~/actions/modal';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { linodes as api } from '~/api';
import {
  powerOnLinode,
  powerOffLinode,
  rebootLinode,
} from '~/api/linodes';
import CreateHelper from '~/components/CreateHelper';


const OBJECT_TYPE = 'linodes';

export class IndexPage extends Component {
  static async preload({ dispatch }) {
    try {
      await dispatch(api.all());
    } catch (response) {
      // eslint-disable-next-line no-console
      console.error(response);
      dispatch(setError(response));
    }
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    dispatch(setTitle('Linodes'));
  }

  genericAction(actionToDispatch, linodes, confirmType) {
    const { dispatch } = this.props;

    const callback = () => {
      linodes.forEach(linode => dispatch(actionToDispatch(linode.id)));
      dispatch(hideModal());
    };

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

    if (confirmType) {
      dispatch(showModal(`Confirm ${confirmType}`, (
        <ConfirmModalBody
          onCancel={() => dispatch(hideModal())}
          onOk={callback}
        >{modalBody}</ConfirmModalBody>
      )));
    } else {
      // No need to confirm.
      callback();
    }
  }

  powerOn = (linodes) => this.genericAction(powerOnLinode, linodes)
  powerOff = (linodes) => this.genericAction(powerOffLinode, linodes, 'Power Off')
  reboot = (linodes) => this.genericAction(rebootLinode, linodes, 'Reboot')

  deleteLinodes = (linodesToBeRemoved) => {
    const { dispatch } = this.props;
    const linodesArray = Array.isArray(linodesToBeRemoved)
                       ? linodesToBeRemoved
                       : [linodesToBeRemoved];

    const selectedLinodes = linodesArray.map(l => l.label);

    dispatch(showModal('Delete Linode(s)',
      <DeleteModalBody
        onOk={async () => {
          const ids = linodesToBeRemoved.map(function (linode) { return linode.id; });

          await Promise.all(ids.map(id => dispatch(api.delete(id))));
          dispatch(toggleSelected(OBJECT_TYPE, ids));
          dispatch(hideModal());
        }}
        items={selectedLinodes}
        typeOfItem="Linodes"
        onCancel={() => dispatch(hideModal())}
      />
    ));
  }

  renderLinodes(linodes) {
    const { dispatch, selectedMap } = this.props;
    // TODO: add sort function in linodes config definition
    const sortedLinodes = _.sortBy(Object.values(linodes), l => moment(l.created));

    const groups = _.sortBy(
      _.map(_.groupBy(sortedLinodes, l => l.group), (_linodes, _group) => {
        return {
          name: _group,
          data: _linodes,
        };
      }), lg => lg.name);

    return (
      <List>
        <ListHeader>
          <div className="pull-sm-left">
            <MassEditControl
              data={sortedLinodes}
              dispatch={dispatch}
              massEditOptions={[
                { name: 'Reboot', action: this.reboot },
                { name: 'Power On', action: this.powerOn },
                { name: 'Power Off', action: this.powerOff },
                null,
                { name: 'Delete', action: this.deleteLinodes },
              ]}
              selectedMap={selectedMap}
              objectType={OBJECT_TYPE}
              toggleSelected={toggleSelected}
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
                      className: 'RowLabelCell',
                      cellComponent: LinkCell,
                      hrefFn: (linode) => `/linodes/${linode.label}`,
                    },
                    { cellComponent: IPAddressCell, headerClassName: 'IPAddressColumn' },
                    {
                      cellComponent: RegionCell,
                      headerClassName: 'RegionColumn hidden-md-down',
                      className: 'hidden-md-down',
                    },
                    {
                      cellComponent: BackupsCell,
                      className: 'hidden-lg-down',
                      headerClassName: 'BackupsColumn hidden-lg-down',
                      hrefFn: (linode) => `/linodes/${linode.label}/backups`,
                    },
                    {
                      cellComponent: StatusDropdownCell,
                      headerClassName: 'StatusDropdownColumn',
                      dispatch: dispatch,
                    },
                  ]}
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
    const { linodes } = this.props.linodes;

    return (
      <div className="PrimaryPage container">
        <header className="PrimaryPage-header">
          <div className="PrimaryPage-headerRow clearfix">
            <h1 className="float-sm-left">Linodes</h1>
            <Link to="/linodes/create" className="linode-add btn btn-primary float-sm-right">
              <span className="fa fa-plus"></span>
              Add a Linode
            </Link>
          </div>
        </header>
        <div className="PrimaryPage-body">
          {Object.keys(this.props.linodes.linodes).length ? this.renderLinodes(linodes) :
            <CreateHelper label="Linodes" href="/linodes/create" linkText="Add a Linode" />}
        </div>
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func,
  linodes: PropTypes.object,
  selectedMap: PropTypes.object.isRequired,
};

function select(state) {
  return {
    linodes: state.api.linodes,
    selectedMap: state.select.selected[OBJECT_TYPE] || {},
  };
}

export default connect(select)(IndexPage);
