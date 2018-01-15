import pickBy from 'lodash/pickBy';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PrimaryButton from 'linode-components/dist/buttons/PrimaryButton';
import Input from 'linode-components/dist/forms/Input';
import List from 'linode-components/dist/lists/List';
import ScrollingList from 'linode-components/dist/lists/ScrollingList';
import ListBody from 'linode-components/dist/lists/bodies/ListBody';
import ListGroup from 'linode-components/dist/lists/bodies/ListGroup';
import MassEditControl from 'linode-components/dist/lists/controls/MassEditControl';
import ListHeader from 'linode-components/dist/lists/headers/ListHeader';
import ConfirmModalBody from 'linode-components/dist/modals/ConfirmModalBody';
import Table from 'linode-components/dist/tables/Table';
import CheckboxCell from 'linode-components/dist/tables/cells/CheckboxCell';
import LinkCell from 'linode-components/dist/tables/cells/LinkCell';

import { setAnalytics, setSource } from '~/actions';
import { showModal, hideModal } from '~/actions/modal';
import toggleSelected from '~/actions/select';
import api from '~/api';
import { transferPool } from '~/api/ad-hoc/account';
import { powerOnLinode, powerOffLinode, rebootLinode } from '~/api/ad-hoc/linodes';
import { fullyLoadedObject, transform } from '~/api/util';
import ChainedDocumentTitle from '~/components/ChainedDocumentTitle';
import PortalModal from '~/components/modal/PortalModal';
import CreateHelper from '~/components/CreateHelper';
import { IPAddressCell, RegionCell, BackupsCell } from '~/components/tables/cells';
import StatusDropdownCell from '~/linodes/components/StatusDropdownCell';
import { confirmThenDelete } from '~/utilities';

import { planStyle } from '../components/PlanStyle';
import AddLinode from '../components/AddLinode';
import CloneLinode from '../components/CloneLinode';
import RestoreLinode from '../components/RestoreLinode';
import TransferPool from '../../components/TransferPool';
import { ComponentPreload as Preload } from '~/decorators/Preload';

const OBJECT_TYPE = 'linodes';

export class ListLinodesPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filter: '',
      modalTitle: '',
      modalOnSubmit: () => null,
      modalAnalytics: {},
      modalBody: null,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    dispatch(setAnalytics(['linodes']));

    ['images', 'types'].map(f => dispatch(api[f].all()));
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

    this.setState({
      activeModal: 'massEditConfirm',
      modalTitle: title,
      modalOnSubmit: callback,
      modalAnalytics: { title },
      modalBody,
    }, () => dispatch(showModal(title)));
  }

  powerOff = (linodes) => this.genericAction(powerOffLinode, linodes, 'Power Off');
  powerOn = (linodes) => this.genericAction(powerOnLinode, linodes)
  reboot = (linodes) => this.genericAction(rebootLinode, linodes, 'Reboot')

  addLinodeModal = () => {
    const { dispatch } = this.props;
    this.setState({
      activeModal: 'addLinode',
    }, () => dispatch(showModal(AddLinode.title)));
  };

  cloneLinodeModal = () => {
    const { dispatch } = this.props;
    this.setState({
      activeModal: 'cloneLinode',
    }, () => dispatch(showModal(CloneLinode.title)));
  }

  restoreLinodeModal = () => {
    const { dispatch } = this.props;
    this.setState({
      activeModal: 'restoreLinode',
    }, () => dispatch(showModal(RestoreLinode.title)));
  }

  hideModal = () => {
    const { dispatch } = this.props;
    dispatch(hideModal());
    this.setState({ activeModal: '' });
  }

  renderLinodes(linodes, types) {
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
                {
                  elements: [
                    { name: 'Power On', action: this.powerOn },
                    { name: 'Power Off', action: this.powerOff },
                  ],
                },
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
                      subtitleFn: linode => planStyle(types[linode.type]),
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

  renderModal = () => {
    const { dispatch, linodes, images, types } = this.props;
    const { activeModal, modalAnalytics, modalBody, modalOnSubmit } = this.state;
    return (
      <PortalModal>
        {(activeModal === 'massEditConfirm') &&
          <ConfirmModalBody
            analytics={modalAnalytics}
            onCancel={this.hideModal}
            onSubmit={() => modalOnSubmit()}
          >
            {modalBody}
          </ConfirmModalBody>
        }
        {(activeModal === 'addLinode') &&
          <AddLinode
            dispatch={dispatch}
            close={this.hideModal}
            images={images}
            plans={types}
          />
        }
        {(activeModal === 'cloneLinode') &&
          <CloneLinode
            dispatch={dispatch}
            close={this.hideModal}
            linodes={linodes}
            plans={types}
          />
        }
        {(activeModal === 'restoreLinode') &&
          <RestoreLinode
            dispatch={dispatch}
            close={this.hideModal}
            linodes={linodes}
            plans={types}
          />
        }
      </PortalModal>
    );
  }

  render() {
    const { linodes, types, transfer } = this.props;

    const addOptions = [
      { name: 'Create from Backup', action: this.restoreLinodeModal },
      { name: 'Clone a Linode', action: this.cloneLinodeModal },
    ];

    return (
      <div className="PrimaryPage container">
        {this.renderModal()}
        <ChainedDocumentTitle title="Linodes" />
        <header className="PrimaryPage-header">
          <div className="PrimaryPage-headerRow clearfix">
            <h1 className="float-left">Linodes</h1>
            <PrimaryButton
              className="float-right"
              onClick={this.addLinodeModal}
              options={addOptions}
            >
              Add a Linode
            </PrimaryButton>
          </div>
        </header>
        <div className="PrimaryPage-body">
          {Object.keys(linodes).length ? this.renderLinodes(linodes, types) : (
            <CreateHelper
              label="Linodes"
              linkText="Add a Linode"
              onClick={this.addLinodeModal}
            />
          )}
        </div>
        <TransferPool transfer={transfer} />
      </div>
    );
  }
}

ListLinodesPage.propTypes = {
  dispatch: PropTypes.func,
  linodes: PropTypes.object.isRequired,
  transfer: PropTypes.object.isRequired,
  types: PropTypes.object.isRequired,
  images: PropTypes.object.isRequired,
  selectedMap: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  const linodes = pickBy(state.api.linodes.linodes, fullyLoadedObject);
  const images = state.api.images.images;
  const types = state.api.types.types;
  const transfer = state.api.account._transferpool;

  return {
    linodes,
    images,
    types,
    transfer,
    selectedMap: state.select.selected[OBJECT_TYPE] || {},
  };
}

const preloadRequest = async (dispatch) => {
  await Promise.all([
    transferPool(),
    api.linodes.all(),
    api.images.all(),
  ].map(dispatch));
};

export default compose(
  connect(mapStateToProps),
  Preload(preloadRequest),
)(ListLinodesPage);
