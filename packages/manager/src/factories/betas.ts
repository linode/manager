import { Beta, AccountBeta } from '@linode/api-v4';
import * as Factory from 'factory.ts';
import { DateTime } from 'luxon';

export const betaFactory = Factory.Sync.makeFactory<Beta>({
  id: Factory.each((i) => `beta-${i}`),
  label: Factory.each((i) => `Beta ${i}`),
  started: DateTime.now().toISO(),
  description:
    'Aliquam erat volutpat.  Nunc eleifend leo vitae magna.  In id erat non orci commodo lobortis.  Proin neque massa, cursus ut, gravida ut, lobortis eget, lacus.  Sed diam.  Praesent fermentum tempor tellus.  Nullam tempus.  Mauris ac felis vel velit tristique imperdiet.  Donec at pede.  Etiam vel neque nec dui dignissim bibendum.  Vivamus id enim.  Phasellus neque orci, porta a, aliquet quis, semper a, massa.  Phasellus purus.  Pellentesque tristique imperdiet tortor.  Nam euismod tellus id erat.',
});

export const accountBetaFactory = Factory.Sync.makeFactory<AccountBeta>({
  id: Factory.each((i) => `beta-${i}`),
  label: Factory.each((i) => `Account Beta ${i}`),
  started: DateTime.now().toISO(),
  description:
    'Aliquam erat volutpat.  Nunc eleifend leo vitae magna.  In id erat non orci commodo lobortis.  Proin neque massa, cursus ut, gravida ut, lobortis eget, lacus.  Sed diam.  Praesent fermentum tempor tellus.  Nullam tempus.  Mauris ac felis vel velit tristique imperdiet.  Donec at pede.  Etiam vel neque nec dui dignissim bibendum.  Vivamus id enim.  Phasellus neque orci, porta a, aliquet quis, semper a, massa.  Phasellus purus.  Pellentesque tristique imperdiet tortor.  Nam euismod tellus id erat.',
  enrolled: DateTime.now().toISO(),
});
