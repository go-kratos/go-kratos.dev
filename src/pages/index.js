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
                <header>
                    <h1 className="hhhh">
                        Hello World
                    </h1>
                </header>
            </div>
        </Layout>
    );
}

export default Home;
