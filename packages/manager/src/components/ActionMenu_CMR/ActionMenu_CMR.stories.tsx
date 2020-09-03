import { storiesOf } from '@storybook/react';
import * as React from 'react';
import ActionMenu, { Action } from './ActionMenu_CMR';

interface Props {
  style?: any;
}

type CombinedProps = Props;

class StoryActionMenu extends React.Component<CombinedProps> {
  createActions = () => (): Action[] => {
    return [
      {
        title: 'First Action',
        onClick: jest.fn()
      },
      {
        title: 'Action 1',
        onClick: jest.fn()
      },
      {
        title: 'Action 3',
        onClick: jest.fn()
      },
      {
        title: 'Last Action',
        onClick: jest.fn()
      }
    ];
  };

  render() {
    return (
      <ActionMenu createActions={this.createActions()} ariaLabel="label" />
    );
  }
}

class StoryActionMenuWithTooltip extends React.Component<CombinedProps> {
  createActions = () => (): Action[] => {
    return [
      {
        title: 'First Action',
        onClick: jest.fn()
      },
      {
        title: 'Another Action',
        onClick: jest.fn()
      },
      {
        title: 'Disabled Action',
        disabled: true,
        onClick: jest.fn(),
        tooltip: 'An explanation as to why this item is disabled'
      }
    ];
  };

  render() {
    return (
      <ActionMenu createActions={this.createActions()} ariaLabel="label" />
    );
  }
}

class StoryActionMenuWithInlineLabel extends React.Component<CombinedProps> {
  createActions = () => (): Action[] => {
    return [
      {
        title: 'Single Action',
        onClick: jest.fn()
      }
    ];
  };
  render() {
    return (
      <ActionMenu
        createActions={this.createActions()}
        ariaLabel="label"
        inlineLabel="More Actions"
      />
    );
  }
}

storiesOf('CMR Action Menu', module)
  .add('Action Menu', () => (
    <div style={{ textAlign: 'center' }}>
      <StoryActionMenu />
    </div>
  ))
  .add('Action Menu with disabled menu item & tooltip', () => (
    <div style={{ textAlign: 'center' }}>
      <StoryActionMenuWithTooltip />
    </div>
  ))
  .add('Action Menu with inline label', () => (
    <div style={{ textAlign: 'center' }}>
      <StoryActionMenuWithInlineLabel />
    </div>
  ));
