import { longviewLoad, memory, systemInfo } from 'src/__data__/longview';
import { requestClientStats } from './longviewStats.actions';
import reducer, { defaultState } from './longviewStats.reducer';

const mockError = [{ TEXT: 'no reason', CODE: 0, SEVERITY: 3 }];

describe('Longview Client Stats Reducer', () => {
  it('should handle an initiated request for Client data', () => {
    expect(
      reducer(
        defaultState,
        requestClientStats.started({ api_key: '1234', clientID: 123 })
      )
    ).toEqual({
      123: {
        loading: true,
      },
    });
  });

  it('should handle a failed GET request', () => {
    const state1 = reducer(
      { ...defaultState, 123: { loading: true } },
      requestClientStats.failed({
        params: {
          api_key: '1234',
          clientID: 123,
        },
        error: mockError,
      })
    );

    const state2 = reducer(
      { ...defaultState, 123: { data: {} } },
      requestClientStats.failed({
        params: {
          api_key: '999999aaaaa',
          clientID: 999,
        },
        error: mockError,
      })
    );

    expect(state1).toEqual({
      123: {
        loading: false,
        error: mockError,
      },
    });

    expect(state2).toEqual({
      123: {
        data: {},
      },
      999: {
        loading: false,
        error: mockError,
      },
    });
  });

  it('should handle a successful GET request', () => {
    const newState = reducer(
      { ...defaultState, 123: { data: {} }, 999: { loading: true } },
      requestClientStats.done({
        params: {
          clientID: 999,
          api_key: '9999aaaabbbb',
        },
        result: {
          ...systemInfo,
          ...memory,
          ...longviewLoad,
        },
      })
    );

    expect(newState[123]).toEqual({
      data: {},
    });
    expect(newState[999]).toHaveProperty('loading', false);
    expect(newState[999]).toHaveProperty('error', undefined);
    expect(newState[999].data).toHaveProperty('SysInfo', systemInfo.SysInfo);
    expect(newState[999].data).toHaveProperty('Memory', memory.Memory);
    expect(newState[999].data).toHaveProperty('Load', longviewLoad.Load);
  });
});
