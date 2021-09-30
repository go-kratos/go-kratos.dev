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

let socialLinks = [
    {
        name: "Twitter",
        url: "https://go-kratos.dev/blog",
        icon: <svg
            xmlns="http://www.w3.org/2000/svg"
            className={"w-5 h-5 mr-2 fill-current text-gray-500"}
            viewBox="0 0 1024 1024"
        >
            <defs>
                <style></style>
            </defs>
            <path
                d="M928 254.3c-30.6 13.2-63.9 22.7-98.2 26.4 35.4-21.1 62.3-54.4 75-94-32.7 19.5-69.7 33.8-108.2 41.2C765.4 194.6 721.1 174 672 174c-94.5 0-170.5 76.6-170.5 170.6 0 13.2 1.6 26.4 4.2 39.1-141.5-7.4-267.7-75-351.6-178.5-14.8 25.4-23.2 54.4-23.2 86.1 0 59.2 30.1 111.4 76 142.1-28-1.1-54.4-9-77.1-21.7v2.1c0 82.9 58.6 151.6 136.7 167.4-14.3 3.7-29.6 5.8-44.9 5.8-11.1 0-21.6-1.1-32.2-2.6C211 652 273.9 701.1 348.8 702.7c-58.6 45.9-132 72.9-211.7 72.9-14.3 0-27.5-.5-41.2-2.1C171.5 822 261.2 850 357.8 850 671.4 850 843 590.2 843 364.7c0-7.4 0-14.8-.5-22.2 33.2-24.3 62.3-54.4 85.5-88.2z"
            ></path>
        </svg>
    },
    {
        name: "Discord",
        url: "https://discord.gg/BWzJsUJ",
        icon: <svg
            xmlns="http://www.w3.org/2000/svg"
            className={"w-5 h-5 mr-2 fill-current text-gray-500"}
            viewBox="0 0 1024 1024"
        >
            <defs>
                <style></style>
            </defs>
            <path d="M862.805 0c59.99 0 108.374 48.512 111.232 105.6V1024L859.82 927.019l-62.72-57.088-68.438-59.648 28.587 94.08H158.293c-59.818 0-108.373-45.44-108.373-105.643V105.813C49.92 48.725 98.56.128 158.507.128h704l.298-.128zM601.771 242.475h-1.28l-8.619 8.533c88.448 25.6 131.243 65.579 131.243 65.579-57.003-28.502-108.374-42.752-159.744-48.512-37.12-5.76-74.24-2.731-105.6 0h-8.534c-20.053 0-62.72 8.533-119.893 31.36-19.925 8.661-31.36 14.336-31.36 14.336s42.752-42.752 136.96-65.579l-5.76-5.76s-71.339-2.73-148.352 54.187c0 0-77.013 134.144-77.013 299.52 0 0 42.666 74.24 159.701 77.056 0 0 17.067-22.742 34.347-42.752-65.707-19.968-91.307-59.904-91.307-59.904s5.717 2.816 14.293 8.533h2.56c1.28 0 1.878.64 2.56 1.28v.256c.683.683 1.28 1.28 2.56 1.28 14.08 5.803 28.16 11.52 39.68 17.067a349.013 349.013 0 0076.8 22.869c39.68 5.76 85.163 8.533 136.96 0 25.6-5.76 51.2-11.392 76.8-22.827 16.64-8.533 37.12-17.066 59.606-31.445 0 0-25.6 39.936-94.08 59.904 14.08 19.883 33.92 42.667 33.92 42.667 117.077-2.56 162.56-76.8 165.12-73.643 0-165.12-77.44-299.52-77.44-299.52-69.76-51.797-135.04-53.76-146.56-53.76l2.389-.853zm7.168 188.288c29.994 0 54.186 25.6 54.186 56.96 0 31.573-24.32 57.173-54.186 57.173-29.867 0-54.187-25.6-54.187-56.917.085-31.574 24.448-57.088 54.187-57.088zm-193.835 0c29.867 0 54.016 25.6 54.016 56.96 0 31.573-24.32 57.173-54.187 57.173-29.866 0-54.186-25.6-54.186-56.917 0-31.574 24.32-57.088 54.186-57.088z"></path>
        </svg>
    },
    {
        name: "GitHub",
        url: "https://github.com/go-kratos",
        icon:  <svg
            xmlns="http://www.w3.org/2000/svg"
            className={"w-5 h-5 mr-2 fill-current text-gray-500"}
            viewBox="0 0 1024 1024"
        >
            <defs>
                <style></style>
            </defs>
            <path d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9 23.5 23.2 38.1 55.4 38.1 91v112.5c.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z"></path>
        </svg>
    },
    {
        name: "Facebook",
        url: "https://github.com/go-kratos/kratos/discussions",
        icon:     <svg
            xmlns="http://www.w3.org/2000/svg"
            className={"w-5 h-5 mr-2 fill-current text-gray-500"}
            viewBox="0 0 1024 1024"
        >
            <defs>
                <style></style>
            </defs>
            <path d="M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-92.4 233.5h-63.9c-50.1 0-59.8 23.8-59.8 58.8v77.1h119.6l-15.6 120.7h-104V912H539.2V602.2H434.9V481.4h104.3v-89c0-103.3 63.1-159.6 155.3-159.6 44.2 0 82.1 3.3 93.2 4.8v107.9z"></path>
        </svg>
    },
]

function SocialLink(props) {
    return <a className={"inline-flex items-center"} href={props.data.url}>
        {props.data.icon}
    </a>
}


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
          <div className="container grid grid-cols-4 gap-x-8">
              <div className={"md:col-span-1 col-span-full"}>
                <h2 className={"font-bold text-xl"}>Kratos</h2>
                  <p className={"text-gray-500 text-xs py-4"}>
                      Kratos is a web application framework with expressive,
                      elegant syntax. We've already laid the foundation.
                  </p>
                  <div className={"py-4 inline-flex gap-2"}>
                      {socialLinks.map((x,i)=><SocialLink key={i} data={x}/>)}
                  </div>
              </div>
              <div className={"md:col-span-3 col-span-full"}>
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
                                  className="text-sm pb-2" // Developer provided the HTML, so assume it's safe.
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
