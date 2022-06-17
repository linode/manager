import * as Factory from 'factory.ts';
import { Profile, SecurityQuestionsData } from '@linode/api-v4/lib/profile';

export const profileFactory = Factory.Sync.makeFactory<Profile>({
  uid: 9999,
  username: 'mock-user',
  email: 'mock-user@linode.com',
  timezone: 'Asia/Shanghai',
  referrals: {
    code: 'XXX',
    url: 'https://www.linode.com/XXX',
    total: 0,
    completed: 0,
    pending: 0,
    credit: 0,
  },
  email_notifications: false,
  ip_whitelist_enabled: false,
  lish_auth_method: 'keys_only',
  authorized_keys: [],
  two_factor_auth: false,
  restricted: false,
  authentication_type: 'password',
  verified_phone_number: '+15555555555',
});

export const securityQuestionsFactory = Factory.Sync.makeFactory<SecurityQuestionsData>(
  {
    security_questions: [
      { id: 1, question: 'What city were you born in?', response: null },
      {
        id: 2,
        question: 'What is your oldest sibling\u{2019}s middle name?',
        response: null,
      },
      {
        id: 3,
        question: 'What was the first concert you attended?',
        response: null,
      },
      {
        id: 4,
        question: 'What was the make and model of your first car?',
        response: null,
      },
      {
        id: 5,
        question: 'In what city or town did your parents meet?',
        response: null,
      },
      {
        id: 6,
        question: 'What\u{2019}s your favorite flavor of ice cream?',
        response: null,
      },
    ],
  }
);
