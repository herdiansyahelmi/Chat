export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // GANTI API KEY INI DENGAN YANG BARU DARI https://console.groq.com/keys
    const apiKey = process.env.GROQ_API_KEY || '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';

    try {
        const response = await fetch(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        {
                            role: 'system',
                            content: 'Kamu adalah CS Assistant Alfamind yang ramah dan membantu. Jawab pertanyaan tentang aplikasi Alfamind, store owner, saldo, dan layanan. Gunakan emoji yang sesuai. Jawab dalam Bahasa Indonesia dengan singkat dan jelas. Jika tidak tahu, arahkan ke call center 1500 959.'
                        },
                        {
                            role: 'user',
                            content: message
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Groq API Error:', errorText);
            return res.status(response.status).json({ error: `Groq API Error: ${errorText}` });
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('Invalid response structure:', data);
            return res.status(500).json({ error: 'Invalid response from Groq API' });
        }
        
        const answer = data.choices[0].message.content;
        
        return res.status(200).json({ 
            answer: answer,
            model: 'llama-3.3-70b-versatile'
        });
    } catch (error) {
        console.error('Function error:', error);
        return res.status(500).json({ error: `Server error: ${error.message}` });
    }
}
