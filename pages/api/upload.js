import { getServiceSupabase } from '../../lib/supabase';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const contentType = req.headers['content-type'] || '';

        if (!contentType.includes('multipart/form-data')) {
            return res.status(400).json({ error: 'Content-Type must be multipart/form-data' });
        }

        // Get RT from query parameter
        const { rt } = req.query;

        if (!rt || !['01', '02', '03'].includes(rt)) {
            return res.status(400).json({ error: 'Invalid RT. Must be 01, 02, or 03' });
        }

        // Read the file from request body
        const chunks = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        // Parse multipart form data manually
        const boundary = contentType.split('boundary=')[1];
        const parts = buffer.toString('binary').split(`--${boundary}`);

        let fileBuffer = null;
        let filename = '';

        for (const part of parts) {
            if (part.includes('Content-Disposition') && part.includes('filename=')) {
                const lines = part.split('\r\n');
                const dispositionLine = lines.find(line => line.includes('Content-Disposition'));

                if (dispositionLine) {
                    const filenameMatch = dispositionLine.match(/filename="(.+?)"/);
                    if (filenameMatch) {
                        filename = filenameMatch[1];
                    }
                }

                // Find the binary data (after double CRLF)
                const dataStart = part.indexOf('\r\n\r\n') + 4;
                const dataEnd = part.lastIndexOf('\r\n');

                if (dataStart > 3 && dataEnd > dataStart) {
                    const binaryData = part.substring(dataStart, dataEnd);
                    fileBuffer = Buffer.from(binaryData, 'binary');
                }
            }
        }

        if (!fileBuffer || !filename) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Validate file type
        const ext = filename.split('.').pop().toLowerCase();
        if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
            return res.status(400).json({ error: 'Only JPG, PNG, and WebP files are allowed' });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const uniqueFilename = `${timestamp}-${filename}`;
        const storagePath = `rt${rt}/${uniqueFilename}`;

        // Upload to Supabase Storage
        const supabase = getServiceSupabase();
        const { data, error } = await supabase.storage
            .from('penduduk-photos')
            .upload(storagePath, fileBuffer, {
                contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
                upsert: false,
            });

        if (error) {
            console.error('Supabase Storage upload error:', error);
            return res.status(500).json({
                error: 'Upload failed',
                message: error.message
            });
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('penduduk-photos')
            .getPublicUrl(storagePath);

        return res.status(200).json({
            success: true,
            url: publicUrl,
            filename: uniqueFilename,
            path: storagePath,
        });

    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({
            error: 'Upload failed',
            message: error.message
        });
    }
}
