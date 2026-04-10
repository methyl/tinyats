import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials"],
  staticDirs: ["../public"],
  viteFinal(config) {
    config.plugins = config.plugins || [];
    config.plugins.push(tailwindcss());
    return config;
  },
};

export default config;
