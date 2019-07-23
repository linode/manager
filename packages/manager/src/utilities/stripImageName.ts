const stripImageName = (images: (string | null)[]) => {
  return images.reduce((acc: string[], image: string) => {
    if (image) {
      acc.push(image.replace('linode/', ''));
    }
    return acc;
  }, []);
};

export default stripImageName;
