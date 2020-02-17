/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import useTypedSelector from "../hooks/useTypedSelector";
import { SetCollectionAndBook } from "../interfaces";
import useSetCollectionAndBook from "../hooks/useSetCollectionAndBook";
import { connect } from "react-redux";
import {
  mapStateToProps,
  mapDispatchToProps,
  mergeRootProps
} from "opds-web-client/lib/components/mergeRootProps";
import { PageLoader } from "../components/LoadingIndicator";
import useNormalizedCollection from "../hooks/useNormalizedCollection";
import { Helmet } from "react-helmet-async";
import { GalleryView, LanesView } from "./BookList";

const Collection: React.FC<{ setCollectionAndBook: SetCollectionAndBook }> = ({
  setCollectionAndBook
}) => {
  useSetCollectionAndBook(setCollectionAndBook);

  // the first hook just provides the collection, the second subs in loaned book data if existing
  const collection = useTypedSelector(state => state.collection);
  const collectionData = useNormalizedCollection();

  if (collection.isFetching) {
    return <PageLoader />;
  }

  const hasLanes = (collectionData?.lanes?.length ?? 0) > 0;
  const hasBooks = (collectionData?.books?.length ?? 0) > 0;

  if (hasLanes) {
    const lanes = collectionData?.lanes ?? [];
    return (
      <div>
        <Helmet>
          <title>{collectionData.title}</title>
        </Helmet>
        <LanesView lanes={lanes} />
      </div>
    );
  } else if (hasBooks) {
    const books = collectionData?.books ?? [];
    return <GalleryView books={books} />;
  }

  // otherwise it is empty
  return (
    <div
      sx={{
        display: "flex",
        flex: "1 1 auto",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Styled.h3 sx={{ color: "primaries.medium", fontStyle: "italic" }}>
        This collection is empty.
      </Styled.h3>
    </div>
  );
};

const Connected = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeRootProps
)(Collection);

// // we have to do this due to a typing error in react-router-dom
const Wrapper = props => <Connected {...props} />;
export default Wrapper;
