import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchSiteConfig } from "@/lib/api";

type Props = {
  active: boolean;
};

export function SiteMetaWatcher({ active }: Props) {
  const getCachedConfig = () => {
    try {
      const cached = localStorage.getItem("skyimage-site-config");
      return cached ? JSON.parse(cached) : undefined;
    } catch {
      return undefined;
    }
  };
  
  const { data } = useQuery({
    queryKey: ["site-meta"],
    queryFn: fetchSiteConfig,
    enabled: active,
    initialData: getCachedConfig,
    staleTime: 5 * 60 * 1000
  });

  useEffect(() => {
    if (data?.title) {
      document.title = data.title;
    }
  }, [data]);

  useEffect(() => {
    const rawLogo = (data?.logo || "").trim();
    const resolved = resolveLogoHref(rawLogo);
    const href = appendVersion(resolved || "/favicon.ico", rawLogo || "default");

    const iconLink = ensureHeadLink("icon");
    iconLink.href = href;

    const shortcutIconLink = ensureHeadLink("shortcut icon");
    shortcutIconLink.href = href;
  }, [data?.logo]);

  return null;
}

function resolveLogoHref(logo: string): string {
  if (!logo) {
    return "";
  }
  if (/^(https?:)?\/\//i.test(logo) || logo.startsWith("data:")) {
    return logo;
  }
  if (logo.startsWith("/")) {
    return logo;
  }
  return `/${logo}`;
}

function appendVersion(url: string, seed: string): string {
  const join = url.includes("?") ? "&" : "?";
  return `${url}${join}v=${encodeURIComponent(seed)}`;
}

function ensureHeadLink(rel: string): HTMLLinkElement {
  const existing = document.querySelector(`link[rel='${rel}']`) as HTMLLinkElement | null;
  if (existing) {
    return existing;
  }
  const link = document.createElement("link");
  link.rel = rel;
  document.head.appendChild(link);
  return link;
}
