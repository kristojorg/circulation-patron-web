import * as React from "react";
import { render, fixtures } from "test-utils";
import { Collection } from "../Collection";
import merge from "deepmerge";
import { LaneData } from "interfaces";
import mockCollection, { useCollectionSpy } from "test-utils/mockCollection";

beforeEach(() => {
  /**
   * We do this because Lane does use timeouts, so we need to be
   * sure they are mocked or we get nebulous errors
   */
  jest.useFakeTimers();
});

test("calls useCollection", () => {
  mockCollection();
  render(<Collection />);

  expect(useCollectionSpy).toHaveBeenCalledTimes(1);
});

test("displays loader", () => {
  mockCollection({
    isLoading: true,
    collection: undefined
  });
  const utils = render(<Collection />);
  expect(
    utils.getByRole("heading", { name: "Loading..." })
  ).toBeInTheDocument();
});

test("displays lanes when present", () => {
  const laneData: LaneData = {
    title: "my lane",
    url: "/link-to-lane",
    books: fixtures.makeBooks(10)
  };
  mockCollection({
    collection: {
      id: "id",
      url: "url",
      title: "title",
      navigationLinks: [],
      books: [],
      lanes: [laneData]
    }
  });
  const utils = render(<Collection />);

  // expect there to be a lane with books
  const laneTitle = utils.getByText("my lane");
  expect(laneTitle).toBeInTheDocument();
  expect(utils.getByText(fixtures.makeBook(0).title)).toBeInTheDocument();
  expect(
    utils.getByText(fixtures.makeBook(0).authors.join(", "))
  ).toBeInTheDocument();
});

test("prefers lanes over books", () => {
  const laneData: LaneData = {
    title: "my lane",
    url: "/link-to-lane",
    books: fixtures.makeBooks(10)
  };
  mockCollection({
    collection: {
      id: "id",
      url: "url",
      title: "title",
      navigationLinks: [],
      books: fixtures.makeBooks(2),
      lanes: [laneData]
    }
  });
  const utils = render(<Collection />);

  // expect the lane title to be rendered, indicating it chose
  // lanes over books
  const laneTitle = utils.getByText("my lane");
  expect(laneTitle).toBeInTheDocument();
});

test("renders books in list view if no lanes", () => {
  mockCollection({
    isLoading: false,
    collection: {
      id: "id",
      url: "url",
      title: "title",
      navigationLinks: [],
      books: fixtures.makeBooks(2),
      lanes: []
    }
  });
  const utils = render(<Collection />);

  const list = utils.getByTestId("listview-list");
  expect(list).toBeInTheDocument();
});

test("renders empty state if no lanes or books", () => {
  mockCollection({
    isLoading: false,
    collection: {
      id: "id",
      url: "url",
      title: "title",
      navigationLinks: [],
      books: [],
      lanes: []
    }
  });
  const utils = render(<Collection />);

  expect(utils.getByText("This collection is empty.")).toBeInTheDocument();
});
