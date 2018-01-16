import { generateDefaultStateFull } from '~/api/internal';
import { config as linodeConfig } from '~/api/generic/linodes';
import {
  getObjectByLabelLazily,
  Error404,
  lessThanDatetimeFilter,
  lessThanNowFilter,
  createHeaderFilter,
} from '~/api/util';
import { state } from '~/data';
import { testLinode } from '~/data/linodes';
import { expectRequest } from '~/test.helpers';


describe('api/util', async () => {
  it('preloads a linode when it is not already in the state', async () => {
    let dispatch;

    dispatch = jest.fn(() => ({ linodes: [], results: 1 }));
    await getObjectByLabelLazily('linodes', 'foo-foo-foo')(dispatch, () => state);
    expect(dispatch.mock.calls.length).toBe(1);
    let fn = dispatch.mock.calls[0][0];
    dispatch.mockReset();

    // Call to fetch all
    dispatch = jest.fn(() => ({ pages: 1, linodes: [], results: 0 }));
    await fn(dispatch, () => state);
    fn = dispatch.mock.calls[0][0];
    dispatch.mockReset();

    const defaultMany = generateDefaultStateFull(linodeConfig);
    await expectRequest(fn, '/linode/instances/?page=1', undefined, {
      ...defaultMany,
      linodes: [
        ...defaultMany.linodes,
        { ...testLinode, __updatedAt: null },
      ],
    });
  });

  it('throws a 404 when the resource is not found', async () => {
    const dispatch = jest.fn(() => ({ linodes: [], results: 0 }));
    // Could not for the life of me get `expect(async () => await getOb...).to.throw(Error404)`
    // to work.
    try {
      await getObjectByLabelLazily('linodes', 'foo-foo-foo')(dispatch, () => state);
      throw Error;
    } catch (e) {
      if (!(e instanceof Error404)) {
        throw Error;
      }
    }
  });

  it('provides a header structure utility function', function () {
    const emptyHeader = createHeaderFilter({});

    expect(emptyHeader['X-Filter']).toEqual({});
  });

  it('provides createHeaderFilter which assigns an object to X-Filter', function () {
    const emptyHeader = createHeaderFilter({ example: true });

    expect(emptyHeader['X-Filter']).toHaveProperty('example', true);
  });

  it('provides a lessThanDatetimeFilter function', function () {
    const lessThanNow = lessThanDatetimeFilter('example', (new Date()).toString());

    expect(lessThanNow).toBeDefined();
    expect(typeof lessThanNow).toBe('object');
    expect(typeof lessThanNow.example).toBe('object');
    expect(lessThanNow.example['+lt']).toBeDefined();
    expect(typeof lessThanNow.example['+lt']).toBe('string');
    expect(typeof (new Date(lessThanNow.example['+lt']))).toBe('object');
  });

  it('provides a lessThanNowFilter function', function () {
    const lessThanNow = lessThanNowFilter('example');

    expect(lessThanNow).toBeDefined();
    expect(typeof lessThanNow).toBe('object');
    expect(lessThanNow.example).toBeDefined();
    expect(typeof lessThanNow.example).toBe('object');
    expect(lessThanNow.example['+lt']).toBeDefined();
    expect(typeof lessThanNow.example['+lt']).toBe('string');
    expect(typeof (new Date(lessThanNow.example['+lt']))).toBe('object');
  });
});
