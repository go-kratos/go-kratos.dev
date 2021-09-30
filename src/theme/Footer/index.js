/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {useThemeConfig} from '@docusaurus/theme-common';
import useBaseUrl from '@docusaurus/useBaseUrl';
import isInternalUrl from '@docusaurus/isInternalUrl';
import styles from './index.css';
import ThemedImage from '@theme/ThemedImage';
import IconExternalLink from '@theme/IconExternalLink';

function FooterLink({to, href, label, prependBaseUrlToHref, ...props}) {
  const toUrl = useBaseUrl(to);
  const normalizedHref = useBaseUrl(href, {
    forcePrependBaseUrl: true,
  });
  return (
    <Link
      {...(href
        ? {
            href: prependBaseUrlToHref ? normalizedHref : href,
          }
        : {
            to: toUrl,
          })}
      {...props}>
      {href && !isInternalUrl(href) ? (
        <span className="flex flex-row items-center">
          <span>{label}</span>
        </span>
      ) : (
        label
      )}
    </Link>
  );
}

const FooterLogo = ({sources, alt}) => (
  <ThemedImage className="footer__logo" alt={alt} sources={sources} />
);

function Footer() {
  const {footer} = useThemeConfig();
  const {copyright, links = [], logo = {}} = footer || {};
  const sources = {
    light: useBaseUrl(logo.src),
    dark: useBaseUrl(logo.srcDark || logo.src),
  };

  if (!footer) {
    return null;
  }

  return (
    <footer className="tailwind">
      <div className={"bg-gray-50 pt-8"}>
          <div className="container px-4 grid grid-cols-4 gap-x-8">
              <div className={"col-span-1"}>
                <h2 className={"font-bold text-xl"}>Kratos</h2>
                  <p className={"text-gray-500 text-xs py-4"}>
                      Kratos is a web application framework with expressive,
                      elegant syntax. We've already laid the foundation.
                  </p>
              </div>
              <div className={"col-span-3"}>
                  <div>
                      {links && links.length > 0 && (
                          <div className="row footer__links">
                              {links.map((linkItem, i) => (
                                  <div key={i} className="col footer__col">
                                      {linkItem.title != null ? (
                                          <div className="footer__title">{linkItem.title}</div>
                                      ) : null}
                                      {linkItem.items != null &&
                                      Array.isArray(linkItem.items) &&
                                      linkItem.items.length > 0 ? (
                                          <ul className="footer__items">
                                              {linkItem.items.map((item, key) =>
                                                  item.html ? (
                                                      <li
                                                          key={key}
                                                          className="footer__item" // Developer provided the HTML, so assume it's safe.
                                                          // eslint-disable-next-line react/no-danger
                                                          dangerouslySetInnerHTML={{
                                                              __html: item.html,
                                                          }}
                                                      />
                                                  ) : (
                                                      <li key={item.href || item.to} className="footer__item">
                                                          <FooterLink {...item} />
                                                      </li>
                                                  ),
                                              )}
                                          </ul>
                                      ) : null}
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
              <div className={"col-span-4"}>
                  {(logo || copyright) && (
                      <div>
                          {logo && (logo.src || logo.srcDark) && (
                              <div className="">
                                  {logo.href ? (
                                      <Link href={logo.href} className={styles.footerLogoLink}>
                                          <FooterLogo alt={logo.alt} sources={sources} />
                                      </Link>
                                  ) : (
                                      <FooterLogo alt={logo.alt} sources={sources} />
                                  )}
                              </div>
                          )}
                          {copyright ? (
                              <div
                                  className="" // Developer provided the HTML, so assume it's safe.
                                  // eslint-disable-next-line react/no-danger
                                  dangerouslySetInnerHTML={{
                                      __html: copyright,
                                  }}
                              />
                          ) : null}
                      </div>
                  )}
              </div>
          </div>


      </div>
    </footer>
  );
}

export default Footer;
