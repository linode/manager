import * as React from 'react';
import Chat from 'src/assets/icons/chat.svg';
import Tile from './Tile';

export default {
  title: 'Components/Tile',
};

export const Internal = () => (
  <div>
    <Tile
      icon={<Chat />}
      title="This is the Tile title"
      description="In order to make the tile a link, the link prop needs to be set.
        It can be either an internal or external link, or an onClick function"
      link="http://cloud.linode.com"
    />
  </div>
);

Internal.story = {
  name: 'Tile',
};
