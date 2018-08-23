import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';

import ThemeDecorator from '../../utilities/storybookDecorators';
import Tile from './Tile';

import Chat from 'src/assets/icons/chat.svg'; 

storiesOf('Tile', module)
  .addDecorator(ThemeDecorator)
  .add('internal', () => (
    <div>
      <Tile
        icon={<Chat />}
        title="This is the Tile title"
        description="In order to make the tile a link, the link prop needs to be set. 
        It can be either an internal or external link, or an onClick function"
        link="http://cloud.manager.com"
      />
    </div>
  ));
