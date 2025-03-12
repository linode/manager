import { DateTime } from 'luxon';

import { Factory } from '@linode/utilities';

import type { AccountBeta, Beta } from '@linode/api-v4';

export const betaFactory = Factory.Sync.makeFactory<Beta>({
  description:
    'Aliquam erat volutpat.  Nunc eleifend leo vitae magna.  In id erat non orci commodo lobortis.  Proin neque massa, cursus ut, gravida ut, lobortis eget, lacus.  Sed diam.  Praesent fermentum tempor tellus.  Nullam tempus.  Mauris ac felis vel velit tristique imperdiet.  Donec at pede.  Etiam vel neque nec dui dignissim bibendum.  Vivamus id enim.  Phasellus neque orci, porta a, aliquet quis, semper a, massa.  Phasellus purus.  Pellentesque tristique imperdiet tortor.  Nam euismod tellus id erat.',
  id: Factory.each((i) => `beta-${i}`),
  label: Factory.each((i) => `Beta ${i}`),
  started: DateTime.now().toISO(),
});

export const accountBetaFactory = Factory.Sync.makeFactory<AccountBeta>({
  description:
    'Aliquam erat volutpat.  Nunc eleifend leo vitae magna.  In id erat non orci commodo lobortis.  Proin neque massa, cursus ut, gravida ut, lobortis eget, lacus.  Sed diam.  Praesent fermentum tempor tellus.  Nullam tempus.  Mauris ac felis vel velit tristique imperdiet.  Donec at pede.  Etiam vel neque nec dui dignissim bibendum.  Vivamus id enim.  Phasellus neque orci, porta a, aliquet quis, semper a, massa.  Phasellus purus.  Pellentesque tristique imperdiet tortor.  Nam euismod tellus id erat.',
  ended: null,
  enrolled: DateTime.now().toISO(),
  id: Factory.each((i) => `beta-${i}`),
  label: Factory.each((i) => `Account Beta ${i}`),
  started: DateTime.now().toISO(),
});
