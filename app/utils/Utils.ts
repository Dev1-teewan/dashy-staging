// Utility function to compare arrays
export const arraysEqual = (arr1: any[], arr2: any[]): boolean => {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((value, index) => value === arr2[index]);
};

// Utility function to format a number as a currency with always two decimal places
export const formatAmount = (value: number): string => {
  // Split into integer and decimal parts
  const [integerPart, decimalPart] = value.toFixed(2).split(".");

  // Format the integer part with commas
  const formattedIntegerPart = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ","
  );

  // Ensure decimal part always has 2 digits
  return `${formattedIntegerPart}.${decimalPart}`;
};

// Utility function to format a number as a token
export const formatToken = (value: number): string => {
  // Split into integer and decimal parts
  const [integerPart, decimalPart] = value.toFixed(4).split(".");

  // Format the integer part with commas
  const formattedIntegerPart = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ","
  );

  // Determine the formatted decimal part
  let formattedDecimalPart;
  if (decimalPart) {
    // Remove trailing zeros from the decimal part
    const significantDecimal = decimalPart.replace(/0+$/, ""); // Remove trailing zeros
    formattedDecimalPart =
      significantDecimal.length > 0 ? significantDecimal : "00"; // Default to '00' if nothing left
    return `${formattedIntegerPart}.${formattedDecimalPart}`;
  } else {
    // If there is no decimal part, return with two decimal places
    return `${formattedIntegerPart}.00`;
  }
};
