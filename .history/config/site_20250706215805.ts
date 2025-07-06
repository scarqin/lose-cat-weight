export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Meow 老猫无痛减肥",
  description: "科学制定猫咪减肥计划，让爱猫健康瘦身",
  navItems: [
    { label: "首页", href: "/" },
    { label: "减肥计划", href: "/cat-diet" },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
  ],
  links: {
    github: "https://github.com/scarqin/lose-cat-weight",
  },
};
