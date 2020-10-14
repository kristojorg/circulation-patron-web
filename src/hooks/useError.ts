import { ServerError } from "errors";
import * as React from "react";

/**
 * Parses error objects, keeps them in state and tracks them
 */
export default function useError() {
  const [error, setError] = React.useState<null | string>(null);

  // for network errors
  function handleError(e: any) {
    // TODO: track error to bugsnag
    if (e instanceof ServerError) {
      setError(`Error: ${e.info.detail}`);
      return;
    }
    if (e instanceof Error) {
      setError(`Error: ${e.message}`);
      return;
    }
    console.error(e);
    setError("An unknown error occurred.");
  }

  // for internal error states we don't need to track
  function setErrorString(str: string) {
    setError(str);
  }

  function clearError() {
    setError(null);
  }

  return {
    error,
    handleError,
    setErrorString,
    clearError
  };
}
