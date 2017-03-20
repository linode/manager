import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';

import Dropdown from '~/components/Dropdown';
import CreateHelper from '~/components/CreateHelper';

import { Table } from '~/components/tables';
import {
  BackupsCell,
  CheckboxCell,
  DatacenterCell,
  IPAddressCell,
  LinkCell,
} from '~/components/tables/cells';
import StatusDropdownCell from '~/linodes/components/StatusDropdownCell';

import { setError } from '~/actions/errors';
import { linodes } from '~/api';
import {
  powerOnLinode,
  powerOffLinode,
  rebootLinode,
} from '~/api/linodes';
import {
  toggleSelected,
} from '../actions';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import ConfirmModalBody from '~/components/modals/ConfirmModalBody';
import { showModal, hideModal } from '~/actions/modal';


export class IndexPage extends Component {
  static async preload({ dispatch }) {
    try {
      await dispatch(linodes.all());
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
    this.toggle = this.toggle.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    dispatch(setTitle('Linodes'));
  }

  powerOn(linode) {
    const { dispatch } = this.props;
    dispatch(powerOnLinode(linode.id));
  }

  powerOff(linode) {
    const { dispatch } = this.props;
    dispatch(powerOffLinode(linode.id));
  }

  reboot(linode) {
    const { dispatch } = this.props;
    dispatch(rebootLinode(linode.id));
  }

  remove(linode) {
    const { dispatch } = this.props;
    dispatch(linodes.delete(linode.id));
  }

  toggle(linode) {
    const { dispatch } = this.props;
    dispatch(toggleSelected(linode.id));
  }

  doToSelected(action) {
    const { linodes } = this.props.linodes;
    const { selected } = this.props;
    Object.keys(selected).map(id => action(linodes[id]));
    if (action !== this.toggle) {
      Object.keys(selected).map(id => this.toggle(linodes[id]));
    }
  }

  massAction(action) {
    return () => {
      if (action !== this.remove) {
        this.doToSelected(action);
        return;
      }

      const { dispatch } = this.props;

      dispatch(showModal('Confirm deletion',
        <ConfirmModalBody
          buttonText="Delete selected Linodes"
          onOk={() => {
            this.doToSelected(action);
            dispatch(hideModal());
          }}
          onCancel={() => dispatch(hideModal())}
        >
          Are you sure you want to delete selected Linodes?
          This operation cannot be undone.
        </ConfirmModalBody>
      ));
    };
  }

  renderLinodes(linodes, selected) {
    const { dispatch } = this.props;
    // TODO: add sort function in linodes config definition
    const sortedLinodes = _.sortBy(Object.values(linodes), l => moment(l.created));

    const groups = _.sortBy(
      _.map(_.groupBy(sortedLinodes, l => l.group), (_linodes, _group) => {
        return {
          name: _group,
          // TODO: don't redefine these for each linode
          columns: [
            {
              cellComponent: CheckboxCell,
              onChange: (record) => {
                this.toggle(record);
              },
            },
            {
              className: 'RowLabelCell',
              cellComponent: LinkCell,
              hrefFn: (linode) => `/linodes/${linode.label}`,
            },
            { cellComponent: IPAddressCell },
            { cellComponent: DatacenterCell },
            { cellComponent: BackupsCell, hrefFn: (linode) => `/linodes/${linode.label}/backups` },
            { cellComponent: StatusDropdownCell, dispatch: dispatch },
          ],
          data: _linodes,
          disableHeader: true,
        };
      }), lg => lg.name);

    return (
      <div>
        {groups.map(function (group, index) {
          return (
            <div className="Group" key={index}>
              <div className="Group-label">{group.name}</div>
              <Table
                columns={group.columns}
                data={group.data}
                selectedMap={selected}
              />
            </div>
          );
        })}
      </div>
    );
  }

  renderActions() {
    const elements = [
      { _action: this.reboot, name: 'Reboot' },
      { _action: this.powerOn, name: 'Power on' },
      { _action: this.powerOff, name: 'Power off' },
      { _action: this.remove, name: 'Delete' },
    ].map(element => ({ ...element, action: this.massAction(element._action) }));

    return <Dropdown elements={elements} />;
  }

  render() {
    const { linodes } = this.props.linodes;
    const { selected } = this.props;
    const linodesList = Object.values(linodes);
    const allSelected = linodesList.length > 0 &&
      Object.keys(selected).length === linodesList.length;
    const selectAll = () => {
      let cond = l => !l._isSelected;
      if (allSelected) cond = () => true;
      linodesList.filter(cond).map(this.toggle);
    };

    const selectAllCheckbox = <input type="checkbox" onChange={selectAll} checked={allSelected} />;

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
          <div className="PrimaryPage-headerRow">
            <div className="input-group">
              <span className="input-group-addon">{selectAllCheckbox}</span>
              {this.renderActions()}
            </div>
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
