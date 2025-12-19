import Tesseract from 'tesseract.js';

// Available RT options in the dropdown
const VALID_RT_OPTIONS = ['01', '02', '03'];

/**
 * Preprocess image for better OCR accuracy
 */
const preprocessImage = (imageDataUrl) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                const contrast = 2.0;
                const factor = (259 * (contrast * 100 + 255)) / (255 * (259 - contrast * 100));
                const enhanced = factor * (gray - 128) + 128;
                const final = Math.max(0, Math.min(255, enhanced));
                data[i] = final;
                data[i + 1] = final;
                data[i + 2] = final;
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.95));
        };
        img.src = imageDataUrl;
    });
};

/**
 * Fix single character that looks like a digit
 */
const charToDigit = (char) => {
    const map = {
        'o': '0', 'O': '0', 'D': '0',
        'l': '1', 'I': '1', '|': '1', 'i': '1',
        'z': '2', 'Z': '2',
        's': '5', 'S': '5',
        'b': '6', 'B': '6', 'G': '6',
        'q': '9', 'g': '9',
    };
    return map[char] || char;
};

/**
 * Check if the person is female based on KTP text
 */
const checkGender = (text) => {
    const upperText = text.toUpperCase();
    if (upperText.includes('PEREMPUAN')) {
        return 'PEREMPUAN';
    }
    if (upperText.includes('LAKI-LAKI') || upperText.includes('LAKI LAKI')) {
        return 'LAKI-LAKI';
    }
    return null;
};

/**
 * Extract birthdate from KTP text
 * Also checks gender field for female detection
 */
const extractBirthdate = (text) => {
    const gender = checkGender(text);
    const isFemale = gender === 'PEREMPUAN';
    console.log('Detected gender:', gender, 'isFemale:', isFemale);

    const datePatterns = [
        /(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/,
        /(\d{1,2})[-\/](\d{1,2})[-\/](\d{2})\b/,
    ];

    for (const pattern of datePatterns) {
        const match = text.match(pattern);
        if (match) {
            let day = parseInt(match[1], 10);
            const month = parseInt(match[2], 10);
            let year = parseInt(match[3], 10);

            if (year < 100) {
                year = year > 50 ? 1900 + year : 2000 + year;
            }

            console.log('Extracted birthdate:', { day, month, year, isFemale });
            return { day, month, year, isFemale };
        }
    }
    return null;
};

/**
 * Validate and fix NIK using birthdate cross-reference
 */
const validateNikWithBirthdate = (nik, birthdate) => {
    if (!birthdate || nik.length !== 16) return nik;

    const { day, month, year, isFemale } = birthdate;

    const nikDay = isFemale ? day + 40 : day;
    const nikMonth = month;
    const nikYear = year % 100;

    const expectedBirthPart =
        nikDay.toString().padStart(2, '0') +
        nikMonth.toString().padStart(2, '0') +
        nikYear.toString().padStart(2, '0');

    const actualBirthPart = nik.substring(6, 12);

    console.log('Expected birth part in NIK:', expectedBirthPart);
    console.log('Actual birth part in NIK:', actualBirthPart);

    if (actualBirthPart !== expectedBirthPart) {
        const fixedNik = nik.substring(0, 6) + expectedBirthPart + nik.substring(12);
        console.log('Fixed NIK:', fixedNik);
        return fixedNik;
    }

    return nik;
};

/**
 * Extract NIK from OCR text
 */
const extractNIK = (text, birthdate) => {
    console.log('=== NIK Extraction ===');

    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const upperLine = line.toUpperCase();

        if (upperLine.includes('NIK')) {
            console.log('Found NIK line:', line);

            let afterNik = line.replace(/.*NIK\s*[:\s]*/i, '');
            console.log('After NIK label:', afterNik);

            const nikMatch = afterNik.match(/^([a-zA-Z]?\d[\d\s]*\d)/);
            if (nikMatch) {
                let nikRaw = nikMatch[1];
                console.log('NIK raw match:', nikRaw);

                let nikDigits = '';
                for (const char of nikRaw) {
                    if (/\d/.test(char)) {
                        nikDigits += char;
                    } else if (/[a-zA-Z]/.test(char)) {
                        const converted = charToDigit(char);
                        if (/\d/.test(converted)) {
                            nikDigits += converted;
                        }
                    }
                }
                console.log('NIK digits:', nikDigits);

                if (nikDigits.length === 16) {
                    return validateNikWithBirthdate(nikDigits, birthdate);
                }

                if (nikDigits.length === 17) {
                    console.log('Got 17 digits, trying to fix...');
                    for (let pos = 9; pos <= 12; pos++) {
                        const candidate = nikDigits.slice(0, pos) + nikDigits.slice(pos + 1);
                        if (candidate[0] !== '0' && candidate.length === 16) {
                            return validateNikWithBirthdate(candidate, birthdate);
                        }
                    }
                    const truncated = nikDigits.substring(0, 16);
                    return validateNikWithBirthdate(truncated, birthdate);
                }

                if (nikDigits.length > 16) {
                    const truncated = nikDigits.substring(0, 16);
                    return validateNikWithBirthdate(truncated, birthdate);
                }
            }
        }
    }

    return '';
};

/**
 * Extract Name from OCR text
 */
const extractName = (text) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toUpperCase();

        if (line.includes('NAMA') && !line.includes('KECAMATAN')) {
            const sameLineMatch = line.match(/NAMA\s*[:\.\s]+([A-Z\s\.\']+)/i);
            if (sameLineMatch && sameLineMatch[1].trim().length > 2) {
                let name = sameLineMatch[1].trim();
                name = name.replace(/[^A-Z\s\.\']/gi, '').trim();
                return name.toUpperCase();
            }

            if (i + 1 < lines.length) {
                const nextLine = lines[i + 1].trim();
                if (!nextLine.match(/^(tempat|lahir|jenis|gol|alamat|rt|rw|kel|desa|kec|agama|status|pekerjaan|kewarganegaraan|berlaku|nik)/i)) {
                    let name = nextLine.replace(/[^A-Za-z\s\.\']/g, '').trim();
                    return name.toUpperCase();
                }
            }
        }
    }

    return '';
};

/**
 * Extract RT from OCR text
 */
const extractRT = (text) => {
    console.log('=== RT Extraction ===');

    const normalizedText = text
        .replace(/[oO]/g, '0')
        .replace(/[lI|]/g, '1');

    const patterns = [
        /RTRW\s*[:\.\s]*0*(\d{1,2})/i,
        /RT\s*[\.\:\s]*0*(\d{1,2})\s*[\/\\]/i,
        /RT\s*[\/\\]\s*RW\s*[\.\:\s]*0*(\d{1,2})\s*[\/\\]/i,
        /\bRT\s*[\.\:\s]*0*(\d{1,2})(?:\s|$|[\/\\])/i,
    ];

    for (const pattern of patterns) {
        const match = normalizedText.match(pattern);
        if (match) {
            const rtNum = parseInt(match[1], 10);
            console.log('Pattern matched, RT num:', rtNum);
            const rtFormatted = rtNum.toString().padStart(2, '0');
            if (VALID_RT_OPTIONS.includes(rtFormatted)) {
                return rtFormatted;
            }
        }
    }

    const lines = normalizedText.split('\n');
    for (const line of lines) {
        if (line.toUpperCase().includes('RT') || line.toUpperCase().includes('RW')) {
            const rtRwMatch = line.match(/\b0*(\d{1,2})\s*[\/\\:]\s*0*\d{1,3}\b/);
            if (rtRwMatch) {
                const rtNum = parseInt(rtRwMatch[1], 10);
                console.log('Address pattern matched, RT num:', rtNum);
                const rtFormatted = rtNum.toString().padStart(2, '0');
                if (VALID_RT_OPTIONS.includes(rtFormatted)) {
                    return rtFormatted;
                }
            }
        }
    }

    return '';
};

/**
 * Main OCR scan function
 */
export const scanKTP = async (imageDataUrl) => {
    try {
        const processedImage = await preprocessImage(imageDataUrl);

        const result = await Tesseract.recognize(
            processedImage,
            'ind',
            {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                    }
                }
            }
        );

        const text = result.data.text;
        const confidence = result.data.confidence;

        console.log('========== OCR RAW TEXT ==========');
        console.log(text);
        console.log('Confidence:', confidence);
        console.log('==================================');

        const birthdate = extractBirthdate(text);

        const nik = extractNIK(text, birthdate);
        const nama = extractName(text);
        const rt = extractRT(text);

        console.log('========== FINAL RESULT ==========');
        console.log('NIK:', nik);
        console.log('Nama:', nama);
        console.log('RT:', rt);
        console.log('==================================');

        return { nik, nama, rt, confidence, rawText: text };
    } catch (error) {
        console.error('OCR Error:', error);
        throw new Error('Gagal membaca KTP. Silakan coba dengan foto yang lebih jelas.');
    }
};
