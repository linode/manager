import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { PrimaryButton } from 'linode-components';
import { Input } from 'linode-components';
import { List } from 'linode-components';
import { ListBody, ListGroup } from 'linode-components';
import { MassEditControl } from 'linode-components';
import { ListHeader } from 'linode-components';
import { Table } from 'linode-components';
import { DropdownCell, CheckboxCell } from 'linode-components';
import { ConfirmModalBody } from 'linode-components';

import toggleSelected from '~/actions/select';
import api from '~/api';
import { transform } from '~/api/util';
import { ChainedDocumentTitle } from '~/components';
import { PortalModal } from '~/components/modal';
import { TimeCell } from '~/components/tables/cells';
import { confirmThenDelete } from '~/utilities';
import { hideModal } from '~/utilities';

import TokenMoreInfo from '../components/TokenMoreInfo';
import EditPersonalAccessToken from '../components/EditPersonalAccessToken';
import CreatePersonalAccessToken from '../components/CreatePersonalAccessToken';
import { ComponentPreload as Preload } from '~/decorators/Preload';


const OBJECT_TYPE = 'tokens';

export class APITokensPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filter: '',
      modal: null,
    };

    this.hideModal = hideModal.bind(this);
  }

  createDropdownGroups = (token) => {
    const groups = [
      { elements: [{ name: 'More Info', action: () => this.tokenMoreInfoModal(token) }] },
      { elements: [{ name: 'Revoke', action: () => this.revokeTokens(token) }] },
    ];

    if (!this.isApp(token)) {
      groups.splice(1, 0, {
        elements: [
          { name: 'Edit', action: () => this.editPersonalAccessTokenModal(token) },
        ],
      });
    }

    return groups;
  }

  isApp = (tokenOrApp) => tokenOrApp.thumbnail_url !== undefined

  revoke = (tokenOrAppId) => {
    const tokenOrApp = this.props.tokens[tokenOrAppId];
    if (this.isApp(tokenOrApp)) {
      return api.apps.delete(tokenOrAppId);
    }

    return api.tokens.delete(tokenOrAppId);
  }

  revokeTokens = confirmThenDelete(
    this.props.dispatch,
    'token',
    this.revoke,
    OBJECT_TYPE,
    (t) => t.label,
    'revoke',
    'revoking').bind(this);

  createPersonalAccessTokenModal = () => {
    this.setState({
      modal: {
        name: 'createPersonalAccessToken',
        title: CreatePersonalAccessToken.title,
      },
    });
  }

  editPersonalAccessTokenModal = (token) => {
    this.setState({
      modal: {
        name: 'editPersonalAccessToken',
        title: EditPersonalAccessToken.title,
        token: token,
      },
    });
  }

  tokenMoreInfoModal = (token) => {
    this.setState({
      modal: {
        name: 'tokenMoreInfo',
        title: TokenMoreInfo.title,
        token: token,
      },
    });
  }

  renderModal = () => {
    const { dispatch } = this.props;
    if (!this.state.modal) {
      return null;
    }
    const { name, title, token } = this.state.modal;
    return (
      <PortalModal
        title={title}
        onClose={this.hideModal}
      >
        {(name === 'tokenMoreInfo') &&
          <ConfirmModalBody
            noCancel
            onSubmit={this.hideModal}
            buttonText="Done"
          >
            <TokenMoreInfo scopes={token.scopes} />
          </ConfirmModalBody>
        }
        {(name === 'editPersonalAccessToken') &&
          <EditPersonalAccessToken
            id={token.id}
            label={token.label}
            dispatch={dispatch}
            close={this.hideModal}
          />
        }
        {(name === 'createPersonalAccessToken') &&
          <EditPersonalAccessToken
            id={token.id}
            label={token.label}
            dispatch={dispatch}
            close={this.hideModal}
          />
        }
      </PortalModal>
    );
  }

  renderTokens = () => {
    const { dispatch, selectedMap, tokens } = this.props;
    const { filter } = this.state;

    const { groups, sorted: sortedTokens } = transform(tokens, {
      filterBy: filter,
      groupOn: d => this.isApp(d) ? d.label : 'Personal Access Tokens',
    });

    return (
      <List>
        <ListHeader className="Menu">
          <div className="Menu-item">
            <MassEditControl
              data={sortedTokens}
              dispatch={dispatch}
              massEditGroups={[{ elements: [
                { name: 'Revoke', action: this.revokeTokens },
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
          {groups.map((group, index) => (
            <ListGroup
              key={index}
              name={group.name}
            >
              <Table
                columns={[
                  { cellComponent: CheckboxCell, headerClassName: 'CheckboxColumn' },
                  {
                    dataKey: 'label',
                    tooltipEnabled: true,
                    label: 'Label',
                  },
                  {
                    dataFn: t => this.isApp(t) ? 'OAuth Client Token' : 'Personal Access Token',
                    label: 'Type',
                  },
                  {
                    cellComponent: TimeCell,
                    timeKey: 'created',
                    label: 'Created',
                  },
                  {
                    cellComponent: TimeCell,
                    timeKey: 'expiry',
                    label: 'Expires',
                  },
                  {
                    cellComponent: DropdownCell,
                    headerClassName: 'DropdownColumn',
                    groups: this.createDropdownGroups,
                  },
                ]}
                noDataMessage="No tokens found."
                data={group.data}
                selectedMap={selectedMap}
                onToggleSelect={(token) => dispatch(toggleSelected(OBJECT_TYPE, token.id))}
              />
            </ListGroup>))}
        </ListBody>
      </List>
    );
  }

  render() {
    const { dispatch } = this.props;

    return (
      <div>
        <ChainedDocumentTitle title="API Tokens" />
        {this.renderModal()}
        <header className="NavigationHeader clearfix">
          <PrimaryButton
            onClick={() => CreatePersonalAccessToken.trigger(dispatch)}
            className="float-right"
            buttonClass="btn-secondary"
          >Create a Personal Access Token</PrimaryButton>
        </header>
        {this.renderTokens()}
      </div>
    );
  }
}

APITokensPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  tokens: PropTypes.object.isRequired,
  selectedMap: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  const tokens = {
    ...state.api.tokens.tokens,
    ...state.api.apps.apps,
  };

  return {
    tokens,
    selectedMap: state.select.selected[OBJECT_TYPE] || {},
  };
};

const preloadRequest = async (dispatch) => {
  await Promise.all([api.tokens, api.apps].map(c => dispatch(c.all())));
};

export default compose(
  connect(mapStateToProps),
  Preload(preloadRequest)
)(APITokensPage);
