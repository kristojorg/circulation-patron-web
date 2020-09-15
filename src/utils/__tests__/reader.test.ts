import { getContainerUrl } from "utils/reader";
import fetchMock from "fetch-mock-jest";
import mockedReader from "../../test-utils/mockWebreader";

jest.mock("library-simplified-webpub-viewer");

describe("blah", () => {
  test("Gets correct container url from epub", () => {
    fetchMock.get("container-url", {
      status: 200,
      body: { text: "blah.container.xml" }
    });
    expect(mockedReader.toHaveBeenCalledTimes(1));
    expect(getContainerUrl("container-url")).toBe("hello");
  });
});

// test("Gets correct container url from non-epub");

// test("calls webpub viewer with params", () => {
//   console.log("stub");
// });

// test("calls webpub viewer with params", () => {
//   console.log("stub");
// });
