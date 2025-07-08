export type SiteConfig = typeof siteConfig;

export const siteConfig = {
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
