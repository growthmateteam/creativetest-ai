import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'CreativeTest.ai'

interface TeamInviteProps {
  inviterName?: string
  recipientName?: string
  acceptUrl?: string
  role?: string
}

const TeamInviteEmail = ({
  inviterName,
  recipientName,
  acceptUrl,
  role,
}: TeamInviteProps) => {
  const greeting = recipientName ? `Hi ${recipientName},` : 'Hi there,'
  const inviter = inviterName || 'A teammate'
  const url = acceptUrl || '#'

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>You've been invited to {SITE_NAME}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>You're invited to {SITE_NAME}</Heading>
          <Text style={text}>{greeting}</Text>
          <Text style={text}>
            <strong>{inviter}</strong> has invited you to join {SITE_NAME}
            {role ? ` as a ${role}` : ''}. Click the button below to accept the
            invitation and sign in.
          </Text>
          <Section style={buttonSection}>
            <Button href={url} style={button}>
              Accept invitation
            </Button>
          </Section>
          <Text style={textMuted}>
            If the button doesn't work, copy and paste this link into your
            browser:
          </Text>
          <Text style={link}>{url}</Text>
          <Text style={footer}>
            If you weren't expecting this invitation, you can safely ignore
            this email.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: TeamInviteEmail,
  subject: `You've been invited to ${SITE_NAME}`,
  displayName: 'Team invite',
  previewData: {
    inviterName: 'Jane Smith',
    recipientName: 'Alex',
    acceptUrl: 'https://example.com/accept-invite?token=abc123',
    role: 'Manager',
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
}
const container = {
  padding: '32px 28px',
  maxWidth: '560px',
  margin: '0 auto',
}
const h1 = {
  fontSize: '24px',
  fontWeight: 700,
  color: '#1A1A2E',
  margin: '0 0 24px',
  lineHeight: '1.3',
}
const text = {
  fontSize: '15px',
  color: '#3a3a4a',
  lineHeight: '1.6',
  margin: '0 0 16px',
}
const textMuted = {
  fontSize: '13px',
  color: '#8a8a96',
  lineHeight: '1.5',
  margin: '24px 0 6px',
}
const buttonSection = { margin: '28px 0', textAlign: 'center' as const }
const button = {
  backgroundColor: '#3B5BDB',
  backgroundImage: 'linear-gradient(135deg, #3B5BDB, #7048E8)',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 600,
  padding: '12px 28px',
  borderRadius: '10px',
  textDecoration: 'none',
  display: 'inline-block',
}
const link = {
  fontSize: '12px',
  color: '#3B5BDB',
  wordBreak: 'break-all' as const,
  margin: '0 0 24px',
}
const footer = {
  fontSize: '12px',
  color: '#999999',
  borderTop: '1px solid #eaeaea',
  paddingTop: '20px',
  margin: '32px 0 0',
}
