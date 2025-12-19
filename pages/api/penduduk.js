import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get all data from Supabase, ordered by creation date (newest first)
        const { data, error } = await supabase
            .from('penduduk')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase query error:', error);
            return res.status(500).json({
                error: 'Failed to get data',
                message: error.message
            });
        }

        // Transform data to match frontend format
        const results = data.map(item => ({
            id: item.id,
            nama: item.nama,
            nik: item.nik,
            rt: item.rt,
            photoUrl: item.photo_url,
            createdAt: item.created_at,
        }));

        return res.status(200).json({
            success: true,
            data: results,
            count: results.length,
        });

    } catch (error) {
        console.error('Get penduduk error:', error);
        return res.status(500).json({
            error: 'Failed to get data',
            message: error.message
        });
    }
}
