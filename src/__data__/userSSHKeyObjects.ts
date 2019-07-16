import { UserSSHKeyObject } from 'src/components/AccessPanel/AccessPanel';

export const user1: UserSSHKeyObject = {
  username: 'user-1',
  selected: false,
  gravatarUrl: 'path/to/avatar',
  keys: ['key1', 'key2'],
  onSSHKeyChange: jest.fn()
};

export const user2: UserSSHKeyObject = {
  username: 'user-2',
  selected: true,
  gravatarUrl: 'path/to/avatar',
  keys: ['key1', 'key2', 'key3'],
  onSSHKeyChange: jest.fn()
};

export const user3: UserSSHKeyObject = {
  username: 'user-3',
  selected: false,
  gravatarUrl: 'path/to/avatar',
  keys: ['key1', 'key2', 'key3', 'key4'],
  onSSHKeyChange: jest.fn()
};

export const users = [user1, user2, user3];
