import type { Preview } from "@storybook/react";
import "../src/styles/globals.css";

const preview: Preview = {
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#FCFCFC" },
        { name: "white", value: "#FFFFFF" },
      ],
    },
  },
};

export default preview;
