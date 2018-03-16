import * as React from 'react';
import { storiesOf } from '@storybook/react';

import InsertPhoto from 'material-ui-icons/InsertPhoto';
import us from 'flag-icon-css/flags/4x3/us.svg';

import ThemeDecorator from '../../utilities/storybookDecorators';

import SelectionCard from './SelectionCard';

storiesOf('SelectionCard', module)
.addDecorator(ThemeDecorator)
.add('Default with SvgIcon', () => (
  <SelectionCard
    renderIcon={() => {
      return <InsertPhoto />;
    }}
    heading="Photos"
    subheadings={[
      'Use a photo',
      'Select up to 3',
    ]}
  />
))
.add('Default with img', () => (
  <SelectionCard
    renderIcon={() => {
      return <img src={us} />;
    }}
    heading="United States"
    subheadings={[
      'The United States of America',
      '\'Mericaaaaa, oh yeah!',
    ]}
  />
))
.add('Default with font Icon', () => (
  <SelectionCard
    renderIcon={() => {
      return <span className="fl-archlinux"/>;
    }}
    heading="Arch Linix"
    subheadings={[
      'Almost as difficult to use as Gentoo!',
    ]}
  />
))
;
