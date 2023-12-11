import { getNormalizedRulePayload } from './utils';

describe('getNormalizedRulePayload', () => {
  it('should change empty strings to null', () => {
    expect(
      getNormalizedRulePayload({
        match_condition: {
          hostname: '',
          match_field: 'path_prefix',
          match_value: '',
          session_stickiness_cookie: null,
          session_stickiness_ttl: null,
        },
        service_targets: [
          {
            id: 42,
            label: 'test-1',
            percentage: 100,
          },
        ],
      })
    ).toStrictEqual({
      match_condition: {
        hostname: null,
        match_field: 'path_prefix',
        match_value: '',
        session_stickiness_cookie: null,
        session_stickiness_ttl: null,
      },
      service_targets: [
        {
          id: 42,
          label: 'test-1',
          percentage: 100,
        },
      ],
    });
  });
});
