import {
  Certificate,
  Configuration,
  ConfigurationEndpointHealth,
  ConfigurationsEndpointHealth,
  CreateCertificatePayload,
  CreateLoadbalancerPayload,
  CreateRoutePayload,
  Endpoint,
  LoadBalancerEndpointHealth,
  Loadbalancer,
  Route,
  ServiceTarget,
  ServiceTargetPayload,
  UpdateLoadbalancerPayload,
} from '@linode/api-v4/lib/aglb/types';
import * as Factory from 'factory.ts';

import { pickRandom } from 'src/utilities/random';

export const mockCertificate = `
-----BEGIN CERTIFICATE-----
MIID0DCCArigAwIBAgIBATANBgkqhkiG9w0BAQUFADB/MQswCQYDVQQGEwJGUjET
MBEGA1UECAwKU29tZS1TdGF0ZTEOMAwGA1UEBwwFUGFyaXMxDTALBgNVBAoMBERp
bWkxDTALBgNVBAsMBE5TQlUxEDAOBgNVBAMMB0RpbWkgQ0ExGzAZBgkqhkiG9w0B
CQEWDGRpbWlAZGltaS5mcjAeFw0xNDAxMjgyMDM2NTVaFw0yNDAxMjYyMDM2NTVa
MFsxCzAJBgNVBAYTAkZSMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJ
bnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQxFDASBgNVBAMMC3d3dy5kaW1pLmZyMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvpnaPKLIKdvx98KW68lz8pGa
RRcYersNGqPjpifMVjjE8LuCoXgPU0HePnNTUjpShBnynKCvrtWhN+haKbSp+QWX
SxiTrW99HBfAl1MDQyWcukoEb9Cw6INctVUN4iRvkn9T8E6q174RbcnwA/7yTc7p
1NCvw+6B/aAN9l1G2pQXgRdYC/+G6o1IZEHtWhqzE97nY5QKNuUVD0V09dc5CDYB
aKjqetwwv6DFk/GRdOSEd/6bW+20z0qSHpa3YNW6qSp+x5pyYmDrzRIR03os6Dau
ZkChSRyc/Whvurx6o85D6qpzywo8xwNaLZHxTQPgcIA5su9ZIytv9LH2E+lSwwID
AQABo3sweTAJBgNVHRMEAjAAMCwGCWCGSAGG+EIBDQQfFh1PcGVuU1NMIEdlbmVy
YXRlZCBDZXJ0aWZpY2F0ZTAdBgNVHQ4EFgQU+tugFtyN+cXe1wxUqeA7X+yS3bgw
HwYDVR0jBBgwFoAUhMwqkbBrGp87HxfvwgPnlGgVR64wDQYJKoZIhvcNAQEFBQAD
ggEBAIEEmqqhEzeXZ4CKhE5UM9vCKzkj5Iv9TFs/a9CcQuepzplt7YVmevBFNOc0
+1ZyR4tXgi4+5MHGzhYCIVvHo4hKqYm+J+o5mwQInf1qoAHuO7CLD3WNa1sKcVUV
vepIxc/1aHZrG+dPeEHt0MdFfOw13YdUc2FH6AqEdcEL4aV5PXq2eYR8hR4zKbc1
fBtuqUsvA8NWSIyzQ16fyGve+ANf6vXvUizyvwDrPRv/kfvLNa3ZPnLMMxU98Mvh
PXy3PkB8++6U4Y3vdk2Ni2WYYlIls8yqbM4327IKmkDc2TimS8u60CT47mKU7aDY
cbTV5RDkrlaYwm5yqlTIglvCv7o=
-----END CERTIFICATE-----
`;

const mockKey = `
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAvpnaPKLIKdvx98KW68lz8pGaRRcYersNGqPjpifMVjjE8LuC
oXgPU0HePnNTUjpShBnynKCvrtWhN+haKbSp+QWXSxiTrW99HBfAl1MDQyWcukoE
b9Cw6INctVUN4iRvkn9T8E6q174RbcnwA/7yTc7p1NCvw+6B/aAN9l1G2pQXgRdY
C/+G6o1IZEHtWhqzE97nY5QKNuUVD0V09dc5CDYBaKjqetwwv6DFk/GRdOSEd/6b
W+20z0qSHpa3YNW6qSp+x5pyYmDrzRIR03os6DauZkChSRyc/Whvurx6o85D6qpz
ywo8xwNaLZHxTQPgcIA5su9ZIytv9LH2E+lSwwIDAQABAoIBAFml8cD9a5pMqlW3
f9btTQz1sRL4Fvp7CmHSXhvjsjeHwhHckEe0ObkWTRsgkTsm1XLu5W8IITnhn0+1
iNr+78eB+rRGngdAXh8diOdkEy+8/Cee8tFI3jyutKdRlxMbwiKsouVviumoq3fx
OGQYwQ0Z2l/PvCwy/Y82ffq3ysC5gAJsbBYsCrg14bQo44ulrELe4SDWs5HCjKYb
EI2b8cOMucqZSOtxg9niLN/je2bo/I2HGSawibgcOdBms8k6TvsSrZMr3kJ5O6J+
77LGwKH37brVgbVYvbq6nWPL0xLG7dUv+7LWEo5qQaPy6aXb/zbckqLqu6/EjOVe
ydG5JQECgYEA9kKfTZD/WEVAreA0dzfeJRu8vlnwoagL7cJaoDxqXos4mcr5mPDT
kbWgFkLFFH/AyUnPBlK6BcJp1XK67B13ETUa3i9Q5t1WuZEobiKKBLFm9DDQJt43
uKZWJxBKFGSvFrYPtGZst719mZVcPct2CzPjEgN3Hlpt6fyw3eOrnoECgYEAxiOu
jwXCOmuGaB7+OW2tR0PGEzbvVlEGdkAJ6TC/HoKM1A8r2u4hLTEJJCrLLTfw++4I
ddHE2dLeR4Q7O58SfLphwgPmLDezN7WRLGr7Vyfuv7VmaHjGuC3Gv9agnhWDlA2Q
gBG9/R9oVfL0Dc7CgJgLeUtItCYC31bGT3yhV0MCgYEA4k3DG4L+RN4PXDpHvK9I
pA1jXAJHEifeHnaW1d3vWkbSkvJmgVf+9U5VeV+OwRHN1qzPZV4suRI6M/8lK8rA
Gr4UnM4aqK4K/qkY4G05LKrik9Ev2CgqSLQDRA7CJQ+Jn3Nb50qg6hFnFPafN+J7		
7juWln08wFYV4Atpdd+9XQECgYBxizkZFL+9IqkfOcONvWAzGo+Dq1N0L3J4iTIk
w56CKWXyj88d4qB4eUU3yJ4uB4S9miaW/eLEwKZIbWpUPFAn0db7i6h3ZmP5ZL8Q
qS3nQCb9DULmU2/tU641eRUKAmIoka1g9sndKAZuWo+o6fdkIb1RgObk9XNn8R4r
psv+aQKBgB+CIcExR30vycv5bnZN9EFlIXNKaeMJUrYCXcRQNvrnUIUBvAO8+jAe
CdLygS5RtgOLZib0IVErqWsP3EI1ACGuLts0vQ9GFLQGaN1SaMS40C9kvns1mlDu
LhIhYpJ8UsCVt5snWo2N+M+6ANh5tpWdQnEK6zILh4tRbuzaiHgb
-----END RSA PRIVATE KEY-----
`;

// ********************
// Configuration endpoints
// ********************
export const configurationFactory = Factory.Sync.makeFactory<Configuration>({
  certificates: [
    {
      hostname: 'example.com',
      id: 0,
    },
  ],
  id: Factory.each((i) => i),
  label: Factory.each((i) => `configuration-${i}`),
  port: 80,
  protocol: 'http',
  routes: [
    { id: 0, label: 'route-0' },
    { id: 1, label: 'route-1' },
    { id: 2, label: 'route-2' },
  ],
});

// ***********************
// Loadbalancers endpoints
// ***********************
export const loadbalancerFactory = Factory.Sync.makeFactory<Loadbalancer>({
  configurations: [{ id: 1, label: 'my-config-1' }],
  hostname: 'loadbalancer1.aglb.akamai.com',
  id: Factory.each((i) => i),
  label: Factory.each((i) => `aglb-${i}`),
  regions: ['us-west'],
  tags: ['tag1', 'tag2'],
});

export const createLoadbalancerWithAllChildrenFactory = Factory.Sync.makeFactory<CreateLoadbalancerPayload>(
  {
    configurations: [
      {
        certificates: [
          {
            hostname: 'example.com',
            id: 1,
          },
        ],
        label: 'myentrypoint1',
        port: 80,
        protocol: 'http',
        routes: [
          {
            label: 'my-route',
            protocol: 'tcp',
            rules: [
              {
                match_condition: {
                  hostname: 'example.com',
                  match_field: 'path_prefix',
                  match_value: '/images',
                  session_stickiness_cookie: 'my-cool-cookie',
                  session_stickiness_ttl: 60000,
                },
                service_targets: [
                  {
                    certificate_id: 0,
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
                      protocol: 'http',
                      timeout: 5000,
                      unhealthy_threshold: 5,
                    },
                    label: 'my-service-target',
                    load_balancing_policy: 'round_robin',
                    percentage: 0,
                    protocol: 'https',
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
  label: Factory.each((i) => `route-${i}`),
  protocol: Factory.each(() => pickRandom(['http', 'tcp'])),
  rules: [
    {
      match_condition: {
        hostname: 'www.acme.com',
        match_field: 'path_prefix',
        match_value: '/A/*',
        session_stickiness_cookie: null,
        session_stickiness_ttl: null,
      },
      service_targets: [
        {
          id: 1,
          label: 'my-service-target',
          percentage: 100,
        },
      ],
    },
    {
      match_condition: {
        hostname: 'www.acme.com',
        match_field: 'path_prefix',
        match_value: '/B/*',
        session_stickiness_cookie: null,
        session_stickiness_ttl: null,
      },
      service_targets: [
        {
          id: 1,
          label: 'my-service-target',
          percentage: 100,
        },
      ],
    },
    {
      match_condition: {
        hostname: 'www.acme.com',
        match_field: 'path_prefix',
        match_value: '/C/*',
        session_stickiness_cookie: null,
        session_stickiness_ttl: null,
      },
      service_targets: [
        {
          id: 1,
          label: 'my-service-target',
          percentage: 100,
        },
      ],
    },
  ],
});

export const createRouteFactory = Factory.Sync.makeFactory<CreateRoutePayload>({
  label: 'images-route',
  protocol: 'http',
  rules: [
    {
      match_condition: {
        hostname: 'www.acme.com',
        match_field: 'path_prefix',
        match_value: '/images/*',
        session_stickiness_cookie: null,
        session_stickiness_ttl: null,
      },
      service_targets: [
        {
          id: 1,
          label: 'test',
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
  certificate_id: 0,
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
    protocol: 'http',
    timeout: 5000,
    unhealthy_threshold: 5,
  },
  id: Factory.each((i) => i),
  label: Factory.each((i) => `service-target-${i}`),
  load_balancing_policy: 'round_robin',
  percentage: 0,
  protocol: 'https',
});

export const createServiceTargetFactory = Factory.Sync.makeFactory<ServiceTargetPayload>(
  {
    certificate_id: 0,
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
      protocol: 'http',
      timeout: 5000,
      unhealthy_threshold: 5,
    },
    label: 'my-service-target',
    load_balancing_policy: 'least_request',
    percentage: 0,
    protocol: 'https',
  }
);

// *********************
// Certificate endpoints
// *********************
export const certificateFactory = Factory.Sync.makeFactory<Certificate>({
  certificate: mockCertificate,
  id: Factory.each((i) => i),
  label: Factory.each((i) => `certificate-${i}`),
  type: 'ca',
});

export const createCertificateFactory = Factory.Sync.makeFactory<CreateCertificatePayload>(
  {
    certificate: mockCertificate,
    key: mockKey,
    label: 'my-cert',
    type: 'downstream',
  }
);

export const endpointFactory = Factory.Sync.makeFactory<Endpoint>({
  host: 'example.com',
  ip: '192.168.1.1',
  port: 80,
  rate_capacity: 10_000,
});

export const loadbalancerEndpointHealthFactory = Factory.Sync.makeFactory<LoadBalancerEndpointHealth>(
  {
    healthy_endpoints: 4,
    id: Factory.each((i) => i),
    timestamp: '2020-01-31T12:00:00',
    total_endpoints: 6,
  }
);

export const configurationEndpointHealthFactory = Factory.Sync.makeFactory<ConfigurationEndpointHealth>(
  {
    healthy_endpoints: 4,
    id: Factory.each((i) => i),
    label: Factory.each((i) => `configuration-${i}`),
    timestamp: '',
    total_endpoints: 6,
    type: '',
    url: '',
  }
);

export const configurationsEndpointHealthFactory = Factory.Sync.makeFactory<ConfigurationsEndpointHealth>(
  {
    configurations: configurationEndpointHealthFactory.buildList(5),
    id: Factory.each((i) => i),
  }
);
