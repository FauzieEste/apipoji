import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { nama, nik, rt, photoUrl } = req.body;

        // Validation - NIK is now optional
        if (!nama || !rt || !photoUrl) {
            return res.status(400).json({
                error: 'Missing required fields: nama, rt, photoUrl'
            });
        }

        if (!['01', '02', '03'].includes(rt)) {
            return res.status(400).json({ error: 'Invalid RT. Must be 01, 02, or 03' });
        }

        // Check for duplicate names and add numbering if needed
        const { data: existingData } = await supabase
            .from('penduduk')
            .select('nama')
            .ilike('nama', `${nama}%`);

        let finalName = nama;
        if (existingData && existingData.length > 0) {
            // Find all entries with the same base name or numbered variants
            const duplicates = existingData.filter(item => {
                // Match exact name or pattern like "NAMA (1)", "NAMA (2)", etc.
                const escapedNama = nama.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const pattern = new RegExp(`^${escapedNama}( \\(\\d+\\))?$`, 'i');
                return pattern.test(item.nama);
            });

            if (duplicates.length > 0) {
                // Extract numbers from existing duplicates
                const numbers = duplicates
                    .map(item => {
                        const match = item.nama.match(/\((\d+)\)$/);
                        return match ? parseInt(match[1]) : 0;
                    })
                    .filter(n => !isNaN(n));

                // Find the next available number
                const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
                const nextNumber = maxNumber + 1;
                finalName = `${nama} (${nextNumber})`;
            }
        }

        // Create new entry
        const newEntry = {
            id: Date.now().toString(),
            nama: finalName,
            nik: nik || '-', // Optional NIK, use '-' if not provided
            rt,
            photo_url: photoUrl,
            created_at: new Date().toISOString(),
        };

        // Insert into Supabase
        const { data, error } = await supabase
            .from('penduduk')
            .insert([newEntry])
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            return res.status(500).json({
                error: 'Failed to save data',
                message: error.message
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Data saved successfully',
            data: {
                id: data.id,
                nama: data.nama,
                nik: data.nik,
                rt: data.rt,
                photoUrl: data.photo_url,
                createdAt: data.created_at,
            },
        });

    } catch (error) {
        console.error('Save error:', error);
        return res.status(500).json({
            error: 'Failed to save data',
            message: error.message
        });
    }
}
