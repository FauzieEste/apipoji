import { getServiceSupabase } from '../../lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { url, filename } = req.query;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Fetch the image from Supabase
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch image');
        }

        const buffer = await response.arrayBuffer();

        // Detect content type
        let contentType = response.headers.get('content-type') || 'image/jpeg';

        // Set headers for download
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename || 'download.jpg'}"`);
        res.setHeader('Cache-Control', 'no-cache');

        // Send the image
        res.send(Buffer.from(buffer));

    } catch (error) {
        console.error('Download proxy error:', error);
        return res.status(500).json({
            error: 'Failed to download image',
            message: error.message
        });
    }
}
