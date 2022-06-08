import * as Factory from 'factory.ts';
import {
  Profile,
  PhoneNumberVerificationCode,
  SecurityQuestions,
  SecurityQuestion,
} from '@linode/api-v4/lib/profile';

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
  phone_number: '+15555555555',
});

export const phoneNumberVerificationCodeFactory = Factory.Sync.makeFactory<PhoneNumberVerificationCode>(
  {
    otp_code: Factory.each((i) => 10000 + i),
  }
);

export const securityQuestionsFactory = Factory.Sync.makeFactory<
  SecurityQuestions<SecurityQuestion>
>({
  security_questions: [
    {
      id: 1,
      question: 'What city were you born in?',
    },
    {
      id: 2,
      question: 'What is your oldest sibling’s middle name?',
    },
    {
      id: 3,
      question: 'What was the first concert you attended?',
    },
  ],
});
