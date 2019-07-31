import { cleanCSVData } from './DownloadCSV';

describe('should prevent CSV injection attacks', () => {
  it('should wrap all math signs in double quotes from an array of values', () => {
    expect(cleanCSVData(['+123', '=123', '-123'])).toEqual([
      '"+"123',
      '"="123',
      '"-"123'
    ]);
  });

  it('should recursively wrap all math signs in double quotes from 2D arrays', () => {
    expect(cleanCSVData([['+123'], ['=123'], ['-123']])).toEqual([
      ['"+"123'],
      ['"="123'],
      ['"-"123']
    ]);
  });

  it('should wrap values of objects in double quotes', () => {
    expect(
      cleanCSVData([
        {
          key: '-123'
        },
        {
          key: '+123'
        },
        {
          key: '=123'
        }
      ])
    ).toEqual([
      {
        key: '"-"123'
      },
      {
        key: '"+"123'
      },
      {
        key: '"="123'
      }
    ]);
  });

  it('should recursively clean values of objects', () => {
    expect(
      cleanCSVData([
        {
          key: {
            nestedKey: '+123'
          }
        },
        {
          key: {
            nestedKey: '-123'
          }
        },
        {
          key: {
            nestedKey: '=123'
          }
        }
      ])
    ).toEqual([
      {
        key: {
          nestedKey: '"+"123'
        }
      },
      {
        key: {
          nestedKey: '"-"123'
        }
      },
      {
        key: {
          nestedKey: '"="123'
        }
      }
    ]);
  });

  it('should clean a nested array in a nested object', () => {
    expect(
      cleanCSVData([
        {
          key: [
            {
              nestedKey: '+123'
            }
          ]
        },
        {
          key: [
            {
              nestedKey: '-123'
            }
          ]
        },
        {
          key: [
            {
              nestedKey: '=123'
            }
          ]
        }
      ])
    ).toEqual([
      {
        key: [
          {
            nestedKey: '"+"123'
          }
        ]
      },
      {
        key: [
          {
            nestedKey: '"-"123'
          }
        ]
      },
      {
        key: [
          {
            nestedKey: '"="123'
          }
        ]
      }
    ]);
  });
});
