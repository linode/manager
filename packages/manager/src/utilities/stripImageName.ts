export const stripImageName = (images: (null | string)[]) => {
  return images.reduce((acc: string[], image: string) => {
    if (image) {
      acc.push(image.replace('linode/', ''));
    }
    return acc;
  }, []);
};
