import { generatePythonLinodeSnippet } from './generate-pythonSDKSnippet';

import type { CreateLinodeRequest } from '@linode/api-v4';

describe('generatePythonLinodeSnippet', () => {
  it('should correctly generates Python snippet for creating a Linode instance with all possible fields', () => {
    const config: CreateLinodeRequest = {
      authorized_keys: ['ssh-rsa AAAAB3Nza...'],
      backups_enabled: true,
      firewall_id: 289203,
      image: 'linode/ubuntu20.04',
      interfaces: [
        {
          ip_ranges: ['192.168.0.1/24'],
          ipam_address: '192.168.0.1',
          ipv4: {
            nat_1_1: '192.168.1.100',
            vpc: '192.168.2.0',
          },
          label: 'main-interface',
          purpose: 'public',
          subnet_id: 69513,
        },
        {
          ipam_address: '192.168.0.1',
          label: 'test',
          purpose: 'vpc',
        },
      ],
      label: 'FullTestLinode',
      metadata: { user_data: 'AAAAB3Nza' },
      placement_group: { id: 2603 },
      private_ip: true,
      region: 'us-central',
      root_pass: 'securepassword123',
      stackscript_id: 123456,
      tags: ['production', 'webserver'],
      type: 'g6-standard-1',
    };

    const expectedOutput = `client = LinodeClient(token=os.getenv('LINODE_TOKEN'))\nnew_linode = client.linode.instance_create(\n    ltype="g6-standard-1",\n    region="us-central",\n    image="linode/ubuntu20.04",\n    label="FullTestLinode",\n    root_pass="securepassword123",\n    placement_group={\n        "id" : 2603,\n    },\n    metadata={\n        "user_data" : "AAAAB3Nza",\n    },\n    authorized_keys=["ssh-rsa AAAAB3Nza..."],\n    interfaces=[\n        {\n            "label": "main-interface",\n            "ipv4": {\n                "nat_1_1": "192.168.1.100",\n                "vpc": "192.168.2.0",\n            },\n            "purpose": "public",\n            "ipam_address": "192.168.0.1",\n            "subnet_id": 69513,\n            "ip_ranges": ["192.168.0.1/24"],\n        },\n        {\n            "label": "test",\n            "purpose": "vpc",\n            "ipam_address": "192.168.0.1",\n        },\n    ],\n    backups_enabled=True,\n    firewall_id=289203,\n    stackscript_id=123456,\n    tags=["production", "webserver"],\n    private_ip=True\n)`;
    expect(generatePythonLinodeSnippet(config)).toEqual(expectedOutput);
  });

  it('should escapes special characters in Python strings gracefully', () => {
    const config = {
      image: 'linode/ubuntu20.04',
      label: 'Test"Instance',
      region: 'us-"central',
      type: 'g6-"nanode-1',
    };

    const expectedOutput = `client = LinodeClient(token=os.getenv('LINODE_TOKEN'))\nnew_linode = client.linode.instance_create(\n    ltype="g6-\\"nanode-1",\n    region="us-\\"central",\n    image="linode/ubuntu20.04",\n    label="Test\\"Instance"\n)`;
    expect(generatePythonLinodeSnippet(config)).toEqual(expectedOutput);
  });
});
