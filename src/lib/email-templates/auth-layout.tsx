import * as React from 'react'
import { Body, Button, Container, Head, Hr, Html, Preview, Section, Text } from '@react-email/components'

// Shared Italian brand frame for authentication emails (white body, gold/navy accents).
export function AuthLayout({ preview, title, children, cta, note }: {
  preview: string; title: string; children: React.ReactNode
  cta?: { label: string; url: string } | undefined; note?: string | undefined
}) {
  return (
    <Html lang="it" dir="ltr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>OASI DEL FARAONE</Text>
          <Text style={tagline}>Esperienze sul Mar Rosso</Text>
          <Hr style={rule} />
          <Text style={h1}>{title}</Text>
          {children}
          {cta ? <Section style={{ textAlign: 'center', margin: '26px 0' }}><Button href={cta.url} style={button}>{cta.label}</Button></Section> : null}
          {note ? <Text style={small}>{note}</Text> : null}
          <Hr style={rule} />
          <Text style={small}>Oasi del Faraone · Domina Coral Bay, Sharm el-Sheikh</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const para = { fontSize: '15px', lineHeight: '1.6', margin: '0 0 14px', color: '#1d2433' }
export const code = { fontSize: '26px', letterSpacing: '6px', fontWeight: 'bold' as const, color: '#0D1B2A', textAlign: 'center' as const, margin: '20px 0' }
const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, "Times New Roman", serif', color: '#1d2433' }
const container = { maxWidth: '560px', padding: '28px 24px' }
const brand = { fontSize: '13px', letterSpacing: '4px', color: '#9a6f1f', margin: 0, textAlign: 'center' as const }
const tagline = { fontSize: '12px', fontStyle: 'italic' as const, color: '#6b7280', margin: '4px 0 0', textAlign: 'center' as const }
const rule = { borderColor: '#e8d9b8', margin: '18px 0' }
const h1 = { fontSize: '22px', color: '#0D1B2A', margin: '0 0 16px' }
const button = { backgroundColor: '#0D1B2A', color: '#E8C97A', padding: '12px 22px', borderRadius: '4px', fontSize: '15px', textDecoration: 'none' }
const small = { fontSize: '12px', color: '#6b7280', lineHeight: '1.5', margin: '4px 0' }
