/**
 * returns either the Image label or "Unknown Image," depending on whether the image can
 * be found in the API data
 * 
 * If no slug is available, returns "no image."
 *  
 * @param { Linode.Image[] } images - list of Linode Images, both deprecated and non-deprecated
 * @param { string | null } slug - image slug that belongs to the Linode instance
 */
export const safeGetImageLabel = (images: Linode.Image[], slug: string | null): string => {
  if (!slug) {
    return 'No Image'
  }
  const iv = images.find((i) => i.id === slug);
  return iv ? iv.label : 'Unknown Image';
};