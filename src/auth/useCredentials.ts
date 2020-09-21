import * as React from "react";
import Cookie from "js-cookie";
import { AuthCredentials, OPDS1 } from "interfaces";
import { IS_SERVER } from "utils/env";
import { NextRouter, useRouter } from "next/router";

type UrlAuthError = { error?: string };
type CredentialResult = (Partial<AuthCredentials> & UrlAuthError) | undefined;

function isValidCredentials(
  result: CredentialResult
): result is AuthCredentials {
  return !!(
    typeof result !== "undefined" &&
    result?.methodType &&
    result?.token
  );
}

function useMemoizedUrlCredentials(router: NextRouter) {
  const result = lookForUrlCredentials(router);
  const { methodType, token, error } = result ?? {};
  const memoizedCreds = React.useMemo(() => ({ methodType, token, error }), [
    methodType,
    token,
    error
  ]);
  return memoizedCreds;
}

export default function useCredentials(slug: string | null) {
  const router = useRouter();
  const [credentials, set] = React.useState<CredentialResult>(undefined);
  const [error, setError] = React.useState<UrlAuthError | undefined>();
  const urlCredentials = useMemoizedUrlCredentials(router);

  React.useEffect(() => {
    const cookie = getCredentials(slug);
    if (cookie) set(cookie);
  }, [slug]);

  const setCredentials = React.useCallback(
    (creds: AuthCredentials) => {
      set(creds);
      setAuthCredentials(slug, creds);
    },
    [set, slug]
  );

  const clear = React.useCallback(() => {
    set(undefined);
    clearCredentials(slug);
  }, [slug]);

  // if you detect credentials or errors in the browser url,
  // set them in the state
  React.useEffect(() => {
    if (isValidCredentials(urlCredentials)) {
      return setCredentials(urlCredentials);
    }
    if (urlCredentials.error) {
      return setError(urlCredentials);
    }
  }, [urlCredentials, setCredentials]);

  return {
    credentials,
    setCredentials,
    clearCredentials: clear,
    error
  };
}

/**
 * If you pass a librarySlug, the cookie will be scoped to the
 * library you are viewing. This is useful in a multi library setup
 */
function cookieName(librarySlug: string | null): string {
  const AUTH_COOKIE_NAME = "CPW_AUTH_COOKIE";
  return `${AUTH_COOKIE_NAME}/${librarySlug}`;
}

/**
 * We do not parse this into an object here
 * because we want it to stay a string so that
 * it passes === if it doesn't change.
 */
function getCredentials(
  librarySlug: string | null
): AuthCredentials | undefined {
  const credentials = Cookie.get(cookieName(librarySlug));
  return credentials ? JSON.parse(credentials) : undefined;
}

function setAuthCredentials(
  librarySlug: string | null,
  credentials: AuthCredentials
) {
  Cookie.set(cookieName(librarySlug), JSON.stringify(credentials));
}

function clearCredentials(librarySlug: string | null) {
  Cookie.remove(cookieName(librarySlug));
}

export function generateToken(username: string, password: string) {
  const btoaStr = btoa(`${username}:${password}`);
  return `Basic ${btoaStr}`;
}

/**
 * Extracting Credentials from the URL after an external
 * login attempt
 */

export function lookForUrlCredentials(router: NextRouter): CredentialResult {
  // we only do this client side
  if (IS_SERVER) return undefined;

  /* TODO: throw error if samlAccessToken and cleverAccessToken exist at the same time as this is an invalid state that shouldn't be reached */

  const clever = lookForCleverCredentials();
  if (clever) return clever;

  const saml = lookForSamlCredentials(router);
  if (saml) return saml;

  return undefined;
}

// check for clever credentials
function lookForCleverCredentials(): CredentialResult {
  if (!IS_SERVER) {
    const accessTokenKey = "access_token=";
    const errorKey = "error=";
    if (window?.location?.hash) {
      if (window.location.hash.indexOf(accessTokenKey) !== -1) {
        const hash = window.location.hash;
        const accessTokenStart = hash.indexOf(accessTokenKey);
        const accessToken = hash
          .slice(accessTokenStart + accessTokenKey.length)
          .split("&")[0];
        const token = `Bearer ${accessToken}`;
        return { token, methodType: OPDS1.CleverAuthType };
      } else if (window.location.hash.indexOf(errorKey) !== -1) {
        const hash = window.location.hash;
        const errorStart = hash.indexOf(errorKey);
        const error = hash.slice(errorStart + errorKey.length).split("&")[0];
        const problemDetail = JSON.parse(
          decodeURIComponent(error.replace(/\+/g, "%20"))
        );
        window.location.hash = "";
        return {
          error:
            problemDetail?.title ?? "An unknown Clever Auth error occurred."
        };
      }
    }
  }
}

// check for saml credentials
function lookForSamlCredentials(
  router: NextRouter
): AuthCredentials | undefined {
  const { access_token: samlAccessToken } = router.query;
  if (samlAccessToken) {
    // clear the browser query
    if (!IS_SERVER) {
      router.replace(
        window.location.href.replace(window.location.search, ""),
        undefined,
        { shallow: true }
      );
    }
    return {
      token: `Bearer ${samlAccessToken}`,
      methodType: OPDS1.SamlAuthType
    };
  }
}
