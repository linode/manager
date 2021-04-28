import * as React from 'react';
import ActionMenu, { Action } from './ActionMenu';

interface Props {
  style?: any;
}

type CombinedProps = Props;

class StoryActionMenu extends React.Component<CombinedProps> {
  createActions = () => (closeMenu: Function): Action[] => {
    return [
      {
        title: 'First Action',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          closeMenu();
          e.preventDefault();
        },
      },
      {
        title: 'Action 1',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          closeMenu();
          e.preventDefault();
        },
      },
      {
        title: 'Action 3',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          closeMenu();
          e.preventDefault();
        },
      },
      {
        title: 'Last Action',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          closeMenu();
          e.preventDefault();
        },
      },
    ];
  };

  render() {
    return <ActionMenu createActions={this.createActions()} ariaLabel="label" />;
  }
}

class StoryActionMenuWithTooltip extends React.Component<CombinedProps> {
  createActions = () => (closeMenu: Function): Action[] => {
    return [
      {
        title: 'First Action',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          closeMenu();
          e.preventDefault();
        },
      },
      {
        title: 'Another Action',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          closeMenu();
          e.preventDefault();
        },
      },
      {
        title: 'Disabled Action',
        disabled: true,
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          closeMenu();
          e.preventDefault();
        },
        tooltip: 'An explanation as to why this item is disabled',
      },
    ];
  };

  render() {
    return <ActionMenu createActions={this.createActions()} ariaLabel="label" />;
  }
}

class StoryActionMenuWithOneAction extends React.Component<CombinedProps> {
  createActions = () => (closeMenu: Function): Action[] => {
    return [
      {
        title: 'Single Action',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
        },
      },
    ];
  };
  render() {
    return <ActionMenu createActions={this.createActions()} ariaLabel="label" />;
  }
}

export default {
  title: 'Action Menu',
};

export const _ActionMenu = () => (
  <div style={{ float: 'left' }}>
    <StoryActionMenu />
  </div>
);

export const ActionMenuWithDisabledMenuItemTooltip = () => (
  <div style={{ float: 'left' }}>
    <StoryActionMenuWithTooltip />
  </div>
);

ActionMenuWithDisabledMenuItemTooltip.story = {
  name: 'Action Menu with disabled menu item & tooltip',
};

export const ActionMenuWithOneMenuItem = () => (
  <div style={{ float: 'left' }}>
    <StoryActionMenuWithOneAction />
  </div>
);

ActionMenuWithOneMenuItem.story = {
  name: 'Action Menu with one menu item',
};
