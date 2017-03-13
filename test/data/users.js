export const apiTestUser = {
  username: 'testuser1',
  email: 'example1@domain.com',
  restricted: false,
  password: 'crisprcas9',
};

export const testUser = {
  ...apiTestUser,
  _polling: false,
};

export const users = [
  { ...testUser },
  {
    ...testUser,
    username: 'testuser2',
    email: 'example2@domain.com',
  },
];
