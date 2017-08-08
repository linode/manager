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


export default class Configs extends Component {
  deleteConfig(linode, config) {
    const { dispatch } = this.props;

    dispatch(showModal('Delete Config',
      <DeleteModalBody
        onSubmit={async () => {
          await dispatch(linodes.configs.delete(linode.id, config.id));
          dispatch(hideModal());
        }}
        items={[config.label]}
        typeOfItem="Configs"
        onCancel={() => dispatch(hideModal())}
      />
    ));
  }

  render() {
    const { linode } = this.props;
    const configs = Object.values(linode._configs.configs);

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

    return (
      <Card header={header}>
        <Table
          className="Table--secondary"
          columns={[
            {
              cellComponent: LinkCell,
              hrefFn: (config) => {
                return `/linodes/${linode.label}/settings/advanced/configs/${config.id}`;
              },
              label: 'Label',
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
      </Card>
    );
  }
}

Configs.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linode: PropTypes.object.isRequired,
};
