/**
 * @file Integration tests for account security questions.
 */

import { randomLabel, randomString } from 'support/util/random';
import { mockGetProfile } from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { assertToast } from 'support/ui/events';

describe('Account security questions', () => {
  it('can set account security questions for the first time', () => {});

  it('can update account security questions', () => {});

  // @TODO Consider moving to TFA tests once they are written.
  // @TODO Consider ways to test this with real API calls.
  it('cannot enable or reset TFA without security questions', () => {});
});
