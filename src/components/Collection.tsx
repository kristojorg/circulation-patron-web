/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { PageLoader } from "../components/LoadingIndicator";
import { ListView, LanesView } from "./BookList";
import Head from "next/head";
import PageTitle from "./PageTitle";
import { Text } from "./Text";
import BreadcrumbBar from "./BreadcrumbBar";
import useCollection from "hooks/useCollection";

export const Collection: React.FC<{
  title?: string;
}> = ({ title }) => {
  const { collection, isLoading } = useCollection();

  const hasLanes = collection?.lanes && collection.lanes.length > 0;
  const hasBooks = collection?.books && collection.books.length > 0;
  const pageTitle = title ?? `Collection: ${collection?.title ?? ""}`;

  return (
    <div
      sx={{
        bg: "ui.gray.lightWarm",
        flex: "1 1 auto",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <BreadcrumbBar />
      <PageTitle>{pageTitle}</PageTitle>
      {isLoading ? (
        <PageLoader />
      ) : hasLanes ? (
        <LanesView lanes={collection?.lanes ?? []} />
      ) : hasBooks ? (
        <ListView books={collection?.books ?? []} />
      ) : (
        <div
          sx={{
            display: "flex",
            flex: "1 1 auto",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Text variant="text.callouts.italic">This collection is empty.</Text>
        </div>
      )}
    </div>
  );
};

export default Collection;
