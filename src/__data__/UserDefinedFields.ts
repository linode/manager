export const UserDefinedFields: Linode.StackScript.UserDefinedField[] = [
  {
    label: 'Wordpress root password',
    name: 'wordpress_password',
    example: 'The password you use to login with Wordpress',
    default: ''
  },
  {
    label: 'Wordpress user',
    name: 'wordpress_username',
    example: 'The user you use to login with Wordpress',
    default: 'username default'
  },
  {
    label: 'Drupal Version',
    name: 'drupal_version',
    default: 'Latest Drupal 8',
    oneof: 'Latest Drupal 8,Latest Drupal 7'
  },
  {
    label: 'Gems to install',
    name: 'gems_to_install',
    manyof: 'rails,mysql,passenger,rcov',
    default: 'rails,mysql'
  }
];
