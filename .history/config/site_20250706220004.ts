export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Meow 老猫无痛减肥",
  description: "科学制定猫咪减肥计划，让爱猫健康瘦身",
  navItems: [] as { label: string; href: string }[],
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
