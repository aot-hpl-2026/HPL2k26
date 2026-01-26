import validator from "validator";

export const isValidUrl = (value) => {
  if (!value) return true;
  return validator.isURL(value, { require_protocol: true });
};

export const ensureValidUrl = (value, label) => {
  if (!isValidUrl(value)) {
    const error = new Error(`${label} must be a valid URL with protocol`);
    error.status = 400;
    throw error;
  }
};
