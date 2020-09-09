import { CleverButton, getAuthUrl } from "../cleverAuthButton";

import { render } from "../../../src/test-utils";
import React from "react";

const useRouter = jest.spyOn(require("next/router"), "useRouter");

const provider = {
  id: "http://librarysimplified.org/authtype/OAuth-with-intermediary",
  plugin: {
    type: "http://librarysimplified.org/authtype/OAuth-with-intermediary",
    lookForCredentials: jest.fn(),
    buttonComponent: jest.fn()
  },
  method: {
    type: "http://librarysimplified.org/authtype/OAuth-with-intermediary",
    description: "Clever",
    links: [
      {
        href: "https://testing.com/USOEI/oauth_authenticate?provider=Clever",
        rel: "authenticate"
      }
    ]
  }
};

describe("CleverButton", () => {
  it("constructs proper authUrl", () => {
    expect(getAuthUrl(provider, "/")).toBe(
      "https://testing.com/USOEI/oauth_authenticate?provider=Clever&redirect_uri=%252F"
    );
  });

  it("constructs no authUrl if provider is not defined", () => {
    expect(getAuthUrl(undefined, "/")).toBe("");
  });

  it("constructs no authUrl if currentUrl is an empty string", () => {
    expect(getAuthUrl(provider, "")).toBe("");
  });

  it("when there is an auth provider returns button labeled Log In With Clever", () => {
    const button = render(<CleverButton provider={provider} />);
    const buttonLabelText = button.getByLabelText("Log In with Clever");
    const buttonText = button.getByText("Log In With Clever");
    expect(buttonLabelText).toBeInTheDocument();
    expect(buttonText).toBeInTheDocument();
  });

  it("when there is no auth provider returns empty element", () => {
    const { container } = render(<CleverButton provider={undefined} />);
    expect(container.firstChild).toBeNull();
  });
});
