import * as Factory from 'factory.ts';
import {
  Profile,
  SecurityQuestionsData,
  UserPreferences,
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
  verified_phone_number: '+15555555555',
});

export const securityQuestionsFactory = Factory.Sync.makeFactory<SecurityQuestionsData>(
  {
    security_questions: [
      { id: 1, question: 'In what city were you born?', response: null },
      {
        id: 2,
        question: 'What is the name of your oldest sibling?',
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
        question:
          'What is the name of a college you applied to but did not attend?',
        response: null,
      },
      {
        id: 7,
        question: 'Where did you go on your most memorable school field trip?',
        response: null,
      },
      {
        id: 8,
        question: 'What is the name of the teacher who impacted you the most?',
        response: null,
      },
      {
        id: 9,
        question: 'Which city did you visit on your first airplane flight?',
        response: null,
      },
      {
        id: 10,
        question: 'On what street did your best friend in high school live?',
        response: null,
      },
      {
        id: 11,
        question: 'What is the name of your favorite city?',
        response: null,
      },
      {
        id: 12,
        question: 'What is your favorite artist of all time?',
        response: null,
      },
      {
        id: 13,
        question: 'What is the maiden name of your grandmother?',
        response: null,
      },
      {
        id: 14,
        question: 'What is the name of your first roommate?',
        response: null,
      },
      {
        id: 15,
        question: 'In what city or town was your first job?',
        response: null,
      },
      {
        id: 16,
        question: 'Who is your favorite author?',
        response: null,
      },
      {
        id: 17,
        question: 'What is the name of the hospital you were born in?',
        response: null,
      },
      {
        id: 18,
        question: 'What sports team do you love to see lose?',
        response: null,
      },
      {
        id: 19,
        question: 'On what street is your grocery store?',
        response: null,
      },
    ],
  }
);

export const userPreferencesFactory = Factory.Sync.makeFactory<UserPreferences>(
  {
    desktop_sidebar_open: true,
    type_to_confirm: true,
    theme: 'light',
    sortKeys: {
      'linodes-landing': {
        order: 'desc',
        orderBy: '_statusPriority',
      },
      'database-order': {
        order: 'asc',
        orderBy: 'created',
      },
      volume: {
        order: 'asc',
        orderBy: 'label',
      },
    },
  }
);
