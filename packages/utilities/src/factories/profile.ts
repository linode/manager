import { Factory } from './factoryProxy';

import type {
  Profile,
  SSHKey,
  SecurityQuestionsData,
  UserPreferences,
} from '@linode/api-v4/lib/profile';

export const profileFactory = Factory.Sync.makeFactory<Profile>({
  authentication_type: 'password',
  authorized_keys: ['foo', 'bar'],
  email: 'mock-user@linode.com',
  email_notifications: false,
  ip_whitelist_enabled: false,
  lish_auth_method: 'keys_only',
  referrals: {
    code: 'XXX',
    completed: 0,
    credit: 0,
    pending: 0,
    total: 0,
    url: 'https://www.linode.com/XXX',
  },
  restricted: false,
  timezone: 'America/New_York',
  two_factor_auth: false,
  uid: 9999,
  user_type: 'default',
  username: 'mock-user',
  verified_phone_number: '+15555555555',
});

export const securityQuestionsFactory =
  Factory.Sync.makeFactory<SecurityQuestionsData>({
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
  });

export const userPreferencesFactory = Factory.Sync.makeFactory<UserPreferences>(
  {
    collapsedSideNavProductFamilies: [],
    desktop_sidebar_open: true,
    sortKeys: {
      'database-order': {
        order: 'asc',
        orderBy: 'created',
      },
      'linodes-landing': {
        order: 'desc',
        orderBy: '_statusPriority',
      },
      volume: {
        order: 'asc',
        orderBy: 'label',
      },
    },
    theme: 'light',
    type_to_confirm: true,
  },
);

export const sshKeyFactory = Factory.Sync.makeFactory<SSHKey>({
  created: '2021-05-21T18:44:02',
  id: Factory.each((id) => id),
  label: Factory.each((id) => `ssh-key-${id}`),
  ssh_key:
    'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC6p4bIK6Cfhy6BLQE7CUcBw6VNxibMsq+v7Y09aLcwkJu7rE7RzgHFwnw09hb1TRI9mZmb/mQaYB44WoA9NK2UMXjK4OXP+vFTk//4M9TIxqKs1oKzoOtZk/Q99gW7bIuVkax3eH4HocZ09IeF1qzM3ff0mY64hy+hD2bd5eEF6oSZZnM8WZqDbTP6jYb/LO0geW18vsueD7+DgEVUODYh7FkQ/HCDyqcGlWvDoJho62u/heOiaZQp25puTCWbNxhSck4GTRIU25febH2xX2OxRp/NRzchS4HvK/iC/mNaLE23gDBN73j/JS+oWwcu7zZk/VN+QUHCPw4fMI6wJdnl',
});
