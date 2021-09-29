import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Translate, {translate} from '@docusaurus/Translate';
import './index.css';

function Home() {
    const context = useDocusaurusContext();
    const {siteConfig = {}} = context;
    return (
        <Layout
            title={translate({message: "A Go framework for microservices."})}
            description={translate({message: 'Kratos is a microservice-oriented governance framework implements by golang, which offers convenient capabilities to help you quickly build a bulletproof application from scratch.'})}>
            <div className="tailwind">
                <header className="container">
                    <h1 className={"text-3xl text-red-500"}>标题示例 - H1 - This a headline.</h1>
                </header>
                <section className="container">
                    <p>hello</p>
                </section>
            </div>
        </Layout>
    );
}

export default Home;
