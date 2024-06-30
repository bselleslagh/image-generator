const express = require('express');
const cors = require('cors');
const Replicate = require('replicate');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

if (!REPLICATE_API_TOKEN) {
  console.error('REPLICATE_API_TOKEN is not set in the environment variables');
  process.exit(1);
}

const replicate = new Replicate({
  auth: REPLICATE_API_TOKEN,
});

app.post('/generate-image', async (req, res) => {
  try {
    console.log('Received request:', req.body);
    //print the replicate token
    console.log('Replicate token:',
      REPLICATE_API_TOKEN
    );

    const output = await replicate.run(
      "stability-ai/stable-diffusion-3",
      {
        input: req.body
      }
    );

    console.log('Replicate API response:', output);
    res.json({ output });
  } catch (error) {
    console.error('Error details:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.message, details: error.response ? error.response.data : 'No additional details' });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));