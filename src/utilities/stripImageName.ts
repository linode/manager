const stripImageName = (images: string[]) => {
  return images.map((image: string) => {
    return image.replace('linode/', '');
  });
};

export default stripImageName;
  