/* eslint-disable camelcase */
import { existsSync, readFileSync } from "fs";
import fetchMock from "jest-fetch-mock";
import getAppConfig from "../fetch-config";

jest.mock("fs");
const mockedExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;
const mockedReadFileSync = readFileSync as jest.MockedFunction<
  typeof readFileSync
>;
process.cwd = jest.fn(() => "/");

test("Throws Error when no config file found on root", async () => {
  mockedExistsSync.mockReturnValue(false);
  await expect(
    getAppConfig("./doesnt exist")
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Config file not found at: /doesnt exist"`
  );
});

const mockFile = `
libraries:
  lib1: http://hello.com
media_support:
  application/epub+zip: show
bugsnag_api_key: bug
gtm_id: gtm
axisnow_decrypt: true
companion_app: simplye
  `;

const mockResult = {
  libraries: {
    lib1: "http://hello.com"
  },
  media_support: {
    "application/epub+zip": "show"
  },
  bugsnag_api_key: "bug",
  gtm_id: "gtm",
  axisnow_decrypt: true,
  companion_app: "simplye"
};

test("returns parsed config file", async () => {
  mockedExistsSync.mockReturnValue(true);
  mockedReadFileSync.mockReturnValue(mockFile);

  const conf = await getAppConfig("anywhere");
  expect(conf).toEqual(mockResult);
});

test("attempts to fetch config file when it starts with http", async () => {
  fetchMock.mockResponseOnce(mockFile);
  await expect(getAppConfig("http://internet")).resolves.toEqual(mockResult);

  expect(fetchMock).toHaveBeenCalledWith("http://internet");
});

test("Throws error when fetch fails for http config file", async () => {
  fetchMock.mockRejectOnce();
  await expect(getAppConfig("http://internet")).rejects.toThrow(
    "Could not fetch config file at: http://internet"
  );

  expect(fetchMock).toHaveBeenCalledWith("http://internet");
});
