import { getAuthUrl } from "../cleverAuthButton";

const provider = {
  id: "http://librarysimplified.org/authtype/OAuth-with-intermediary",
  plugin: {
    type: "http://librarysimplified.org/authtype/OAuth-with-intermediary"
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
});
