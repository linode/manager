import React, { Component, PropTypes } from 'react';

import { PrimaryButton } from 'linode-components/buttons';
import { Card, CardHeader } from 'linode-components/cards';
import { Input } from 'linode-components/forms';
import { List } from 'linode-components/lists';
import { ListBody } from 'linode-components/lists/bodies';
import { MassEditControl } from 'linode-components/lists/controls';
import { ListHeader } from 'linode-components/lists/headers';
import { Table } from 'linode-components/tables';
import { ButtonCell, CheckboxCell, LinkCell } from 'linode-components/tables/cells';

import { default as toggleSelected } from '~/actions/select';
import { linodes } from '~/api';
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
    (id) => linodes.configs.delete(this.props.linode.id, id),
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
                massEditGroups={[{ elements: [
                    { name: 'Delete', action: this.deleteConfigs },
                ] }]}
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
                  onClick: (config) => { this.deleteConfigs(linode, [config]); },
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
