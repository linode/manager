import { UserDefinedField } from '@linode/api-v4/lib/stackscripts';

export const UserDefinedFields: UserDefinedField[] = [
  {
    default: '',
    example: 'The password you use to login with Wordpress',
    label: 'Wordpress root password',
    name: 'wordpress_password',
  },
  {
    default: 'username default',
    example: 'The user you use to login with Wordpress',
    label: 'Wordpress user',
    name: 'wordpress_username',
  },
  {
    default: 'Latest Drupal 8',
    label: 'Drupal Version',
    name: 'drupal_version',
    oneof: 'Latest Drupal 8,Latest Drupal 7',
  },
  {
    default: 'rails,mysql',
    label: 'Gems to install',
    manyof: 'rails,mysql,passenger,rcov',
    name: 'gems_to_install',
  },
];
