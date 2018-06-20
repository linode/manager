import * as React from 'react';
import { storiesOf } from '@storybook/react';

import InsertPhoto from '@material-ui/icons/InsertPhoto';
import Alarm from '@material-ui/icons/Alarm';
import US from 'flag-icon-css/flags/4x3/us.svg';
import DE from 'flag-icon-css/flags/4x3/de.svg';
import FR from 'flag-icon-css/flags/4x3/fr.svg';

import ThemeDecorator from '../../utilities/storybookDecorators';

import SelectionCard, { Props as CardProps } from './SelectionCard';
import Grid from 'src/components/Grid';

class InteractiveExample extends React.Component<{}, { cards: CardProps[] }> {
  state = {
    cards: [
      {
        renderIcon: () => {
          return <InsertPhoto />;
        },
        heading: 'Photos',
        subheadings: [
          'Use a photo',
          'Select up to 3',
        ],
        checked: true,
      },
      {
        renderIcon: () => {
          return <InsertPhoto />;
        },
        heading: 'Photos',
        subheadings: [
          'Use a photo',
          'Select up to 3',
        ],
        disabled: true,
        tooltip: 'Something... something... whatever...',
      },
      {
        renderIcon: () => {
          return <InsertPhoto />;
        },
        heading: 'Photos 2',
        subheadings: [
          'Use a photo',
          'Select up to 3',
        ],
        tooltip: 'Here is another tooltip!',
      },
    ],
  };

  handleClick = (id: number) => {
    this.setState((prevState) => {
      return {
        cards: prevState.cards.map((e, idx) => {
          e.checked = id === idx;
          return e;
        }),
      };
    });
  }

  render() {
    const { cards } = this.state;

    return (
      <Grid container wrap="wrap" className="m0">
      {
        cards.map((card, idx) =>
          <SelectionCard
            key={idx}
            {...card}
            onClick={() => this.handleClick(idx)}
          />)
      }
      </Grid>
    );
  }
}

export default InteractiveExample;

storiesOf('SelectionCard', module)
.addDecorator(ThemeDecorator)
.add('Interactive example', () => (
  <InteractiveExample />
))
.add('Default with SvgIcon', () => (
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
))
.add('Default with plain SVG', () => (
  <React.Fragment>
    <Grid container wrap="wrap" className="m0">
      <SelectionCard
        renderIcon={() => {
          return <US width="32" height="24" viewBox="0 0 720 480" />;
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
          return <DE width="32" height="24" viewBox="0 0 640 480" />;
        }}
        heading="Germany"
        subheadings={[
          'Germany',
          'Willkommen in Deutschland!',
        ]}
      />
      <SelectionCard
        renderIcon={() => {
          return <FR width="32" height="24" viewBox="0 0 640 480" />;
        }}
        heading="France"
        subheadings={[
          'France',
          'Don\'t host there',
        ]}
      />
    </Grid>
  </React.Fragment>
))
.add('Default with font Icon', () => (
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
))
.add('Default with no Icon', () => (
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
))
.add('Checked with SvgIcon', () => (
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
))
.add('Checked with plain SVG', () => (
  <React.Fragment>
    <Grid container wrap="wrap" className="m0">
      <SelectionCard
        checked
        renderIcon={() => {
          return <US width="32" height="24" viewBox="0 0 720 480" />;
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
          return <DE width="32" height="24" viewBox="0 0 640 480" />;
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
))
.add('Checked with no Icon', () => (
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
))
;
