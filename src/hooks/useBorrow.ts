import * as React from "react";
import { BookData, FulfillmentLink } from "interfaces";
import { fetchBook } from "dataflow/opds1/fetch";
import useUser from "components/context/UserContext";
import useLibraryContext from "components/context/LibraryContext";

export default function useBorrow(
  book: BookData,
  isBorrow: boolean,
  borrowLink: FulfillmentLink
) {
  const { catalogUrl } = useLibraryContext();
  const { refetchLoans } = useUser();
  const isUnmounted = React.useRef(false);
  const [isLoading, setLoading] = React.useState(false);

  const loadingText = isBorrow ? "Borrowing..." : "Reserving...";
  const buttonLabel = isBorrow
    ? borrowLink.indirectType ===
      "application/vnd.librarysimplified.axisnow+json"
      ? "Borrow to read online"
      : "Borrow to read on a mobile device"
    : "Reserve";

  const borrowOrReserve = async (url: string) => {
    setLoading(true);
    try {
      await fetchBook(url, catalogUrl);
      refetchLoans();
    } catch (e) {
      e?.info ? console.log(e.info) : console.log(e);
    }
    if (!isUnmounted.current) setLoading(false);
  };

  React.useEffect(
    () => () => {
      isUnmounted.current = true;
    },
    []
  );

  return {
    isLoading,
    loadingText,
    buttonLabel,
    borrowOrReserve
  };
}
