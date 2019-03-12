import { getStackscripts } from 'src/services/stackscripts';

/**
 * @returns { Linode.Image[] } - a list of public images AKA
 * images that are officially supported by Linode
 *
 * @todo test this
 */
export const filterPublicImages = (images: Linode.Image[]) => {
  return images.filter((image: Linode.Image) => image.is_public);
};

/**
 * filter out all the UDF errors from our error state.
 * To do this, we compare the keys from the error state to our "errorResources"
 * map and return all the errors that don't match the keys in that object
 *
 * @todo test this function
 */
export const filterUDFErrors = (
  errorResources: any,
  errors?: Linode.ApiFieldError[]
) => {
  return !errors
    ? []
    : errors.filter(eachError => {
        return !Object.keys(errorResources).some(
          eachKey => eachKey === eachError.field
        );
      });
};

/**
 * Currently existing Linode account StackScripts. These aren't cloud apps so
 * we will use this list to filter them out.
 */

const LINODE_SCRIPTS = [1, 3, 5, 7, 8, 9, 12, 13];

/**
 * helper function to get Cloud Apps StackScripts
 *
 * for the prototype, all the apps we need are going to be uploaded to
 * Christine Puk's account. Keep in mind that the Linux distros will be missing from this
 * list because we're intentionally not including the distros in this view
 */
export const getCloudApps = (params?: any, filter?: any) =>
  getStackscripts(params, {
    ...filter,
    username: 'capuk'
  }).then(response => {
    return response.data.filter(script => {
      return !LINODE_SCRIPTS.includes(script.id);
    });
  });

export const iconMap = {
  399468: '/assets/Terraria.svg',
  399470: '/assets/Ark@1x.svg',
  399471: '/assets/TF2.svg',
  399465: '/assets/Rust.svg',
  399467: '/assets/GitLab.svg',
  399469: '/assets/Minecraft.svg',
  399466: '/assets/Drupal.svg',
  399464: '/assets/Wireguard.svg',
  399462: '/assets/WooCommerce.svg',
  399457: '/assets/WordPress.svg'
};
