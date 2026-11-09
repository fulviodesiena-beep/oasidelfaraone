import * as React from 'react'
import { Body, Button, Container, Head, Hr, Html, Link, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

export interface OasiSection { title?: string; text: string }
export interface OasiMessageProps {
  subject?: string; preheader?: string; body?: string; sections?: OasiSection[]
  links?: { label: string; url: string }[]; cta?: { label: string; url: string }
  footer?: string; unsubscribeUrl?: string; unsubscribeLabel?: string
}

const lines = (t: string) => t.split(/\n{2,}/).map((p, i) => (
  <Text key={i} style={para}>{p.split('\n').map((l, j, a) => <React.Fragment key={j}>{l}{j < a.length - 1 ? <br /> : null}</React.Fragment>)}</Text>
))

export const OasiMessage = ({ subject, preheader, body = '', sections, links = [], cta, footer, unsubscribeUrl, unsubscribeLabel }: OasiMessageProps) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>{preheader || subject || 'Oasi del Faraone'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>OASI DEL FARAONE</Text>
        <Hr style={rule} />
        {body ? lines(body) : null}
        {sections?.map((s, i) => (
          <Section key={i} style={{ marginBottom: 18 }}>
            {s.title ? <Text style={sectionTitle}>{s.title}</Text> : null}
            {lines(s.text)}
          </Section>
        ))}
        {cta ? <Section style={{ textAlign: 'center', margin: '24px 0' }}><Button href={cta.url} style={button}>{cta.label}</Button></Section> : null}
        {links.length ? <Section style={{ margin: '12px 0' }}>{links.map((l, i) => (
          <Text key={i} style={{ ...para, margin: '6px 0' }}>→ <Link href={l.url} style={link}>{l.label}</Link></Text>
        ))}</Section> : null}
        {footer || unsubscribeUrl ? <>
          <Hr style={rule} />
          {footer ? <Text style={small}>{footer}</Text> : null}
          {unsubscribeUrl ? <Text style={small}><Link href={unsubscribeUrl} style={link}>{unsubscribeLabel || 'Disiscriviti'}</Link></Text> : null}
        </> : null}
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: OasiMessage,
  subject: (d: Record<string, any>) => d.subject || 'Oasi del Faraone',
  displayName: 'Messaggio Oasi (automazioni)',
  previewData: { subject: '✅ Prenotazione confermata', body: 'Ciao Maria! 🎉\n\nLa tua prenotazione è confermata.', links: [{ label: 'Instagram @oasidelfaraone', url: 'https://www.instagram.com/oasidelfaraone' }] },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, "Times New Roman", serif', color: '#1d2433' }
const container = { maxWidth: '600px', padding: '28px 24px' }
const brand = { fontSize: '13px', letterSpacing: '4px', color: '#9a6f1f', margin: 0, textAlign: 'center' as const }
const rule = { borderColor: '#e8d9b8', margin: '18px 0' }
const para = { fontSize: '15px', lineHeight: '1.6', margin: '0 0 14px' }
const sectionTitle = { fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' as const, color: '#9a6f1f', margin: '0 0 6px' }
const button = { backgroundColor: '#0D1B2A', color: '#E8C97A', padding: '12px 22px', borderRadius: '4px', fontSize: '15px', textDecoration: 'none' }
const link = { color: '#9a6f1f' }
const small = { fontSize: '12px', color: '#6b7280', lineHeight: '1.5', margin: '4px 0' }
