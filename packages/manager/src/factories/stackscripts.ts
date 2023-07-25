import {
  StackScript,
  UserDefinedField,
} from '@linode/api-v4/lib/stackscripts/types';
import * as Factory from 'factory.ts';

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

export const userDefinedFieldFactory = Factory.Sync.makeFactory<UserDefinedField>(
  {
    label: Factory.each((i) => `Field${i}`),
    name: Factory.each((i) => `field${i}`),
  }
);
