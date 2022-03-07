import axios from 'axios';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import proxy from 'express-http-proxy';
import requestLogger from './middleware/requestLogger';
import auth from './middleware/auth';
import apiCaller from './utils/apiCaller';
import { TokenRequest } from './types/TokenRequest';

const app = express();
const port = 8080;
const OPENSTACK_URL = 'http://localhost:56080'; //'http://10.0.2.15'

app.use(cors());
app.use(express.json());
app.use(requestLogger);

// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });

app.post('/auth-callback', async (req, res) => {
  // console.log(req.params, req.body, req.headers);
  let { username, password } = req.body;
  if (username === '') {
    username = 'admin';
  }
  if (password === '') {
    password = 'devstack';
  }
  console.log('Username', username, 'Password', password);
  try {
    const result = await axios.post(
      `${OPENSTACK_URL}/identity/v3/auth/tokens`,
      {
        auth: {
          identity: {
            methods: ['password'],
            password: {
              user: {
                name: username,
                domain: {
                  name: 'Default',
                },
                password,
              },
            },
          },
          scope: {
            system: {
              all: true,
            },
          },
        },
      }
    );
    const token = result.headers['x-subject-token'];
    console.log('Token', token);
    res.status(200).json({
      access_token: token,
    });
  } catch (error) {
    console.log('Error:', error.message);
    res.status(400).json({ Error: error.message });
  }
});

app.get('/linode/instances', auth, async (req: TokenRequest, res) => {
  console.log(req.query);
  console.log(req.headers);
  try {
    const result = await apiCaller.get('/compute/v2.1/servers', {
      headers: { 'X-Auth-Token': req.token },
    });
    console.log('Res', result.data);
    const response = {
      data: result.data.servers,
      page: 1,
      pages: 1,
      results: 1,
    };
    res.status(200).send(response);
  } catch (error) {
    console.log('Error:', error.message);
    res.status(400).json({ Error: error.message });
  }
});

interface Network {
  id: string;
  name: string;
  tenant_id: string;
  admin_state_up: boolean;
  mtu: number;
  status: string;
  subnets: string[];
  shared: boolean;
  availability_zone_hints: any[];
  availability_zones: any[];
  ipv4_address_scope?: any;
  ipv6_address_scope?: any;
  'router:external': boolean;
  description: string;
  port_security_enabled: boolean;
  is_default: boolean;
  tags: any[];
  created_at: Date;
  updated_at: Date;
  revision_number: number;
  project_id: string;
}

app.post('/linode/instances', auth, async (req: TokenRequest, res) => {
  // req.body
  const { image, region, type, label, tags, root_pass } = req.body;

  console.log('Body', req.body);
  try {
    const networksResult = await axios.post(
      'http://localhost:9696/v2.0/networks'
    );
    const networks: Network[] = networksResult.data.networks;
    const publicNetwork = networks.find((network) => network.name === 'public');
    const result = await apiCaller.post(
      '/compute/v2.1/servers',
      {
        server: {
          name: label,
          imageRef: '70a599e0-31e7-49b7-b260-868f441e862b',
          flavorRef: type,
          availability_zone: region,
          networks: [
            {
              uuid: publicNetwork.id,
            },
          ],
          adminPass: root_pass,
          'OS-DCF:diskConfig': 'AUTO',
          security_groups: [
            {
              name: 'default',
            },
          ],
          user_data: '',
          block_device_mapping_v2: [
            {
              uuid: image,
              source_type: 'image',
              destination_type: 'volume',
              boot_index: 0,
              volume_size: '1',
              delete_on_termination: false,
            },
          ],
        },
        // availability_zone: region,
        // config_drive: false,
        // create_volume_default: true,
        // disk_config: 'AUTO',
        // block_device_mapping_v2: [
        //   {
        //     source_type: 'image',
        //     destination_type: 'volume',
        //     delete_on_termination: false,
        //     uuid: 'c75a38a2-a22a-4d3d-a443-cd734c98a8de',
        //     boot_index: '0',
        //     volume_size: 1,
        //   },
        // ],
        // flavor_id: '42',
        // hide_create_volume: false,
        // instance_count: 1,
        // key_name: null,
        // name: label,
        // nics: [
        //   {
        //     'net-id': 'b2dff566-1eb0-4405-a912-6e4916fb7efd',
        //     'v4-fixed-ip': '',
        //   },
        // ],
        // scheduler_hints: {},
        // security_groups: ['162bb7a9-775b-427a-9bf9-55457e27ad96'],
        // source_id: null,
        // user_data: '',
      },
      {
        headers: { 'X-Auth-Token': req.token },
      }
    );
    res.status(200).send();
  } catch (error) {
    res.status(400).json({ Error: error.message });
  }
});

app.get('/account', auth, async (req: TokenRequest, res) => {
  res.send({
    company: '',
    email: 'lawrencelin101@gmail.com',
    first_name: 'Lawrence',
    last_name: 'Lin',
    address_1: '87-11 57th Rd 2nd Fl',
    address_2: '',
    city: 'Elmhurst',
    state: 'NY',
    zip: '11373',
    country: 'US',
    phone: '',
    balance: 0,
    tax_id: '',
    credit_card: {
      last_four: '9667',
      expiry: '08/2022',
    },
    balance_uninvoiced: 0,
    active_since: '2021-12-05T08:00:40',
    capabilities: [
      'Linodes',
      'NodeBalancers',
      'Block Storage',
      'Object Storage',
      'Kubernetes',
      'Cloud Firewall',
      'Vlans',
      'LKE HA Control Planes',
      'Machine Images',
    ],
    active_promotions: [],
    euuid: '0792F0A5-64A9-4220-902571B98846127C',
  });
});

app.get('/profile', auth, async (req: TokenRequest, res) => {
  res.send({
    uid: 2260402,
    username: 'law-lin',
    email: 'lawrencelin101@gmail.com',
    timezone: 'GMT',
    email_notifications: true,
    referrals: {
      code: '',
      url: '',
      total: 0,
      completed: 0,
      pending: 0,
      credit: 0,
    },
    ip_whitelist_enabled: false,
    lish_auth_method: 'keys_only',
    authorized_keys: null,
    two_factor_auth: false,
    restricted: false,
    authentication_type: 'github',
  });
});

app.get('/account/settings', auth, async (req: TokenRequest, res) => {
  res.send({
    managed: false,
    network_helper: true,
    longview_subscription: null,
    backups_enabled: false,
    object_storage: 'disabled',
  });
});

app.get('/account/events', auth, async (req: TokenRequest, res) => {
  res.send({
    data: [],
    page: 1,
    pages: 1,
    results: 0,
  });
});

app.get('/profile/preferences', auth, async (req: TokenRequest, res) => {
  res.send({
    desktop_sidebar_open: false,
  });
});

app.get('/domains', auth, async (req: TokenRequest, res) => {
  res.send({
    data: [],
    page: 1,
    pages: 1,
    results: 0,
  });
});

app.get('/tags', auth, async (req: TokenRequest, res) => {
  res.send({
    data: [],
    page: 1,
    pages: 1,
    results: 0,
  });
});

app.get('/account/users', auth, async (req: TokenRequest, res) => {
  res.send({
    data: [
      {
        username: 'law-lin',
        email: 'lawrencelin101@gmail.com',
        restricted: false,
        ssh_keys: [],
        tfa_enabled: false,
      },
    ],
    page: 1,
    pages: 1,
    results: 1,
  });
});

app.get('/profile/grants', auth, async (req: TokenRequest, res) => {
  res.status(200).send();
});

interface Link {
  href: string;
  rel: string;
}
interface Flavor {
  id: string;
  name: string;
  ram: number;
  disk: number;
  swap: string;
  'OS-FLV-EXT-DATA:ephemeral': number;
  'OS-FLV-DISABLED:disabled': false;
  vcpus: number;
  'os-flavor-access:is_public': boolean;
  rxtx_factor: number;
  links: Link[];
}

interface Type {
  id: string;
  label: string;
  price: {
    hourly: number;
    monthly: number;
  };
  addons: {
    backups: {
      price: {
        hourly: number;
        monthly: number;
      };
    };
  };
  memory: number;
  disk: number;
  transfer: number;
  vcpus: number;
  gpus: number;
  network_out: number;
  class: string;
  successor: null;
}
app.get('/linode/types', auth, async (req: TokenRequest, res) => {
  try {
    const result = await apiCaller.get(
      '/compute/v2.1/flavors/detail?is_public=true',
      {
        headers: { 'X-Auth-Token': req.token },
      }
    );
    const flavors: Flavor[] = result.data.flavors;
    const types: Type[] = flavors.map((flavor) => {
      const type: Type = {
        id: flavor.id,
        label: flavor.name,
        price: {
          hourly: 0,
          monthly: 0,
        },
        addons: {
          backups: {
            price: {
              hourly: 0,
              monthly: 0,
            },
          },
        },
        memory: flavor.ram,
        disk: flavor.disk * 1024, // flavor.disk is in GB, type.disk is in MB
        transfer: 1000,
        vcpus: flavor.vcpus,
        gpus: 0,
        network_out: 1000,
        class: 'dedicated',
        successor: null,
      };
      return type;
    });
    const response = {
      data: types,
    };
    res.status(200).send(response);
  } catch (error) {
    console.log('Error:', error.message);
    res.status(400).json({ Error: error.message });
  }
});

app.get('/linode/types-legacy', auth, async (req: TokenRequest, res) => {
  res.send({
    data: [
      {
        id: 'standard-1',
        label: 'Linode 4GB (pending upgrade)',
        price: {
          hourly: 0.03,
          monthly: 20,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.008,
              monthly: 5,
            },
          },
        },
        memory: 512,
        disk: 24576,
        transfer: 2000,
        vcpus: 8,
        gpus: 0,
        network_out: 250,
        class: null,
        successor: 'g6-standard-2',
      },
      {
        id: 'standard-2',
        label: 'Linode 6GB (pending upgrade)',
        price: {
          hourly: 0.045,
          monthly: 30,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.012,
              monthly: 7.5,
            },
          },
        },
        memory: 768,
        disk: 36864,
        transfer: 3000,
        vcpus: 8,
        gpus: 0,
        network_out: 250,
        class: null,
        successor: 'g6-standard-3-s',
      },
      {
        id: 'standard-3',
        label: 'Linode 8GB (pending upgrade)',
        price: {
          hourly: 0.06,
          monthly: 40,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.015,
              monthly: 10,
            },
          },
        },
        memory: 1024,
        disk: 49152,
        transfer: 4000,
        vcpus: 8,
        gpus: 0,
        network_out: 250,
        class: null,
        successor: 'g6-standard-4',
      },
      {
        id: 'standard-4',
        label: 'Linode 10GB (pending upgrade)',
        price: {
          hourly: 0.09,
          monthly: 60,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.024,
              monthly: 15,
            },
          },
        },
        memory: 1536,
        disk: 73728,
        transfer: 6000,
        vcpus: 8,
        gpus: 0,
        network_out: 250,
        class: null,
        successor: 'g6-standard-4-s',
      },
      {
        id: 'standard-5',
        label: 'Linode 16GB (pending upgrade)',
        price: {
          hourly: 0.12,
          monthly: 80,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.03,
              monthly: 20,
            },
          },
        },
        memory: 2048,
        disk: 98304,
        transfer: 8000,
        vcpus: 8,
        gpus: 0,
        network_out: 250,
        class: null,
        successor: 'g6-standard-6',
      },
      {
        id: 'standard-6',
        label: 'Linode 32GB (pending upgrade)',
        price: {
          hourly: 0.24,
          monthly: 160,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.06,
              monthly: 40,
            },
          },
        },
        memory: 4096,
        disk: 196608,
        transfer: 16000,
        vcpus: 8,
        gpus: 0,
        network_out: 250,
        class: null,
        successor: 'g6-standard-8',
      },
      {
        id: 'standard-7',
        label: 'Linode 64GB (pending upgrade)',
        price: {
          hourly: 0.48,
          monthly: 320,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.12,
              monthly: 80,
            },
          },
        },
        memory: 8192,
        disk: 393216,
        transfer: 20000,
        vcpus: 8,
        gpus: 0,
        network_out: 250,
        class: null,
        successor: 'g6-standard-16',
      },
      {
        id: 'standard-8',
        label: 'Linode 96GB (pending upgrade)',
        price: {
          hourly: 0.72,
          monthly: 480,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.18,
              monthly: 120,
            },
          },
        },
        memory: 12288,
        disk: 589824,
        transfer: 20000,
        vcpus: 8,
        gpus: 0,
        network_out: 250,
        class: null,
        successor: 'g6-standard-20',
      },
      {
        id: 'standard-9',
        label: 'Linode 128GB (pending upgrade)',
        price: {
          hourly: 0.96,
          monthly: 640,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.24,
              monthly: 160,
            },
          },
        },
        memory: 16384,
        disk: 786432,
        transfer: 20000,
        vcpus: 8,
        gpus: 0,
        network_out: 250,
        class: null,
        successor: 'g6-standard-24',
      },
      {
        id: 'standard-10',
        label: 'Linode 160GB (pending upgrade)',
        price: {
          hourly: 1.2,
          monthly: 800,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.3,
              monthly: 200,
            },
          },
        },
        memory: 20480,
        disk: 983040,
        transfer: 20000,
        vcpus: 8,
        gpus: 0,
        network_out: 250,
        class: null,
        successor: 'g6-standard-20-s',
      },
      {
        id: 'standard-46',
        label: 'Linode 4GB (pending upgrade)',
        price: {
          hourly: 0.03,
          monthly: 20,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.008,
              monthly: 5,
            },
          },
        },
        memory: 1024,
        disk: 24576,
        transfer: 2000,
        vcpus: 8,
        gpus: 0,
        network_out: 250,
        class: null,
        successor: 'g6-standard-2',
      },
      {
        id: 'standard-47',
        label: 'Linode 6GB (pending upgrade)',
        price: {
          hourly: 0.05,
          monthly: 30,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.012,
              monthly: 7.5,
            },
          },
        },
        memory: 1536,
        disk: 36864,
        transfer: 3000,
        vcpus: 8,
        gpus: 0,
        network_out: 250,
        class: null,
        successor: 'g6-standard-3-s',
      },
      {
        id: 'standard-48',
        label: 'Linode 8GB (pending upgrade)',
        price: {
          hourly: 0.06,
          monthly: 40,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.015,
              monthly: 10,
            },
          },
        },
        memory: 2048,
        disk: 49152,
        transfer: 4000,
        vcpus: 8,
        gpus: 0,
        network_out: 250,
        class: null,
        successor: 'g6-standard-4',
      },
      {
        id: 'standard-49',
        label: 'Linode 10GB (pending upgrade)',
        price: {
          hourly: 0.09,
          monthly: 60,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.024,
              monthly: 15,
            },
          },
        },
        memory: 3072,
        disk: 73728,
        transfer: 6000,
        vcpus: 8,
        gpus: 0,
        network_out: 250,
        class: null,
        successor: 'g6-standard-4-s',
      },
      {
        id: 'standard-50',
        label: 'Linode 16GB (pending upgrade)',
        price: {
          hourly: 0.12,
          monthly: 80,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.03,
              monthly: 20,
            },
          },
        },
        memory: 4096,
        disk: 98304,
        transfer: 8000,
        vcpus: 8,
        gpus: 0,
        network_out: 250,
        class: null,
        successor: 'g6-standard-6',
      },
      {
        id: 'standard-51',
        label: 'Linode 32GB (pending upgrade)',
        price: {
          hourly: 0.24,
          monthly: 160,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.06,
              monthly: 40,
            },
          },
        },
        memory: 8192,
        disk: 196608,
        transfer: 16000,
        vcpus: 8,
        gpus: 0,
        network_out: 250,
        class: null,
        successor: 'g6-standard-8',
      },
      {
        id: 'standard-52',
        label: 'Linode 64GB (pending upgrade)',
        price: {
          hourly: 0.5,
          monthly: 320,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.12,
              monthly: 80,
            },
          },
        },
        memory: 16384,
        disk: 393216,
        transfer: 20000,
        vcpus: 8,
        gpus: 0,
        network_out: 250,
        class: null,
        successor: 'g6-standard-16',
      },
      {
        id: 'standard-53',
        label: 'Linode 96GB (pending upgrade)',
        price: {
          hourly: 0.72,
          monthly: 480,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.18,
              monthly: 120,
            },
          },
        },
        memory: 24576,
        disk: 589824,
        transfer: 20000,
        vcpus: 8,
        gpus: 0,
        network_out: 250,
        class: null,
        successor: 'g6-standard-20',
      },
      {
        id: 'standard-54',
        label: 'Linode 128GB (pending upgrade)',
        price: {
          hourly: 0.96,
          monthly: 640,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.24,
              monthly: 160,
            },
          },
        },
        memory: 32768,
        disk: 786432,
        transfer: 20000,
        vcpus: 8,
        gpus: 0,
        network_out: 250,
        class: null,
        successor: 'g6-standard-24',
      },
      {
        id: 'standard-55',
        label: 'Linode 160GB (pending upgrade)',
        price: {
          hourly: 1.2,
          monthly: 800,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.3,
              monthly: 200,
            },
          },
        },
        memory: 40960,
        disk: 983040,
        transfer: 20000,
        vcpus: 8,
        gpus: 0,
        network_out: 250,
        class: null,
        successor: 'g6-standard-20-s',
      },
      {
        id: 'standard-92',
        label: 'Linode 4GB (pending upgrade)',
        price: {
          hourly: 0.03,
          monthly: 20,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.008,
              monthly: 5,
            },
          },
        },
        memory: 1024,
        disk: 49152,
        transfer: 2000,
        vcpus: 8,
        gpus: 0,
        network_out: 250,
        class: null,
        successor: 'g6-standard-2',
      },
      {
        id: 'standard-93',
        label: 'Linode 6GB (pending upgrade)',
        price: {
          hourly: 0.05,
          monthly: 30,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.012,
              monthly: 7.5,
            },
          },
        },
        memory: 1536,
        disk: 73728,
        transfer: 3000,
        vcpus: 8,
        gpus: 0,
        network_out: 250,
        class: null,
        successor: 'g6-standard-3-s',
      },
      {
        id: 'standard-94',
        label: 'Linode 8GB (pending upgrade)',
        price: {
          hourly: 0.06,
          monthly: 40,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.015,
              monthly: 10,
            },
          },
        },
        memory: 2048,
        disk: 98304,
        transfer: 4000,
        vcpus: 8,
        gpus: 0,
        network_out: 250,
        class: null,
        successor: 'g6-standard-4',
      },
      {
        id: 'standard-95',
        label: 'Linode 10GB (pending upgrade)',
        price: {
          hourly: 0.09,
          monthly: 60,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.024,
              monthly: 15,
            },
          },
        },
        memory: 3072,
        disk: 147456,
        transfer: 6000,
        vcpus: 8,
        gpus: 0,
        network_out: 250,
        class: null,
        successor: 'g6-standard-4-s',
      },
      {
        id: 'standard-96',
        label: 'Linode 16GB (pending upgrade)',
        price: {
          hourly: 0.12,
          monthly: 80,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.03,
              monthly: 20,
            },
          },
        },
        memory: 4096,
        disk: 196608,
        transfer: 8000,
        vcpus: 8,
        gpus: 0,
        network_out: 250,
        class: null,
        successor: 'g6-standard-6',
      },
      {
        id: 'standard-97',
        label: 'Linode 32GB (pending upgrade)',
        price: {
          hourly: 0.24,
          monthly: 160,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.06,
              monthly: 40,
            },
          },
        },
        memory: 8192,
        disk: 393216,
        transfer: 16000,
        vcpus: 8,
        gpus: 0,
        network_out: 250,
        class: null,
        successor: 'g6-standard-8',
      },
      {
        id: 'standard-98',
        label: 'Linode 64GB (pending upgrade)',
        price: {
          hourly: 0.48,
          monthly: 320,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.12,
              monthly: 80,
            },
          },
        },
        memory: 16384,
        disk: 786432,
        transfer: 20000,
        vcpus: 8,
        gpus: 0,
        network_out: 250,
        class: null,
        successor: 'g6-standard-16',
      },
      {
        id: 'standard-99',
        label: 'Linode 96GB (pending upgrade)',
        price: {
          hourly: 0.72,
          monthly: 480,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.18,
              monthly: 120,
            },
          },
        },
        memory: 24576,
        disk: 1179648,
        transfer: 20000,
        vcpus: 8,
        gpus: 0,
        network_out: 250,
        class: null,
        successor: 'g6-standard-20',
      },
      {
        id: 'standard-100',
        label: 'Linode 128GB (pending upgrade)',
        price: {
          hourly: 0.96,
          monthly: 640,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.24,
              monthly: 160,
            },
          },
        },
        memory: 32768,
        disk: 1572864,
        transfer: 20000,
        vcpus: 8,
        gpus: 0,
        network_out: 250,
        class: null,
        successor: 'g6-standard-24',
      },
      {
        id: 'standard-101',
        label: 'Linode 160GB (pending upgrade)',
        price: {
          hourly: 1.2,
          monthly: 800,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.3,
              monthly: 200,
            },
          },
        },
        memory: 40960,
        disk: 1966080,
        transfer: 20000,
        vcpus: 8,
        gpus: 0,
        network_out: 250,
        class: null,
        successor: 'g6-standard-20-s',
      },
      {
        id: 'g4-standard-1',
        label: 'Linode 2GB (pending upgrade)',
        price: {
          hourly: 0.015,
          monthly: 10,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.004,
              monthly: 2.5,
            },
          },
        },
        memory: 1024,
        disk: 24576,
        transfer: 2000,
        vcpus: 1,
        gpus: 0,
        network_out: 125,
        class: 'standard',
        successor: 'g6-standard-1',
      },
      {
        id: 'g4-standard-2',
        label: 'Linode 4GB (pending upgrade)',
        price: {
          hourly: 0.03,
          monthly: 20,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.008,
              monthly: 5,
            },
          },
        },
        memory: 2048,
        disk: 49152,
        transfer: 3000,
        vcpus: 2,
        gpus: 0,
        network_out: 250,
        class: 'standard',
        successor: 'g6-standard-2',
      },
      {
        id: 'g4-standard-3-2',
        label: 'Linode 6GB (pending upgrade)',
        price: {
          hourly: 0.05,
          monthly: 30,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.012,
              monthly: 7.5,
            },
          },
        },
        memory: 3072,
        disk: 73728,
        transfer: 3000,
        vcpus: 3,
        gpus: 0,
        network_out: 375,
        class: 'standard',
        successor: 'g6-standard-3-s',
      },
      {
        id: 'g4-standard-4',
        label: 'Linode 8GB (pending upgrade)',
        price: {
          hourly: 0.06,
          monthly: 40,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.015,
              monthly: 10,
            },
          },
        },
        memory: 4096,
        disk: 98304,
        transfer: 4000,
        vcpus: 4,
        gpus: 0,
        network_out: 500,
        class: 'standard',
        successor: 'g6-standard-4',
      },
      {
        id: 'g4-standard-4-s',
        label: 'Linode 10GB (pending upgrade)',
        price: {
          hourly: 0.09,
          monthly: 60,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.024,
              monthly: 15,
            },
          },
        },
        memory: 6144,
        disk: 147456,
        transfer: 6000,
        vcpus: 4,
        gpus: 0,
        network_out: 750,
        class: 'standard',
        successor: 'g6-standard-4-s',
      },
      {
        id: 'g4-standard-6',
        label: 'Linode 16GB (pending upgrade)',
        price: {
          hourly: 0.12,
          monthly: 80,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.03,
              monthly: 20,
            },
          },
        },
        memory: 8192,
        disk: 196608,
        transfer: 8000,
        vcpus: 6,
        gpus: 0,
        network_out: 1000,
        class: 'standard',
        successor: 'g6-standard-6',
      },
      {
        id: 'g4-standard-8',
        label: 'Linode 32GB (pending upgrade)',
        price: {
          hourly: 0.24,
          monthly: 160,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.06,
              monthly: 40,
            },
          },
        },
        memory: 16384,
        disk: 393216,
        transfer: 16000,
        vcpus: 8,
        gpus: 0,
        network_out: 2000,
        class: 'standard',
        successor: 'g6-standard-8',
      },
      {
        id: 'g4-standard-12',
        label: 'Linode 64GB (pending upgrade)',
        price: {
          hourly: 0.48,
          monthly: 320,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.12,
              monthly: 80,
            },
          },
        },
        memory: 32768,
        disk: 786432,
        transfer: 20000,
        vcpus: 12,
        gpus: 0,
        network_out: 4000,
        class: 'standard',
        successor: 'g6-standard-16',
      },
      {
        id: 'g4-standard-16',
        label: 'Linode 96GB (pending upgrade)',
        price: {
          hourly: 0.72,
          monthly: 480,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.18,
              monthly: 120,
            },
          },
        },
        memory: 49152,
        disk: 1179648,
        transfer: 20000,
        vcpus: 16,
        gpus: 0,
        network_out: 6000,
        class: 'standard',
        successor: 'g6-standard-20',
      },
      {
        id: 'g4-standard-20',
        label: 'Linode 128GB (pending upgrade)',
        price: {
          hourly: 0.96,
          monthly: 640,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.24,
              monthly: 160,
            },
          },
        },
        memory: 65536,
        disk: 1572864,
        transfer: 20000,
        vcpus: 20,
        gpus: 0,
        network_out: 8000,
        class: 'standard',
        successor: 'g6-standard-24',
      },
      {
        id: 'g4-standard-20-s1',
        label: 'Linode 160GB (pending upgrade)',
        price: {
          hourly: 1.2,
          monthly: 800,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.3,
              monthly: 200,
            },
          },
        },
        memory: 81920,
        disk: 1966080,
        transfer: 20000,
        vcpus: 20,
        gpus: 0,
        network_out: 10000,
        class: 'standard',
        successor: 'g6-standard-20-s',
      },
      {
        id: 'g4-standard-20-s2',
        label: 'Linode 192GB (pending upgrade)',
        price: {
          hourly: 1.44,
          monthly: 960,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.3,
              monthly: 200,
            },
          },
        },
        memory: 98304,
        disk: 1966080,
        transfer: 20000,
        vcpus: 20,
        gpus: 0,
        network_out: 10000,
        class: 'standard',
        successor: 'g6-standard-32',
      },
      {
        id: 'g5-nanode-1',
        label: 'Nanode 1GB (pending upgrade)',
        price: {
          hourly: 0.0075,
          monthly: 5,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.003,
              monthly: 2,
            },
          },
        },
        memory: 1024,
        disk: 20480,
        transfer: 1000,
        vcpus: 1,
        gpus: 0,
        network_out: 1000,
        class: 'nanode',
        successor: 'g6-nanode-1',
      },
      {
        id: 'g5-standard-1',
        label: 'Linode 2GB (pending upgrade)',
        price: {
          hourly: 0.015,
          monthly: 10,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.004,
              monthly: 2.5,
            },
          },
        },
        memory: 2048,
        disk: 30720,
        transfer: 2000,
        vcpus: 1,
        gpus: 0,
        network_out: 1000,
        class: 'standard',
        successor: 'g6-standard-1',
      },
      {
        id: 'g5-standard-2',
        label: 'Linode 4GB (pending upgrade)',
        price: {
          hourly: 0.03,
          monthly: 20,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.008,
              monthly: 5,
            },
          },
        },
        memory: 4096,
        disk: 49152,
        transfer: 3000,
        vcpus: 2,
        gpus: 0,
        network_out: 1000,
        class: 'standard',
        successor: 'g6-standard-2',
      },
      {
        id: 'g5-standard-3-s',
        label: 'Linode 6GB (pending upgrade)',
        price: {
          hourly: 0.05,
          monthly: 30,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.012,
              monthly: 7.5,
            },
          },
        },
        memory: 6144,
        disk: 73728,
        transfer: 3000,
        vcpus: 3,
        gpus: 0,
        network_out: 1000,
        class: 'standard',
        successor: 'g6-standard-3-s',
      },
      {
        id: 'g5-standard-4',
        label: 'Linode 8GB (pending upgrade)',
        price: {
          hourly: 0.06,
          monthly: 40,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.015,
              monthly: 10,
            },
          },
        },
        memory: 8192,
        disk: 98304,
        transfer: 4000,
        vcpus: 4,
        gpus: 0,
        network_out: 1000,
        class: 'standard',
        successor: 'g6-standard-4',
      },
      {
        id: 'g5-standard-4-s',
        label: 'Linode 10GB (pending upgrade)',
        price: {
          hourly: 0.09,
          monthly: 60,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.024,
              monthly: 15,
            },
          },
        },
        memory: 10240,
        disk: 147456,
        transfer: 6000,
        vcpus: 4,
        gpus: 0,
        network_out: 1000,
        class: 'standard',
        successor: 'g6-standard-4-s',
      },
      {
        id: 'g5-standard-6',
        label: 'Linode 16GB (pending upgrade)',
        price: {
          hourly: 0.12,
          monthly: 80,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.03,
              monthly: 20,
            },
          },
        },
        memory: 12288,
        disk: 196608,
        transfer: 8000,
        vcpus: 6,
        gpus: 0,
        network_out: 1000,
        class: 'standard',
        successor: 'g6-standard-6',
      },
      {
        id: 'g5-standard-8',
        label: 'Linode 32GB (pending upgrade)',
        price: {
          hourly: 0.24,
          monthly: 160,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.06,
              monthly: 40,
            },
          },
        },
        memory: 24576,
        disk: 393216,
        transfer: 16000,
        vcpus: 8,
        gpus: 0,
        network_out: 2000,
        class: 'standard',
        successor: 'g6-standard-8',
      },
      {
        id: 'g5-standard-12',
        label: 'Linode 64GB (pending upgrade)',
        price: {
          hourly: 0.48,
          monthly: 320,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.12,
              monthly: 80,
            },
          },
        },
        memory: 49152,
        disk: 786432,
        transfer: 20000,
        vcpus: 12,
        gpus: 0,
        network_out: 4000,
        class: 'standard',
        successor: 'g6-standard-16',
      },
      {
        id: 'g5-standard-16',
        label: 'Linode 96GB (pending upgrade)',
        price: {
          hourly: 0.72,
          monthly: 480,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.18,
              monthly: 120,
            },
          },
        },
        memory: 65536,
        disk: 1179648,
        transfer: 20000,
        vcpus: 16,
        gpus: 0,
        network_out: 6000,
        class: 'standard',
        successor: 'g6-standard-20',
      },
      {
        id: 'g5-standard-20',
        label: 'Linode 128GB (pending upgrade)',
        price: {
          hourly: 0.96,
          monthly: 640,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.24,
              monthly: 160,
            },
          },
        },
        memory: 81920,
        disk: 1572864,
        transfer: 20000,
        vcpus: 20,
        gpus: 0,
        network_out: 8000,
        class: 'standard',
        successor: 'g6-standard-24',
      },
      {
        id: 'g5-standard-20-s1',
        label: 'Linode 160GB (pending upgrade)',
        price: {
          hourly: 1.2,
          monthly: 800,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.3,
              monthly: 200,
            },
          },
        },
        memory: 102400,
        disk: 1966080,
        transfer: 20000,
        vcpus: 20,
        gpus: 0,
        network_out: 10000,
        class: 'standard',
        successor: 'g6-standard-20-s',
      },
      {
        id: 'g5-standard-20-s2',
        label: 'Linode 192GB (pending upgrade)',
        price: {
          hourly: 1.44,
          monthly: 960,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.3,
              monthly: 200,
            },
          },
        },
        memory: 122880,
        disk: 1966080,
        transfer: 20000,
        vcpus: 20,
        gpus: 0,
        network_out: 10000,
        class: 'standard',
        successor: 'g6-standard-32',
      },
      {
        id: 'g5-highmem-1',
        label: 'Linode 24GB (pending upgrade)',
        price: {
          hourly: 0.09,
          monthly: 60,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.008,
              monthly: 5,
            },
          },
        },
        memory: 16384,
        disk: 20480,
        transfer: 5000,
        vcpus: 1,
        gpus: 0,
        network_out: 1000,
        class: 'highmem',
        successor: 'g6-highmem-1',
      },
      {
        id: 'g5-highmem-2',
        label: 'Linode 48GB (pending upgrade)',
        price: {
          hourly: 0.18,
          monthly: 120,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.015,
              monthly: 10,
            },
          },
        },
        memory: 32768,
        disk: 40960,
        transfer: 6000,
        vcpus: 2,
        gpus: 0,
        network_out: 1500,
        class: 'highmem',
        successor: 'g6-highmem-2',
      },
      {
        id: 'g5-highmem-4',
        label: 'Linode 90GB (pending upgrade)',
        price: {
          hourly: 0.36,
          monthly: 240,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.03,
              monthly: 20,
            },
          },
        },
        memory: 61440,
        disk: 92160,
        transfer: 7000,
        vcpus: 4,
        gpus: 0,
        network_out: 3000,
        class: 'highmem',
        successor: 'g6-highmem-4',
      },
      {
        id: 'g5-highmem-8',
        label: 'Linode 150GB (pending upgrade)',
        price: {
          hourly: 0.72,
          monthly: 480,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.06,
              monthly: 40,
            },
          },
        },
        memory: 102400,
        disk: 204800,
        transfer: 8000,
        vcpus: 8,
        gpus: 0,
        network_out: 6000,
        class: 'highmem',
        successor: 'g6-highmem-8',
      },
      {
        id: 'g5-highmem-16',
        label: 'Linode 300GB (pending upgrade)',
        price: {
          hourly: 1.44,
          monthly: 960,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.09,
              monthly: 60,
            },
          },
        },
        memory: 204800,
        disk: 348160,
        transfer: 9000,
        vcpus: 16,
        gpus: 0,
        network_out: 10000,
        class: 'highmem',
        successor: 'g6-highmem-16',
      },
      {
        id: 'g6-highmem-1',
        label: 'Linode 24GB (pending upgrade)',
        price: {
          hourly: 0.09,
          monthly: 60,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.0075,
              monthly: 5,
            },
          },
        },
        memory: 24576,
        disk: 20480,
        transfer: 5000,
        vcpus: 1,
        gpus: 0,
        network_out: 5000,
        class: 'highmem',
        successor: 'g7-highmem-1',
      },
      {
        id: 'g6-highmem-2',
        label: 'Linode 48GB (pending upgrade)',
        price: {
          hourly: 0.18,
          monthly: 120,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.015,
              monthly: 10,
            },
          },
        },
        memory: 49152,
        disk: 40960,
        transfer: 6000,
        vcpus: 2,
        gpus: 0,
        network_out: 6000,
        class: 'highmem',
        successor: 'g7-highmem-2',
      },
      {
        id: 'g6-highmem-4',
        label: 'Linode 90GB (pending upgrade)',
        price: {
          hourly: 0.36,
          monthly: 240,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.03,
              monthly: 20,
            },
          },
        },
        memory: 92160,
        disk: 92160,
        transfer: 7000,
        vcpus: 4,
        gpus: 0,
        network_out: 7000,
        class: 'highmem',
        successor: 'g7-highmem-4',
      },
      {
        id: 'g6-highmem-8',
        label: 'Linode 150GB (pending upgrade)',
        price: {
          hourly: 0.72,
          monthly: 480,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.06,
              monthly: 40,
            },
          },
        },
        memory: 153600,
        disk: 204800,
        transfer: 8000,
        vcpus: 8,
        gpus: 0,
        network_out: 8000,
        class: 'highmem',
        successor: 'g7-highmem-8',
      },
      {
        id: 'g6-highmem-16',
        label: 'Linode 300GB (pending upgrade)',
        price: {
          hourly: 1.44,
          monthly: 960,
        },
        addons: {
          backups: {
            price: {
              hourly: 0.12,
              monthly: 80,
            },
          },
        },
        memory: 307200,
        disk: 348160,
        transfer: 9000,
        vcpus: 16,
        gpus: 0,
        network_out: 9000,
        class: 'highmem',
        successor: 'g7-highmem-16',
      },
    ],
    page: 1,
    pages: 1,
    results: 65,
  });
});

interface Region {
  id: string;
  country: string;
  capabilities: string[];
  status: string;
  resolvers: {
    ipv4: string;
    ipv6: string;
  };
}

interface AvailZone {
  hosts: null;
  zoneName: string;
  zoneState: {
    available: boolean;
  };
}
app.get('/regions', auth, async (req: TokenRequest, res) => {
  try {
    const result = await apiCaller.get('/compute/v2.1/os-availability-zone', {
      headers: { 'X-Auth-Token': req.token },
    });
    const availZones: AvailZone[] = result.data.availabilityZoneInfo;
    const regions: Region[] = availZones.map((availZone) => {
      const region: Region = {
        id: availZone.zoneName,
        country: 'us',
        capabilities: [
          'Linodes',
          'NodeBalancers',
          'Block Storage',
          'GPU Linodes',
          'Kubernetes',
          'Cloud Firewall',
          'Vlans',
          'Managed Databases',
        ],
        status: 'ok',
        resolvers: {
          ipv4: '172.105.34.5,172.105.35.5,172.105.36.5,172.105.37.5,172.105.38.5,172.105.39.5,172.105.40.5,172.105.41.5,172.105.42.5,172.105.43.5',
          ipv6: '2400:8904::f03c:91ff:fea5:659,2400:8904::f03c:91ff:fea5:9282,2400:8904::f03c:91ff:fea5:b9b3,2400:8904::f03c:91ff:fea5:925a,2400:8904::f03c:91ff:fea5:22cb,2400:8904::f03c:91ff:fea5:227a,2400:8904::f03c:91ff:fea5:924c,2400:8904::f03c:91ff:fea5:f7e2,2400:8904::f03c:91ff:fea5:2205,2400:8904::f03c:91ff:fea5:9207',
        },
      };
      return region;
    });
    const response = {
      data: regions,
    };
    res.status(200).send(response);
  } catch (error) {
    console.log('Error:', error.message);
    res.status(400).json({ Error: error.message });
  }
});

interface Image {
  id: string;
  label: string;
  deprecated: false;
  size: number;
  created: Date;
  updated: Date;
  description: string;
  created_by: string;
  type: string;
  is_public: boolean;
  vendor: string;
  expiry: null;
  eol: Date;
  status: string;
}

interface OpenStackImage {
  'owner_specified.openstack.object': string;
  'owner_specified.openstack.sha256': string;
  'owner_specified.openstack.md5': string;
  hw_rng_model: string;
  name: string;
  disk_format: string;
  container_format: string;
  visibility: string;
  size: number;
  virtual_size: number;
  status: string;
  checksum: string;
  protected: boolean;
  min_ram: number;
  min_disk: number;
  owner: string;
  os_hidden: boolean;
  os_hash_algo: string;
  os_hash_value: string;
  id: string;
  created_at: Date;
  updated_at: Date;
  tags: any[];
  self: string;
  file: string;
  schema: string;
}
app.get('/images', auth, async (req: TokenRequest, res) => {
  try {
    const result = await apiCaller.get('/image/v2/images', {
      headers: { 'X-Auth-Token': req.token },
    });
    const osImages: OpenStackImage[] = result.data.images;
    const images: Image[] = osImages.map((osImage) => {
      const vendor = osImage.name.includes('Fedora') ? 'Fedora' : 'None';
      const image: Image = {
        id: osImage.id,
        label: osImage.name,
        deprecated: false,
        size: osImage.size / 1024,
        created: osImage.created_at,
        updated: osImage.updated_at,
        description: '',
        created_by: osImage.owner,
        type: 'manual',
        is_public: true,
        vendor: vendor,
        expiry: null,
        eol: new Date('2029-01-01T05:00:00'),
        status: 'available',
      };
      return image;
    });
    const response = {
      data: images,
    };
    res.status(200).send(response);
  } catch (error) {
    console.log('Error:', error.message);
    res.status(400).json({ Error: error.message });
  }
});

// app.use(
//   '/',
//   proxy(`https://api.linode.com/v4?client_id=${process.env.CLIENT_ID}`, {})
// );

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
