/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { useDialogState, DialogDisclosure } from "reakit/Dialog";
import useLibraryContext from "../components/context/LibraryContext";
import Modal, { modalButtonStyles } from "../components/Modal";
import ClientOnly from "../components/ClientOnly";
import { H2, Text } from "../components/Text";
import FormLabel from "../components/form/FormLabel";
import Select from "../components/Select";
import Stack from "../components/Stack";
import { AppAuthMethod, OPDS1 } from "interfaces";
import BasicAuthForm from "auth/BasicAuthForm";
import SamlAuthButton from "auth/SamlAuthButton";
import CleverButton from "auth/cleverAuthButton";
import { AuthFormProvider } from "auth/AuthFormCotext";
import useUser from "components/context/UserContext";
import LoadingIndicator from "components/LoadingIndicator";
import {
  basicAuthMethod,
  cleverAuthMethod,
  createSamlMethod
} from "test-utils/fixtures";
import Button from "components/Button";

const methods: AppAuthMethod[] = [
  basicAuthMethod,
  cleverAuthMethod,
  createSamlMethod(0),
  createSamlMethod(1)
  // createSamlMethod(2)
];

const AuthForm: React.FC = ({ children }) => {
  const dialog = useDialogState();
  const { hide } = dialog;
  const { catalogName } = useLibraryContext();
  const authMethods = methods;
  const { isAuthenticated, isLoading } = useUser();

  /**
   * If the user becomes authenticated, we can hide the form
   */
  React.useEffect(() => {
    if (isAuthenticated) hide();
  }, [isAuthenticated, hide]);

  /**
   * The options:
   *  - We are authenticating the user, show a loading indicator
   *  - No auth methods available. Tell the user.
   *  - There is only one method. Show the form for that one.
   *  - There are 1-5 methods. Show a button for each.
   *  - There are >5 methods. Show a combobox selector.
   */
  const formStatus = isLoading
    ? "loading"
    : authMethods.length === 0
    ? "no-auth"
    : authMethods.length === 1
    ? "single-auth"
    : authMethods.length < 5
    ? "buttons"
    : "combobox";

  return (
    <React.Fragment>
      <ClientOnly>
        <Modal
          isVisible={dialog.visible}
          hide={dialog.hide}
          label="Sign In Form"
          dialog={dialog}
          sx={{ p: 5 }}
        >
          <div sx={{ textAlign: "center", p: 0 }}>
            <H2>{catalogName}</H2>
            <h4>Login</h4>
          </div>
          {formStatus === "loading" ? (
            <Loading />
          ) : formStatus === "no-auth" ? (
            <NoAuth />
          ) : formStatus === "single-auth" ? (
            <SignInForm method={authMethods[0]} />
          ) : formStatus === "combobox" ? (
            <Combobox authMethods={authMethods} />
          ) : (
            <Buttons authMethods={authMethods} />
          )}

          {/* <Button
            onClick={() =>
              authProvider && (visibleProviders?.length ?? 0) > 1
                ? cancelGoBackToAuthSelection()
                : typeof cancel === "function" && cancel()
            }
            sx={{
              ...modalButtonStyles
            }}
            variant="ghost"
          >
            Cancel
          </Button> */}
        </Modal>
      </ClientOnly>
      {/* We render this to provide the dialog a focus target after it closes
          even though we don't open the dialog with a button
      */}
      <DialogDisclosure sx={{ display: "none" }} {...dialog} />
      <AuthFormProvider showForm={dialog.show}>{children}</AuthFormProvider>
    </React.Fragment>
  );
};

const Loading: React.FC = () => {
  return (
    <Stack
      sx={{
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <LoadingIndicator size={18} />
      <Text>Logging in...</Text>
    </Stack>
  );
};

/**
 * Renders a form if there is one, or a button, or tells
 * the user that the auth method is not supported.
 */
const SignInForm: React.FC<{
  method: AppAuthMethod;
  goBackToSelection?: () => void;
}> = ({ method, goBackToSelection: _ }) => {
  switch (method.type) {
    case OPDS1.BasicAuthType:
      return <BasicAuthForm method={method} />;
    case OPDS1.SamlAuthType:
      return <SamlAuthButton method={method} />;
    case OPDS1.CleverAuthType:
      return <CleverButton method={method} />;
    default:
      return <p>This authentication method is not supported.</p>;
  }
};

const NoAuth: React.FC = () => {
  return <div>No auth configured</div>;
};

const Buttons: React.FC<{
  authMethods: AppAuthMethod[];
}> = ({ authMethods }) => {
  const [selectedMethod, setSelectedMethod] = React.useState<
    AppAuthMethod | undefined
  >(undefined);

  const handleChangeMethod = (type: string) => {
    const method = authMethods.find(method => method.type === type);
    if (method) setSelectedMethod(method);
  };

  const cancelSelection = () => setSelectedMethod(undefined);

  return (
    <Stack direction="column">
      {!selectedMethod &&
        authMethods.map(method => {
          switch (method.type) {
            case OPDS1.BasicAuthType:
              return (
                <Button
                  key={method.type}
                  sx={{ ...modalButtonStyles }}
                  onClick={() => handleChangeMethod(OPDS1.BasicAuthType)}
                >
                  Login with {method.description ?? "Basic Auth"}
                </Button>
              );
            case OPDS1.SamlAuthType:
              return <SamlAuthButton method={method} key={method.type} />;
            case OPDS1.CleverAuthType:
              return <CleverButton method={method} key={method.type} />;
            default:
              return null;
          }
        })}
      {selectedMethod && (
        <Stack direction="column">
          <SignInForm method={selectedMethod} />
          <Button
            onClick={cancelSelection}
            variant="ghost"
            color="ui.gray.dark"
            sx={{ alignSelf: "center" }}
          >
            Back to selection
          </Button>
        </Stack>
      )}
    </Stack>
  );
};

const Combobox: React.FC<{
  authMethods: AppAuthMethod[];
}> = ({ authMethods }) => {
  const [selectedMethod, setSelectedMethod] = React.useState<AppAuthMethod>(
    authMethods[0]
  );

  const handleChangeMethod = (type: string) => {
    const method = authMethods.find(method => method.type === type);
    if (method) setSelectedMethod(method);
  };

  return (
    <div sx={{ mb: 2 }}>
      <FormLabel htmlFor="login-method-select">Login Method</FormLabel>
      <Select
        id="login-method-select"
        onChange={e => handleChangeMethod(e.target.value)}
      >
        {authMethods?.map(method => (
          <option key={method.type} value={method.type}>
            {method.description}
          </option>
        ))}
      </Select>
      <SignInForm method={selectedMethod} />
    </div>
  );
};

export default AuthForm;
