/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { H1 } from "./Text";
import Stack from "./Stack";
import { CollectionData } from "interfaces";
import ListFilters from "components/ListFilters";

const PageTitle: React.FC<{ collection?: CollectionData }> = ({
  children,
  collection
}) => {
  return (
    <Stack
      direction="column"
      sx={{
        px: [3, 5],
        mt: 4
      }}
    >
      <H1 sx={{ mb: 3 }}>{children}</H1>
      {collection && <ListFilters collection={collection} />}
    </Stack>
  );
};

export default PageTitle;
