import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { StaticRouter } from 'react-router-dom';

import SelectionRow, { SelectionRowProps } from 'src/components/SelectionRow';

import ThemeDecorator from '../../utilities/storybookDecorators';

interface State {
  selected: number;
}

class InteractiveExample extends React.Component<{}, State> {
  state: State = {
    selected: 0,
  };

  createItems = (): SelectionRowProps[] => [
    {
      checked: this.state.selected === 0,
      onSelect: () => this.setState({ selected: 0 }),
      label: 'Dont Stop Believing',
      description: `Just a small town girl, living in a lonely world
      She took the midnight train going anywhere
      Just a city boy, born and raised in South Detroit
      He took the midnight train going anywhere
      A singer in a smoky room
      A smell of wine and cheap perfume
      For a smile they can share the night
      It goes on and on and on and on`,
      images: ['Journey', 'Ubuntu'],
      deploymentsActive: 999,
      updated: '2013/09/13',
      stackScriptID: 1000,
      stackScriptUsername: 'mmckenna',
      canDelete: false,
      canEdit: false,
      isPublic: false,
    },
    {
      checked: this.state.selected === 1,
      onSelect: () => this.setState({ selected: 1 }),
      label: 'Every Rose Has Its Thorn',
      description: `We both lie silently still in the dead of the night
      Although we both lie close together we feel miles apart inside
      Was it something I said or something I did?
      Did my words not come out right?
      Though I tried not to hurt you
      Though I tried
      But I guess that's why they say`,
      images: [`Poison`, 'Slackware', 'Debian 8', 'Debian 7'],
      deploymentsActive: 999,
      updated: '2013/09/13',
      stackScriptID: 1001,
      stackScriptUsername: 'mmckenna',
      canDelete: false,
      canEdit: false,
      isPublic: false,
    },
    {
      checked: this.state.selected === 2,
      onSelect: () => this.setState({ selected: 2 }),
      label: 'The Final Countdown',
      description: `We're leaving together,
      But still it's farewell
      And maybe we'll come back
      To earth, who can tell?
      I guess there is no one to blame
      We're leaving ground (leaving ground)
      Will things ever be the same again?`,
      images: [`Europe`, 'CentOS'],
      deploymentsActive: 999,
      updated: '2013/09/13',
      stackScriptID: 1002,
      stackScriptUsername: 'mmckenna',
      canDelete: false,
      canEdit: false,
      isPublic: false,
    },
    {
      label: 'Livin\' on a Prayer',
      description: `Once upon a time not so long ago
      Tommy used to work on the docks, union's been on strike
      He's down on his luck, it's tough, so tough
      Gina works the diner all day working for her man
      She brings home her pay, for love, for love`,
      images: ['Bon Jovi', 'Ubuntu'],
      deploymentsActive: 999,
      updated: '2013/09/13',
      showDeployLink: true,
      stackScriptID: 1003,
      stackScriptUsername: 'mmckenna',
      canDelete: false,
      canEdit: false,
      isPublic: false,
    },
    {
      label: 'Sweet Child O\' Mine',
      description: `She's got a smile it seems to me
      Reminds me of childhood memories
      Where everything
      Was as fresh as the bright blue sky
      Now and then when I see her face
      She takes me away to that special place
      And if I'd stare too long
      I'd probably break down and cry`,
      images: [`Guns n' Roses`, 'Slackware', 'Debian 8', 'Debian 7'],
      deploymentsActive: 999,
      updated: '2013/09/13',
      showDeployLink: true,
      stackScriptID: 1004,
      stackScriptUsername: 'mmckenna',
      canDelete: false,
      canEdit: false,
      isPublic: false,
    },
    {
      label: 'Africa',
      description: `I hear the drums echoing tonight
      But she hears only whispers of some quiet conversation
      She's coming in, 12:30 flight
      The moonlit wings reflect the stars that guide me towards salvation
      I stopped an old man along the way
      Hoping to find some long forgotten words or ancient melodies
      He turned to me as if to say, "Hurry boy, it's waiting there for you"`,
      images: ['Toto', 'CentOS'],
      deploymentsActive: 999,
      updated: '2013/09/13',
      showDeployLink: true,
      stackScriptID: 1005,
      stackScriptUsername: 'mmckenna',
      canDelete: false,
      canEdit: false,
      isPublic: false,
    },
  ]

  render() {
    return (
      <StaticRouter>
        <React.Fragment>
          {
            this
              .createItems()
              .map((item, idx) => React.createElement(SelectionRow, { key: idx, ...item }))
          }
        </React.Fragment>
      </StaticRouter>
    );
  }
}

storiesOf('SelectionRow', module)
  .addDecorator(ThemeDecorator)
  .add('Interactive example', () => (<InteractiveExample />));
