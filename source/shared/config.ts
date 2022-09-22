import { Config } from './types';
import { configFilePath } from './constants';
import { execSync } from "child_process";

export function getConfig(): Config {
  const configRAW = execSync(`cat ${configFilePath}`).toString();
  const configPairs = configRAW
    .split("\n")
    .filter(c => c.replace(/\s/g, "").length > 0)
    .map(line => line.split(":"));

  let config: Config = {
    linearToken: "",
    defaultBranch: "staging"
  };
  configPairs.forEach(p => {
    const key = p[0];
    if (key && p[1]) {
      config[key as keyof Config] = p[1];
    }
  });
  return config;
}

export function createConfigPath(): void {
  let previousPath = "";
  configFilePath.split("/").forEach((path: string) => {
    if (path !== "config.yaml" && path !== "~") {
      previousPath += path + "/";
      execSync(`mkdir ~/${previousPath}`).toString();
    }
  });
}

export function saveConfig(config: Partial<Config>): Config {
  const configToSave = { ...getConfig(), ...config };

  execSync(`rm -rf ${configFilePath}`);
  Object.entries(configToSave).forEach(entry => {
    if (entry[0] && entry[1]) {
      execSync(`echo ${entry[0]}:${entry[1]} >> ${configFilePath}`);
    }
  });
  return configToSave;
}