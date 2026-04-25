import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { supportConversationsTable, supportMessagesTable, usersTable } from "@workspace/db/schema";
import { eq, desc, and } from "drizzle-orm";
import jwt from "jsonwebtoken";

const router: IRouter = Router();
const JWT_SECRET = process.env.SESSION_SECRET ?? "investment-platform-secret-key";

function getAuthContext(req: any): { userId: number | null; isAdmin: boolean } {
  const sessionUserId = (req.session as any)?.userId ?? null;
  if (sessionUserId) {
    return { userId: sessionUserId, isAdmin: !!(req.session as any)?.isAdmin };
  }
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as any;
      return { userId: payload.userId ?? null, isAdmin: !!payload.isAdmin };
    } catch { return { userId: null, isAdmin: false }; }
  }
  return { userId: null, isAdmin: false };
}

// ── User: get or create their conversation ─────────────────────────────────
router.get("/conversation", async (req, res) => {
  const { userId } = getAuthContext(req);
  if (!userId) { res.status(401).json({ error: "unauthorized" }); return; }
  try {
    let [conv] = await db.select()
      .from(supportConversationsTable)
      .where(eq(supportConversationsTable.userId, userId))
      .orderBy(desc(supportConversationsTable.createdAt))
      .limit(1);

    if (!conv) {
      [conv] = await db.insert(supportConversationsTable)
        .values({ userId, status: "open" })
        .returning();
    }

    const messages = await db.select()
      .from(supportMessagesTable)
      .where(eq(supportMessagesTable.conversationId, conv.id))
      .orderBy(supportMessagesTable.createdAt);

    // Mark user messages as read by admin and vice versa (from user view, mark admin msgs as read)
    await db.update(supportMessagesTable)
      .set({ read: true })
      .where(and(
        eq(supportMessagesTable.conversationId, conv.id),
        eq(supportMessagesTable.senderType, "admin"),
      ));

    res.json({ conversation: conv, messages });
  } catch (err) {
    res.status(500).json({ error: "server_error", message: "Failed to fetch conversation" });
  }
});

// ── User: send a message ───────────────────────────────────────────────────
router.post("/message", async (req, res) => {
  const { userId } = getAuthContext(req);
  if (!userId) { res.status(401).json({ error: "unauthorized" }); return; }
  try {
    const { message } = req.body;
    if (!message?.trim()) { res.status(400).json({ error: "Message required" }); return; }

    let [conv] = await db.select()
      .from(supportConversationsTable)
      .where(eq(supportConversationsTable.userId, userId))
      .orderBy(desc(supportConversationsTable.createdAt))
      .limit(1);

    if (!conv) {
      [conv] = await db.insert(supportConversationsTable)
        .values({ userId, status: "open" })
        .returning();
    }

    const [msg] = await db.insert(supportMessagesTable)
      .values({
        conversationId: conv.id,
        userId,
        senderType: "user",
        message: message.trim(),
      })
      .returning();

    await db.update(supportConversationsTable)
      .set({ lastMessageAt: new Date(), status: "open" })
      .where(eq(supportConversationsTable.id, conv.id));

    res.json({ message: msg });
  } catch (err) {
    res.status(500).json({ error: "server_error", message: "Failed to send message" });
  }
});

// ── Admin: get all conversations ───────────────────────────────────────────
router.get("/admin/conversations", async (req, res) => {
  const { isAdmin } = getAuthContext(req);
  if (!isAdmin) { res.status(403).json({ error: "forbidden" }); return; }
  try {
    const convs = await db.select({
      id: supportConversationsTable.id,
      userId: supportConversationsTable.userId,
      status: supportConversationsTable.status,
      lastMessageAt: supportConversationsTable.lastMessageAt,
      createdAt: supportConversationsTable.createdAt,
      userName: usersTable.fullName,
      userEmail: usersTable.email,
    })
      .from(supportConversationsTable)
      .leftJoin(usersTable, eq(supportConversationsTable.userId, usersTable.id))
      .orderBy(desc(supportConversationsTable.lastMessageAt));

    res.json({ conversations: convs });
  } catch (err) {
    res.status(500).json({ error: "server_error", message: "Failed to fetch conversations" });
  }
});

// ── Admin: get messages for a conversation ─────────────────────────────────
router.get("/admin/conversations/:id/messages", async (req, res) => {
  const { isAdmin } = getAuthContext(req);
  if (!isAdmin) { res.status(403).json({ error: "forbidden" }); return; }
  try {
    const convId = parseInt(req.params.id);
    const [conv] = await db.select()
      .from(supportConversationsTable)
      .where(eq(supportConversationsTable.id, convId))
      .limit(1);

    if (!conv) { res.status(404).json({ error: "not_found" }); return; }

    const messages = await db.select()
      .from(supportMessagesTable)
      .where(eq(supportMessagesTable.conversationId, convId))
      .orderBy(supportMessagesTable.createdAt);

    // Mark user messages as read
    await db.update(supportMessagesTable)
      .set({ read: true })
      .where(and(
        eq(supportMessagesTable.conversationId, convId),
        eq(supportMessagesTable.senderType, "user"),
      ));

    res.json({ conversation: conv, messages });
  } catch (err) {
    res.status(500).json({ error: "server_error", message: "Failed to fetch messages" });
  }
});

// ── Admin: reply to a conversation ────────────────────────────────────────
router.post("/admin/conversations/:id/reply", async (req, res) => {
  const { isAdmin, userId } = getAuthContext(req);
  if (!isAdmin) { res.status(403).json({ error: "forbidden" }); return; }
  try {
    const convId = parseInt(req.params.id);
    const { message } = req.body;
    if (!message?.trim()) { res.status(400).json({ error: "Message required" }); return; }

    const [msg] = await db.insert(supportMessagesTable)
      .values({
        conversationId: convId,
        userId: userId,
        senderType: "admin",
        message: message.trim(),
      })
      .returning();

    await db.update(supportConversationsTable)
      .set({ lastMessageAt: new Date() })
      .where(eq(supportConversationsTable.id, convId));

    res.json({ message: msg });
  } catch (err) {
    res.status(500).json({ error: "server_error", message: "Failed to send reply" });
  }
});

export default router;
