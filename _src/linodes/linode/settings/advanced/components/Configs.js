import PropTypes from 'prop-types';
import React, { Component } from 'react';
import PrimaryButton from 'linode-components/dist/buttons/PrimaryButton';
import Card from 'linode-components/dist/cards/Card';
import CardHeader from 'linode-components/dist/cards/CardHeader';
import Input from 'linode-components/dist/forms/Input';
import List from 'linode-components/dist/lists/List';
import ListBody from 'linode-components/dist/lists/bodies/ListBody';
import MassEditControl from 'linode-components/dist/lists/controls/MassEditControl';
import ListHeader from 'linode-components/dist/lists/headers/ListHeader';
import Table from 'linode-components/dist/tables/Table';
import ButtonCell from 'linode-components/dist/tables/cells/ButtonCell';
import CheckboxCell from 'linode-components/dist/tables/cells/CheckboxCell';
import LinkCell from 'linode-components/dist/tables/cells/LinkCell';

import { default as toggleSelected } from '~/actions/select';
import api from '~/api';
import { transform } from '~/api/util';
import { confirmThenDelete } from '~/utilities';


export default class Configs extends Component {
  static OBJECT_TYPE = 'linode-configs'

  constructor(props) {
    super(props);

    this.state = { filter: '' };
  }

  deleteConfigs = confirmThenDelete(
    this.props.dispatch,
    'config',
    (id) => api.linodes.configs.delete(this.props.linode.id, id),
    Configs.OBJECT_TYPE).bind(this)

  render() {
    const { dispatch, linode, selectedMap } = this.props;
    const { filter } = this.state;
    const configs = Object.values(linode._configs.configs);
    const { sorted } = transform(configs, {
      filterBy: filter,
    });

    const nav = (
      <PrimaryButton
        to={`/linodes/${linode.label}/settings/advanced/configs/create`}
        className="float-right"
        buttonClass="btn-default"
      >
        Add a Config
      </PrimaryButton>
    );

    const header = <CardHeader title="Configs" nav={nav} />;

    return (
      <Card header={header}>
        <List>
          <ListHeader className="Menu">
            <div className="Menu-item">
              <MassEditControl
                data={sorted}
                dispatch={dispatch}
                massEditGroups={[{
                  elements: [
                    { name: 'Delete', action: this.deleteConfigs },
                  ],
                }]}
                selectedMap={selectedMap}
                objectType={Configs.OBJECT_TYPE}
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
            <Table
              className="Table--secondary"
              columns={[
                { cellComponent: CheckboxCell, headerClassName: 'CheckboxColumn' },
                {
                  cellComponent: LinkCell,
                  hrefFn: (config) => {
                    return `/linodes/${linode.label}/settings/advanced/configs/${config.id}`;
                  },
                  label: 'Label',
                  titleKey: 'label',
                  tooltipEnabled: true,
                },
                {
                  cellComponent: ButtonCell,
                  headerClassName: 'ButtonColumn',
                  onClick: (config) => { this.deleteConfigs(config); },
                  text: 'Delete',
                },
              ]}
              data={sorted}
              noDataMessage="You have no configs."
              selectedMap={selectedMap}
              onToggleSelect={(record) => {
                dispatch(toggleSelected(Configs.OBJECT_TYPE, record.id));
              }}
            />
          </ListBody>
        </List>
      </Card>
    );
  }
}

Configs.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linode: PropTypes.object.isRequired,
  selectedMap: PropTypes.object.isRequired,
};
