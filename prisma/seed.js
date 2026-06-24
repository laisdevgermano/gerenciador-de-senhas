import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const users = [
  {
    id: 'u1',
    name: 'Lais Rodrigues',
    email: 'lais@exemplo.com',
    role: 'admin',
    status: 'active',
    passphrase: 'senha123',
    mfaEnabled: false,
    lastLogin: new Date('2026-06-18T14:30:00Z'),
  },
  {
    id: 'u2',
    name: 'Carlos Mendes',
    email: 'carlos@exemplo.com',
    role: 'user',
    status: 'active',
    passphrase: 'senha123',
    mfaEnabled: true,
    lastLogin: new Date('2026-06-17T09:15:00Z'),
  },
  {
    id: 'u3',
    name: 'Ana Oliveira',
    email: 'ana@exemplo.com',
    role: 'user',
    status: 'pending',
    passphrase: 'senha123',
    mfaEnabled: false,
  },
]

const folders = [
  { id: 'f1', name: 'Cloud / Infraestrutura', parentId: null, color: '#0c11cf', createdAt: new Date('2026-01-10T08:00:00Z') },
  { id: 'f2', name: 'Comunicação', parentId: null, color: '#7c3aed', createdAt: new Date('2026-04-10T08:00:00Z') },
  { id: 'f3', name: 'Bancos de Dados', parentId: null, color: '#059669', createdAt: new Date('2026-05-10T08:00:00Z') },
  { id: 'f4', name: 'Produção', parentId: 'f1', color: null, createdAt: new Date('2026-01-10T08:00:00Z') },
  { id: 'f5', name: 'Desenvolvimento', parentId: 'f1', color: null, createdAt: new Date('2026-01-10T08:00:00Z') },
]

const tags = [
  { id: 't1', name: 'DevOps', color: '#0c11cf' },
  { id: 't2', name: 'Cloud', color: '#d97706' },
  { id: 't3', name: 'Team', color: '#7c3aed' },
  { id: 't4', name: 'Database', color: '#059669' },
]

const passwords = [
  {
    id: 'p1', name: 'AWS Console', username: 'lais.admin', password: 's3nh4F0rt3!2026',
    url: 'https://aws.amazon.com/console', folderId: 'f1', createdBy: 'u1',
    favorite: true, notes: 'Conta master da AWS Organização.',
    createdAt: new Date('2026-01-15T10:00:00Z'), updatedAt: new Date('2026-06-10T08:30:00Z'),
    tagIds: ['t1', 't2'], sharedWithUserIds: ['u2'],
  },
  {
    id: 'p2', name: 'GitHub Enterprise', username: 'lais.rodrigues', password: 'ghp_abc123def456',
    url: 'https://github.com/enterprises', folderId: 'f1', createdBy: 'u1',
    favorite: true, notes: null,
    createdAt: new Date('2026-02-20T14:00:00Z'), updatedAt: new Date('2026-06-15T11:00:00Z'),
    tagIds: ['t1'], sharedWithUserIds: ['u2', 'u3'],
  },
  {
    id: 'p3', name: 'Banco do Brasil', username: 'lais.rodrigues', password: 'bb#2026@senha',
    url: 'https://www.bb.com.br', folderId: null, createdBy: 'u1',
    favorite: false, notes: 'Conta PJ.',
    createdAt: new Date('2026-03-01T09:00:00Z'), updatedAt: new Date('2026-03-01T09:00:00Z'),
    tagIds: [], sharedWithUserIds: [],
  },
  {
    id: 'p4', name: 'DigitalOcean', username: 'lais@exemplo.com', password: 'd0_secure_pass',
    url: 'https://cloud.digitalocean.com', folderId: 'f1', createdBy: 'u1',
    favorite: false, notes: 'Projeto em produção.',
    createdAt: new Date('2026-04-10T16:00:00Z'), updatedAt: new Date('2026-05-20T12:00:00Z'),
    tagIds: ['t1', 't2'], sharedWithUserIds: ['u2'],
  },
  {
    id: 'p5', name: 'Slack Workspace', username: 'lais@exemplo.com', password: 'sl@ck_pass_2026',
    url: 'https://app.slack.com', folderId: 'f2', createdBy: 'u1',
    favorite: true, notes: null,
    createdAt: new Date('2026-04-15T08:00:00Z'), updatedAt: new Date('2026-06-18T07:00:00Z'),
    tagIds: ['t3'], sharedWithUserIds: [],
  },
  {
    id: 'p6', name: 'Notion Team', username: 'lais@exemplo.com', password: 'n0t10n_team_pass',
    url: 'https://notion.so', folderId: 'f2', createdBy: 'u1',
    favorite: false, notes: 'Workspace do time de engenharia.',
    createdAt: new Date('2026-05-01T10:00:00Z'), updatedAt: new Date('2026-06-01T10:00:00Z'),
    tagIds: ['t3'], sharedWithUserIds: ['u2', 'u3'],
  },
  {
    id: 'p7', name: 'MongoDB Atlas', username: 'lais.admin', password: 'm0ng0_db_str0ng',
    url: 'https://cloud.mongodb.com', folderId: 'f3', createdBy: 'u1',
    favorite: false, notes: 'Cluster de produção — acesso restrito.',
    createdAt: new Date('2026-05-15T14:00:00Z'), updatedAt: new Date('2026-06-12T09:00:00Z'),
    tagIds: ['t1', 't4'], sharedWithUserIds: ['u2'],
  },
  {
    id: 'p8', name: 'Cloudflare', username: 'lais@exemplo.com', password: 'cL0ud_fl@re!',
    url: 'https://dash.cloudflare.com', folderId: null, createdBy: 'u1',
    favorite: false, notes: null,
    createdAt: new Date('2026-06-01T11:00:00Z'), updatedAt: new Date('2026-06-18T14:00:00Z'),
    tagIds: ['t1', 't2'], sharedWithUserIds: [],
  },
  {
    id: 'p9', name: 'Mailgun', username: 'lais@exemplo.com', password: 'mg_un1c0rn!',
    url: 'https://app.mailgun.com', folderId: null, createdBy: 'u1',
    favorite: false, notes: 'API key de email transacional.',
    createdAt: new Date('2026-06-10T15:00:00Z'), updatedAt: new Date('2026-06-10T15:00:00Z'),
    tagIds: ['t4'], sharedWithUserIds: [],
  },
  {
    id: 'p10', name: 'Admin Local PostgreSQL', username: 'postgres', password: 'pg_adm1n_2026',
    url: 'localhost:5432', folderId: 'f3', createdBy: 'u1',
    favorite: false, notes: 'Acesso local, não compartilhar.',
    createdAt: new Date('2026-06-15T16:00:00Z'), updatedAt: new Date('2026-06-15T16:00:00Z'),
    tagIds: ['t1', 't4'], sharedWithUserIds: [],
  },
]

const groups = [
  {
    id: 'g1', name: 'Engenharia',
    description: 'Time de engenharia de software',
    memberIds: ['u1', 'u2'],
    createdAt: new Date('2026-01-10T08:00:00Z'),
  },
  {
    id: 'g2', name: 'Administradores',
    description: 'Acesso administrativo geral',
    memberIds: ['u1'],
    createdAt: new Date('2026-01-10T08:00:00Z'),
  },
]

const pendingInvites = [
  {
    id: 'inv1', email: 'ana@exemplo.com', role: 'user', invitedBy: 'u1',
    createdAt: new Date('2026-06-17T10:00:00Z'),
  },
]

async function main() {
  console.log('Limpando banco...')
  await prisma.pendingInvite.deleteMany()
  await prisma.sharedAccess.deleteMany()
  await prisma.passwordTag.deleteMany()
  await prisma.groupMember.deleteMany()
  await prisma.password.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.folder.deleteMany()
  await prisma.group.deleteMany()
  await prisma.user.deleteMany()

  console.log('Criando usuários...')
  for (const u of users) {
    const hashedPassphrase = await bcrypt.hash(u.passphrase, 10)
    await prisma.user.create({
      data: {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        passphrase: hashedPassphrase,
        mfaEnabled: u.mfaEnabled,
        lastLogin: u.lastLogin ?? null,
      },
    })
  }

  console.log('Criando pastas...')
  for (const f of folders) {
    await prisma.folder.create({ data: f })
  }

  console.log('Criando tags...')
  for (const t of tags) {
    await prisma.tag.create({ data: t })
  }

  console.log('Criando senhas...')
  for (const pw of passwords) {
    const { tagIds, sharedWithUserIds, ...pwData } = pw
    await prisma.password.create({
      data: {
        ...pwData,
        tags: tagIds.length
          ? { create: tagIds.map((tagId) => ({ tagId })) }
          : undefined,
        sharedWith: sharedWithUserIds.length
          ? { create: sharedWithUserIds.map((userId) => ({ userId, permission: 'read' })) }
          : undefined,
      },
    })
  }

  console.log('Criando grupos...')
  for (const g of groups) {
    const { memberIds, ...gData } = g
    await prisma.group.create({
      data: {
        ...gData,
        members: {
          create: memberIds.map((userId) => ({ userId })),
        },
      },
    })
  }

  console.log('Criando convites pendentes...')
  for (const inv of pendingInvites) {
    await prisma.pendingInvite.create({ data: inv })
  }

  console.log('Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
