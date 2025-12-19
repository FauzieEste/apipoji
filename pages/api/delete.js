import { supabase } from '../../lib/supabase';
import { getServiceSupabase } from '../../lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id, photoUrl, pin } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'ID is required' });
        }

        // Verify PIN
        const adminPin = process.env.ADMIN_PIN;
        if (pin !== adminPin) {
            return res.status(401).json({ error: 'PIN salah!' });
        }

        // Delete from database
        const { error: dbError } = await supabase
            .from('penduduk')
            .delete()
            .eq('id', id);

        if (dbError) {
            console.error('Database delete error:', dbError);
            throw new Error(dbError.message);
        }

        // Delete photo from storage if exists
        if (photoUrl) {
            try {
                const serviceSupabase = getServiceSupabase();
                // Extract path from URL
                // URL format: https://{project}.supabase.co/storage/v1/object/public/penduduk-photos/rt01/filename.jpg
                const urlParts = photoUrl.split('/');
                const bucket = 'penduduk-photos';
                const pathIndex = urlParts.indexOf(bucket) + 1;

                if (pathIndex > 0 && pathIndex < urlParts.length) {
                    const filePath = urlParts.slice(pathIndex).join('/');

                    const { error: storageError } = await serviceSupabase.storage
                        .from(bucket)
                        .remove([filePath]);

                    if (storageError) {
                        console.error('Storage delete error:', storageError);
                        // Don't fail the whole operation if storage delete fails
                    }
                }
            } catch (storageErr) {
                console.error('Storage delete exception:', storageErr);
                // Continue even if storage deletion fails
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Data deleted successfully'
        });

    } catch (error) {
        console.error('Delete error:', error);
        return res.status(500).json({
            error: 'Failed to delete data',
            message: error.message
        });
    }
}
