import { AppSetupError } from "./../errors";
import { readFileSync, existsSync } from "fs";
import path from "path";
import {
  AppConfig,
  DirectMediaSupport,
  IndirectMediaSupport,
  LibrariesConfig,
  LibraryRegistryBase,
  MediaSupportConfig
} from "interfaces";
import YAML from "yaml";

/**
 * Reads a config file either from local path or
 * http request, parses it, and returns it as an object
 */
export default async function getAppConfig(
  configFileSetting: string
): Promise<AppConfig> {
  if (configFileSetting.startsWith("http")) {
    return await fetchConfigFile(configFileSetting);
  }
  const configFilePath = path.join(process.cwd(), configFileSetting);
  if (!existsSync(configFilePath)) {
    throw new AppSetupError("Config file not found at: " + configFilePath);
  }
  const text = readFileSync(configFilePath, "utf8");
  return parseConfigText(text);
}

/**
 * Fetches a config file from the network, parses it into
 * an object and returns it
 */
async function fetchConfigFile(configFileUrl: string): Promise<AppConfig> {
  try {
    const response = await fetch(configFileUrl);
    const text = await response.text();
    const parsed = parseConfigText(text);
    return parsed;
  } catch (e) {
    throw new Error("Could not fetch config file at: " + configFileUrl);
  }
}

/**
 * Parses the raw text of a config file into an object.
 */
function parseConfigText(raw: string): AppConfig {
  const config = YAML.parse(raw);

  // specifically set defaults for a couple values
  const companionApp =
    config.companion_app === "openebooks" ? "openebooks" : "simplye";
  const axisNowDecrypt = config.axisnow_decrypt === true;

  return {
    ...config,
    axisNowDecrypt,
    companionApp
  };
}

function extractString(value: any): string | null {
  if (typeof value === "string") return value;
  return null;
}

function parseLibraries(value: any): LibraryRegistryBase | LibrariesConfig {
  if (typeof value === "undefined") {
    throw new AppSetupError(
      "You must define a value for `libraries` in your config file"
    );
  }
  if (typeof value === "string") {
    return value;
  }
  // otherwise it should be an object with keys
  const keys = Object.keys(value);
  return keys.reduce((map, key) => {
    if (typeof key !== "string" || typeof value[key] !== "string") {
      throw new AppSetupError(
        "Config File `libraries` key is improperly defined."
      );
    }
    return { ...map, [key]: value };
  }, {});
}
