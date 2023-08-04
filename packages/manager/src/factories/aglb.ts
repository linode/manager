import {
  Configuration,
  CreateLoadbalancerPayload,
  CreateRoutePayload,
  Loadbalancer,
  Route,
  ServiceTarget,
  ServiceTargetPayload,
  UpdateLoadbalancerPayload,
} from '@linode/api-v4/lib/aglb/types';
import * as Factory from 'factory.ts';

// ********************
// Entrypoint endpoints
// ********************
export const configurationFactory = Factory.Sync.makeFactory<Configuration>({
  certificate_table: [
    {
      certificate_id: 'cert-12345',
      sni_hostname: 'example.com',
    },
  ],
  id: Factory.each((i) => i),
  label: Factory.each((i) => `entrypoint${i}`),
  port: 80,
  protocol: 'HTTP',
  routes: ['images-route'],
});

// ***********************
// Loadbalancers endpoints
// ***********************
export const loadbalancerFactory = Factory.Sync.makeFactory<Loadbalancer>({
  configurations: [{ id: 1, label: 'my-config-1' }],
  hostname: 'loadbalancer1.aglb.akamai.com',
  id: Factory.each((i) => i),
  label: 'loadbalancer1',
  regions: ['us-west'],
  tags: ['tag1', 'tag2'],
});

export const createLoadbalancerWithAllChildrenFactory = Factory.Sync.makeFactory<CreateLoadbalancerPayload>(
  {
    configurations: [
      {
        certificate_table: [
          {
            certificate_id: 'cert-12345',
            sni_hostname: 'example.com',
          },
        ],
        label: 'myentrypoint1',
        port: 80,
        protocol: 'HTTP',
        routes: [
          {
            label: 'my-route',
            rules: [
              {
                match_condition: {
                  affinity_cookie: 'my-cool-cookie',
                  affinity_ttl: '60000',
                  hostname: 'example.com',
                  match_field: 'path_prefix',
                  match_value: '/images',
                },
                service_targets: [
                  {
                    ca_certificate: 'my-cms-certificate',
                    endpoints: [
                      {
                        ip: '192.168.0.100',
                        port: 8080,
                        rate_capacity: 100,
                      },
                    ],
                    healthcheck: {
                      healthy_threshold: 5,
                      host: 'linode.com',
                      interval: 10000,
                      path: '/images',
                      timeout: 5000,
                      unhealthy_threshold: 5,
                    },
                    label: 'my-service-target',
                    load_balancing_policy: 'round_robin',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    label: Factory.each((i) => `loadbalancer${i}`),
    regions: ['us-west'],
  }
);

export const updateLoadbalancerFactory = Factory.Sync.makeFactory<UpdateLoadbalancerPayload>(
  {
    configuration_ids: [1],
    label: Factory.each((i) => `loadbalancer${i}`),
    regions: ['us-west'],
  }
);

// ****************
// Routes endpoints
// ****************

export const routeFactory = Factory.Sync.makeFactory<Route>({
  id: Factory.each((i) => i),
  label: 'images-route',
  rules: [
    {
      match_condition: {
        affinity_cookie: null,
        affinity_ttl: null,
        hostname: 'www.acme.com',
        match_field: 'path_prefix',
        match_value: '/images/*',
      },
      service_targets: [
        {
          id: 1,
          label: 'my-service-target',
          percentage: 10,
        },
      ],
    },
  ],
});

export const createRouteFactory = Factory.Sync.makeFactory<CreateRoutePayload>({
  label: 'images-route',
  rules: [
    {
      match_condition: {
        affinity_cookie: null,
        affinity_ttl: null,
        hostname: 'www.acme.com',
        match_field: 'path_prefix',
        match_value: '/images/*',
      },
      service_targets: [
        {
          id: 1,
          label: 'my-service-target',
          percentage: 10,
        },
      ],
    },
  ],
});

// *************************
// Service Targets endpoints
// *************************

export const serviceTargetFactory = Factory.Sync.makeFactory<ServiceTarget>({
  ca_certificate: 'my-cms-certificate',
  endpoints: [
    {
      ip: '192.168.0.100',
      port: 8080,
      rate_capacity: 100,
    },
  ],
  healthcheck: {
    healthy_threshold: 5,
    host: 'linode.com',
    interval: 10000,
    path: '/images',
    timeout: 5000,
    unhealthy_threshold: 5,
  },
  id: Factory.each((i) => i),
  label: Factory.each((i) => `images-backend-aws-${i}`),
  load_balancing_policy: 'round_robin',
});

export const createServiceTargetFactory = Factory.Sync.makeFactory<ServiceTargetPayload>(
  {
    ca_certificate: 'my-cms-certificate',
    endpoints: [
      {
        ip: '192.168.0.100',
        port: 8080,
        rate_capacity: 10,
      },
    ],
    healthcheck: {
      healthy_threshold: 5,
      host: 'linode.com',
      interval: 10000,
      path: '/images',
      timeout: 5000,
      unhealthy_threshold: 5,
    },
    label: 'my-service-target',
    load_balancing_policy: 'least_request',
  }
);
