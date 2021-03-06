import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

const features = [
  {
    title: 'API规范化',
    imageUrl: 'img/api.svg',
    description: (
      <>
        API 协议使用 Protobuf 定义接口，实现 HTTP/gRPC 方式进行通信，
        并且 Errors 通过 Enum 作为错误码，以实现错误判定。
      </>
    ),
  },
  {
    title: '组件插件化',
    imageUrl: 'img/plugin.svg',
    description: (
      <>
        Component 统一遵循 OpenTracing 规范进行实现，
        通过 Plugins 设计理念，实现插件化方式提供扩展能力。
      </>
    ),
  },
  {
    title: '项目工程化',
    imageUrl: 'img/layout.svg',
    description: (
      <>
        通过 Git 方式管理 Service 项目模板，并可通过 Kratos 一键初始化脚手架。
      </>
    ),
  },
];

function Feature({imageUrl, title, description}) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={clsx('col col--4', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3 className={styles.featureTitle}>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  return (
    <Layout
      title={` A Go framework for microservices. `}
      description="Kratos is a microservice-oriented governance framework implements by golang, which offers convenient capabilities to help you quickly build a bulletproof application from scratch. <head />">
      <header className={clsx('hero', styles.heroBanner)}>
        <div className="container">
            <img src="/img/logo.svg" alt="Kratos Logo" className={styles.heroLogo}/>
          <h1 className={clsx("hero__title", styles.heroTitle)}>{siteConfig.title}</h1>
          <p className={clsx("hero__subtitle", styles.heroSubitle)}>{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={clsx(
                'button button--outline button--primary button--lg',
                styles.getStarted,
              )}
              to={useBaseUrl('docs/getting-started/start')}>
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default Home;
