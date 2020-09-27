import { MediaLink, FulfillmentLink, OPDS1 } from "interfaces";

type Download = {
  type: "download";
  url: string;
  filename: string;
  extension: string;
  buttonLabel: string;
};
type ReadInternal = {
  type: "read-internal";
  url: string;
};
type ReadExternal = {
  type: "read-external";
  url: string;
  buttonLabel: string;
};
type Unsupported = {
  type: "unsupported";
};

/**
 * This is how the user perceives the fulfillment, not necessarily how
 * we perform the fulfillment.
 */
type FulfillmentType = Download | ReadInternal | ReadExternal | Unsupported;

/**
 * Mapping links to fulfillment protocols based on
 * https://docs.google.com/document/d/1dli5mgTbVaURN_B2AtUmPhgpaFUVqOqrzsaoFvCXnkA/edit?pli=1#
 */
export function getFulfillmentType(
  link: MediaLink | FulfillmentLink
): FulfillmentType {
  const endContentType = fixMimeType(link.type);
  const indirectType = "indirectType" in link ? link.indirectType : undefined;

  // there is no support for books with "Libby" DRM
  if (
    endContentType === OPDS1.OverdriveEbookMediaType ||
    indirectType === OPDS1.OverdriveEbookMediaType
  ) {
    return { type: "unsupported" };
  }
  switch (endContentType) {
    case OPDS1.PdfMediaType:
    case OPDS1.Mobi8Mediatype:
    case OPDS1.MobiPocketMediaType:
    case OPDS1.EpubMediaType:
      return {
        url: link.url,
        type: "download",
        buttonLabel: `Download`,
        extension: `blah`,
        filename: "filename"
      };

    case OPDS1.AtomMediaType:
      return {
        url: link.url,
        type: "read-external",
        buttonLabel: "Read on Overdrive"
      };

    case OPDS1.AxisNowWebpubMediaType:
      return {
        // here parse this into the actual url we need to send the user to
        url: `/read/${encodeURIComponent(link.url)}`,
        type: "read-internal"
      };
  }
  return {
    type: "unsupported"
  };
}

export function fixMimeType(
  mimeType: OPDS1.AnyBookMediaType | "vnd.adobe/adept+xml"
): OPDS1.AnyBookMediaType {
  return mimeType === "vnd.adobe/adept+xml"
    ? "application/vnd.adobe.adept+xml"
    : mimeType;
}
