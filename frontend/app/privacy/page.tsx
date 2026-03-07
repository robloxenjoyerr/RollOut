export default function PrivacyPolicyPage() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.h1}>Datenschutzerklärung</h1>
        <p style={styles.subtitle}>Wie RollOut deine Daten behandelt</p>

        {/* Datenerfassung */}
        <section style={styles.section}>
          <h2 style={styles.h2}>📋 Welche Daten speichern wir?</h2>
          
          <div style={styles.dataBox}>
            <h3 style={styles.h3}>Im Browser (Cookie)</h3>
            <p style={styles.text}>
              <strong>Client-ID:</strong> Eine eindeutige ID, um dich während der Spielsitzung zu identifizieren. 
              Diese wird beim Schließen des Browsers gelöscht.
            </p>
          </div>

          <div style={styles.dataBox}>
            <h3 style={styles.h3}>In der Datenbank</h3>
            <p style={styles.text}>
              <strong>Spieler-Name:</strong> Der Name, den du eingibst, um dem Spiel beizutreten.
            </p>
            <p style={styles.text}>
              <strong>Room-Code:</strong> Der Code des Spielraums, dem du beigetreten bist.
            </p>
            <p style={styles.text}>
              <strong>Spieler-Status:</strong> Ob du Host oder Gast bist, Beitrittszeitpunkt.
            </p>
            <p style={styles.text}>
              <strong>Spielaktivitäten:</strong> Wann du beigetreten/verlassen hast, wer gedreht hat (nur während der Spielsitzung).
            </p>
          </div>

          <div style={styles.highlight}>
            ✓ Wir speichern <strong>KEINE</strong> E-Mail, Passwort, Zahlungsdaten oder persönliche Informationen.
          </div>
        </section>

        {/* Zweck */}
        <section style={styles.section}>
          <h2 style={styles.h2}>🎮 Wofür nutzen wir deine Daten?</h2>
          
          <ul style={styles.list}>
            <li><strong>Spielbetrieb:</strong> Um das Spiel zu ermöglichen und dich mit anderen Spielern zu verbinden.</li>
            <li><strong>Sicherheit:</strong> Um Missbrauch zu verhindern und die Spielintegration zu schützen.</li>
            <li><strong>Fehlerdiagnose:</strong> Um Probleme zu erkennen und RollOut zu verbessern.</li>
          </ul>
        </section>

        {/* Speicherdauer */}
        <section style={styles.section}>
          <h2 style={styles.h2}>⏱️ Wie lange speichern wir Daten?</h2>
          
          <div style={styles.dataBox}>
            <p style={styles.text}>
              <strong>Client-ID (Browser):</strong> Wird gelöscht, wenn du den Browser schließt.
            </p>
            <p style={styles.text}>
              <strong>Spielersitzung:</strong> Wird gelöscht, wenn der Spielraum geschlossen wird oder der Host das Spiel beendet.
            </p>
            <p style={styles.text}>
              <strong>Spielhistorie:</strong> Wird nach 30 Tagen automatisch aus der Datenbank gelöscht.
            </p>
          </div>
        </section>

        {/* Sicherheit */}
        <section style={styles.section}>
          <h2 style={styles.h2}>🔒 Wie schützen wir deine Daten?</h2>
          
          <ul style={styles.list}>
            <li>✓ HTTPS-Verschlüsselung für alle Datenübertragungen</li>
            <li>✓ Sichere Datenbank mit beschränktem Zugriff</li>
            <li>✓ Automatische Löschung alter Daten</li>
            <li>✓ Keine Weitergabe an Werbepartner oder Dritte</li>
          </ul>
        </section>

        {/* Deine Rechte */}
        <section style={styles.section}>
          <h2 style={styles.h2}>⚖️ Deine Datenschutzrechte</h2>
          
          <p style={styles.text}>
            Du hast das Recht, deine Daten einzusehen, zu berichtigen oder löschen zu lassen. 
            Schreib uns einfach an:
          </p>
          
          <div style={styles.contactBox}>
            <p><strong>📧 privacy@rollout.de</strong></p>
            <p style={{marginTop: '0.5rem', fontSize: '0.95rem'}}>
              Bitte gib deinen Spielernamen oder deine Client-ID an.
            </p>
          </div>
        </section>

        {/* Kontakt */}
        <section style={styles.section}>
          <h2 style={styles.h2}>📞 Kontakt & Support</h2>
          
          <div style={styles.contactBox}>
            <p><strong>Datenschutz-Fragen:</strong></p>
            <p><a href="mailto:privacy@rollout.de" style={styles.link}>privacy@rollout.de</a></p>
          </div>

          <div style={styles.contactBox}>
            <p><strong>Technische Probleme:</strong></p>
            <p><a href="mailto:support@rollout.de" style={styles.link}>support@rollout.de</a></p>
          </div>
        </section>

        {/* Footer */}
        <div >
          <p>Letzte Aktualisierung: Januar 2025</p>
          <p style={{fontSize: '0.85rem', marginTop: '0.5rem'}}>
            Diese Datenschutzerklärung kann aktualisiert werden. Änderungen werden hier veröffentlicht.
          </p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '',
    padding: '2rem 1rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  content: {
    maxWidth: '700px',
    margin: '0 auto',
    background: '',
    borderRadius: '12px',
    padding: '2.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
  },
  h1: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    color: 'white',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: 'black',
    marginBottom: '2rem',
  },
  section: {
    marginBottom: '2.5rem',
    paddingBottom: '2.5rem',
    borderBottom: '1px solid #e5e7eb',
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
    color: 'black',
    marginBottom: '0.5rem',
  },
  text: {
    color: 'black',
    lineHeight: '1.6',
    marginBottom: '0.75rem',
  },
  dataBox: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1.25rem',
    marginBottom: '1rem',
  },
  highlight: {
    background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
    border: '2px solid #3b82f6',
    borderRadius: '8px',
    padding: '1.25rem',
    color: '#1e40af',
    fontWeight: '500',
    marginTop: '1.5rem',
  },
  list: {
    marginLeft: '1.5rem',
    lineHeight: '1.8',
    color: '#374151',
  },
  contactBox: {
    background: '#f0f9ff',
    border: '1px solid #bfdbfe',
    borderRadius: '8px',
    padding: '1.25rem',
    marginBottom: '1rem',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '500',
  },
  footer: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '0.9rem',
    marginTop: '2rem',
    paddingTop: '2rem',
    borderTop: '1px solid #e5e7eb',
  },
}