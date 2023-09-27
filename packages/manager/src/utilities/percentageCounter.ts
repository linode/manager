export const initializePercentageCounter = (duration: number) => {
  let startTimestamp: number;
  let animationFrameId: number;
  let percentage: number = 0;
  let onUpdate: (percentage: number) => void;

  const animatePercentage = (timestamp: number) => {
    if (!startTimestamp) {
      startTimestamp = timestamp;
    }

    const progress = timestamp - startTimestamp;
    percentage = Math.min(100, (progress / duration) * 100);
    onUpdate(percentage);

    if (percentage < 100) {
      animationFrameId = requestAnimationFrame(animatePercentage);
    }
  };

  const startAnimation = (updateCallback: (percentage: number) => void) => {
    onUpdate = updateCallback;
    animationFrameId = requestAnimationFrame(animatePercentage);
  };

  const stopAnimation = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  };

  return { startAnimation, stopAnimation };
};
