/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import {
  getFulfillmentState,
  availabilityString,
  queueString,
  bookIsAudiobook
} from "utils/book";
import Button, { NavButton } from "../Button";
import withErrorBoundary from "../ErrorBoundary";
import Stack from "components/Stack";
import { Text } from "components/Text";
import { MediumIcon } from "components/MediumIndicator";
import SvgExternalLink from "icons/ExternalOpen";
import SvgDownload from "icons/Download";
import SvgPhone from "icons/Phone";
import useIsBorrowed from "hooks/useIsBorrowed";
import BorrowOrReserve from "components/BorrowOrReserve";
import { BookData, FulfillmentLink } from "interfaces";
import {
  dedupeLinks,
  DownloadDetails,
  getFulfillmentDetails,
  ReadExternalDetails,
  ReadInternalDetails,
  shouldRedirectToCompanionApp
} from "utils/fulfill";
import useDownloadButton from "hooks/useDownloadButton";
import useReadOnlineButton from "hooks/useReadOnlineButton";
import { APP_CONFIG } from "config";

const FulfillmentCard: React.FC<{ book: BookData }> = ({ book }) => {
  return (
    <div
      aria-label="Borrow and download card"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        color: "ui.gray.extraDark"
      }}
    >
      <FulfillmentContent book={book} />
    </div>
  );
};

const FulfillmentContent: React.FC<{
  book: BookData;
}> = ({ book }) => {
  const isBorrowed = useIsBorrowed(book);
  const fulfillmentState = getFulfillmentState(book, isBorrowed);

  switch (fulfillmentState) {
    case "AVAILABLE_OPEN_ACCESS":
      if (!book.openAccessLinks)
        throw new Error("This open-access book is missing open access links");
      return (
        <AccessCard
          links={book.openAccessLinks}
          book={book}
          subtitle="This open-access book is available to keep forever."
        />
      );

    case "AVAILABLE_TO_BORROW": {
      return (
        <BorrowOrReserveBlock
          title="This book is available to borrow!"
          subtitle={
            <>
              <MediumIcon book={book} sx={{ mr: 1 }} />{" "}
              {availabilityString(book)}
            </>
          }
          borrowUrl={book.borrowUrl}
          isBorrow={true}
        />
      );
    }

    case "AVAILABLE_TO_RESERVE": {
      return (
        <BorrowOrReserveBlock
          title="This book is currently unavailable."
          subtitle={
            <>
              <MediumIcon book={book} sx={{ mr: 1 }} />{" "}
              {availabilityString(book)}
              {typeof book.holds?.total === "number" &&
                ` ${book.holds.total} patrons in the queue.`}
            </>
          }
          borrowUrl={book.borrowUrl}
          isBorrow={false}
        />
      );
    }

    case "RESERVED":
      return <Reserved book={book} />;

    case "READY_TO_BORROW": {
      const availableUntil = book.availability?.until
        ? new Date(book.availability.until).toDateString()
        : "NaN";

      const title = "You can now borrow this book!";
      const subtitle =
        availableUntil !== "NaN"
          ? `Your hold will expire on ${availableUntil}. ${queueString(book)}`
          : "You must borrow this book before your loan expires.";

      return (
        <BorrowOrReserveBlock
          title={title}
          subtitle={subtitle}
          borrowUrl={book.borrowUrl}
          isBorrow={true}
        />
      );
    }

    case "AVAILABLE_TO_ACCESS": {
      if (!book.fulfillmentLinks)
        throw new Error(
          "This available-to-access book is missing fulfillment links."
        );

      const availableUntil = book.availability?.until
        ? new Date(book.availability.until).toDateString()
        : "NaN";

      const subtitle =
        availableUntil !== "NaN"
          ? `You have this book on loan until ${availableUntil}.`
          : "You have this book on loan.";
      return (
        <AccessCard
          links={book.fulfillmentLinks}
          book={book}
          subtitle={subtitle}
        />
      );
    }

    case "FULFILLMENT_STATE_ERROR":
      return <ErrorCard />;
  }
};

const BorrowOrReserveBlock: React.FC<{
  title: string;
  subtitle: React.ReactNode;
  isBorrow: boolean;
  borrowUrl: string | null;
}> = ({ title, subtitle, isBorrow, borrowUrl }) => {
  if (!borrowUrl) {
    // TODO: track a bugsnag error. Shouldn't have ended up here
    return <Text>This book cannot be borrowed at this time.</Text>;
  }
  return (
    <Stack direction="column" spacing={0} sx={{ my: 3 }}>
      <Text variant="text.body.bold">{title}</Text>
      <Text
        variant="text.body.italic"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          textAlign: "center"
        }}
      >
        {subtitle}
      </Text>
      <BorrowOrReserve borrowUrl={borrowUrl} isBorrow={isBorrow} />
    </Stack>
  );
};

const Reserved: React.FC<{ book: BookData }> = ({ book }) => {
  const position = book.holds?.position;
  return (
    <>
      <Text variant="text.callouts.bold">You have this book on hold.</Text>
      {!!position && (
        <Text
          variant="text.body.italic"
          sx={{ display: "inline-flex", alignItems: "center" }}
        >
          <MediumIcon book={book} sx={{ mr: 1 }} />
          Your hold position is: {position}.
        </Text>
      )}
      <Button size="lg" disabled aria-label="Reserved" role="button">
        <Text variant="text.body.bold">Reserved</Text>
      </Button>
    </>
  );
};

const ErrorCard: React.FC = () => {
  return (
    <>
      <Text variant="text.callouts.bold">
        There was an error processing this book.
      </Text>
      <Text
        variant="text.body.italic"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          textAlign: "center"
        }}
      >
        We are unable to show you the book&apos;s availability. Try refreshing
        your page. If the problem persists, please contact library support.
      </Text>
    </>
  );
};

/**
 * Handles the case where it is ready for access either via openAccessLink or
 * via fulfillmentLink.
 */
const AccessCard: React.FC<{
  book: BookData;
  links: FulfillmentLink[];
  subtitle: string;
}> = ({ book, links, subtitle }) => {
  const { title } = book;
  const dedupedLinks = dedupeLinks(links);
  const fulfillments = dedupedLinks
    .map(getFulfillmentDetails)
    .filter(details => details.type !== "unsupported");

  const isFulfillable = fulfillments.length > 0;

  const isAudiobook = bookIsAudiobook(book);
  const redirectUser = shouldRedirectToCompanionApp(links);

  return (
    <Stack direction="column" sx={{ my: 3 }}>
      <AccessHeading
        redirectToCompanionApp={redirectUser}
        subtitle={subtitle}
      />
      {!isAudiobook && isFulfillable && (
        <>
          {redirectUser && (
            <Text variant="text.body.italic">
              If you would rather read on your computer, you can:
            </Text>
          )}
          <Stack sx={{ flexWrap: "wrap" }}>
            {fulfillments.map(details => {
              switch (details.type) {
                case "download":
                  return (
                    <DownloadButton
                      details={details}
                      title={title}
                      key={details.id}
                      isPrimaryAction={!redirectUser}
                    />
                  );
                case "read-online-internal":
                  return (
                    <ReadOnlineInternal
                      details={details}
                      key={details.url}
                      isPrimaryAction={!redirectUser}
                    />
                  );
                case "read-online-external":
                  return (
                    <ReadOnlineExternal
                      details={details}
                      key={details.id}
                      isPrimaryAction={!redirectUser}
                    />
                  );
              }
            })}
          </Stack>
        </>
      )}
    </Stack>
  );
};

const AccessHeading: React.FC<{
  subtitle: string;
  redirectToCompanionApp: boolean;
}> = ({ subtitle, redirectToCompanionApp }) => {
  const companionApp =
    APP_CONFIG.companionApp === "openebooks" ? "Open eBooks" : "SimplyE";

  if (redirectToCompanionApp) {
    return (
      <Stack direction="column">
        <Stack>
          <SvgPhone sx={{ fontSize: 24 }} />
          <Text variant="text.body.bold">
            You&apos;re ready to read this book in {companionApp}!
          </Text>
        </Stack>
        <Text>{subtitle}</Text>
      </Stack>
    );
  }
  return (
    <Stack spacing={0} direction="column">
      <Text variant="text.body.bold">Ready to read!</Text>
      <Text>{subtitle}</Text>
    </Stack>
  );
};

function getButtonStyles(isPrimaryAction: boolean) {
  return isPrimaryAction
    ? ({
        variant: "filled",
        color: "brand.primary"
      } as const)
    : ({
        variant: "ghost",
        color: "ui.gray.extraDark"
      } as const);
}

const ReadOnlineExternal: React.FC<{
  details: ReadExternalDetails;
  isPrimaryAction: boolean;
}> = ({ details, isPrimaryAction }) => {
  const { open, loading, error } = useReadOnlineButton(details);

  return (
    <>
      <Button
        {...getButtonStyles(isPrimaryAction)}
        iconLeft={SvgExternalLink}
        onClick={open}
        loading={loading}
        loadingText="Opening..."
      >
        {details.buttonLabel}
      </Button>
      {error && <Text sx={{ color: "ui.error" }}>{error}</Text>}
    </>
  );
};

const ReadOnlineInternal: React.FC<{
  details: ReadInternalDetails;
  isPrimaryAction: boolean;
}> = ({ details, isPrimaryAction }) => {
  return (
    <NavButton {...getButtonStyles(isPrimaryAction)} href={details.url}>
      Read
    </NavButton>
  );
};

const DownloadButton: React.FC<{
  details: DownloadDetails;
  title: string;
  isPrimaryAction: boolean;
}> = ({ details, title, isPrimaryAction }) => {
  const { buttonLabel } = details;
  const { download, error, loading } = useDownloadButton(details, title);

  return (
    <>
      <Button
        onClick={download}
        {...getButtonStyles(isPrimaryAction)}
        iconLeft={SvgDownload}
        loading={loading}
        loadingText="Downloading..."
      >
        {buttonLabel}
      </Button>
      {error && <Text sx={{ color: "ui.error" }}>{error}</Text>}
    </>
  );
};

export default withErrorBoundary(FulfillmentCard, ErrorCard);
