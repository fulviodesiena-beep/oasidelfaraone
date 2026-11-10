import * as React from 'react'
import { Text } from '@react-email/components'
import { AuthLayout, para } from './auth-layout'

interface MagicLinkEmailProps { siteName: string; confirmationUrl: string }

export const MagicLinkEmail = ({ siteName, confirmationUrl }: MagicLinkEmailProps) => (
  <AuthLayout
    preview={`Il tuo link di accesso a ${siteName}`}
    title="Il tuo link di accesso"
    cta={{ label: 'Accedi', url: confirmationUrl }}
    note="Il link scade dopo poco tempo. Se non hai chiesto tu di accedere, ignora questa email."
  >
    <Text style={para}>Ciao,</Text>
    <Text style={para}>premi il pulsante qui sotto per accedere all’area riservata di {siteName}.</Text>
  </AuthLayout>
)

export default MagicLinkEmail
