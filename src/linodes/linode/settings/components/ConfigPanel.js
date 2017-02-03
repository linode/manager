import React, { Component, PropTypes } from 'react';
import HelpButton from '~/components/HelpButton';
import { Link } from 'react-router';
import { getLinode } from '~/linodes/linode/layouts/IndexPage';
import { ConfirmModalBody } from '~/components/modals';
import { linodes } from '~/api';
import { showModal, hideModal } from '~/actions/modal';
import { Button } from '~/components/buttons';

function configContent(linode, configs, dispatch) {
  if (!linode && linode._configs.totalPages === -1) {
    return null;
  }

  if (configs.length === 0) {
    return (
      <p>No configs yet. Add a config.</p>
    );
  }

  return (
    <table className="ConfigPanel-configs">
      <tbody>
        {configs.map(config =>
          <tr key={config.id}>
            <td>
              <Link
                to={`/linodes/${linode.label}/settings/advanced/configs/${config.id}`}
              >
                {config.label}
              </Link>
            </td>
            {configs.length > 1 ? <td className="text-xs-right">
              <Button
                className="LinodesLinodeSettingsComponentsConfigPanel-delete"
                onClick={e => {
                  e.preventDefault();
                  dispatch(showModal('Confirm deletion',
                    <ConfirmModalBody
                      buttonText="Delete config"
                      onOk={async () => {
                        await dispatch(linodes.configs.delete(linode.id, config.id));
                        dispatch(hideModal());
                      }}
                      onCancel={() => dispatch(hideModal())}
                    >
                      Are you sure you want to delete this config?
                      This operation cannot be undone.
                    </ConfirmModalBody>
                  ));
                }}
              >Delete</Button></td> : null}
          </tr>
        )}
      </tbody>
    </table>
  );
}

export class ConfigPanel extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
  }

  render() {
    const linode = this.getLinode();
    const configs = Object.values(linode._configs.configs);
    const { dispatch } = this.props;

    const content = configContent(linode, configs, dispatch);

    return (
      <section className="card">
        <header className="clearfix">
          <h2 className="float-xs-left">Configs<HelpButton to="http://example.org" /></h2>
          <Button
            to={`/linodes/${linode.label}/settings/advanced/configs/create`}
            className="float-xs-right"
          >
            Add a config
          </Button>
        </header>
        {content}
      </section>
    );
  }
}

ConfigPanel.propTypes = {
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.shape({
    linodeLabel: PropTypes.string,
  }),
};
