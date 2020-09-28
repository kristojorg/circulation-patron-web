import * as React from "react";
import { LibraryData } from "interfaces";
import { LibraryProvider } from "./LibraryContext";
import { Provider as ReakitProvider } from "reakit";
import { ThemeProvider } from "theme-ui";
import makeTheme from "../../theme";
import { LinkUtilsProvider } from "./LinkUtilsContext";
import { UserProvider } from "components/context/UserContext";
import AuthModal from "auth/AuthModal";

type ProviderProps = {
  library: LibraryData;
};
/**
 * Combines all of the apps context provider into a single component for simplicity
 */
const AppContextProvider: React.FC<ProviderProps> = ({ children, library }) => {
  const theme = makeTheme(library.colors);

  return (
    <ThemeProvider theme={theme}>
      <ReakitProvider>
        <LibraryProvider library={library}>
          <LinkUtilsProvider library={library}>
            <UserProvider>
              <AuthModal>{children}</AuthModal>
            </UserProvider>
          </LinkUtilsProvider>
        </LibraryProvider>
      </ReakitProvider>
    </ThemeProvider>
  );
};

export default AppContextProvider;
