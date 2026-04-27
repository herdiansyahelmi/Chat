export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;
    const apiKey = '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';

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
                    model: 'llama-3.3-70b-versatile'
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
            return res.status(response.status).json({ error: errorText });
        }

        const data = await response.json();
        const answer = data.choices[0].message.content;
        
        return res.status(200).json({ 
            answer: answer,
            model: 'llama-3.3-70b-versatile'
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
