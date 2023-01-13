export const filterUrls = (inputs: string[]) => {
  return inputs.filter((input) => {
    try {
      new URL(input);
      return true;
    } catch (err) {
      console.warn(`"${input}" is not a valid URL`);
      return false;
    }
  });
};
