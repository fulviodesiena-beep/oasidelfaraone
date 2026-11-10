import * as React from 'react'
import { Text } from '@react-email/components'
import { AuthLayout, para } from './auth-layout'

interface RecoveryEmailProps { siteName: string; confirmationUrl: string }

export const RecoveryEmail = ({ siteName, confirmationUrl }: RecoveryEmailProps) => (
  <AuthLayout
    preview={`Reimposta la password di ${siteName}`}
    title="Reimposta la tua password"
    cta={{ label: 'Scegli una nuova password', url: confirmationUrl }}
    note="Il link è personale e scade dopo poco tempo. Se non hai chiesto tu di reimpostare la password, ignora questa email: la password attuale resta invariata."
  >
    <Text style={para}>Ciao,</Text>
    <Text style={para}>abbiamo ricevuto una richiesta di reimpostazione della password per l’area riservata di {siteName}. Premi il pulsante qui sotto per sceglierne una nuova.</Text>
  </AuthLayout>
)

export default RecoveryEmail
