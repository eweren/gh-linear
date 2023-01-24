import { Config } from './types';
import { configFilePath } from './constants';
import { execSync } from "child_process";

export function getConfig(): Config {
  try {
    let configRAW = execSync(`cat ${configFilePath}`).toString();
    if (configRAW.split(":").length === 1) {
      configRAW = `linearToken: ${configRAW}`;
      execSync(`echo ${configRAW} > ${configFilePath}`);
    }
    const configPairs = configRAW
      .split("\n")
      .filter(c => c.replace(/\s/g, "").length > 0)
      .map(line => line.split(":"));

    let config: Config = {
      linearToken: "",
      defaultBranch: "staging",
      defaultReviewers: []
    };
    configPairs.forEach(p => {
      const key = p[0];
      if (key && p[1]) {
        if (key === "defaultReviewers") {
          config.defaultReviewers = p[1].split(",").map(c => c.trim());
        } else {
          (config[key as keyof Config] as string) = (p[1] as string).trim();
        }
      }
    });
    return config;
  } catch (e) {
    createConfigPath();
    return getConfig();
  }
}

export function createConfigPath(): void {
  let previousPath = "";
  configFilePath.split("/").forEach((path: string) => {
    if (path !== "config.yaml" && path !== "~") {
      previousPath += path + "/";
      execSync(`mkdir ~/${previousPath}`).toString();
    }
  });
  execSync("echo linearToken: > config.yaml").toString();
}

export function saveConfig(config: Partial<Config>): Config {
  const configToSave = { ...getConfig(), ...config };

  execSync(`rm -rf ${configFilePath}`);
  Object.entries(configToSave).forEach(entry => {
    if (entry[0] && entry[1]) {
      execSync(`echo ${entry[0]}: ${entry[1]} >> ${configFilePath}`);
    }
  });
  return configToSave;
}