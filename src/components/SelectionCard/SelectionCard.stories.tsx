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
    <Grid container wrap="wrap" className="m0">
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
    <Grid container wrap="wrap" className="m0">
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
    </Grid>
  </React.Fragment>
))
.add('Default with font Icon', () => (
  <React.Fragment>
    <Grid container wrap="wrap" className="m0">
      <SelectionCard
        renderIcon={() => {
          return <span className="fl-archlinux"/>;
        }}
        heading="Arch Linix"
        subheadings={[
          'Almost as difficult to use as Gentoo!',
        ]}
      />
      <SelectionCard
        renderIcon={() => {
          return <span className="fl-devuan"/>;
        }}
        heading="Devuan Linix"
        subheadings={[
          'It\'s Debian with a sane init system!',
        ]}
      />
      <SelectionCard
        renderIcon={() => {
          return <span className="fl-coreos"/>;
        }}
        heading="CoreOs"
        subheadings={[
          'Container Linux',
        ]}
      />
    </Grid>
  </React.Fragment>
))
.add('Default with no Icon', () => (
  <React.Fragment>
    <Grid container wrap="wrap" className="m0">
      <SelectionCard
        heading="Linode 1GB"
        subheadings={[
          '$5/mo ($0.0075/hr)',
          '1 CPU, 20G Storage, 1G Ram',
        ]}
      />
      <SelectionCard
        heading="Linode 8GB"
        subheadings={[
          '$40/mo ($0.06/hr)',
          '4 CPU, 96G Storage, 8G Ram',
        ]}
      />
      <SelectionCard
        heading="Linode 64GB"
        subheadings={[
          '$640/mo ($0.96/hr)',
          '20 CPU, 1536G Storage, 80G Ram',
        ]}
      />
    </Grid>
  </React.Fragment>
))
.add('Checked with SvgIcon', () => (
  <React.Fragment>
    <Grid container wrap="wrap" className="m0">
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
    </Grid>
  </React.Fragment>
))
.add('Checked with img', () => (
  <React.Fragment>
    <Grid container wrap="wrap" className="m0">
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
    </Grid>
  </React.Fragment>
))
.add('Checked with font Icon', () => (
  <React.Fragment>
    <Grid container wrap="wrap" className="m0">
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
    </Grid>
  </React.Fragment>
))
.add('Checked with no Icon', () => (
  <React.Fragment>
    <Grid container wrap="wrap" className="m0">
      <SelectionCard
        checked
        heading="Linode 1GB"
        subheadings={[
          '$5/mo ($0.0075/hr)',
          '1 CPU, 20G Storage, 1G Ram',
        ]}
      />
      <SelectionCard
        checked
        heading="Linode 8GB"
        subheadings={[
          '$40/mo ($0.06/hr)',
          '4 CPU, 96G Storage, 8G Ram',
        ]}
      />
      <SelectionCard
        checked
        heading="Linode 64GB"
        subheadings={[
          '$640/mo ($0.96/hr)',
          '20 CPU, 1536G Storage, 80G Ram',
        ]}
      />
    </Grid>
  </React.Fragment>
))
;
