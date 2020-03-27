# circulation-patron-web

A Circulation catalog web interface for library patrons.

## Background

The `circulation-patron-web` application serves as a way for libraries to view their collections on the web. A library _must_ be part of a [Circulation Manager](https://github.com/NYPL-Simplified/circulation) and _can_ be registered to a [Library Registry](https://github.com/NYPL-Simplified/library_registry). Currently, in order for a library to be part of Library Simplified and show up in the SimplyE application, they must register with NYPL's Library Registry. A Library Registry provides details about a library, and a Circulation Manager provides a library's collection of eBooks and audiobooks in OPDS format.

The `circulation-patron-web` app can be used for single-library and multi-library scenarios. The most common scenario may be for a single-library where the app renders the _main_ library of a Circulation Manager. Alternatively, it's possible to use one instance of the `circulation-patron-web` app for multiple libraries, either from a single Circulation Manager or from multiple Circulation Managers.

## Installation

Once you have a [Library Registry](https://github.com/NYPL-Simplified/library_registry) or [Circulation Manager](https://github.com/NYPL-Simplified/circulation), run `npm install` in this repository to install the dependencies.

## Manager, Registry, and Application Configurations

Any Circulation Manager you'll be using with the app also needs a configuration setting to turn on CORS headers. In the Circulation Manager interface, go to the Sitewide Settings section under System Configuration (`/admin/web/config/sitewideSettings`) and add a setting for "URL of the web catalog for patrons". For development, you can set this to "\*", but for production it should be the real URL where you will run the catalog.

If you are using a Library Registry, this configuration will automatically be created when you register libraries with the Registry, but you need to configure the URL in the Library Registry by running `bin/configuration/configure_site_setting --setting="web_client_url=http://library.org/{uuid}"` (replace the URL with your web client URL). Otherwise, you'll need to create a sitewide setting for it in the Circulation Manager. Finally, make sure that the libraries are registered to the Library Registry you are using.

## Running the Application

Once the dependencies are installed and application environments configured, the following two base commands can be used to start the application:

- `npm run dev` - This command will watch the code for changes and rebuild the front-end code, but won't reload the server code.
- `npm run prod` - This will generate the build that will be used in production servers.

The application will start at the base URL of `localhost:3000`.

### Application Startup Configurations

There are three ways to run this application:

- with a [Library Registry](https://github.com/NYPL-Simplified/library_registry)
- with a single library on a [Circulation Manager](https://github.com/NYPL-Simplified/circulation)
- with a configuration file for multiple Circulation Manager URLs

By default, this application expects a Library Registry to be running at http://localhost:7000. For all three variations below, make sure that the Circulation Manager is running at the same time. For the first variation, make sure that the library is registered to the Library Registry (setting "Registry Stage" to "production").

Set one of the following environment variables when running the application:

- `REGISTRY_BASE` - to use a Library Registry

  - Example: `REGISTRY_BASE=http://localhost:7000 npm run prod`
  - A Library Registry is required for this build.
  - This is the default setting which will point to a Library Registry located at `localhost:7000`. The libraries can be viewed in the app (running locally) by going to `localhost:3000/{urn:uuid}` where `urn:uuid` is the `urn:uuid` of the library. Get the `urn:uuid` from the Library Registry admin under the `internal_urn` label for its basic information.

- `SIMPLIFIED_CATALOG_BASE` - to use a Circulation Manager

  - Example: `SIMPLIFIED_CATALOG_BASE=http://localhost:6500 npm run prod`.
  - Point this environment variable to the URL of the Circulation Manager (which defaults to `localhost:6500`). This will load the _main_ library in the Circulation Manager in the app by going to `localhost:3000`.

- `CONFIG_FILE` - to use a configuration file
  - Example: `CONFIG_FILE=config_file.txt npm run prod`
  - Set `CONFIG_FILE` to point to a local file or a remote URL.
    Each line in the file should be a library's desired URL path in the web catalog and the library's Circulation Manager URL (the domain of the Circulation Manager along with the library's shortname), separated by a pipe character. For example:
  - ```
     library1|http://circulationmanager.org/L1
     library2|http://localhost:6500/L2
     library3|http://anothercirculationmanager.org/L3
    ```
  - From the example above, when running the command you can visit the different libraries (running locally) at `localhost:3000/library1`, `localhost:3000/library2`, and `localhost:3000/library3`.
  - This is for cases when an organization wants to use the same circulation-patron-web instance for multiple libraries and they are not running their own Library Registry or do not want to run a Library Registry when it's not needed for anything else.

The following environment variables can also be set to further configure the application.

- Set `SHORTEN_URLS=false` to stop the app from removing common parts of the circulation manager URLs from the web app's URLs.
- Set `CACHE_EXPIRATION_SECONDS` to control how often the app will check for changes to registry entries and circ manager authentication documents.
