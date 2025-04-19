import Head from "next/head";
import Link from "next/link";
import {
    ShieldCheckIcon,
    ScaleIcon,
    DocumentTextIcon,
    AcademicCapIcon,
    BeakerIcon,
    CodeBracketIcon,
    EnvelopeIcon,
    ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function Legal() {
    const mainSections = [
        {
            icon: CodeBracketIcon,
            title: "Student Development Project",
            content:
                "ChinFlix represents an educational web development project, showcasing the implementation of modern React.js, Next.js, and streaming technologies. Created by a student developer to demonstrate practical application of web development concepts.",
        },
        {
            icon: BeakerIcon,
            title: "Educational Framework",
            content:
                "This platform serves as a learning environment for exploring advanced web development techniques, API integrations, and user interface design. All features are implemented purely for educational demonstration.",
        },
    ];

    const legalSections = [
        {
            icon: DocumentTextIcon,
            title: "Content & Storage Policy",
            content:
                "ChinFlix operates strictly as a content indexer and does not host, store, or distribute any media files on its servers. All content is accessed through third-party services over which we maintain no control or responsibility.",
        },
        {
            icon: ScaleIcon,
            title: "DMCA Compliance",
            content:
                "We strictly adhere to the Digital Millennium Copyright Act (DMCA). Copyright holders can submit takedown requests for prompt review. All legitimate requests will be processed expeditiously.",
        },
        {
            icon: ShieldCheckIcon,
            title: "Fair Use Statement",
            content:
                "This platform operates under fair use principles for educational and research purposes. Users are responsible for ensuring their use complies with applicable local laws and regulations.",
        },
        {
            icon: ExclamationTriangleIcon,
            title: "Disclaimer",
            content:
                "This is a non-commercial, student project created solely for educational purposes. We do not encourage or promote unauthorized use of copyrighted content.",
        },
    ];

    return (
        <>
            <Head>
                <title>Legal Information | ChinFlix</title>
            </Head>
            <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8 pb-16">
                <div className="max-w-6xl mx-auto space-y-12">
                    <div className="relative overflow-hidden bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-white/10">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent" />
                        <div className="relative space-y-4">
                            <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                                Legal Information
                            </h1>
                            <p className="text-xl text-white/70">Student Practice Project & Educational Platform</p>
                            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            <p className="text-white/60 max-w-3xl">
                                This platform is developed by a student developer as a demonstration of web development skills and modern
                                streaming technologies. It serves purely educational purposes and operates under strict legal guidelines.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {mainSections.map((section, index) => (
                            <div
                                key={index}
                                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.07] to-transparent p-[1px]"
                            >
                                <div className="relative h-full rounded-2xl bg-black/40 backdrop-blur-xl p-6 transition-transform duration-300 group-hover:translate-x-[2px] group-hover:translate-y-[2px]">
                                    <section.icon className="w-8 h-8 mb-4 text-white/80" />
                                    <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
                                    <p className="text-white/60 leading-relaxed">{section.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {legalSections.map((section, index) => (
                            <div
                                key={index}
                                className="group bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:bg-black/60 transition-all duration-300"
                            >
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <section.icon className="w-6 h-6 text-white/80" />
                                        <h2 className="text-xl font-semibold">{section.title}</h2>
                                    </div>
                                    <p className="text-white/60 leading-relaxed">{section.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                        <div className="max-w-3xl mx-auto space-y-6">
                            <div className="flex items-center gap-3">
                                <EnvelopeIcon className="w-6 h-6 text-white/80" />
                                <h2 className="text-2xl font-semibold">Contact Information</h2>
                            </div>
                            <p className="text-white/60">
                                For DMCA takedown requests or legal inquiries, contact:{" "}
                                <span className="text-white">
                                    <Link href="mailto:legal@chinflix.com" className="text-white hover:opacity-80 transition-opacity">
                                        mmoat@proton.me
                                    </Link>
                                </span>
                            </p>
                            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            <div className="text-center space-y-2">
                                <p className="text-white/60">This is a non-commercial student project for educational purposes only.</p>
                                <p className="text-white/40">© {new Date().getFullYear()} ChinFlix</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
