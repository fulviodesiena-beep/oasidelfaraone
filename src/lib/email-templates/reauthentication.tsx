import * as React from 'react'
import { Text } from '@react-email/components'
import { AuthLayout, code, para } from './auth-layout'

interface ReauthenticationEmailProps { token: string }

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <AuthLayout
    preview="Il tuo codice di verifica"
    title="Codice di verifica"
    note="Il codice scade dopo poco tempo. Se non lo hai richiesto tu, ignora questa email."
  >
    <Text style={para}>Usa questo codice per confermare la tua identità:</Text>
    <Text style={code}>{token}</Text>
  </AuthLayout>
)

export default ReauthenticationEmail
