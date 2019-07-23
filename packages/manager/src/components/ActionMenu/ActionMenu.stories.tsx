import { storiesOf } from '@storybook/react';
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
        }
      },
      {
        title: 'Action 1',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          closeMenu();
          e.preventDefault();
        }
      },
      {
        title: 'Action 3',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          closeMenu();
          e.preventDefault();
        }
      },
      {
        title: 'Last Action',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          closeMenu();
          e.preventDefault();
        }
      }
    ];
  };

  render() {
    return <ActionMenu createActions={this.createActions()} />;
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
        }
      },
      {
        title: 'Another Action',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          closeMenu();
          e.preventDefault();
        }
      },
      {
        title: 'Disabled Action',
        disabled: true,
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          closeMenu();
          e.preventDefault();
        },
        tooltip: 'An explanation as to why this item is disabled'
      }
    ];
  };

  render() {
    return <ActionMenu createActions={this.createActions()} />;
  }
}

class StoryActionMenuWithOneAction extends React.Component<CombinedProps> {
  createActions = () => (closeMenu: Function): Action[] => {
    return [
      {
        title: 'Single Action',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
        }
      }
    ];
  };
  render() {
    return <ActionMenu createActions={this.createActions()} />;
  }
}

storiesOf('Action Menu', module)
  .add('Action Menu', () => (
    <div style={{ float: 'left' }}>
      <StoryActionMenu />
    </div>
  ))
  .add('Action Menu with disabled menu item & tooltip', () => (
    <div style={{ float: 'left' }}>
      <StoryActionMenuWithTooltip />
    </div>
  ))
  .add('Action Menu with one menu item', () => (
    <div style={{ float: 'left' }}>
      <StoryActionMenuWithOneAction />
    </div>
  ));
