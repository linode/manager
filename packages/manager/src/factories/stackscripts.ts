import * as Factory from 'factory.ts';
import {
  StackScript,
  UserDefinedField,
} from '@linode/api-v4/lib/stackscripts/types';

export const stackScriptFactory = Factory.Sync.makeFactory<StackScript>({
  id: Factory.each((i) => i),
  label: 'MySQL',
  images: [],
  user_defined_fields: [],
  is_public: true,
  mine: true,
  user_gravatar_id: 'ead4da00f4fe6a4bd0b4f11a510c031d',
  username: 'Linode',
  deployments_total: 2,
  deployments_active: 1,
  description: 'Some test script for fun',
  script: 'sudo rm -rf /etc',
  created: '2010-12-31T23:59:58',
  updated: '2010-12-31T23:59:59',
  rev_note: 'Initial import.',
  ordinal: 1, // default value
  logo_url: '', // default value
});

export const userDefinedFieldFactory = Factory.Sync.makeFactory<UserDefinedField>(
  {
    label: Factory.each((i) => `Field${i}`),
    name: Factory.each((i) => `field${i}`),
  }
);
