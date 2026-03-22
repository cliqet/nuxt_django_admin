export const useUtility = () => {
  const formatTitle = (str: string) => {
    return str
      .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
      .toLowerCase()         // Optional: normalization to ensure consistent casing
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize every first letter
  };
  
  return {
    formatTitle
  }
}