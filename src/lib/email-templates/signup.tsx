import * as React from 'react'
import { Text } from '@react-email/components'
import { AuthLayout, para } from './auth-layout'

interface SignupEmailProps { siteName: string; siteUrl: string; recipient: string; confirmationUrl: string }

export const SignupEmail = ({ siteName, recipient, confirmationUrl }: SignupEmailProps) => (
  <AuthLayout
    preview={`Conferma la tua email per ${siteName}`}
    title="Conferma il tuo indirizzo email"
    cta={{ label: 'Conferma email', url: confirmationUrl }}
    note="Se non hai creato tu questo account, ignora questa email."
  >
    <Text style={para}>Ciao,</Text>
    <Text style={para}>per completare l’accesso a {siteName} conferma l’indirizzo {recipient} con il pulsante qui sotto.</Text>
  </AuthLayout>
)

export default SignupEmail
