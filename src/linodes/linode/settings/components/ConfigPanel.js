import React, { Component, PropTypes } from 'react';

import { getLinode } from '~/linodes/linode/layouts/IndexPage';
import DeleteModalBody from '~/components/modals/DeleteModalBody';
import { linodes } from '~/api';
import { showModal, hideModal } from '~/actions/modal';
import { Button } from '~/components/buttons';
import { Card, CardHeader } from '~/components/cards';
import { Table } from '~/components/tables';
import {
  LinkCell,
  ButtonCell,
} from '~/components/tables/cells';


export class ConfigPanel extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
  }

  deleteConfig(linode, config) {
    const { dispatch } = this.props;

    dispatch(showModal('Confirm deletion',
      <DeleteModalBody
        buttonText="Delete config"
        onOk={async () => {
          await dispatch(linodes.configs.delete(linode.id, config.id));
          dispatch(hideModal());
        }}
        items={[config.label]}
        typeOfItem="Configs"
        onCancel={() => dispatch(hideModal())}
      />
    ));
  }

  renderConfigContent(linode, configs) {
    if (!linode && linode._configs.totalPages === -1) {
      return null;
    }

    if (configs.length === 0) {
      return (
        <p>No configs yet. Add a config.</p>
      );
    }

    return (
      <Table
        className="ConfigPanel-config Table--secondary"
        columns={[
          {
            cellComponent: LinkCell,
            hrefFn: (config) => {
              return `/linodes/${linode.label}/settings/advanced/configs/${config.id}`;
            },
          },
          {
            buttonClassName: 'ConfigPanel-delete',
            cellComponent: ButtonCell,
            onClick: (config) => { this.deleteConfig(linode, config); },
            text: 'Delete',
          },
        ]}
        data={configs}
      />
    );
  }

  render() {
    const linode = this.getLinode();
    const configs = Object.values(linode._configs.configs);

    const content = this.renderConfigContent(linode, configs);

    const nav = (
      <Button
        to={`/linodes/${linode.label}/settings/advanced/configs/create`}
        className="float-sm-right"
      >
        Add a config
      </Button>
    );

    return (
      <Card
        header={
          <CardHeader
            title="Configs"
            navLink="https://example.org"
            nav={nav}
          />
        }
      >
        {content}
      </Card>
    );
  }
}

ConfigPanel.propTypes = {
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.shape({
    linodeLabel: PropTypes.string,
  }),
};
