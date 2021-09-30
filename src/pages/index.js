import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Translate, {translate} from '@docusaurus/Translate';
import './index.css';

let features = [
    {
        icon: "/assets/microservices.png",
        title: "Microservices",
        description: "Quickly deliver production-grade features with independently evolve-able microservices."
    },
    {
        icon: "/assets/specified-api.png",
        title: "Specified API",
        description: "The API protocol uses Protobuf to define interfaces for HTTP/gRPC communication."
    },
    {
        icon: "/assets/plug-able.png",
        title: "Plug-able",
        description: "Components' implementation is following the OpenTelemetry specification providing plug-in design concepts."
    },
    {
        icon: "/assets/kratos-ui.png",
        title: "Kratos UI",
        description: "Complete service management platform simple configuration can be owned."
    },
]

function Feature(props) {
    return (
        <div className={"cursor-pointer py-8 px-4 flex flex-col items-center rounded-2xl border border-solid shadow-lg hover:shadow-2xl border-gray-50 transition duration-150 ease-in-out"}>
            <img alt={props.data.title} src={props.data.icon}/>
            <h3 className={"py-4 font-bold text-gray-700 text-lg"}>{props.data.title}</h3>
            <p className={"text-center text-sm text-gray-500"}>{props.data.description}</p>
        </div>
    )
}

function Home() {
    const context = useDocusaurusContext();
    const {siteConfig = {}} = context;
    return (
        <Layout>
            <div className={"tailwind"}>
                <header className={"py-16"}>
                    <div className={"grid grid-cols-1 gap-8 md:grid-cols-2 section"}>
                        <div>
                            <h2 className={"font-bold text-5xl"}>The Go Framework for microservices</h2>
                            <p className={"py-8 text-gray-500"}>Kratos is a web application framework with expressive,
                                elegant syntax. We've already laid the foundation.</p>
                            <div className={"flex flex-row gap-3 justify-start"}>
                                <button className={"btn btn-blue"}>Get Started</button>
                                <button className={"btn"}>GitHub</button>
                            </div>
                        </div>
                        <div className={"hidden md:block"}>
                            <svg href={"/assets/logo.svg"}/>
                        </div>
                    </div>
                </header>
                <section className="bg-gray-50">
                    <div className={"section py-8"}>
                        <h2 className={"text-gray-500 font-bold rounded-xl"}>Resource</h2>
                        <div className={"grid grid-cols-1 gap-8 md:grid-cols-2"}>
                            <div className={""}>
                                <h1 className={"font-bold text-4xl py-8"}>A community built for people like you</h1>
                                <p>Whether you’re a solo developer or a 20-person team, getting started is simple thanks
                                    to
                                    our
                                    great community.</p>
                                <div className={"py-4 grid grid-cols-2"}>
                                    <a>Blog</a>
                                    <a>Discussions</a>
                                    <a>Discord</a>
                                    <a>StackOverflow</a>
                                </div>
                            </div>
                            <div>
                                <div className={"px-8 py-8 rounded-xl bg-white relative mr-8"}>
                                    <img className={"bg-black px-2 py-2 rounded-xl absolute right-0 transform translate-x-1/2"} alt="geekbang" src={"/assets/geekbang.png"} />
                                    <h2 className={"text-gray-500 font-bold"}>Featured Resource</h2>
                                    <h1 className={"py-8 font-bold text-3xl"}>Geekbang training camp</h1>
                                    <p>60 hours of content, 13 modules, Check them out, see for yourself, and massively
                                        level up
                                        your development skills in the process.</p>
                                    <div>
                                        <button className={"btn"}>Start Learning</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section>
                    <div className="section py-8">
                        <h2 className={"font-bold text-4xl text-center py-8"}>What Kratos can do</h2>
                        <div className={"grid grid-cols-1 md:grid-cols-4 gap-4 mx-8 md:mx-0"}>
                            {features.map((x,i)=><Feature data={x} key={i}/>)}
                        </div>
                    </div>
                </section>
                <section className="bg-gray-50 mt-48 h-36">
                    <div className={"section"}>
                        <div className={"transform -translate-y-1/2 py-8 px-8 border-solid border border-gray-200 rounded-xl bg-contribution bg-white bg-no-repeat bg-right-bottom"}>
                            <h2 className={"font-bold text-gray-500 text-xl"}>Contribution</h2>
                            <p className={"py-4 max-w-xl"}>Thank you for considering contribute to the Kratos framework.
                                Every time you contribute, we will make us further.
                            </p>
                            <button className={"btn"}>Contribution Guide</button>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
}

export default Home;
