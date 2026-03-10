"use client"
import { AnimatePresence, motion, Variants } from "framer-motion"
import Header from "../components/Header"
import Footer from "../components/Footer"

const fadeUpBlur: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: "easeOut" as const }
  }
}


export default function PrivacyPolicyPage() {
  return (
    <>
    
      <Header />
      <AnimatePresence>
        <div style={styles.container} className="h-screen overflow-y-auto">
          <div style={styles.content}>
            <motion.h1 style={styles.h1} variants={fadeUpBlur} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              Datenschutzerklärung
            </motion.h1>
            <motion.p style={styles.subtitle} variants={fadeUpBlur} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              Wie RollOut deine Daten behandelt
            </motion.p>

            <motion.section style={styles.section} variants={fadeUpBlur} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
              <h2 style={styles.h2}>📋 Welche Daten speichern wir?</h2>
              <div style={styles.dataBox}>
                <h3 style={styles.h3}>Im Browser (Cookie)</h3>
                <p style={styles.text}><strong>Client-ID:</strong> Eine eindeutige ID, um dich während der Spielsitzung zu identifizieren. Diese wird beim Schließen des Browsers gelöscht.</p>
              </div>
              <div style={styles.dataBox}>
                <h3 style={styles.h3}>In der Datenbank</h3>
                <p style={styles.text}><strong>Spieler-Name:</strong> Der Name, den du eingibst, um dem Spiel beizutreten.</p>
                <p style={styles.text}><strong>Room-Code:</strong> Der Code des Spielraums, dem du beigetreten bist.</p>
                <p style={styles.text}><strong>Spieler-Status:</strong> Ob du Host oder Gast bist, Beitrittszeitpunkt.</p>
                <p style={styles.text}><strong>Spielaktivitäten:</strong> Wann du beigetreten/verlassen hast, wer gedreht hat (nur während der Spielsitzung).</p>
              </div>
              <div style={styles.highlight}>✓ Wir speichern <strong>KEINE</strong> E-Mail, Passwort, Zahlungsdaten oder persönliche Informationen.</div>
            </motion.section>

            <motion.section style={styles.section} variants={fadeUpBlur} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
              <h2 style={styles.h2}>🎮 Wofür nutzen wir deine Daten?</h2>
              <ul style={styles.list}>
                <li><strong>Spielbetrieb:</strong> Um das Spiel zu ermöglichen und dich mit anderen Spielern zu verbinden.</li>
                <li><strong>Sicherheit:</strong> Um Missbrauch zu verhindern und die Spielintegration zu schützen.</li>
                <li><strong>Fehlerdiagnose:</strong> Um Probleme zu erkennen und RollOut zu verbessern.</li>
              </ul>
            </motion.section>

            <motion.section style={styles.section} variants={fadeUpBlur} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
              <h2 style={styles.h2}>⏱️ Wie lange speichern wir Daten?</h2>
              <div style={styles.dataBox}>
                <p style={styles.text}><strong>Client-ID (Browser):</strong> Wird gelöscht, wenn du den Browser schließt.</p>
                <p style={styles.text}><strong>Spielersitzung:</strong> Wird gelöscht, wenn der Spielraum geschlossen wird oder der Host das Spiel beendet.</p>
                <p style={styles.text}><strong>Spielhistorie:</strong> Wird nach 30 Tagen automatisch aus der Datenbank gelöscht.</p>
              </div>
            </motion.section>

            <motion.section style={styles.section} variants={fadeUpBlur} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
              <h2 style={styles.h2}>🔒 Wie schützen wir deine Daten?</h2>
              <ul style={styles.list}>
                <li>✓ HTTPS-Verschlüsselung für alle Datenübertragungen</li>
                <li>✓ Sichere Datenbank mit beschränktem Zugriff</li>
                <li>✓ Automatische Löschung alter Daten</li>
                <li>✓ Keine Weitergabe an Werbepartner oder Dritte</li>
              </ul>
            </motion.section>
            <motion.section
              style={styles.section}
              variants={fadeUpBlur}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              <h2 style={styles.h2}>⚖️ Deine Datenschutzrechte & Kontakt</h2>

              <p style={styles.text}>
                Du hast das Recht, deine Daten einzusehen, zu berichtigen oder löschen zu lassen.
                Des Weiteren stehen wir für Fragen oder technische Probleme bereit.
                Schreib uns einfach an:
              </p>

              <div style={styles.contactBox}>
                <p><strong>📧 contact@rollout.live</strong></p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>
                  Bitte gib deinen Spielernamen oder deine Client-ID an.
                </p>
              </div>

              <div style={styles.contactBox}>
                <p><strong>📞 contact@rollout.live</strong></p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>
                  Bitte gib uns eine kurze Beschreibung deines Problems.
                </p>
              </div>

              <div style={styles.contactBox}>
                <p><strong>💡 contact@rollout.live</strong></p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>
                  Du hast eine Idee für neue Features oder Verbesserungsvorschläge?
                  Schreib uns einfach!
                </p>
              </div>
            </motion.section>
            <motion.div variants={fadeUpBlur} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>Letzte Aktualisierung: Januar 2025</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'rgba(255,255,255,0.4)' }}>
                Diese Datenschutzerklärung kann aktualisiert werden. Änderungen werden hier veröffentlicht.
              </p>
            </motion.div>
          </div>
        </div>
      </AnimatePresence>
      <Footer/>
    </>
  )
}
const styles = {
  container: {
    minHeight: '100vh',
    padding: '2rem 1rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  content: {
    maxWidth: '700px',
    margin: '0 auto',
    borderRadius: '16px',
    padding: '2.5rem',
  },
  h1: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    color: 'white',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '2rem',
  },
  section: {
    marginBottom: '2.5rem',
    paddingBottom: '2.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  h2: {
    fontSize: '1.4rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: 'white',
  },
  h3: {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: '0.5rem',
  },
  text: {
    color: 'rgba(255,255,255,0.75)',
    lineHeight: '1.6',
    marginBottom: '0.75rem',
  },
  dataBox: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '10px',
    padding: '1.25rem',
    marginBottom: '1rem',
    backdropFilter: 'blur(8px)',
  },
  highlight: {
    background: 'rgba(255,255,255,0.1)',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '10px',
    padding: '1.25rem',
    color: 'white',
    fontWeight: '500',
    marginTop: '1.5rem',
  },
  list: {
    marginLeft: '1.5rem',
    lineHeight: '1.8',
    color: 'rgba(255,255,255,0.75)',
  },
  contactBox: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '10px',
    padding: '1.25rem',
    marginBottom: '1rem',
    color: 'rgba(255,255,255,0.85)',
  },
  link: {
    color: '#93c5fd',
    textDecoration: 'none',
    fontWeight: '500',
  },
  footer: {
    textAlign: 'center' as const,
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.9rem',
    marginTop: '2rem',
    paddingTop: '2rem',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
}