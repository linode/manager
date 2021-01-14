import { storiesOf } from '@storybook/react';
import * as React from 'react';
import ActionMenu, { Action } from './ActionMenu_CMR';

interface Props {
  style?: any;
}

type CombinedProps = Props;

class StoryActionMenu extends React.Component<CombinedProps> {
  actions: Action[] = [
    {
      title: 'First Action',
      onClick: () => null
    },
    {
      title: 'Action 1',
      onClick: () => null
    },
    {
      title: 'Action 3',
      onClick: () => null
    },
    {
      title: 'Last Action',
      onClick: () => null
    }
  ];

  render() {
    return <ActionMenu actionsList={this.actions} ariaLabel="label" />;
  }
}

class StoryActionMenuWithTooltip extends React.Component<CombinedProps> {
  actions: Action[] = [
    {
      title: 'First Action',
      onClick: () => null
    },
    {
      title: 'Another Action',
      onClick: () => null
    },
    {
      title: 'Disabled Action',
      disabled: true,
      onClick: () => null,
      tooltip: 'An explanation as to why this item is disabled'
    }
  ];

  render() {
    return <ActionMenu actionsList={this.actions} ariaLabel="label" />;
  }
}

class StoryActionMenuWithInlineLabel extends React.Component<CombinedProps> {
  actions: Action[] = [
    {
      title: 'Single Action',
      onClick: () => null
    }
  ];

  render() {
    return (
      <ActionMenu
        actionsList={this.actions}
        ariaLabel="label"
        inlineLabel="More Actions"
      />
    );
  }
}

storiesOf('CMR Action Menu', module)
  .add('Action Menu', () => (
    <div style={{ display: 'inline-block' }}>
      <StoryActionMenu />
    </div>
  ))
  .add('Action Menu with disabled menu item & tooltip', () => (
    <div style={{ display: 'inline-block' }}>
      <StoryActionMenuWithTooltip />
    </div>
  ))
  .add('Action Menu with inline label', () => (
    <div style={{ display: 'inline-block' }}>
      <StoryActionMenuWithInlineLabel />
    </div>
  ));
