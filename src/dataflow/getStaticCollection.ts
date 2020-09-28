import { fetchCollection, stripUndefined } from "dataflow/opds1/fetch";
import extractParam from "dataflow/utils";
import withAppProps, { AppProps } from "dataflow/withAppProps";
import { CollectionData } from "interfaces";
import { GetStaticProps } from "next";

export type CollectionPageProps = AppProps & {
  collection?: CollectionData;
};

const getStaticCollection: GetStaticProps<CollectionPageProps> = withAppProps(
  library => async ({ params }) => {
    // get the collection url
    // fetch the data
    // parse the data from XML to JS
    // return props
    const collectionUrl = extractParam(params, "collectionUrl");
    // if there is no collection url, use the catalog root.
    const url = collectionUrl ?? library.catalogUrl;
    console.log("Running getStaticProps with ", url);
    const collection = await fetchCollection(url);
    const withoutUndefined = stripUndefined(collection);
    return {
      props: {
        collection: withoutUndefined
      },
      revalidate: 5
    };
  }
);
export default getStaticCollection;
