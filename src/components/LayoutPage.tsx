import * as React from "react";
import Page from "./Page";
import Layout from "./Layout";
import { AppProps } from "dataflow/withAppProps";

const LayoutPage: React.FC<AppProps> = props => {
  const { children, library, error } = props;

  return (
    <Page library={library} error={error}>
      <Layout>{children}</Layout>
    </Page>
  );
};

export default LayoutPage;
