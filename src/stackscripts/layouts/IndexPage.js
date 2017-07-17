import _ from 'lodash';
import moment from 'moment';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

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

import { showModal, hideModal } from '~/actions/modal';
import { default as toggleSelected } from '~/actions/select';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { stackscripts } from '~/api';
import CreateHelper from '~/components/CreateHelper';

const OBJECT_TYPE = 'stackscripts';

export class IndexPage extends Component {
  static async preload({ dispatch }) {
    await dispatch(stackscripts.all());
  }

  constructor(props) {
    super(props);

  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));

    dispatch(setTitle('StackScripts'));
  }

 /* renderScripts(scripts) {
    const { dispatch } = this.props;

    return (
      <List>
        <ListBody>
          <Table
            columns={[
              { cellComponent: CheckboxCell, headerClassName: 'CheckboxColumn' },
              {
                cellComponent: LinkCell,
                hrefFn: (script) => `/stackscripts/${script.id}`, textKey: 'stackscript',
                tooltipEnabled: true,
              },
              { dataKey: 'type', formatFn: _.capitalize },
              {
                cellComponent: ButtonCell,
                headerClassName: 'ButtonColumn',
                text: 'Delete',
                onClick: (script) => {},
              },
            ]}
            data={group.data}
            selectedMap={selectedMap}
            disableHeader
            onToggleSelect={(record) => {
              dispatch(toggleSelected(OBJECT_TYPE, record.id));
            }}
          />
        </ListBody>
      </List>
    );
  }*/

  render() {
    console.log('ss',this.props.stackscripts);
    return (
      <div className="PrimaryPage container">
        <header className="PrimaryPage-header">
          <div className="PrimaryPage-headerRow clearfix">
            <h1 className="float-sm-left">StackScripts</h1>
            <Link to="/stackscripts/create" className="linode-add btn btn-primary float-sm-right">
              <span className="fa fa-plus"></span>
              Add a StackScript
            </Link>
          </div>
        </header>
      </div>
    );
  }
};

IndexPage.propTypes = {
  dispatch: PropTypes.func,
  stackscripts: PropTypes.object,
  selectedMap: PropTypes.object.isRequired,
};


function select(state) {
  console.log(state);
  return {
    stackscripts: state.api.stackscripts,
    selectedMap: state.select.selected[OBJECT_TYPE] || {},
  };
}

export default connect(select)(IndexPage);
