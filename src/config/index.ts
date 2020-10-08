import { AppConfig } from "interfaces.js";
import * as unparsed from "./load-config.js";

function parseConfig(unparsed: any): AppConfig {
  // specifically set defaults for a couple values.
  const companionApp =
    unparsed.companion_app === "openebooks" ? "openebooks" : "simplye";
  const axisNowDecrypt = unparsed.axisnow_decrypt === true;

  // otherwise assume the file is properly structured.
  return {
    libraries: unparsed.libraries,
    mediaSupport: unparsed.mediaSupport,
    bugsnagApiKey: unparsed.bugsnagApiKey ?? null,
    gtmId: unparsed.gtmId ?? null,
    axisNowDecrypt,
    companionApp
  };
}

export const APP_CONFIG = parseConfig(unparsed);
