import React, { useState } from 'react';
import Replicate from "replicate";
import { Settings, Image as ImageIcon, Sliders, Download, Upload, ChevronDown, ChevronUp } from 'lucide-react';

const ImageGenerator = () => {
  const [formData, setFormData] = useState({
    prompt: '',
    aspect_ratio: '1:1',
    cfg: 3.5,
    image: null,
    prompt_strength: 0.85,
    steps: 28,
    output_format: 'webp',
    output_quality: 90,
    seed: '',
    negative_prompt: ''
  });

  const [isGenerated, setIsGenerated] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setIsGenerated(false);
  
    const input = {
      prompt: formData.prompt,
      negative_prompt: formData.negative_prompt,
      cfg: parseFloat(formData.cfg),
      seed: formData.seed ? parseInt(formData.seed) : undefined,
      steps: parseInt(formData.steps),
      aspect_ratio: formData.aspect_ratio,
      output_format: formData.output_format,
      output_quality: parseInt(formData.output_quality),
    };

    // Only include image and prompt_strength if an image is actually uploaded
    if (formData.image) {
      input.image = formData.image;
      input.prompt_strength = parseFloat(formData.prompt_strength);
    }

     // Remove undefined or null values
    Object.keys(input).forEach(key => input[key] === undefined && delete input[key]);
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
      }
  
      const data = await response.json();
  
      if (data.output && data.output.length > 0) {
        setGeneratedImageUrl(data.output[0]);
        setIsGenerated(true);
      } else {
        console.error("No image generated");
      }
    } catch (error) {
      console.error("Error generating image:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (generatedImageUrl) {
      fetch(generatedImageUrl)
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          // Set the file name - you might want to generate a more meaningful name
          a.download = `generated-image.${formData.output_format}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        })
        .catch(error => console.error('Error downloading image:', error));
    }
  };

  const Tooltip = ({ children, title }) => (
    <div className="relative inline-block ml-2 group">
      {children}
      <div className="absolute z-10 invisible group-hover:visible bg-black text-white text-xs rounded p-2 left-full ml-2 w-48 top-0">
        {title}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-white text-black relative">
      <div className="w-1/3 p-6 border-r border-gray-200 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Image Generator</h1>
        
        <div className="mb-4">
          <label className="block mb-2 font-semibold">
            <ImageIcon className="inline mr-2" size={18} />
            Prompt
            <Tooltip title="Enter your prompt here">
              <span className="inline-block w-4 h-4 bg-gray-200 rounded-full text-xs text-center leading-4 cursor-help">i</span>
            </Tooltip>
          </label>
          <textarea
            name="prompt"
            className="w-full p-2 border border-gray-300 rounded"
            value={formData.prompt}
            onChange={handleInputChange}
            rows={3}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-semibold">
            Aspect Ratio
            <Tooltip title="The aspect ratio of your output image. This value is ignored if you are using an input image.">
              <span className="inline-block w-4 h-4 bg-gray-200 rounded-full text-xs text-center leading-4 cursor-help">i</span>
            </Tooltip>
          </label>
          <select
            name="aspect_ratio"
            className="w-full p-2 border border-gray-300 rounded"
            value={formData.aspect_ratio}
            onChange={handleInputChange}
          >
            {['1:1', '16:9', '21:9', '2:3', '3:2', '4:5', '5:4', '9:16', '9:21'].map(ratio => (
              <option key={ratio} value={ratio}>{ratio}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-semibold">
            <Upload className="inline mr-2" size={18} />
            Input Image
            <Tooltip title="Input image for image to image mode. The aspect ratio of your output will match this image.">
              <span className="inline-block w-4 h-4 bg-gray-200 rounded-full text-xs text-center leading-4 cursor-help">i</span>
            </Tooltip>
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-semibold">
            Output Format
            <Tooltip title="Format of the output images">
              <span className="inline-block w-4 h-4 bg-gray-200 rounded-full text-xs text-center leading-4 cursor-help">i</span>
            </Tooltip>
          </label>
          <select
            name="output_format"
            className="w-full p-2 border border-gray-300 rounded"
            value={formData.output_format}
            onChange={handleInputChange}
          >
            {['webp', 'jpg', 'png'].map(format => (
              <option key={format} value={format}>{format.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-semibold">
            Negative Prompt
            <Tooltip title="Negative prompts do not really work in SD3. Using a negative prompt will change your output in unpredictable ways.">
              <span className="inline-block w-4 h-4 bg-gray-200 rounded-full text-xs text-center leading-4 cursor-help">i</span>
            </Tooltip>
          </label>
          <textarea
            name="negative_prompt"
            className="w-full p-2 border border-gray-300 rounded"
            value={formData.negative_prompt}
            onChange={handleInputChange}
            rows={2}
          />
        </div>

        <div className="mb-4">
          <button 
            className="w-full flex justify-between items-center p-2 bg-gray-100 rounded"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <span className="font-semibold">Advanced Settings</span>
            {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {showAdvanced && (
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <div className="mb-4">
              <label className="block mb-2 font-semibold">
                Steps
                <Tooltip title="Number of steps to run the sampler for.">
                  <span className="inline-block w-4 h-4 bg-gray-200 rounded-full text-xs text-center leading-4 cursor-help">i</span>
                </Tooltip>
              </label>
              <input
                type="number"
                name="steps"
                min="1"
                max="28"
                value={formData.steps}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-semibold">
                Seed
                <Tooltip title="Set a seed for reproducibility. Random by default.">
                  <span className="inline-block w-4 h-4 bg-gray-200 rounded-full text-xs text-center leading-4 cursor-help">i</span>
                </Tooltip>
              </label>
              <input
                type="number"
                name="seed"
                value={formData.seed}
                onChange={handleInputChange}
                placeholder="Random"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-semibold">
                Prompt Strength
                <Tooltip title="Prompt strength (or denoising strength) when using image to image. 1.0 corresponds to full destruction of information in image.">
                  <span className="inline-block w-4 h-4 bg-gray-200 rounded-full text-xs text-center leading-4 cursor-help">i</span>
                </Tooltip>
              </label>
              <input
                type="range"
                name="prompt_strength"
                min="0"
                max="1"
                step="0.01"
                value={formData.prompt_strength}
                onChange={handleInputChange}
                className="w-full"
              />
              <span>{formData.prompt_strength}</span>
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-semibold">
                <Sliders className="inline mr-2" size={18} />
                Guidance Scale (CFG)
                <Tooltip title="The guidance scale tells the model how similar the output should be to the prompt.">
                  <span className="inline-block w-4 h-4 bg-gray-200 rounded-full text-xs text-center leading-4 cursor-help">i</span>
                </Tooltip>
              </label>
              <input
                type="range"
                name="cfg"
                min="0"
                max="20"
                step="0.1"
                value={formData.cfg}
                onChange={handleInputChange}
                className="w-full"
              />
              <span>{formData.cfg}</span>
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-semibold">
                Output Quality
                <Tooltip title="Quality of the output images, from 0 to 100. 100 is best quality, 0 is lowest quality.">
                  <span className="inline-block w-4 h-4 bg-gray-200 rounded-full text-xs text-center leading-4 cursor-help">i</span>
                </Tooltip>
              </label>
              <input
                type="range"
                name="output_quality"
                min="0"
                max="100"
                value={formData.output_quality}
                onChange={handleInputChange}
                className="w-full"
              />
              <span>{formData.output_quality}</span>
            </div>
          </div>
        )}
        
        <button 
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
          onClick={handleGenerate}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </div>
      
      <div className="w-2/3 p-6 flex flex-col items-center justify-center bg-gray-100">
      <div className="w-[512px] h-[512px] bg-gray-300 rounded flex items-center justify-center mb-4">
        {isLoading ? (
          <span className="text-gray-600">Generating image...</span>
        ) : isGenerated ? (
          <img 
            src={generatedImageUrl} 
            alt="Generated image" 
            className="w-full h-full object-contain rounded" 
          />
        ) : (
          <span className="text-gray-600">Generated image will appear here</span>
        )}
      </div>
      {isGenerated && (
        <>
          <p className="text-sm text-gray-600 mb-4">Image generated based on your prompt</p>
          <button 
            className="px-4 py-2 border border-black text-black rounded hover:bg-gray-100 flex items-center justify-center"
            onClick={handleDownload}
          >
            <Download className="mr-2" size={18} />
            Download Image
          </button>
        </>
      )}
    </div>

      <div className="absolute bottom-4 right-4">
        <img 
          src="/images/logo_small_black.png" 
          alt="Vectrix Logo" 
          className="h-8" 
        />
      </div>
    </div>
  );
};

export default ImageGenerator;