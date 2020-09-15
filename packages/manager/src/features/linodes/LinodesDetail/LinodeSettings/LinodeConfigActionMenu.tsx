import { Config } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  onEdit: (config: Config) => void;
  onDelete: (id: number, label: string) => void;
  onBoot: (linodeId: number, configId: number, label: string) => void;
  config: Config;
  linodeId: number;
  readOnly?: boolean;
  label: string;
}

type CombinedProps = Props & RouteComponentProps<{}>;

class ConfigActionMenu extends React.Component<CombinedProps> {
  handleEdit = () => {
    const { config, onEdit } = this.props;
    onEdit(config);
  };

  handleDelete = () => {
    const {
      config: { id, label },
      onDelete
    } = this.props;
    onDelete(id, label);
  };

  handleBoot = () => {
    const {
      config: { id, label },
      linodeId,
      onBoot
    } = this.props;
    onBoot(linodeId, id, label);
  };

  createConfigActions = () => (closeMenu: Function): Action[] => {
    const { readOnly, history, linodeId, config } = this.props;
    const tooltip = readOnly
      ? "You don't have permission to perform this action"
      : undefined;
    return [
      {
        title: 'Boot This Config',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
          this.handleBoot();
          closeMenu();
        },
        disabled: readOnly,
        tooltip
      },
      {
        title: 'Edit',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
          this.handleEdit();
          closeMenu();
        },
        disabled: readOnly,
        tooltip
      },
      {
        title: 'Clone',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
          closeMenu();
          history.push(
            `/linodes/${linodeId}/clone/configs?selectedConfig=${config.id}`
          );
        },
        disabled: readOnly
      },
      {
        title: 'Delete',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
          this.handleDelete();
          closeMenu();
        },
        disabled: readOnly,
        tooltip
      }
    ];
  };

  render() {
    return (
      <ActionMenu
        createActions={this.createConfigActions()}
        ariaLabel={`Action menu for Linode Config ${this.props.label}`}
      />
    );
  }
}

export default withRouter(ConfigActionMenu);
