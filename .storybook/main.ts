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
    // Provide a fallback Instant app id so components that import `db` can render in stories.
    config.define = {
      ...config.define,
      "import.meta.env.VITE_INSTANT_APP_ID": JSON.stringify(
        process.env.VITE_INSTANT_APP_ID || "00000000-0000-0000-0000-000000000000"
      ),
    };
    return config;
  },
};

export default config;
