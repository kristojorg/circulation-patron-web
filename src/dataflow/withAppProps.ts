import { LibraryData, AppConfigFile } from "../interfaces";
import { GetStaticProps } from "next";
import {
  getCatalogRootUrl,
  fetchCatalog,
  fetchAuthDocument,
  buildLibraryData
} from "dataflow/getLibraryData";
import ApplicationError from "errors";
import getConfigFile from "./getConfigFile";
import { CONFIG_FILE } from "utils/env";
import { getAuthDocHref } from "utils/auth";
import { findSearchLink } from "dataflow/opds1/parse";
import { fetchSearchData } from "dataflow/opds1/fetch";
import extractParam from "dataflow/utils";

export type AppProps = {
  library?: LibraryData;
  error?: {
    message: string;
    name: string;
    statusCode: number | null;
  };
  configFile?: AppConfigFile | null;
};

export default function withAppProps<T>(
  pageGetStaticProps?: (library: LibraryData) => GetStaticProps<T>
): GetStaticProps<AppProps> {
  return async ctx => {
    /**
     * Determine the catalog url
     * Get library catalog
     * Fetch the auth document provided in it
     */
    try {
      const librarySlug = extractParam(ctx.params, "library");
      const catalogUrl = await getCatalogRootUrl(librarySlug);
      const catalog = await fetchCatalog(catalogUrl);
      const authDocHref = getAuthDocHref(catalog);
      const authDocument = await fetchAuthDocument(authDocHref);
      const searchDataUrl = findSearchLink(catalog)?.href;
      // const searchData = await fetchSearchData(searchDataUrl);
      const library = buildLibraryData(
        authDocument,
        catalogUrl,
        librarySlug,
        catalog
      );
      // fetch the static props for the page
      const pageResult = (await pageGetStaticProps?.(library)(ctx)) ?? {
        props: {}
      };
      return {
        ...pageResult,
        props: {
          ...pageResult.props,
          library
          // catalog
        }
      };
    } catch (e) {
      // if we are running with a config file, add it to the error
      let configFile: AppConfigFile | null = null;
      if (CONFIG_FILE) {
        try {
          configFile = await getConfigFile(CONFIG_FILE);
        } catch {
          configFile = null;
        }
      }

      if (e instanceof ApplicationError) {
        return {
          props: {
            error: {
              message: e.message,
              name: e.name,
              statusCode: e.statusCode
            },
            configFile
          }
        };
      }
      // otherwise we probably can't recover at all,
      // so rethrow.
      throw e;
    }
  };
}
