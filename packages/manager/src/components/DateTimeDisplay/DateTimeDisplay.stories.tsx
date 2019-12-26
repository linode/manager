import { storiesOf } from '@storybook/react';
import * as moment from 'moment-timezone';
import * as React from 'react';
import FormControlLabel from 'src/components/core/FormControlLabel';
import RadioGroup from 'src/components/core/RadioGroup';
import Radio from 'src/components/Radio';
import { TimeInterval } from 'src/utilities/formatDate';
import { DateTimeDisplay } from './DateTimeDisplay';
import { DateTime } from 'luxon';

interface State {
  time: any;
  cutoff: TimeInterval;
}

class Example extends React.Component<{}, State> {
  state: State = {
    time: moment(),
    cutoff: 'day'
  };

  toggleCutoff = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cutoff: TimeInterval = e.target.value as TimeInterval;
    this.setState({ cutoff });
  };

  render() {
    return (
      <React.Fragment>
        <p>
          {'Default display: '}
          <DateTimeDisplay value={'2018-07-20T04:23:17'} />
        </p>
        <p>
          {'You have been on this page since: '}
          <DateTimeDisplay
            value={this.state.time}
            humanizeCutoff={this.state.cutoff}
          />
        </p>
        <p>
          {'You last checked Slack: '}
          <DateTimeDisplay
            value={DateTime
              .utc()
              .minus({minutes:5})
              .toISO()}
            humanizeCutoff={this.state.cutoff}
          />
        </p>
        <p>
          {'Last Thursday was: '}
          <DateTimeDisplay
            value={DateTime
              .utc()
              .minus({days:4})
              .toISO()}
            humanizeCutoff={this.state.cutoff}
          />
        </p>
        <p>
          {'Three Wednesdays ago was: '}
          <DateTimeDisplay
            value={DateTime
              .utc()
              .minus({days:25})
              .toISO()}
            humanizeCutoff={this.state.cutoff}
          />
        </p>
        <p>
          {'You were so young '}
          <DateTimeDisplay
            value={DateTime
              .utc()
              .minus({months:11})
              .toISO()}
            humanizeCutoff={this.state.cutoff}
          />
        </p>
        <p>
          {'Elvis was born: '}
          <DateTimeDisplay
            value={DateTime.fromString('1/8/1935','D').toISO()}
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
    );
  }
}

storiesOf('DateTimeDisplay', module).add('Example', () => <Example />);
