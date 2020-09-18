import * as React from "react";
import Cookie from "js-cookie";
import { AuthCredentials, OPDS1 } from "interfaces";
import { IS_SERVER } from "utils/env";
import { NextRouter } from "next/router";

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
 * Check for clever auth access token in the browser url
 */
function lookForCleverCredentials(): UrlCredentialsResult {
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

function lookForSamlCredentials(
  router: NextRouter
): AuthCredentials | undefined {
  const { access_token: samlAccessToken } = router.query;
  if (samlAccessToken) {
    return {
      token: `Bearer ${samlAccessToken}`,
      methodType: OPDS1.SamlAuthType
    };
  }
}

type UrlAuthError = { error: string | undefined };
type UrlCredentialsResult = AuthCredentials | UrlAuthError | undefined;
/**
 * Checks for credentials or auth errors embedded
 * in the browser url
 */
export function lookForUrlCredentials(
  router: NextRouter
): UrlCredentialsResult {
  /* TODO: throw error if samlAccessToken and cleverAccessToken exist at the same time as this is an invalid state that shouldn't be reached */

  const clever = lookForCleverCredentials();
  if (clever) return clever;

  const saml = lookForSamlCredentials(router);
  if (saml) return saml;

  return undefined;
}

export default function useCredentials(slug: string | null) {
  const [credentials, set] = React.useState<AuthCredentials | undefined>(
    undefined
  );
  React.useEffect(() => {
    const cookie = getCredentials(slug);
    if (cookie) set(cookie);
  }, [slug]);

  function setCredentials(creds: AuthCredentials) {
    set(creds);
    setAuthCredentials(slug, creds);
  }

  function clear() {
    set(undefined);
    clearCredentials(slug);
  }

  return {
    credentials,
    setCredentials,
    clearCredentials: clear
  };
}
