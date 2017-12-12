import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { PrimaryButton } from 'linode-components';
import { Input } from 'linode-components';
import { List } from 'linode-components';
import { ListBody, ListGroup } from 'linode-components';
import { MassEditControl } from 'linode-components';
import { ListHeader } from 'linode-components';
import { Table } from 'linode-components';
import { DropdownCell, CheckboxCell } from 'linode-components';

import toggleSelected from '~/actions/select';
import api from '~/api';
import { transform } from '~/api/util';
import { ChainedDocumentTitle } from '~/components';
import { TimeCell } from '~/components/tables/cells';
import { confirmThenDelete } from '~/utilities';

import TokenMoreInfo from '../components/TokenMoreInfo';
import EditPersonalAccessToken from '../components/EditPersonalAccessToken';
import CreatePersonalAccessToken from '../components/CreatePersonalAccessToken';


const OBJECT_TYPE = 'tokens';

export class APITokensPage extends Component {
  static async preload({ dispatch }) {
    await Promise.all([api.tokens, api.apps].map(c => dispatch(c.all())));
  }

  constructor(props) {
    super(props);

    this.state = { filter: '' };
  }

  createDropdownGroups = (token) => {
    const { dispatch } = this.props;

    const groups = [
      { elements: [{ name: 'More Info', action: () => TokenMoreInfo.trigger(dispatch, token) }] },
      { elements: [{ name: 'Revoke', action: () => this.revokeTokens(token) }] },
    ];

    if (!this.isApp(token)) {
      groups.splice(1, 0, {
        elements: [
          { name: 'Edit', action: () => EditPersonalAccessToken.trigger(dispatch, token) },
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
    'revoking').bind(this)

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

function select(state) {
  const tokens = {
    ...state.api.tokens.tokens,
    ...state.api.apps.apps,
  };

  return {
    tokens,
    selectedMap: state.select.selected[OBJECT_TYPE] || {},
  };
}

export default connect(select)(APITokensPage);
