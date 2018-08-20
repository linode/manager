import * as React from 'react';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  onRemove: (domain: string, id: number) => void;
  onClone: (domain: string, id: number) => void;
  domainID: number,
  domain: string,
}

type CombinedProps = Props;

class LinodeActionMenu extends React.Component<CombinedProps> {
  createActions = () => (closeMenu: Function): Action[] => {
    const { onRemove, onClone, domainID, domain } = this.props;

    return [
      {
        title: 'Edit DNS Records',
        linkTo: `/domains/${domainID}`
      },
      {
        title: 'Check Zone',
        disabled: true,
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          closeMenu();
          e.preventDefault();
        },
      },
      {
        title: 'Zone File',
        disabled: true,
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          closeMenu();
          e.preventDefault();
        },
      },
      {
        title: 'Clone',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          onClone(domain, domainID);
          closeMenu();
          e.preventDefault();
        },
      },
      {
        title: 'Remove',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          onRemove(domain, domainID);
          closeMenu();
          e.preventDefault();
        },
      },
    ];
  }

  render() {
    return (<ActionMenu createActions={this.createActions()} />);
  }
}

export default LinodeActionMenu;
