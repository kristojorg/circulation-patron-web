import * as React from "react";
import Bugsnag from "@bugsnag/js";
import BugsnagPluginReact from "@bugsnag/plugin-react";
import { APP_VERSION } from "utils/env";
import { config } from "config";

if (config.bugsnagApiKey) {
  Bugsnag.start({
    apiKey: config.bugsnagApiKey,
    appVersion: APP_VERSION,
    plugins: [new BugsnagPluginReact()]
  });
}

export const BugsnagErrorBoundary = config.bugsnagApiKey
  ? Bugsnag.getPlugin("react")?.createErrorBoundary(React)
  : undefined;

export default Bugsnag;
