import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { q } = req.query;

        // Build query
        let query = supabase
            .from('penduduk')
            .select('*')
            .order('created_at', { ascending: false });

        // Filter by name if query provided
        if (q && q.trim()) {
            query = query.ilike('nama', `%${q.trim()}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Supabase search error:', error);
            return res.status(500).json({
                error: 'Search failed',
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
            results,
            count: results.length,
        });

    } catch (error) {
        console.error('Search error:', error);
        return res.status(500).json({
            error: 'Search failed',
            message: error.message
        });
    }
}
