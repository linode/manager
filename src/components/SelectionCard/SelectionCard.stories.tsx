import * as React from 'react';
import { storiesOf } from '@storybook/react';

import InsertPhoto from 'material-ui-icons/InsertPhoto';
import Alarm from 'material-ui-icons/Alarm';
import us from 'flag-icon-css/flags/4x3/us.svg';
import de from 'flag-icon-css/flags/4x3/de.svg';

import ThemeDecorator from '../../utilities/storybookDecorators';

import SelectionCard from './SelectionCard';
import Grid from 'material-ui/Grid';

storiesOf('SelectionCard', module)
.addDecorator(ThemeDecorator)
.add('Default with SvgIcon', () => (
  <React.Fragment>
    <Grid container wrap="wrap">
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
      <SelectionCard
        renderIcon={() => {
          return <Alarm />;
        }}
        heading="Alarm"
        subheadings={[
          'Set an alarm',
          'Choose the time and alarm sound',
        ]}
      />
    </Grid>
  </React.Fragment>
))
.add('Default with img', () => (
  <React.Fragment>
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
    <br /><br />
    <SelectionCard
      renderIcon={() => {
        return <img src={de} />;
      }}
      heading="Germany"
      subheadings={[
        'Germany',
        'Willkommen in Deutschland!',
      ]}
    />
  </React.Fragment>
))
.add('Default with font Icon', () => (
  <React.Fragment>
    <SelectionCard
      renderIcon={() => {
        return <span className="fl-archlinux"/>;
      }}
      heading="Arch Linix"
      subheadings={[
        'Almost as difficult to use as Gentoo!',
      ]}
    />
    <br /><br />
    <SelectionCard
      renderIcon={() => {
        return <span className="fl-devuan"/>;
      }}
      heading="Devuan Linix"
      subheadings={[
        'It\'s Debian with a sane init system!',
      ]}
    />
  </React.Fragment>
))
.add('Checked with SvgIcon', () => (
  <React.Fragment>
    <SelectionCard
      checked
      renderIcon={() => {
        return <InsertPhoto />;
      }}
      heading="Photos"
      subheadings={[
        'Use a photo',
        'Select up to 3',
      ]}
    />
    <br /><br />
    <SelectionCard
      checked
      renderIcon={() => {
        return <Alarm />;
      }}
      heading="Alarm"
      subheadings={[
        'Set an alarm',
        'Choose the time and alarm sound',
      ]}
    />
  </React.Fragment>
))
.add('Checked with img', () => (
  <React.Fragment>
    <SelectionCard
      checked
      renderIcon={() => {
        return <img src={us} />;
      }}
      heading="United States"
      subheadings={[
        'The United States of America',
        '\'Mericaaaaa, oh yeah!',
      ]}
    />
    <br /><br />
    <SelectionCard
      checked
      renderIcon={() => {
        return <img src={de} />;
      }}
      heading="Germany"
      subheadings={[
        'Germany',
        'Willkommen in Deutschland!',
      ]}
    />
  </React.Fragment>
))
.add('Checked with font Icon', () => (
  <React.Fragment>
    <SelectionCard
      checked
      renderIcon={() => {
        return <span className="fl-archlinux"/>;
      }}
      heading="Arch Linix"
      subheadings={[
        'Almost as difficult to use as Gentoo!',
      ]}
    />
    <br /><br />
    <SelectionCard
      checked
      renderIcon={() => {
        return <span className="fl-devuan"/>;
      }}
      heading="Devuan Linix"
      subheadings={[
        'It\'s Debian with a sane init system!',
      ]}
    />
  </React.Fragment>
))
;
