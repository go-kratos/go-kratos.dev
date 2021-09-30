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
        url: "/en/docs/getting-started/examples",
        title: "Microservices",
        description: "Quickly deliver production-grade features with independently evolve-able microservices."
    },
    {
        icon: "/assets/specified-api.png",
        url: "http://localhost:3000/docs/component/api",
        title: "Specified API",
        description: "The API protocol uses Protobuf to define interfaces for HTTP/gRPC communication."
    },
    {
        icon: "/assets/plug-able.png",
        url: "/en/docs/getting-started/plugin",
        title: "Plug-able",
        description: "Components' implementation is following the OpenTelemetry specification providing plug-in design concepts."
    },
    {
        icon: "/assets/kratos-ui.png",
        title: "Kratos UI",
        description: "Complete service management platform simple configuration can be owned."
    },
]

let communityLinks = [
    {
        name: "Blog",
        url: "https://go-kratos.dev/blog",
    },
    {
        name: "Discussions",
        url: "https://github.com/go-kratos/kratos/discussions",
    },
    {
        name: "Discord",
        url: "https://discord.gg/BWzJsUJ",
    },
]

function CommunityLink(props) {
    return <a className={"inline-flex items-center"} href={props.data.url}>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={"w-5 h-5 mr-2"}
            viewBox="0 0 1024 1024"
        >
            <defs>
                <style></style>
            </defs>
            <path
                fill="#4fbdea"
                d="M581.8 684.7c-3.5-3.5-9.2-3.5-12.7 0L438.4 815.4c-60.5 60.5-162.7 66.9-229.5 0-66.9-66.9-60.5-169 0-229.5l130.7-130.7c3.5-3.5 3.5-9.2 0-12.7l-44.8-44.8c-3.5-3.5-9.2-3.5-12.7 0L151.4 528.4c-95.2 95.2-95.2 249.2 0 344.2s249.2 95.2 344.2 0L626.3 742c3.5-3.5 3.5-9.2 0-12.7l-44.5-44.6zm290.9-533.3c-95.2-95.2-249.2-95.2-344.2 0L397.6 282.1c-3.5 3.5-3.5 9.2 0 12.7l44.7 44.7c3.5 3.5 9.2 3.5 12.7 0l130.7-130.7c60.5-60.5 162.7-66.9 229.5 0 66.9 66.9 60.5 169 0 229.5L684.5 569.1c-3.5 3.5-3.5 9.2 0 12.7l44.8 44.8c3.5 3.5 9.2 3.5 12.7 0l130.7-130.7c95.1-95.2 95.1-249.4 0-344.5z"
            ></path>
            <path
                fill="#4fbdea"
                d="M622.4 354.9c-3.5-3.5-9.2-3.5-12.7 0L354.9 609.7c-3.5 3.5-3.5 9.2 0 12.7l44.5 44.5c3.5 3.5 9.2 3.5 12.7 0l254.7-254.7c3.5-3.5 3.5-9.2 0-12.7l-44.4-44.6z"
            ></path>
        </svg>
        <span className={"text-gray-600 hover:text-gray-400 transition duration-150 ease-in-out"}>{props.data.name}</span>
    </a>
}

function Feature(props) {
    return (
        <a href={props.data.url}
            className={"cursor-pointer py-8 px-8 flex justify-start flex-col items-center rounded-2xl border border-solid shadow hover:shadow-2xl border-gray-50 transition duration-150 ease-in-out"}>
            <img className={"py-4"} alt={props.data.title} src={props.data.icon}/>
            <h3 className={"py-4 font-bold text-gray-700 text-lg"}>{props.data.title}</h3>
            <p className={"text-center text-sm text-gray-500"}>{props.data.description}</p>
        </a>
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
                                <a href={"/en/docs/getting-started/start"}><button className={"btn btn-blue inline-flex items-center"}>Get Started</button></a>
                                <a href={"https://github.com/go-kratos/kratos"}><button className={"btn inline-flex items-center"}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={"fill-current w-6 h-6 mr-2"}
                                        viewBox="0 0 1024 1024"
                                    >
                                        <path
                                            d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9 23.5 23.2 38.1 55.4 38.1 91v112.5c.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z"></path>
                                    </svg>
                                    <span>GitHub</span></button></a>
                            </div>
                        </div>
                        <div className={"hidden md:block flex mx-auto"}>
                            <svg
                                className={"h-64"}
                                xmlns="http://www.w3.org/2000/svg"
                                fillRule="evenodd"
                                strokeLinejoin="round"
                                strokeMiterlimit="2"
                                clipRule="evenodd"
                                viewBox="0 0 1080 1080"
                            >
                                <g transform="translate(540 -37.248)">
                                    <path
                                        fill="#2AD4FF"
                                        d="M800.519 900.035L943 1041.93l-298 .82 155.519-142.715z"
                                        transform="translate(-540 37.248)"
                                    ></path>
                                    <path
                                        fill="#49DBFF"
                                        d="M439 540l361.519 360.035L299 700l140-160z"
                                        transform="translate(-540 37.248)"
                                    ></path>
                                    <path
                                        fill="#96EAFF"
                                        d="M800.519 900.035L644.884 1042.75 299 700l501.519 200.035z"
                                        transform="translate(-540 37.248)"
                                    ></path>
                                    <path
                                        fill="#2AD4FF"
                                        d="M639.065 38.605l117.534 180.246L936 37.248"
                                        transform="translate(-540 37.248)"
                                    ></path>
                                    <path
                                        fill="#00C8FF"
                                        d="M639.065 38.605L376 302l381-83.149L639.065 38.605z"
                                        transform="translate(-540 37.248)"
                                    ></path>
                                    <path
                                        fill="#5DF"
                                        d="M375.043 302.275L439 540l317.599-321.149-381.556 83.424z"
                                        transform="translate(-540 37.248)"
                                    ></path>
                                    <path
                                        fill="#AEF"
                                        d="M137 540l238.043-237.725L439 540H137z"
                                        transform="translate(-540 37.248)"
                                    ></path>
                                    <path
                                        fill="#79E4FF"
                                        d="M299 700l140-160H137"
                                        transform="translate(-540 37.248)"
                                    ></path>
                                    <path
                                        fill="#999"
                                        fillRule="nonzero"
                                        d="M136.706 145.341v-26.412h53.166l-26.406 26.412c-14.523 14.527-26.485 26.413-26.583 26.413-.097 0-.177-11.886-.177-26.413z"
                                        transform="translate(-1113.37 -543.492) scale(5.1963)"
                                    ></path>
                                    <path
                                        fill="#CCC"
                                        fillRule="nonzero"
                                        d="M163.706 313.929h-26.412v-53.166l26.412 26.405c14.527 14.524 26.413 26.486 26.413 26.583 0 .098-11.886.178-26.413.178z"
                                        transform="translate(-1121.02 -561.786) scale(5.22981)"
                                    ></path>
                                </g>
                            </svg>
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
                                <div className={"py-4 grid grid-cols-2 gap-2"}>
                                    {communityLinks.map((x,i)=><CommunityLink key={i} data={x}/>)}
                                </div>
                            </div>
                            <div>
                                <div className={"px-8 py-8 rounded-xl bg-white relative mr-8"}>
                                    <img
                                        className={"bg-black px-2 py-2 rounded-xl absolute right-0 transform translate-x-1/2"}
                                        alt="geekbang" src={"/assets/geekbang.png"}/>
                                    <h2 className={"text-gray-500 font-bold"}>Featured Resource</h2>
                                    <h1 className={"py-8 font-bold text-3xl"}>Geekbang training camp</h1>
                                    <p>60 hours of content, 13 modules, Check them out, see for yourself, and massively
                                        level up
                                        your development skills in the process.</p>
                                    <div className={"py-8"}>
                                        <a href={"https://u.geekbang.org/subject/go/1000607"}><button className={"btn"}>Start Learning →</button></a>
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
                            {features.map((x, i) => <Feature data={x} key={i}/>)}
                        </div>
                    </div>
                </section>
                <section className="bg-gray-50 mt-60 h-60 sm:h-36 sm:mt-36">
                    <div className={"px-16 md:max-w-screen-lg md:container md:px-8"}>
                        <div
                            className={"transform -translate-y-1/2 py-8 px-8 border-solid border border-gray-200 rounded-xl sm:bg-contribution bg-white bg-no-repeat bg-right-bottom"}>
                            <h2 className={"font-bold text-gray-500 text-xl"}>Contribution</h2>
                            <p className={"py-4 max-w-xl"}>Thank you for considering contribute to the Kratos framework.
                                Every time you contribute, we will make us further.
                            </p>
                            <img className={"py-4 sm:hidden mx-auto"} alt={"contribution"}
                                 src={"/assets/contribution-mobile.png"}/>
                            <a href={"/en/docs/community/contribution"}>
                                <button className={"btn"}>Contribution Guide</button>
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
}

export default Home;
