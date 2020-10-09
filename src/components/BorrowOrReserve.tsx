/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import useBorrow from "hooks/useBorrow";
import Button from "./Button";
import { Text } from "./Text";

const BorrowOrReserve: React.FC<{
  isBorrow: boolean;
  borrowUrl: string;
}> = ({ isBorrow, borrowUrl }) => {
  const {
    isLoading,
    loadingText,
    buttonLabel,
    borrowOrReserve,
    error
  } = useBorrow(isBorrow);
  return (
    <div sx={{ my: 3 }}>
      <Button
        size="lg"
        onClick={() => borrowOrReserve(borrowUrl)}
        loading={isLoading}
        loadingText={loadingText}
      >
        <Text variant="text.body.bold">{buttonLabel}</Text>
      </Button>
      {error && <Text sx={{ color: "ui.error" }}>Error: {error}</Text>}
    </div>
  );
};

export default BorrowOrReserve;
