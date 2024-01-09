import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://kenny.wtf/", // replace this with your deployed domain
  author: "Kenneth Pirman",
  desc: "A friendly internet space about procedural world-building",
  title: "Kenneth Pirman",
  ogImage: "hello-worlds.png",
  lightAndDarkMode: true,
  postPerPage: 3,
};

export const LOCALE = ["en-EN"]; // set to [] to use the environment default

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/kenjinp",
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/kenjinp/",
    linkTitle: `${SITE.title} on LinkedIn`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:hi@kenny.wtf",
    linkTitle: `Send an email to ${SITE.title}`,
    active: true,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/KennyPirman",
    linkTitle: `${SITE.title} on Twitter`,
    active: true,
  },
  {
    name: "Twitch",
    href: "https://www.twitch.tv/kennycreates",
    linkTitle: `${SITE.title} on Twitch`,
    active: true,
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/channel/UC-GwnOdlAKw3rNmssmOVTpA",
    linkTitle: `${SITE.title} on YouTube`,
    active: true,
  },
  {
    name: "Discord",
    href: "https://discord.gg/ssX9MQjkur",
    linkTitle: `Hello Worlds on Discord`,
    active: true,
  },
  {
    name: "Mastodon",
    href: "https://mastodon.gamedev.place/@kenny",
    linkTitle: `${SITE.title} on Mastodon`,
    active: true,
  },
];
