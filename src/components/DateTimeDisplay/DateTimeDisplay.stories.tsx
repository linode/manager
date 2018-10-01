import { storiesOf } from '@storybook/react';
import * as moment from 'moment-timezone';
import * as React from 'react';

import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioGroup from '@material-ui/core/RadioGroup';

import Radio from 'src/components/Radio';

import ThemeDecorator from '../../utilities/storybookDecorators';

import { DateTimeDisplay, TimeInterval } from './DateTimeDisplay';

interface State {
  time: any;
  cutoff: TimeInterval;
}

class Example extends React.Component<{},State> {
  state: State = {
    time: moment(),
    cutoff: 'day',
  }

  toggleCutoff = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cutoff: TimeInterval = e.target.value as TimeInterval;
    this.setState({ cutoff });
  }

  render() {
    return (
      <React.Fragment>
        <p>{'Default display: '}
          <DateTimeDisplay
            value={this.state.time}
            timezone={'America/New_York'}
            classes={{root:''}}
          />
        </p>
        <p>{'You have been on this page since: '}
          <DateTimeDisplay
            value={this.state.time}
            timezone={'America/New_York'}
            classes={{root:''}}
            humanizeCutoff={this.state.cutoff}
          />
        </p>
        <p>{'You last checked Slack: '}
          <DateTimeDisplay
            value={moment().subtract(5,'minutes').format()}
            timezone={'America/New_York'}
            classes={{root:''}}
            humanizeCutoff={this.state.cutoff}
          />
        </p>
        <p>{'Last Thursday was: '}
          <DateTimeDisplay
            value={moment().day(-4).format()}
            timezone={'America/New_York'}
            classes={{root:''}}
            humanizeCutoff={this.state.cutoff}
          />
        </p>
        <p>{'Three Wednesdays ago was: '}
          <DateTimeDisplay
            value={moment().day(-25).format()}
            timezone={'America/New_York'}
            classes={{root:''}}
            humanizeCutoff={this.state.cutoff}
          />
        </p>
        <p>{'You were so young '}
          <DateTimeDisplay
            value={moment().subtract(11,'months').format()}
            timezone={'America/New_York'}
            classes={{root:''}}
            humanizeCutoff={this.state.cutoff}
          />
        </p>
        <p>{'Elvis was born: '}
          <DateTimeDisplay
            value={moment('1-8-1935').format()}
            timezone={'America/New_York'}
            classes={{root:''}}
            humanizeCutoff={this.state.cutoff}
          />
        </p>
        <p>{'humanizeCutoff prop is set to: '}</p>
        <RadioGroup
          aria-label="gender"
          name="gender"
          value={this.state.cutoff}
          onChange={this.toggleCutoff}
        >
          <FormControlLabel value="day" label="day" control={<Radio />} />
          <FormControlLabel value="week" label="week" control={<Radio />} />
          <FormControlLabel value="month" label="month" control={<Radio />} />
          <FormControlLabel value="year" label="year" control={<Radio />} />
          <FormControlLabel value="never" label="never" control={<Radio />} />
        </RadioGroup>
      </React.Fragment>
    )
  }
}

storiesOf('DateTimeDisplay', module)
  .addDecorator(ThemeDecorator)
  .add('Example', () => (
    <Example />
  ));