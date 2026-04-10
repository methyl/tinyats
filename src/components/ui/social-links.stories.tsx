import type { Meta, StoryObj } from "@storybook/react";
import { SocialLinks } from "./social-links";

const meta: Meta<typeof SocialLinks> = {
  title: "UI/SocialLinks",
  component: SocialLinks,
};
export default meta;
type Story = StoryObj<typeof SocialLinks>;

export const AllLinks: Story = {
  args: {
    linkedin: "https://linkedin.com/in/example",
    github: "https://github.com/example",
    resume: "https://example.com/resume.pdf",
  },
};

export const LinkedInOnly: Story = {
  args: { linkedin: "https://linkedin.com/in/example" },
};

export const GitHubOnly: Story = {
  args: { github: "https://github.com/example" },
};

export const LinkedInAndGitHub: Story = {
  args: {
    linkedin: "https://linkedin.com/in/example",
    github: "https://github.com/example",
  },
};
