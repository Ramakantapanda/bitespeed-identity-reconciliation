"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const app = (0, express_1.default)();
app.use(express_1.default.json());
const prisma = new client_1.PrismaClient();
app.post('/identify', async (req, res) => {
    let emailStr = undefined;
    let phoneStr = undefined;
    if (req.body.email !== undefined && req.body.email !== null && req.body.email !== "") {
        emailStr = String(req.body.email);
    }
    if (req.body.phoneNumber !== undefined && req.body.phoneNumber !== null && req.body.phoneNumber !== "") {
        phoneStr = String(req.body.phoneNumber);
    }
    if (!emailStr && !phoneStr) {
        return res.status(400).json({ error: 'Email or phoneNumber is required' });
    }
    // Find all contacts matching email OR phone
    const matches = await prisma.contact.findMany({
        where: {
            OR: [
                emailStr ? { email: emailStr } : undefined,
                phoneStr ? { phoneNumber: phoneStr } : undefined,
            ].filter(Boolean),
        },
    });
    if (matches.length === 0) {
        // New primary contact
        const newContact = await prisma.contact.create({
            data: {
                email: emailStr,
                phoneNumber: phoneStr,
                linkPrecedence: 'primary',
            },
        });
        return res.json({
            contact: {
                primaryContatctId: newContact.id, // Not changing the typo to match specs, wait, requirement says primaryContatctId
                emails: newContact.email ? [newContact.email] : [],
                phoneNumbers: newContact.phoneNumber ? [newContact.phoneNumber] : [],
                secondaryContactIds: [],
            },
        });
    }
    // Find all primary IDs
    const primaryIds = new Set();
    for (const c of matches) {
        if (c.linkPrecedence === 'primary') {
            primaryIds.add(c.id);
        }
        else if (c.linkedId) {
            primaryIds.add(c.linkedId);
        }
    }
    let primaries = await prisma.contact.findMany({
        where: { id: { in: Array.from(primaryIds) } }
    });
    // Sort by createdAt ascending to find oldest
    primaries.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    // Actually, we should make sure we found primaries. If there are none (db corrupted?), fallback.
    if (primaries.length === 0) {
        return res.status(500).json({ error: 'Internal server error: no primary found' });
    }
    const oldestPrimary = primaries[0];
    // If there are multiple primaries, demote newer ones to secondary
    if (primaries.length > 1) {
        const newerPrimaries = primaries.slice(1);
        const newerPrimaryIds = newerPrimaries.map(p => p.id);
        // Demote them
        await prisma.contact.updateMany({
            where: { id: { in: newerPrimaryIds } },
            data: {
                linkedId: oldestPrimary.id,
                linkPrecedence: 'secondary'
            }
        });
        // Update their subsequent secondaries to point to the new oldestPrimary
        await prisma.contact.updateMany({
            where: { linkedId: { in: newerPrimaryIds } },
            data: {
                linkedId: oldestPrimary.id
            }
        });
    }
    // Now, fetch the full cluster
    const cluster = await prisma.contact.findMany({
        where: {
            OR: [
                { id: oldestPrimary.id },
                { linkedId: oldestPrimary.id }
            ]
        }
    });
    // Check if we need to insert a new secondary
    const hasEmail = cluster.some(c => c.email === emailStr);
    const hasPhone = cluster.some(c => c.phoneNumber === phoneStr);
    const containsNewInfo = (emailStr && !hasEmail) || (phoneStr && !hasPhone);
    if (containsNewInfo) {
        const newSecondary = await prisma.contact.create({
            data: {
                email: emailStr,
                phoneNumber: phoneStr,
                linkedId: oldestPrimary.id,
                linkPrecedence: 'secondary'
            }
        });
        cluster.push(newSecondary);
    }
    // Format response
    // oldestPrimary values must be first
    cluster.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const emails = new Set();
    const phones = new Set();
    const secondaryIds = [];
    // Add primary info first
    if (oldestPrimary.email)
        emails.add(oldestPrimary.email);
    if (oldestPrimary.phoneNumber)
        phones.add(oldestPrimary.phoneNumber);
    // Then add the rest
    for (const c of cluster) {
        if (c.email)
            emails.add(c.email);
        if (c.phoneNumber)
            phones.add(c.phoneNumber);
        if (c.id !== oldestPrimary.id) {
            secondaryIds.push(c.id);
        }
    }
    return res.json({
        contact: {
            primaryContatctId: oldestPrimary.id,
            emails: Array.from(emails),
            phoneNumbers: Array.from(phones),
            secondaryContactIds: secondaryIds
        }
    });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map