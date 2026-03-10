"use client"
import Footer from "../components/Footer";
import Header from "../components/Header";
import { AnimatePresence, motion, Variants } from "framer-motion"


const fadeUpBlur: Variants = {
    hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.6, ease: "easeOut" as const }
    }
}

export default function ContactPage() {
    return (
        <>
            <Header />
            <motion.section style={styles.section} variants={fadeUpBlur} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="flex flex-col items-center justify-center min-h-screen text-indigo-300 gap-6 text-center px-6">

                <h1 className="text-4xl font-bold text-white">
                    📬 Kontakt
                </h1>

                <p className="max-w-xl text-lg text-indigo-200">
                    Bei Fragen, technischen Problemen oder sonstigen Anliegen kannst du uns jederzeit per E-Mail kontaktieren.
                    Wir helfen dir gerne weiter.
                </p>

                <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl px-6 py-4">
                    <p className="text-xl font-semibold">
                        📧 contact@rollout.live
                    </p>
                </div>

                <p className="text-sm text-indigo-200">
                    Bitte beschreibe dein Anliegen möglichst genau, damit wir dir schnell helfen können.
                </p>

            </motion.section>
            <Footer />
        </>
    )
}



const styles = {
  section: {
    marginBottom: '2.5rem',
    paddingBottom: '2.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  }
}