import _ from 'lodash';
import moment from 'moment';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Button } from 'linode-components/buttons';
import { Input } from 'linode-components/forms';
import { List } from 'linode-components/lists';
import { ListBody, ListGroup } from 'linode-components/lists/bodies';
import { MassEditControl } from 'linode-components/lists/controls';
import { ListHeader } from 'linode-components/lists/headers';
import { DeleteModalBody } from 'linode-components/modals';
import { Table } from 'linode-components/tables';
import { DropdownCell, CheckboxCell } from 'linode-components/tables/cells';
import { EmitEvent } from 'linode-components/utils';

import { showModal, hideModal } from '~/actions/modal';
import toggleSelected from '~/actions/select';
import { tokens as api } from '~/api';
import { TimeCell } from '~/components/tables/cells';

import TokenMoreInfo from '../components/TokenMoreInfo';
import EditPersonalAccessToken from '../components/EditPersonalAccessToken';
import CreatePersonalAccessToken from '../components/CreatePersonalAccessToken';


const OBJECT_TYPE = 'tokens';

export class APITokensPage extends Component {
  static async preload({ dispatch }) {
    await dispatch(api.all());
  }

  constructor() {
    super();

    this.state = { filter: '' };
  }

  createDropdownGroups = (token) => {
    const { dispatch } = this.props;

    const groups = [
      { elements: [{ name: 'More Info', action: () => TokenMoreInfo.trigger(dispatch, token) }] },
      { elements: [{ name: 'Revoke', action: () => this.revokeTokens(token) }] },
    ];

    if (!token.client) {
      groups.splice(1, 0, {
        elements: [{ name: 'Edit', action: () => EditPersonalAccessToken.trigger(dispatch, token) }],
      });
    }

    return groups;
  }

  revokeTokens = (tokens) => {
    const { dispatch } = this.props;
    const tokensArr = Array.isArray(tokens) ? tokens : [tokens];
    const title = 'Revoke Token(s)';

    dispatch(showModal(title,
      <DeleteModalBody
        onOk={async () => {
          const ids = tokensArr.map(function (token) { return token.id; });

          await Promise.all(ids.map(id => dispatch(api.delete(id))));
          dispatch(toggleSelected(OBJECT_TYPE, ids));
          EmitEvent('modal:submit', 'Modal', 'delete', title);
          dispatch(hideModal());
        }}
        onCancel={() => {
          EmitEvent('modal:cancel', 'Modal', 'cancel', title);
          dispatch(hideModal());
        }}
        items={tokensArr.map(n => n.label)}
        typeOfItem="Tokens"
        deleteAction="revoke"
        deleteActionPending="revoking"
      />
    ));
  }

  tokenLabel(token) {
    return token.client ? token.client.label : token.label;
  }

  renderTokens = () => {
    const { dispatch, selectedMap, tokens: { tokens } } = this.props;
    const { filter } = this.state;

    const filteredTokens = filter.length ? _.pickBy(tokens, t =>
      this.tokenLabel(t).toLowerCase().indexOf(filter.toLowerCase()) !== -1) : tokens;
    const sortedTokens = _.sortBy(Object.values(filteredTokens), ({ created }) => moment(created));
    const groups = _.sortBy(
      _.map(_.groupBy(sortedTokens, d => d.client ? d.client.label : 'Personal Access Tokens'),
            (_tokens, _group) => {
              return {
                name: _group,
                data: _tokens,
              };
            }), tokenGroup => tokenGroup.name);

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
                    dataFn: this.tokenLabel,
                    tooltipEnabled: true,
                    label: 'Label',
                  },
                  {
                    dataFn: t => t.client ? 'OAuth Client Token' : 'Personal Access Token',
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
        <header className="NavigationHeader clearfix">
          <Button
            onClick={() => CreatePersonalAccessToken.trigger(dispatch)}
            className="float-sm-right"
          >Create a Personal Access Token</Button>
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
  return {
    tokens: state.api.tokens,
    selectedMap: state.select.selected[OBJECT_TYPE] || {},
  };
}

export default connect(select)(APITokensPage);
