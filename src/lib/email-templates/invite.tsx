import * as React from 'react'
import { Text } from '@react-email/components'
import { AuthLayout, para } from './auth-layout'

interface InviteEmailProps { siteName: string; siteUrl: string; confirmationUrl: string }

export const InviteEmail = ({ siteName, confirmationUrl }: InviteEmailProps) => (
  <AuthLayout
    preview={`Il tuo invito all’area riservata di ${siteName}`}
    title="Sei stato invitato"
    cta={{ label: 'Accetta l’invito', url: confirmationUrl }}
    note="Se non ti aspettavi questo invito, ignora questa email."
  >
    <Text style={para}>Ciao,</Text>
    <Text style={para}>sei stato invitato nell’area riservata di {siteName}. Premi il pulsante per attivare il tuo accesso e scegliere una password.</Text>
  </AuthLayout>
)

export default InviteEmail
