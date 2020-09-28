import useLibraryContext from "components/context/LibraryContext";
import { fetchCollection } from "dataflow/opds1/fetch";
import extractParam from "dataflow/utils";
import { useRouter } from "next/router";
import useSWR from "swr";

export default function useCollection() {
  const { catalogUrl } = useLibraryContext();
  const { query } = useRouter();
  const collectionUrlParam = extractParam(query, "collectionUrl");
  // use catalog url if you're at home
  const collectionUrl = decodeURIComponent(collectionUrlParam ?? catalogUrl);

  const { data: collection, isValidating } = useSWR(
    collectionUrl,
    fetchCollection
  );

  const isLoading = !collection && isValidating;

  return {
    isLoading,
    collection
  };
}
