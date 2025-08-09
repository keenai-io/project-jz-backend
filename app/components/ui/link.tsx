"use client";

import * as Headless from '@headlessui/react'
import NextLink, {LinkProps, type LinkProps as NextLinkProps} from 'next/link'
import React, {forwardRef} from 'react'
import {getLocalizedUrl} from "intlayer";
import {useLocale} from "next-intlayer";


/**
 * Utility function to check whether a given URL is external.
 * If the URL starts with http:// or https://, it's considered external.
 */
export const checkIsExternalLink = (href?: string): boolean =>
  /^https?:\/\//.test(href ?? "");

/**
 * A custom Link component that adapts the href attribute based on the current locale.
 * For internal links, it uses `getLocalizedUrl` to prefix the URL with the locale (e.g., /fr/about).
 * This ensures that navigation stays within the same locale context.
 */
export const Link = forwardRef(function Link({
                                               href,
                                               children,
                                               ...props
                                             }: LinkProps & React.ComponentPropsWithoutRef<'a'>, ref: React.ForwardedRef<HTMLAnchorElement>) {
  const {locale} = useLocale();
  const isExternalLink = checkIsExternalLink(href.toString());

  // If the link is internal and a valid href is provided, get the localized URL.
  const hrefI18n: NextLinkProps["href"] =
    href && !isExternalLink ? getLocalizedUrl(href.toString(), locale) : href;

  return (
    <Headless.DataInteractive>
      <NextLink href={hrefI18n} {...props} ref={ref}>
        {children}
      </NextLink>
    </Headless.DataInteractive>

  );
});
