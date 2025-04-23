import { Factory } from '@linode/utilities';

import type {
  StackScript,
  UserDefinedField,
} from '@linode/api-v4/lib/stackscripts/types';
import type { OCA } from 'src/features/OneClickApps/types';

export const stackScriptFactory = Factory.Sync.makeFactory<StackScript>({
  created: '2010-12-31T23:59:58',
  deployments_active: 1,
  deployments_total: 2,
  description: 'Some test script for fun',
  id: Factory.each((i) => i),
  images: [],
  is_public: true,
  label: Factory.each((i) => `stackScript-${i}`),
  logo_url: '', // default value
  mine: true,
  ordinal: 1, // default value
  rev_note: 'Initial import.',
  script: 'sudo rm -rf /etc',
  updated: '2010-12-31T23:59:59',
  user_defined_fields: [],
  user_gravatar_id: 'ead4da00f4fe6a4bd0b4f11a510c031d',
  username: 'Linode',
});

export const oneClickAppFactory = Factory.Sync.makeFactory<OCA>({
  alt_description: 'A test app',
  alt_name: 'Test App',
  categories: ['Databases'],
  colors: {
    end: '#000000',
    start: '#000000',
  },
  description: 'A test app',
  logo_url: 'nodejs.svg',
  summary: 'A test app',
  website: 'https://www.linode.com',
});

export const userDefinedFieldFactory = Factory.Sync.makeFactory<UserDefinedField>(
  {
    label: Factory.each((i) => `Field${i}`),
    name: Factory.each((i) => `field${i}`),
  }
);
