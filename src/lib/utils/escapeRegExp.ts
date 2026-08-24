/**
 * Escapes a user-supplied string for use inside a RegExp.
 *
 * Search input was being interpolated into `new RegExp()` verbatim, so typing
 * a single "(" or "[" threw and blanked the results.
 */
const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default escapeRegExp;
