const body = `<!DOCTYPE html>
<html lang="en">

<head>
  <title>Webpub Viewer</title>
  <meta charset="utf-8" />
  <meta name="author" content="NYPL Digital" />
  <meta name="description" content="A viewer application for EPUB files." />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no,
    viewport-fit=cover" />
  <link rel="stylesheet" href="main.css" type="text/html" />
  <!-- <script src="require.js"></script>-->
  <!-- <script src="fetch.js"></script>-->
</head>

<body>
  <div id="viewer"></div>
  <script type="module">
    import { CacheStatus } from "../../../library-simplified-webpub-viewer/dist/Cacher.js";
      import HTMLUtilities from "../../../library-simplified-webpub-viewer/dist/HTMLUtilities.js";
      import BrowserUtilities from "../../../library-simplified-webpub-viewer/dist/BrowserUtilities.js";
      import Manifest from "../../../library-simplified-webpub-viewer/dist/Manifest.js";
      import IconLib from "../../../library-simplified-webpub-viewer/dist/IconLib.js";
      import BookSettings from "../../../library-simplified-webpub-viewer/dist/BookSettings.js";
      import MemoryStore from "../../../library-simplified-webpub-viewer/dist/MemoryStore.js";
      import LocalStorageStore from "../../../library-simplified-webpub-viewer/dist/LocalStorageStore.js";
      import ServiceWorkerCacher from "../../../library-simplified-webpub-viewer/dist/ServiceWorkerCacher.js";
      import LocalAnnotator from "../../../library-simplified-webpub-viewer/dist/LocalAnnotator.js";
      import PublisherFont from "../../../library-simplified-webpub-viewer/dist/PublisherFont.js";
      import SerifFont from "../../../library-simplified-webpub-viewer/dist/SerifFont.js";
      import SansFont from "../../../library-simplified-webpub-viewer/dist/SansFont.js";
      import DayTheme from "../../../library-simplified-webpub-viewer/dist/DayTheme.js";
      import SepiaTheme from "../../../library-simplified-webpub-viewer/dist/SepiaTheme.js";
      import NightTheme from "../../../library-simplified-webpub-viewer/dist/NightTheme.js";
      import ColumnsPaginatedBookView from "../../../library-simplified-webpub-viewer/dist/ColumnsPaginatedBookView.js";
      import ScrollingBookView from "../../../library-simplified-webpub-viewer/dist/ScrollingBookView.js";
      import EventHandler from "../../../library-simplified-webpub-viewer/dist/EventHandler.js";
      import IFrameNavigator from "../../../library-simplified-webpub-viewer/dist/IFrameNavigator.js";


      // var getURLQueryParams = function () {
      //   var params = {};
      //   var query = window.location.search;
      //   if (query && query.length) {
      //     query = query.substring(1);
      //     var keyParams = query.split("&");
      //     for (var x = 0; x < keyParams.length; x++) {
      //       var keyVal = keyParams[x].split("=");
      //       if (keyVal.length > 1) {
      //         params[keyVal[0]] = decodeURIComponent(keyVal[1]);
      //       }
      //     }
      //   }
      //   return params;
      // };

      var element = document.getElementById("viewer");
     // var urlParams = getURLQueryParams();
      var webpubManifestUrl = new URL("https://researchnow-reader.nypl.org/pub/aHR0cHM6Ly9jb250ZW50c2VydmVyLmFkb2JlLmNvbS9zdG9yZS9ib29rcy9hbGljZUR5bmFtaWMuZXB1Yg==/manifest.json");
      // urlParams["url"] ? new URL(urlParams["url"]) : "";
       var containerHref = webpubManifestUrl.href.endsWith("container.xml") ? webpubManifestUrl.href : "";

        (function () {
          window.fetch(containerHref)
            .then(response => response.text())
            .then((text) => new window.DOMParser().parseFromString(text, "text/html"))
            .then(xml => xml.getElementsByTagName("rootfile")[0] ? xml.getElementsByTagName("rootfile")[0].getAttribute("full-path") : "")
            .then(rootfile => {
              const url = containerHref.replace("META-INF/container.xml", rootfile)
              webpubManifestUrl = rootfile ? new URL(url) : webpubManifestUrl
            }).then(() => {

              var store = new LocalStorageStore({
                prefix: webpubManifestUrl.href,
              });
              var cacher = new ServiceWorkerCacher({
                store: store,
                manifestUrl: webpubManifestUrl,
                serviceWorkerUrl: new URL("sw.js", window.location.href),
                staticFileUrls: [
                  new URL(window.location.href),
                  new URL("index.html", window.location.href),
                  new URL("main.css", window.location.href),
                  new URL("require.js", window.location.href),
                  new URL("fetch.js", window.location.href),
                ],
              });
              var publisher = new PublisherFont();
              var serif = new SerifFont();
              var sans = new SansFont();
              var fontSizes = [12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32];
              var defaultFontSize = 20;
              var day = new DayTheme();
              var sepia = new SepiaTheme();
              var night = new NightTheme();
              var paginator = new ColumnsPaginatedBookView();
              var scroller = new ScrollingBookView();
              var annotator = new LocalAnnotator({ store: store });
              var settingsStore = new LocalStorageStore({
                prefix: "webpub-viewer",
              });
              var upLink = {
                url: new URL("https://github.com/NYPL-Simplified/webpub-viewer"),
                label: "Return to Digital Research Books Beta",
                ariaLabel: "Return to Digital Research Books  Beta",
                libraryIcon: new URL("https://www.nypl.org/sites/default/files/images/av/news_2009_11_06_logo.jpeg")
              };

              BookSettings.create({
                store: settingsStore,
                bookFonts: [publisher, serif, sans],
                fontSizesInPixels: fontSizes,
                defaultFontSizeInPixels: defaultFontSize,
                bookThemes: [day, sepia, night],
                bookViews: [paginator, scroller],
              }).then(function (settings) {
                IFrameNavigator.create({
                  element: element,
                  manifestUrl: webpubManifestUrl,
                  store: store,
                  cacher: cacher,
                  settings: settings,
                  annotator: annotator,
                  publisher: publisher,
                  serif: serif,
                  sans: sans,
                  day: day,
                  sepia: sepia,
                  night: night,
                  paginator: paginator,
                  scroller: scroller,
                  upLink: upLink,
                  allowFullscreen: true,
                });
              })
            }).catch(function (err) {
              console.warn('Something went wrong with fetching the container.', err);
            });


        }
        )();
      
    </script>
  <noscript>
    <style>
      noscript {
        width: 100%;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .warning {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
          Helvetica, Arial, sans-serif;
        font-size: 1.5rem;
        font-weight: bold;
      }
    </style>
    <p class="warning">
      To use this webpub viewer, please enable JavaScript.
    </p>
  </noscript>
</body>
</html>
`;

export default (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/javascript");
  res.end(JSON.stringify({ html: body }));
};
