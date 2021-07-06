import * as React from 'react';
import ActionMenu, { Action } from './ActionMenu';

interface Props {
  style?: any;
}

type CombinedProps = Props;

class StoryActionMenu extends React.Component<CombinedProps> {
  actions: Action[] = [
    {
      title: 'First Action',
      onClick: () => null,
    },
    {
      title: 'Action 1',
      onClick: () => null,
    },
    {
      title: 'Action 3',
      onClick: () => null,
    },
    {
      title: 'Last Action',
      onClick: () => null,
    },
  ];

  render() {
    return <ActionMenu actionsList={this.actions} ariaLabel="label" />;
  }
}

class StoryActionMenuWithTooltip extends React.Component<CombinedProps> {
  actions: Action[] = [
    {
      title: 'First Action',
      onClick: () => null,
    },
    {
      title: 'Another Action',
      onClick: () => null,
    },
    {
      title: 'Disabled Action',
      disabled: true,
      onClick: () => null,
      tooltip: 'An explanation as to why this item is disabled',
    },
  ];

  render() {
    return <ActionMenu actionsList={this.actions} ariaLabel="label" />;
  }
}

class StoryActionMenuWithInlineLabel extends React.Component<CombinedProps> {
  actions: Action[] = [
    {
      title: 'Single Action',
      onClick: () => null,
    },
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

export default {
  title: 'CMR Action Menu',
};

export const _ActionMenu = () => (
  <div style={{ display: 'inline-block' }}>
    <StoryActionMenu />
  </div>
);

export const ActionMenuWithDisabledMenuItemTooltip = () => (
  <div style={{ display: 'inline-block' }}>
    <StoryActionMenuWithTooltip />
  </div>
);

ActionMenuWithDisabledMenuItemTooltip.story = {
  name: 'Action Menu with disabled menu item & tooltip',
};

export const ActionMenuWithInlineLabel = () => (
  <div style={{ display: 'inline-block' }}>
    <StoryActionMenuWithInlineLabel />
  </div>
);

ActionMenuWithInlineLabel.story = {
  name: 'Action Menu with inline label',
};
