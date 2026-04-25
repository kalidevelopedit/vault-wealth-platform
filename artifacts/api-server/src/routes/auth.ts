import { Router, type IRouter, type Request } from "express";
import { db } from "@workspace/db";
import { usersTable, activityLogTable, loginSessionsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail, sendForgotPinEmail } from "../lib/email.js";

function parseUserAgent(ua: string): { browser: string; os: string; deviceInfo: string } {
  let browser = "Unknown Browser";
  let os = "Unknown OS";

  if (ua.includes("Chrome") && !ua.includes("Chromium") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("OPR") || ua.includes("Opera")) browser = "Opera";

  if (ua.includes("iPhone") || ua.includes("iPad")) os = ua.includes("iPhone") ? "iOS (iPhone)" : "iOS (iPad)";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("Windows NT")) os = "Windows";
  else if (ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";

  return { browser, os, deviceInfo: `${browser} on ${os}` };
}

async function recordLoginSession(userId: number, req: Request): Promise<void> {
  try {
    const ua = req.headers["user-agent"] || "";
    const { browser, os, deviceInfo } = parseUserAgent(ua);
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
      || req.headers["x-real-ip"] as string
      || req.socket.remoteAddress
      || "Unknown";

    // Mark all previous sessions as not current
    await db.update(loginSessionsTable)
      .set({ isCurrent: false })
      .where(eq(loginSessionsTable.userId, userId));

    // Insert new session
    await db.insert(loginSessionsTable).values({
      userId,
      deviceInfo,
      browser,
      os,
      ipAddress: ip,
      location: "Unknown",
      isCurrent: true,
    });
  } catch (e) {
    // Non-fatal: log but don't break login
    console.error("Failed to record login session:", e);
  }
}

const router: IRouter = Router();

const JWT_SECRET = process.env.SESSION_SECRET ?? "investment-platform-secret-key";
const JWT_EXPIRY = "30d";

function signToken(userId: number, pinVerified: boolean): string {
  return jwt.sign({ userId, pinVerified }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

function verifyToken(token: string): { userId: number; pinVerified: boolean } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    return { userId: payload.userId, pinVerified: !!payload.pinVerified };
  } catch {
    return null;
  }
}

function getAuthContext(req: Request): { userId: number | null; pinVerified: boolean } {
  const sessionUserId = (req.session as any).userId ?? null;
  if (sessionUserId) {
    return { userId: sessionUserId, pinVerified: !!(req.session as any).pinVerified };
  }
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const payload = verifyToken(authHeader.slice(7));
    if (payload) return payload;
  }
  return { userId: null, pinVerified: false };
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "salt_investment_platform").digest("hex");
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, phone, country, agreedToTerms } = req.body;
    if (!fullName || !email || !password || !phone || !country || !agreedToTerms) {
      res.status(400).json({ error: "validation_error", message: "All fields are required" });
      return;
    }
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "email_taken", message: "Email already registered" });
      return;
    }
    const passwordHash = hashPassword(password);
    const [user] = await db.insert(usersTable).values({
      fullName,
      email,
      passwordHash,
      phone,
      country,
      role: "user",
      kycStatus: "not_started",
      onboardingStep: 1,
      onboardingComplete: false,
      availableCash: "10000.00",
    }).returning();

    await db.insert(activityLogTable).values({
      userId: user.id,
      eventType: "account_created",
      description: "Account registered",
    });

    sendWelcomeEmail({ email: user.email, fullName: user.fullName }).catch(() => {});

    (req.session as any).userId = user.id;
    const token = signToken(user.id, false);
    res.status(201).json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        country: user.country,
        role: user.role,
        kycStatus: user.kycStatus,
        onboardingStep: user.onboardingStep,
        onboardingComplete: user.onboardingComplete,
        profilePhotoUrl: user.profilePhotoUrl ?? null,
        createdAt: user.createdAt.toISOString(),
      },
      message: "Account created successfully",
    });
  } catch (err) {
    req.log.error({ err }, "Register error");
    res.status(500).json({ error: "server_error", message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "validation_error", message: "Email and password required" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      res.status(401).json({ error: "invalid_credentials", message: "Invalid email or password" });
      return;
    }
    if ((user as any).isFrozen) {
      res.status(403).json({ error: "account_frozen", message: "Your account has been suspended. Please contact support." });
      return;
    }
    if (user.kycStatus === "pending" && user.role !== "admin") {
      res.status(403).json({ error: "kyc_pending", message: "Your application is currently under review. You'll be notified once our compliance team has made a decision." });
      return;
    }
    await db.update(usersTable).set({ lastActive: new Date() }).where(eq(usersTable.id, user.id));
    await db.insert(activityLogTable).values({
      userId: user.id,
      eventType: "login",
      description: "User logged in",
    });
    recordLoginSession(user.id, req);
    (req.session as any).userId = user.id;
    const token = signToken(user.id, false);
    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        country: user.country,
        role: user.role,
        kycStatus: user.kycStatus,
        onboardingStep: user.onboardingStep,
        onboardingComplete: user.onboardingComplete,
        profilePhotoUrl: user.profilePhotoUrl ?? null,
        createdAt: user.createdAt.toISOString(),
      },
      message: "Logged in successfully",
    });
  } catch (err) {
    req.log.error({ err }, "Login error");
    res.status(500).json({ error: "server_error", message: "Login failed" });
  }
});

// ── One-click demo login ───────────────────────────────────────────────────
router.post("/demo-login", async (req, res) => {
  try {
    const DEMO_EMAIL = "demo@vestplatform.com";
    const DEMO_PASS  = "demo1234";
    const DEMO_NAME  = "Demo User";

    let [user] = await db.select().from(usersTable).where(eq(usersTable.email, DEMO_EMAIL)).limit(1);

    if (!user) {
      // Create the demo user fresh
      const [created] = await db.insert(usersTable).values({
        fullName: DEMO_NAME,
        email: DEMO_EMAIL,
        passwordHash: hashPassword(DEMO_PASS),
        phone: "+1-800-000-0000",
        country: "United States",
        role: "user",
        kycStatus: "approved",
        onboardingStep: 8,
        onboardingComplete: true,
        availableCash: "10000.00",
        mustSetPin: false,
        pinHash: null,
      }).returning();
      user = created;
    } else {
      // Ensure demo user is always in a good state (approved, no PIN gate, not frozen)
      await db.update(usersTable).set({
        kycStatus: "approved",
        onboardingComplete: true,
        onboardingStep: 8,
        mustSetPin: false,
        pinHash: null,
        isFrozen: false,
        frozenReason: null,
        updatedAt: new Date(),
      } as any).where(eq(usersTable.id, user.id));
      // Re-fetch updated state
      [user] = await db.select().from(usersTable).where(eq(usersTable.id, user.id)).limit(1);
    }

    await db.update(usersTable).set({ lastActive: new Date() }).where(eq(usersTable.id, user.id));

    (req.session as any).userId     = user.id;
    (req.session as any).pinVerified = true;
    const token = signToken(user.id, true);

    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        country: user.country,
        role: user.role,
        kycStatus: user.kycStatus,
        onboardingStep: user.onboardingStep,
        onboardingComplete: user.onboardingComplete,
        profilePhotoUrl: user.profilePhotoUrl ?? null,
        createdAt: user.createdAt.toISOString(),
        mustSetPin: false,
        hasPin: false,
        pinVerified: true,
        isFrozen: false,
        frozenReason: null,
      },
      message: "Demo login successful",
    });
  } catch (err) {
    req.log.error({ err }, "Demo login error");
    res.status(500).json({ error: "server_error", message: "Demo login failed" });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out successfully" });
  });
});

router.get("/me", async (req, res) => {
  const { userId, pinVerified } = getAuthContext(req);
  if (!userId) {
    res.status(401).json({ error: "unauthorized", message: "Not authenticated" });
    return;
  }
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      res.status(401).json({ error: "unauthorized", message: "User not found" });
      return;
    }
    res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      country: user.country,
      role: user.role,
      kycStatus: user.kycStatus,
      onboardingStep: user.onboardingStep,
      onboardingComplete: user.onboardingComplete,
      profilePhotoUrl: user.profilePhotoUrl ?? null,
      createdAt: user.createdAt.toISOString(),
      mustSetPin: user.mustSetPin ?? false,
      hasPin: !!user.pinHash,
      pinVerified,
      isFrozen: (user as any).isFrozen ?? false,
      frozenReason: (user as any).frozenReason ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Get me error");
    res.status(500).json({ error: "server_error", message: "Failed to get user" });
  }
});

router.post("/set-pin", async (req, res) => {
  const { userId } = getAuthContext(req);
  if (!userId) {
    res.status(401).json({ error: "unauthorized", message: "Not authenticated" });
    return;
  }
  try {
    const { pin } = req.body;
    if (!pin || !/^\d{6}$/.test(pin)) {
      res.status(400).json({ error: "validation_error", message: "PIN must be exactly 6 digits" });
      return;
    }
    const pinHash = hashPassword(pin);
    await db.update(usersTable).set({
      pinHash,
      mustSetPin: false,
      updatedAt: new Date(),
    }).where(eq(usersTable.id, userId));
    (req.session as any).pinVerified = true;
    await db.insert(activityLogTable).values({
      userId,
      eventType: "pin_set",
      description: "Account passcode set",
    });
    const token = signToken(userId, true);
    res.json({ token, message: "Passcode set successfully" });
  } catch (err) {
    req.log.error({ err }, "Set PIN error");
    res.status(500).json({ error: "server_error", message: "Failed to set passcode" });
  }
});

router.post("/verify-pin", async (req, res) => {
  const { userId } = getAuthContext(req);
  if (!userId) {
    res.status(401).json({ error: "unauthorized", message: "Not authenticated" });
    return;
  }
  try {
    const { pin } = req.body;
    if (!pin) {
      res.status(400).json({ error: "validation_error", message: "PIN required" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user || !user.pinHash) {
      res.status(400).json({ error: "no_pin", message: "No passcode set for this account" });
      return;
    }
    if (!verifyPassword(pin, user.pinHash)) {
      res.status(401).json({ error: "invalid_pin", message: "Incorrect passcode. Please try again." });
      return;
    }
    (req.session as any).pinVerified = true;
    await db.update(usersTable).set({ lastActive: new Date() }).where(eq(usersTable.id, userId));
    const token = signToken(userId, true);
    res.json({ token, message: "Passcode verified" });
  } catch (err) {
    req.log.error({ err }, "Verify PIN error");
    res.status(500).json({ error: "server_error", message: "Failed to verify passcode" });
  }
});

router.post("/forgot-pin", async (req, res) => {
  const { userId } = getAuthContext(req);
  if (!userId) {
    res.status(401).json({ error: "unauthorized", message: "Not authenticated" });
    return;
  }
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      res.status(404).json({ error: "not_found", message: "User not found" });
      return;
    }
    const tempPassword = Math.random().toString(36).slice(2, 10).toUpperCase();
    const passwordHash = hashPassword(tempPassword);
    await db.update(usersTable).set({
      passwordHash,
      pinHash: null,
      mustSetPin: true,
      updatedAt: new Date(),
    }).where(eq(usersTable.id, userId));
    (req.session as any).pinVerified = false;
    sendForgotPinEmail({ email: user.email, fullName: user.fullName, tempPassword }).catch(() => {});
    await db.insert(activityLogTable).values({
      userId,
      eventType: "pin_reset_requested",
      description: "Passcode reset requested",
    });
    res.json({ message: "Reset instructions sent" });
  } catch (err) {
    req.log.error({ err }, "Forgot PIN error");
    res.status(500).json({ error: "server_error", message: "Failed to reset passcode" });
  }
});

router.post("/change-password", async (req, res) => {
  const { userId } = getAuthContext(req);
  if (!userId) {
    res.status(401).json({ error: "unauthorized", message: "Not authenticated" });
    return;
  }
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "validation_error", message: "Current and new password required" });
      return;
    }
    if (newPassword.length < 8) {
      res.status(400).json({ error: "validation_error", message: "New password must be at least 8 characters" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user || !verifyPassword(currentPassword, user.passwordHash)) {
      res.status(401).json({ error: "invalid_credentials", message: "Current password is incorrect" });
      return;
    }
    const newHash = hashPassword(newPassword);
    await db.update(usersTable).set({ passwordHash: newHash, updatedAt: new Date() }).where(eq(usersTable.id, userId));
    await db.insert(activityLogTable).values({
      userId,
      eventType: "password_changed",
      description: "Login password changed",
    });
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    req.log.error({ err }, "Change password error");
    res.status(500).json({ error: "server_error", message: "Failed to change password" });
  }
});

// ── Login sessions ─────────────────────────────────────────────────────────
router.get("/login-sessions", async (req, res) => {
  const { userId } = getAuthContext(req);
  if (!userId) { res.status(401).json({ error: "unauthorized" }); return; }
  try {
    const sessions = await db
      .select()
      .from(loginSessionsTable)
      .where(eq(loginSessionsTable.userId, userId))
      .orderBy(desc(loginSessionsTable.createdAt))
      .limit(10);
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: "server_error", message: "Failed to fetch sessions" });
  }
});

router.delete("/login-sessions/:id", async (req, res) => {
  const { userId } = getAuthContext(req);
  if (!userId) { res.status(401).json({ error: "unauthorized" }); return; }
  try {
    const sessionId = parseInt(req.params.id);
    await db
      .delete(loginSessionsTable)
      .where(eq(loginSessionsTable.id, sessionId));
    res.json({ message: "Session removed" });
  } catch (err) {
    res.status(500).json({ error: "server_error", message: "Failed to remove session" });
  }
});

export default router;
