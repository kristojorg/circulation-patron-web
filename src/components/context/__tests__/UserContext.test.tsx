/* eslint-disable camelcase */
import * as React from "react";
import { AuthCredentials, OPDS1 } from "interfaces";
import fetchMock from "jest-fetch-mock";
import { act, render } from "test-utils";
import Cookie from "js-cookie";
import * as router from "next/router";
import useUser from "components/context/UserContext";
/**
 * This file tests both UserContext and useCredentials, as
 * the latter is only used within the former. It doesn't have
 * to pass the user provider in to the render function, because
 * render wraps everything with our ContextProvider already (see text-utils/index)
 */

const mockCookie = Cookie as any;

const credentials: AuthCredentials = {
  token: "some-token",
  methodType: OPDS1.BasicAuthType
};
const str = JSON.stringify;

function expectFetchWithToken(token: string) {
  expect(fetchMock).toHaveBeenCalledWith("/shelf-url", {
    headers: {
      Authorization: token,
      "X-Requested-With": "XMLHttpRequest"
    }
  });
}

const useRouterSpy = jest.spyOn(router, "useRouter");

/**
 * Our custom `render` already wraps passing in components
 * with a UserProvider automatically, so we don't need to
 * pass the component in manually here.
 */
function renderUserContext() {
  return render(<div>child</div>);
}

beforeEach(() => {
  window.location.hash = "";
  useRouterSpy.mockReturnValue({
    query: {},
    replace: jest.fn()
  } as any);
});
/**
 * - sign in sets a token and triggers a fetch
 * - sign out clearns a token and clears data
 * - status works properly
 *
 * - syncs cookies with internal state. IE a change:
 *    - flows to cookie
 *    - calls a rerender
 * - sets cookie scoped to library
 */

test("fetches loans when credentials are present", () => {
  mockCookie.get.mockReturnValueOnce(str(credentials));
  renderUserContext();

  expect(fetchMock).toHaveBeenCalledTimes(1);
  expectFetchWithToken(credentials.token);
});

test("does not fetch loans if no credentials are present", () => {
  mockCookie.get.mockReturnValueOnce(str(null));
  renderUserContext();
  expect(fetchMock).toHaveBeenCalledTimes(0);
});

const mockReplace = jest.fn(() => {
  window.location.hash = "";
});

test("extracts clever tokens from the url", () => {
  window.location.hash = "#access_token=fry6H3" as any;

  useRouterSpy.mockReturnValue({ replace: mockReplace, query: {} } as any);
  renderUserContext();

  expect(Cookie.set).toHaveBeenCalledTimes(1);
  expect(Cookie.set).toHaveBeenCalledWith(
    "CPW_AUTH_COOKIE/null",
    str({ token: "Bearer fry6H3", methodType: OPDS1.CleverAuthType })
  );
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expectFetchWithToken("Bearer fry6H3");

  // mock the router
  expect(mockReplace).toHaveBeenCalledTimes(1);
  expect(mockReplace).toHaveBeenCalledWith(
    "http://test-domain.com/",
    undefined,
    { shallow: true }
  );
});

test("extracts SAML tokens from the url", () => {
  useRouterSpy.mockReturnValue({
    replace: mockReplace,
    query: { access_token: "saml-token" }
  } as any);
  renderUserContext();

  expect(Cookie.set).toHaveBeenCalledTimes(1);
  expect(Cookie.set).toHaveBeenCalledWith(
    "CPW_AUTH_COOKIE/null",
    str({ token: "Bearer saml-token", methodType: OPDS1.SamlAuthType })
  );

  expect(fetchMock).toHaveBeenCalledTimes(1);
  expectFetchWithToken("Bearer saml-token");

  expect(mockReplace).toHaveBeenCalledWith(
    "http://test-domain.com/",
    undefined,
    { shallow: true }
  );
});

test("sign out clears cookies", async () => {
  mockCookie.get.mockReturnValueOnce(str(credentials));
  let extractedSignOut: any = null;
  function Extractor() {
    const { signOut } = useUser();
    extractedSignOut = signOut;
    return <div>hello</div>;
  }
  render(<Extractor />);

  // make sure fetch was called and you have the right data
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expectFetchWithToken(credentials.token);

  // now sign out
  act(() => {
    extractedSignOut();
  });

  // should have removed cookie
  expect(Cookie.remove).toHaveBeenCalledTimes(1);
  expect(Cookie.remove).toHaveBeenCalledWith("CPW_AUTH_COOKIE/null");
});
