import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '@/lib/auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Apply authentication middleware
    const user = await authMiddleware(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    switch (req.method) {
      case 'GET':
        return await getNotifications(req, res, user);
      case 'POST':
        return await createNotification(req, res, user);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Notification API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getNotifications(req: NextApiRequest, res: NextApiResponse, user: any) {
  try {
    const { 
      page = 1, 
      limit = 50, 
      type, 
      isRead 
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {
      userId: user.id,
    };

    if (type && type !== 'all') {
      where.type = type as string;
    }

    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    }

    const [notifications, totalCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          isRead: true,
          createdAt: true,
        },
      }),
      prisma.notification.count({ where }),
    ]);

    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    });

    return res.status(200).json({
      notifications,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit as string)),
      },
      unreadCount,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

async function createNotification(req: NextApiRequest, res: NextApiResponse, user: any) {
  try {
    // Only admins can create notifications for other users
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const {
      userId,
      userIds = [],
      type,
      title,
      message,
      data = {},
    } = req.body;

    // Validate required fields
    if (!type || !title || !message) {
      return res.status(400).json({
        error: 'Missing required fields: type, title, message'
      });
    }

    // Determine target users
    let targetUserIds: string[] = [];
    
    if (userId) {
      targetUserIds = [userId];
    } else if (userIds.length > 0) {
      targetUserIds = userIds;
    } else {
      return res.status(400).json({
        error: 'Either userId or userIds must be provided'
      });
    }

    // Verify users exist
    const existingUsers = await prisma.user.findMany({
      where: {
        id: { in: targetUserIds }
      },
      select: { id: true }
    });

    const existingUserIds = existingUsers.map(u => u.id);
    const invalidUserIds = targetUserIds.filter(id => !existingUserIds.includes(id));

    if (invalidUserIds.length > 0) {
      return res.status(400).json({
        error: `Invalid user IDs: ${invalidUserIds.join(', ')}`
      });
    }

    // Create notifications
    const notifications = await Promise.all(
      existingUserIds.map(userId =>
        prisma.notification.create({
          data: {
            userId,
            type,
            title,
            message: JSON.stringify({ message, ...data }),
            isRead: false,
          },
        })
      )
    );

    return res.status(201).json({
      success: true,
      notifications: notifications.length,
      message: `Created ${notifications.length} notification(s)`,
    });
  } catch (error) {
    console.error('Create notification error:', error);
    return res.status(500).json({ error: 'Failed to create notification' });
  }
}