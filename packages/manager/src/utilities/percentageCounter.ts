/**
 * This function provides a mechanism to display a percentage based progress.
 * It helps the user with a better visual indication that an action is still processing.
 * It could be used for instance to display a percentage progress or fill a progress bar.
 *
 * It accepts an arbitrary timer, based on a either a time based action or an estimation a task may take.
 *
 * In the case of an API request, it should only be used for requests that takes a long time, such as One Click Apps StackScripts.
 * The idea behind it is that if the request takes shorter than the timer, then great, otherwise it may stay at 99% a tad longer till resolved.
 * In this case it is purely an approximate visual aid.
 *
 * For the purpose of it being versatile, it avoids hooks so it can be used in any component.
 *
 * @param duration {number}
 * @returns {startAnimation, stopAnimation}
 */
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
    // Here we're upping the percentage to 99 max
    // It provides an indication the request isn't fully complete
    // Since it's an arbitrary timer, we don't want to show 100% while not complete
    // It will appear "Stuck" at 99% till resolved
    const stopAtPercentage = 99;
    percentage = Math.min(stopAtPercentage, (progress / duration) * 100);
    onUpdate(percentage);

    if (percentage < stopAtPercentage) {
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
