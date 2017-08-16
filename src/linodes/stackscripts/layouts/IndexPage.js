import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { PrimaryButton } from 'linode-components/buttons';
import { Input } from 'linode-components/forms';
import { List } from 'linode-components/lists';
import { Table } from 'linode-components/tables';
import { MassEditControl } from 'linode-components/lists/controls';
import { ListHeader } from 'linode-components/lists/headers';
import { ListBody, ListGroup } from 'linode-components/lists/bodies';
import { DeleteModalBody } from 'linode-components/modals';
import {
  ButtonCell,
  CheckboxCell,
  LinkCell,
} from 'linode-components/tables/cells';

import { setAnalytics, setSource, setTitle } from '~/actions';
import { showModal, hideModal } from '~/actions/modal';
import { default as toggleSelected } from '~/actions/select';
import { stackscripts } from '~/api';
import { createHeaderFilter, transform } from '~/api/util';
import CreateHelper from '~/components/CreateHelper';

import AddStackScript from '../components/AddStackScript';


const OBJECT_TYPE = 'stackscripts';

export class IndexPage extends Component {
  static async preload({ dispatch }) {
    await dispatch(stackscripts.all([], null, createHeaderFilter({ mine: true })));
  }

  constructor(props) {
    super(props);

    this.state = { filter: '' };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    dispatch(setAnalytics(['stackscripts']));
    dispatch(setTitle('StackScripts'));
  }

  deleteScripts = (scriptsToDelete) => {
    const { dispatch } = this.props;
    const scriptsArr = Array.isArray(scriptsToDelete) ? scriptsToDelete : [scriptsToDelete];

    const selectedStackScripts = scriptsArr.map(l => l.label);

    dispatch(showModal('Delete StackScript(s)', (
      <DeleteModalBody
        onSubmit={async () => {
          const ids = scriptsArr.map(function (script) { return script.id; });

          await Promise.all(ids.map(id => dispatch(stackscripts.delete(id))));
          dispatch(toggleSelected(OBJECT_TYPE, ids));
          dispatch(hideModal());
        }}
        items={selectedStackScripts}
        typeOfItem="StackScripts"
        onCancel={() => dispatch(hideModal())}
      />
    )));
  }

  renderScripts(scripts) {
    const { dispatch, selectedMap } = this.props;
    const { filter } = this.state;

    const { groups, sorted: sortedScripts } = transform(Object.values(scripts).map(script => {
      const returnedScript = {
        ...script,
        privacy: script.is_public ? 'Public' : 'Private',
      };
      return returnedScript;
    }), {
      groupOn: 'privacy',
      filterBy: filter,
    });

    return (
      <List>
        <ListHeader className="Menu">
          <div className="Menu-item">
            <MassEditControl
              data={sortedScripts}
              dispatch={dispatch}
              massEditGroups={[{ elements: [
                { name: 'Delete', action: this.deleteScripts },
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
                      hrefFn: (script) => `/stackscripts/${script.id}`, textKey: 'label',
                      tooltipEnabled: true,
                    },
                    { dataKey: 'is_public', formatFn: (isPublic) => {
                      return isPublic ? 'Public' : 'Private';
                    } },
                    { dataFn: (stackscript) => {
                      const { deployments_active: active, deployments_total: total } = stackscript;
                      return `${active} active / ${total} total deploys`;
                    } },
                    {
                      cellComponent: ButtonCell,
                      headerClassName: 'ButtonColumn',
                      text: 'Delete',
                      onClick: (script) => { this.deleteScripts(script); },
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
    const { dispatch } = this.props;

    return (
      <div className="PrimaryPage container">
        <header className="PrimaryPage-header">
          <div className="PrimaryPage-headerRow clearfix">
            <h1 className="float-sm-left">StackScripts</h1>
            <PrimaryButton
              className="float-sm-right"
              onClick={() => AddStackScript.trigger(dispatch)}
            >
              Add a StackScript
            </PrimaryButton>
          </div>
        </header>
        <div className="PrimaryPage-body">
          {Object.keys(this.props.stackscripts.stackscripts).length ?
            this.renderScripts(this.props.stackscripts.stackscripts) :
            <CreateHelper
              label="StackStripts"
              onClick={() => AddStackScript.trigger(dispatch)}
              linkText="Add a StackScript"
            />
          }
        </div>
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func,
  stackscripts: PropTypes.object,
  selectedMap: PropTypes.object.isRequired,
};


function select(state) {
  return {
    stackscripts: state.api.stackscripts,
    selectedMap: state.select.selected[OBJECT_TYPE] || {},
  };
}

export default connect(select)(IndexPage);
