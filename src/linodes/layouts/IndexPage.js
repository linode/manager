import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';

import CreateHelper from '~/components/CreateHelper';

import { List, Table } from '~/components/tables';
import { MassEditControl } from '~/components/tables/controls';
import { ListHeader } from '~/components/tables/headers';
import { ListBody, ListGroup } from '~/components/tables/bodies';
import {
  CheckboxCell,
  IPAddressCell,
  DatacenterCell,
  BackupsCell,
  LinkCell,
} from '~/components/tables/cells';
import StatusDropdownCell from '~/linodes/components/StatusDropdownCell';

import { setError } from '~/actions/errors';
import { toggleSelected } from '../actions';
import { linodes as apiLinodes } from '~/api';
import {
  powerOnLinode,
  powerOffLinode,
  rebootLinode,
} from '~/api/linodes';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import ConfirmModalBody from '~/components/modals/ConfirmModalBody';
import { showModal, hideModal } from '~/actions/modal';


export class IndexPage extends Component {
  static async preload({ dispatch }) {
    try {
      await dispatch(apiLinodes.all());
    } catch (response) {
      // eslint-disable-next-line no-console
      console.error(response);
      dispatch(setError(response));
    }
  }

  constructor() {
    super();
    this.powerOn = this.powerOn.bind(this);
    this.powerOff = this.powerOff.bind(this);
    this.reboot = this.reboot.bind(this);
    this.remove = this.remove.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    dispatch(setTitle('Linodes'));
  }

  powerOn(linodes) {
    const { dispatch } = this.props;

    linodes.forEach(function (linode) {
      dispatch(powerOnLinode(linode.id));
    });
  }

  powerOff(linodes) {
    const { dispatch } = this.props;

    linodes.forEach(function (linode) {
      dispatch(powerOffLinode(linode.id));
    });
  }

  reboot(linodes) {
    const { dispatch } = this.props;

    linodes.forEach(function (linode) {
      dispatch(rebootLinode(linode.id));
    });
  }

  remove(linodes) {
    const { dispatch } = this.props;

    dispatch(showModal('Confirm deletion',
      <ConfirmModalBody
        buttonText="Delete selected Linodes"
        onOk={() => {
          linodes.forEach(function (linode) {
            dispatch(apiLinodes.delete(linode.id));
          });
          dispatch(hideModal());
        }}
        onCancel={() => dispatch(hideModal())}
      >
        Are you sure you want to delete selected Linodes?
        This operation cannot be undone.
      </ConfirmModalBody>
    ));
  }

  renderLinodes(linodes, selected) {
    const { dispatch } = this.props;
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
          <div className="pull-left">
            <MassEditControl
              data={sortedLinodes}
              dispatch={dispatch}
              massEditOptions={[
                { name: 'Reboot', action: this.reboot },
                { name: 'Power on', action: this.powerOn },
                { name: 'Power off', action: this.powerOff },
                { name: 'Delete', action: this.remove },
              ]}
              selectedMap={selected}
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
                    { cellComponent: CheckboxCell },
                    {
                      className: 'RowLabelCell',
                      cellComponent: LinkCell,
                      hrefFn: (linode) => `/linodes/${linode.label}`,
                    },
                    { cellComponent: IPAddressCell },
                    { cellComponent: DatacenterCell },
                    {
                      cellComponent: BackupsCell,
                      hrefFn: (linode) => `/linodes/${linode.label}/backups`,
                    },
                    { cellComponent: StatusDropdownCell, dispatch: dispatch },
                  ]}
                  data={group.data}
                  selectedMap={selected}
                  disableHeader
                  onToggleSelect={(record) => {
                    dispatch(toggleSelected(record.id));
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
    const { selected } = this.props;

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
          {Object.keys(this.props.linodes.linodes).length ? this.renderLinodes(linodes, selected) :
            <CreateHelper label="Linodes" href="/linodes/create" linkText="Add a Linode" />}
        </div>
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func,
  linodes: PropTypes.object,
  selected: PropTypes.object,
};

function select(state) {
  return {
    linodes: state.api.linodes,
    selected: state.linodes.index.selected,
  };
}

export default connect(select)(IndexPage);
