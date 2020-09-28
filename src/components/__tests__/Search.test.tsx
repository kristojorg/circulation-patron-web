import * as React from "react";
import { render, fixtures, fireEvent } from "test-utils";
import Search from "../Search";
import userEvent from "@testing-library/user-event";
import { mockPush } from "test-utils/mockNextRouter";

test("doesn't render if there is no searchData in the store", () => {
  const utils = render(<Search />, {
    library: {
      ...fixtures.libraryData,
      searchData: null
    }
  });
  expect(utils.container).toBeEmptyDOMElement();
});

test("searching calls history.push with url", async () => {
  const mockedTemplate = jest.fn().mockReturnValue("templatereturn");
  const utils = render(<Search />, {
    library: {
      ...fixtures.libraryData,
      searchData: {
        template: mockedTemplate,
        description: "search desc",
        shortName: "search shortname",
        url: "/search-url"
      }
    }
  });
  const searchButton = utils.getByText("Search");
  const input = utils.getByLabelText("Enter search keyword or keywords");
  // act
  userEvent.type(input, "my search");
  fireEvent.click(searchButton);

  // assert
  expect(mockedTemplate).toHaveBeenCalledTimes(1);
  expect(mockedTemplate).toHaveBeenCalledWith("my%20search");
  expect(mockPush).toHaveBeenCalledTimes(1);
  expect(mockPush).toHaveBeenCalledWith(
    "/collection/[collectionUrl]",
    "/collection/templatereturn"
  );
});
