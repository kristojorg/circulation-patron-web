import * as React from "react";
import {
  AnyBook,
  BookData,
  BookMedium,
  BorrowableBook,
  FulfillableBook,
  OnHoldBook,
  ReservableBook,
  ReservedBook
} from "interfaces";
import { BookFulfillmentState } from "interfaces";
import { Book, Headset } from "../icons";
import { DEFAULT_AVAILABILITY } from "utils/constants";

export function getAuthors(book: BookData, lim?: number): string[] {
  // select contributors if the authors array is undefined or empty.
  const allAuth =
    typeof book.authors?.length === "number" && book.authors.length > 0
      ? book.authors
      : typeof book.contributors?.length === "number" &&
        book.contributors.length > 0
      ? book.contributors
      : ["Authors unknown"];

  // now limit it to however many
  if (lim) {
    return allAuth.slice(0, lim);
  }
  return allAuth;
}

export function availabilityString(book: BookData) {
  if (book.openAccessLinks && book.openAccessLinks.length > 0)
    return "This open-access book is available to keep forever.";

  const availableCopies = book.copies?.available;
  const totalCopies = book.copies?.total;
  return typeof availableCopies === "number" && typeof totalCopies === "number"
    ? `${availableCopies} out of ${totalCopies} copies available.`
    : "Number of books available is unknown.";
}

export function queueString(book: BookData) {
  const holds = book.holds?.total;
  return typeof holds === "number"
    ? `There are ${holds} other patrons in the queue.`
    : "";
}

export function bookIsFulfillable(book: AnyBook): book is FulfillableBook {
  return book.status === "fulfillable";
}

export function bookIsReserved(book: AnyBook): book is ReservedBook {
  return book.status === "reserved";
}

export function bookIsReservable(book: AnyBook): book is ReservableBook {
  return book.status === "reservable";
}

export function bookIsOnHold(book: AnyBook): book is OnHoldBook {
  return book.status === "on-hold";
}

export function bookIsBorrowable(book: AnyBook): book is BorrowableBook {
  return book.status === "borrowable";
}

export function bookIsAudiobook(book: BookData): boolean {
  if (getMedium(book) === "http://bib.schema.org/Audiobook") {
    return true;
  }
  return false;
}

export const bookMediumMap: {
  [key in BookMedium]: {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
  };
} = {
  "http://bib.schema.org/Audiobook": {
    name: "Audiobook",
    icon: Headset
  },
  "http://schema.org/EBook": { name: "eBook", icon: Book },
  "http://schema.org/Book": { name: "Book", icon: Book }
};

export function getMedium(book: BookData): BookMedium | "" {
  if (!book.raw || !book.raw["$"] || !book.raw["$"]["schema:additionalType"]) {
    return "";
  }

  return book.raw["$"]["schema:additionalType"].value
    ? book.raw["$"]["schema:additionalType"].value
    : "";
}
