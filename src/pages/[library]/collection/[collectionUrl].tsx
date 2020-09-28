import * as React from "react";
import Collection from "components/Collection";
import { GetStaticPaths, InferGetStaticPropsType } from "next";
import LayoutPage from "components/LayoutPage";
import getStaticCollection from "dataflow/getStaticCollection";

export const getStaticProps = getStaticCollection;

const CollectionPage = ({
  library,
  error,
  collection
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <LayoutPage library={library} error={error}>
      <Collection collection={collection} />
    </LayoutPage>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true
  };
};

export default CollectionPage;
