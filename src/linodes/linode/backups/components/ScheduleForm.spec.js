import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import {
  ScheduleForm,
  createAdjustedScheduleOptions,
} from '~/linodes/linode/backups/components/ScheduleForm';

import { expectDispatchOrStoreErrors, expectRequest } from '~/test.helpers';
import { testLinode } from '~/data/linodes';


describe('linodes/linode/backups/components/ScheduleForm', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('saves settings back to the api', async () => {
    const page = shallow(
      <ScheduleForm
        dispatch={dispatch}
        linode={testLinode}
        window="W0"
        day="Saturday"
        tz="US/Eastern"
      />
    );

    dispatch.reset();
    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/instances/1234', {
        method: 'PUT',
        body: {
          backups: {
            schedule: {
              day: 'Saturday',
              window: 'W0',
            },
          },
        },
      }),
    ]);
  });

  it('Returns "natural" list when timezone is GMT.', () => {
    const expected = [
      {
        start: '2017-11-30T01:00:00.000Z',
        finish: '2017-11-30T03:00:00.000Z',
        label: '01:00 - 03:00',
        value: 'W0',
      },
      {
        start: '2017-11-30T03:00:00.000Z',
        finish: '2017-11-30T05:00:00.000Z',
        label: '03:00 - 05:00',
        value: 'W2',
      },
      {
        start: '2017-11-30T05:00:00.000Z',
        finish: '2017-11-30T07:00:00.000Z',
        label: '05:00 - 07:00',
        value: 'W4',
      },
      {
        start: '2017-11-30T07:00:00.000Z',
        finish: '2017-11-30T09:00:00.000Z',
        label: '07:00 - 09:00',
        value: 'W6',
      },
      {
        start: '2017-11-30T09:00:00.000Z',
        finish: '2017-11-30T11:00:00.000Z',
        label: '09:00 - 11:00',
        value: 'W8',
      },
      {
        start: '2017-11-30T11:00:00.000Z',
        finish: '2017-11-30T13:00:00.000Z',
        label: '11:00 - 13:00',
        value: 'W10',
      },
      {
        start: '2017-11-30T13:00:00.000Z',
        finish: '2017-11-30T15:00:00.000Z',
        label: '13:00 - 15:00',
        value: 'W12',
      },
      {
        start: '2017-11-30T15:00:00.000Z',
        finish: '2017-11-30T17:00:00.000Z',
        label: '15:00 - 17:00',
        value: 'W14',
      },
      {
        start: '2017-11-30T17:00:00.000Z',
        finish: '2017-11-30T19:00:00.000Z',
        label: '17:00 - 19:00',
        value: 'W16',
      },
      {
        start: '2017-11-30T19:00:00.000Z',
        finish: '2017-11-30T21:00:00.000Z',
        label: '19:00 - 21:00',
        value: 'W18',
      },
      {
        start: '2017-11-30T21:00:00.000Z',
        finish: '2017-11-30T23:00:00.000Z',
        label: '21:00 - 23:00',
        value: 'W20',
      },
      {
        start: '2017-11-30T23:00:00.000Z',
        finish: '2017-12-01T01:00:00.000Z',
        label: '23:00 - 01:00',
        value: 'W22',
      },
    ];
    const result = createAdjustedScheduleOptions('GMT', 'thursday');
    expect(JSON.stringify(result)).to.deep.eql(JSON.stringify(expected));
  });

  it('Returns adjusted list when timezone is EST.', () => {
    const expected = [
      {
        start: '2017-11-30T05:00:00.000Z',
        finish: '2017-11-30T07:00:00.000Z',
        label: '00:00 - 02:00',
        value: 'W4',
      },
      {
        start: '2017-11-30T07:00:00.000Z',
        finish: '2017-11-30T09:00:00.000Z',
        label: '02:00 - 04:00',
        value: 'W6',
      },
      {
        start: '2017-11-30T09:00:00.000Z',
        finish: '2017-11-30T11:00:00.000Z',
        label: '04:00 - 06:00',
        value: 'W8',
      },
      {
        start: '2017-11-30T11:00:00.000Z',
        finish: '2017-11-30T13:00:00.000Z',
        label: '06:00 - 08:00',
        value: 'W10',
      },
      {
        start: '2017-11-30T13:00:00.000Z',
        finish: '2017-11-30T15:00:00.000Z',
        label: '08:00 - 10:00',
        value: 'W12',
      },
      {
        start: '2017-11-30T15:00:00.000Z',
        finish: '2017-11-30T17:00:00.000Z',
        label: '10:00 - 12:00',
        value: 'W14',
      },
      {
        start: '2017-11-30T17:00:00.000Z',
        finish: '2017-11-30T19:00:00.000Z',
        label: '12:00 - 14:00',
        value: 'W16',
      },
      {
        start: '2017-11-30T19:00:00.000Z',
        finish: '2017-11-30T21:00:00.000Z',
        label: '14:00 - 16:00',
        value: 'W18',
      },
      {
        start: '2017-11-30T21:00:00.000Z',
        finish: '2017-11-30T23:00:00.000Z',
        label: '16:00 - 18:00',
        value: 'W20',
      },
      {
        start: '2017-11-30T23:00:00.000Z',
        finish: '2017-12-01T01:00:00.000Z',
        label: '18:00 - 20:00',
        value: 'W22',
      },
      {
        start: '2017-11-30T01:00:00.000Z',
        finish: '2017-11-30T03:00:00.000Z',
        label: '20:00 - 22:00',
        value: 'W0',
      },
      {
        start: '2017-11-30T03:00:00.000Z',
        finish: '2017-11-30T05:00:00.000Z',
        label: '22:00 - 00:00',
        value: 'W2',
      },
    ];
    const result = createAdjustedScheduleOptions('EST', 'thursday');
    expect(JSON.stringify(result)).to.equal(JSON.stringify(expected));
  });
});
