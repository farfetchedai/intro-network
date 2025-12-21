import { prisma } from '@/lib/prisma'

export type NotificationType =
  | 'CONNECTION_REQUEST'
  | 'CONNECTION_ACCEPTED'
  | 'CONNECTION_DECLINED'
  | 'INTRO_REQUEST'
  | 'INTRO_ACCEPTED'
  | 'INTRO_DECLINED'
  | 'INTRO_HELP_REQUEST'

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
  fromUserId?: string
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link,
        fromUserId: params.fromUserId,
      },
    })
    return notification
  } catch (error) {
    console.error('Failed to create notification:', error)
    return null
  }
}

// Helper functions for common notification types
export async function notifyConnectionRequest(
  toUserId: string,
  fromUser: { id: string; firstName: string; lastName: string }
) {
  return createNotification({
    userId: toUserId,
    type: 'CONNECTION_REQUEST',
    title: 'New connection request',
    message: `${fromUser.firstName} ${fromUser.lastName} would like to connect with you`,
    link: '/connections',
    fromUserId: fromUser.id,
  })
}

export async function notifyConnectionAccepted(
  toUserId: string,
  fromUser: { id: string; firstName: string; lastName: string; username?: string | null }
) {
  return createNotification({
    userId: toUserId,
    type: 'CONNECTION_ACCEPTED',
    title: 'Connection accepted',
    message: `${fromUser.firstName} ${fromUser.lastName} accepted your connection request`,
    link: fromUser.username ? `/${fromUser.username}` : '/connections',
    fromUserId: fromUser.id,
  })
}

export async function notifyConnectionDeclined(
  toUserId: string,
  fromUser: { id: string; firstName: string; lastName: string }
) {
  return createNotification({
    userId: toUserId,
    type: 'CONNECTION_DECLINED',
    title: 'Connection declined',
    message: `${fromUser.firstName} ${fromUser.lastName} declined your connection request`,
    link: '/connections',
    fromUserId: fromUser.id,
  })
}

export async function notifyIntroRequest(
  toUserId: string,
  fromUser: { id: string; firstName: string; lastName: string },
  targetName: string
) {
  return createNotification({
    userId: toUserId,
    type: 'INTRO_REQUEST',
    title: 'Introduction request',
    message: `${fromUser.firstName} ${fromUser.lastName} is requesting an introduction to ${targetName}`,
    link: '/dashboard',
    fromUserId: fromUser.id,
  })
}

export async function notifyIntroHelpRequest(
  toUserId: string,
  fromUser: { id: string; firstName: string; lastName: string }
) {
  return createNotification({
    userId: toUserId,
    type: 'INTRO_HELP_REQUEST',
    title: 'Help with introductions',
    message: `${fromUser.firstName} ${fromUser.lastName} would like your help with introductions`,
    link: '/dashboard',
    fromUserId: fromUser.id,
  })
}

export async function notifyIntroAccepted(
  toUserId: string,
  fromUser: { id: string; firstName: string; lastName: string },
  targetName: string
) {
  return createNotification({
    userId: toUserId,
    type: 'INTRO_ACCEPTED',
    title: 'Introduction accepted',
    message: `${fromUser.firstName} ${fromUser.lastName} has accepted your introduction request to ${targetName}`,
    link: '/dashboard',
    fromUserId: fromUser.id,
  })
}

export async function notifyIntroDeclined(
  toUserId: string,
  fromUser: { id: string; firstName: string; lastName: string },
  targetName: string
) {
  return createNotification({
    userId: toUserId,
    type: 'INTRO_DECLINED',
    title: 'Introduction declined',
    message: `${fromUser.firstName} ${fromUser.lastName} has declined your introduction request to ${targetName}`,
    link: '/dashboard',
    fromUserId: fromUser.id,
  })
}
