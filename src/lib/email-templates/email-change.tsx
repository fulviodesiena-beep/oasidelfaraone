import * as React from 'react'
import { Text } from '@react-email/components'
import { AuthLayout, para } from './auth-layout'

interface EmailChangeEmailProps { siteName: string; oldEmail: string; email: string; newEmail: string; confirmationUrl: string }

export const EmailChangeEmail = ({ siteName, oldEmail, email, newEmail, confirmationUrl }: EmailChangeEmailProps) => (
  <AuthLayout
    preview={`Conferma il cambio email per ${siteName}`}
    title="Conferma il nuovo indirizzo email"
    cta={{ label: 'Conferma il cambio', url: confirmationUrl }}
    note="Se non hai chiesto tu questa modifica, ignora questa email e verifica la sicurezza del tuo account."
  >
    <Text style={para}>Ciao,</Text>
    <Text style={para}>hai chiesto di cambiare l’email del tuo accesso a {siteName} da {oldEmail || email} a {newEmail}. Premi il pulsante per confermare.</Text>
  </AuthLayout>
)

export default EmailChangeEmail
