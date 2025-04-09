/* eslint-disable xss/no-mixed-html */

export const community_question = {
  _highlightResult: {
    title: {
      value: '<em>This</em> is a community question.',
    },
  },
  description: 'Short description',
  objectID: 'q_98',
  title: 'This is a community question.',
};

export const community_answer = {
  _highlightResult: {
    description: {
      value: '<em>Short</em> description.',
    },
  },
  description: 'Short description',
  objectID: 'a_98',
};

export const docs_result = {
  _highlightResult: {
    title: {
      value: '<em>Update</em> and Secure Drupal 8 on Ubunto or Debian',
    },
  },
  href: '/docs/websites/cms/update-and-secure-drupal-8-on-ubuntu/',
  objectID: '123456',
  title: 'Update and Secure Drupal 8 on Ubuntu or Debian',
};

export const searchbarResult1 = {
  data: {
    created: '2021-01-01',
    description: 'Description',
    icon: 'LinodeIcon',
    path: `/nodebalancers/nodebalID`,
    region: 'us-east',
    searchText: 'result',
    tags: [],
  },
  entityType: 'linode' as any,
  label: 'result1',
  value: '111111',
};

export const searchbarResult2 = {
  data: {
    created: '2021-01-01',
    description: 'Description',
    icon: 'NodebalIcon',
    path: `/nodebalancers/nodebalID`,
    region: 'us-east',
    searchText: 'result',
    tags: ['tag1', 'tag2'],
  },
  label: 'result2',
  value: '222222',
};
