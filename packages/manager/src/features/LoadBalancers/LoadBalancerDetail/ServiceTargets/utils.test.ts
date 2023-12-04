import { getNormzlizedServiceTargetPayload } from './utils';

describe('getNormzlizedRulePayload', () => {
  it('should change empty strings to null', () => {
    expect(
      getNormzlizedServiceTargetPayload({
        certificate_id: null,
        endpoints: [
          {
            host: '',
            ip: '139.144.129.228',
            port: 80,
            rate_capacity: 10000,
          },
        ],
        healthcheck: {
          healthy_threshold: 3,
          host: '',
          interval: 10,
          path: '',
          protocol: 'http',
          timeout: 5,
          unhealthy_threshold: 3,
        },
        label: 'test',
        load_balancing_policy: 'round_robin',
        percentage: 10,
        protocol: 'https',
      })
    ).toStrictEqual({
      certificate_id: null,
      endpoints: [
        {
          host: null,
          ip: '139.144.129.228',
          port: 80,
          rate_capacity: 10000,
        },
      ],
      healthcheck: {
        healthy_threshold: 3,
        host: null,
        interval: 10,
        path: null,
        protocol: 'http',
        timeout: 5,
        unhealthy_threshold: 3,
      },
      label: 'test',
      load_balancing_policy: 'round_robin',
      percentage: 10,
      protocol: 'https',
    });
  });
});
