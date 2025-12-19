import { serialize } from 'cookie';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, password } = req.body;

    // Verify credentials from env vars
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (username === adminUsername && password === adminPassword) {
        // Create session cookie (1 day expiry)
        // In a real app, sign this with JWT_SECRET. For now, a simple token value is sufficient as proof of auth.
        const token = 'authenticated_session_token_' + Date.now();

        const cookie = serialize('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });

        res.setHeader('Set-Cookie', cookie);
        return res.status(200).json({ success: true });
    } else {
        return res.status(401).json({ error: 'Invalid username or password' });
    }
}
