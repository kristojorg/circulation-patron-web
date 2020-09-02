import * as React from "react";
import { AuthMethod } from "opds-web-client/lib/interfaces";
import { AuthButtonProps } from "opds-web-client/lib/components/AuthProviderSelectionForm";
import { useActions } from "opds-web-client/lib/components/context/ActionsContext";
import { AnchorButton } from "components/Button";

import { modalButtonStyles } from "components/Modal";

const CleverButton: React.FC<AuthButtonProps<AuthMethod>> = ({ provider }) => {
  const { actions, dispatch } = useActions();

  const currentUrl = window.location.origin + window.location.pathname;

  const imageUrl = (provider?.method.links || []).find(
    link => link.rel === "logo"
  )?.href;
  // double encoding is required for unshortened book urls to be redirected to properly
  const authUrl = `${
    (provider?.method.links || []).find(link => link.rel === "authenticate")
      ?.href
  }&redirect_uri=${encodeURIComponent(encodeURIComponent(currentUrl))}`;

  return authUrl ? (
    <AnchorButton
      href={authUrl}
      onClick={() =>
        dispatch(
          actions.saveAuthCredentials({
            provider: "Clever",
            credentials: ""
          })
        )
      }
      type="submit"
      sx={{
        ...modalButtonStyles,
        color: "#ffffff",
        backgroundColor: "#2f67aa",
        backgroundImage: `url(${imageUrl})`
      }}
      aria-label="Log In with Clever"
    >
      {!imageUrl ? "Log In With Clever" : ""}
    </AnchorButton>
  ) : null;
};

export default CleverButton;
