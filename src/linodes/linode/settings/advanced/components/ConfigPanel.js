import React, { Component, PropTypes } from 'react';

import { DeleteModalBody } from 'linode-components/modals';
import { linodes } from '~/api';
import { showModal, hideModal } from '~/actions/modal';
import { PrimaryButton } from 'linode-components/buttons';
import { Card, CardHeader } from 'linode-components/cards';
import { Table } from 'linode-components/tables';
import {
  LinkCell,
  ButtonCell,
} from 'linode-components/tables/cells';


export class ConfigPanel extends Component {
  deleteConfig(linode, config) {
    const { dispatch } = this.props;

    dispatch(showModal('Delete Config',
      <DeleteModalBody
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
            cellComponent: ButtonCell,
            headerClassName: 'ButtonColumn',
            onClick: (config) => { this.deleteConfig(linode, config); },
            text: 'Delete',
          },
        ]}
        data={configs}
        noDataMessage="You have no configs."
      />
    );
  }

  render() {
    const { linode } = this.props;
    const configs = Object.values(linode._configs.configs);

    const content = this.renderConfigContent(linode, configs);

    const nav = (
      <PrimaryButton
        to={`/linodes/${linode.label}/settings/advanced/configs/create`}
        className="float-sm-right"
        buttonClass="btn-default"
      >
        Add a config
      </PrimaryButton>
    );

    const header = <CardHeader title="Configs" nav={nav} />;

    return <Card header={header}>{content}</Card>;
  }
}

ConfigPanel.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linode: PropTypes.object.isRequired,
};
