<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fractal Story Tree</title>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #faf5ff 0%, #dbeafe 100%);
            min-height: 100vh;
            padding: 1.5rem;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            margin-bottom: 2rem;
        }

        .header-title {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
        }

        .header-title h1 {
            font-size: 2rem;
            font-weight: bold;
            color: #1f2937;
            margin: 0 0.75rem;
        }

        .header-badge {
            background: #f3e8ff;
            color: #7c3aed;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 500;
        }

        .header-description {
            color: #6b7280;
            max-width: 48rem;
            margin: 0 auto 0.75rem;
        }

        .info-toggle {
            color: #7c3aed;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 0.875rem;
            display: flex;
            align-items: center;
            margin: 0 auto;
        }

        .info-toggle:hover {
            color: #5b21b6;
        }

        .structure-info {
            background: white;
            border-radius: 0.75rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            padding: 1.5rem;
            margin-bottom: 2rem;
            display: none;
        }

        .structure-grid {
            display: grid;
            gap: 1.5rem;
            margin-bottom: 1rem;
        }

        @media (min-width: 768px) {
            .structure-grid {
                grid-template-columns: repeat(3, 1fr);
            }
        }

        .structure-card {
            padding: 1rem;
            border-radius: 0.5rem;
            border-left: 4px solid;
        }

        .structure-card.inicio {
            background: #dbeafe;
            border-left-color: #3b82f6;
        }

        .structure-card.nudo {
            background: #fed7aa;
            border-left-color: #f97316;
        }

        .structure-card.desenlace {
            background: #dcfce7;
            border-left-color: #22c55e;
        }

        .structure-card h4 {
            font-weight: bold;
            margin-bottom: 0.5rem;
        }

        .structure-card.inicio h4 {
            color: #1e40af;
        }

        .structure-card.nudo h4 {
            color: #ea580c;
        }

        .structure-card.desenlace h4 {
            color: #16a34a;
        }

        .structure-fractal {
            background: #f9fafb;
            padding: 1rem;
            border-radius: 0.5rem;
        }

        .start-form {
            background: white;
            border-radius: 0.75rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            padding: 2rem;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-label {
            display: block;
            font-size: 0.875rem;
            font-weight: 500;
            color: #374151;
            margin-bottom: 0.5rem;
        }

        .form-select, .form-textarea {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            font-size: 1rem;
        }

        .form-select:focus, .form-textarea:focus {
            outline: none;
            border-color: transparent;
            box-shadow: 0 0 0 2px #7c3aed;
        }

        .form-textarea {
            resize: none;
            font-family: inherit;
        }

        .start-button {
            width: 100%;
            background: #7c3aed;
            color: white;
            font-weight: 600;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 0.5rem;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .start-button:hover:not(:disabled) {
            background: #5b21b6;
        }

        .start-button:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }

        .story-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }

        .story-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1f2937;
        }

        .reset-button {
            background: #6b7280;
            color: white;
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 0.5rem;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .reset-button:hover {
            background: #374151;
        }

        .story-container {
            background: white;
            border-radius: 0.75rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            padding: 1.5rem;
        }

        .story-node {
            margin-bottom: 0.75rem;
        }

        .node-content {
            display: flex;
            align-items: flex-start;
            padding: 1rem;
            border-radius: 0.5rem;
            border-left: 4px solid;
            transition: all 0.2s;
        }

        .node-content.premise {
            background: #f9fafb;
            border-left-color: #9ca3af;
        }

        .node-content.premise:hover {
            background: #f3f4f6;
        }

        .node-content.inicio {
            background: #dbeafe;
            border-left-color: #3b82f6;
        }

        .node-content.inicio:hover {
            background: #bfdbfe;
        }

        .node-content.nudo {
            background: #fed7aa;
            border-left-color: #f97316;
        }

        .node-content.nudo:hover {
            background: #fdba74;
        }

        .node-content.desenlace {
            background: #dcfce7;
            border-left-color: #22c55e;
        }

        .node-content.desenlace:hover {
            background: #bbf7d0;
        }

        .node-toggle {
            margin-right: 0.75rem;
            background: none;
            border: none;
            padding: 0.25rem;
            border-radius: 0.25rem;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .node-toggle:hover {
            background: rgba(255, 255, 255, 0.5);
        }

        .node-details {
            flex: 1;
        }

        .beat-label {
            margin-bottom: 0.5rem;
        }

        .beat-badge {
            display: inline-block;
            font-size: 0.75rem;
            font-weight: bold;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
        }

        .beat-badge.inicio {
            background: #bfdbfe;
            color: #1e40af;
        }

        .beat-badge.nudo {
            background: #fdba74;
            color: #ea580c;
        }

        .beat-badge.desenlace {
            background: #bbf7d0;
            color: #16a34a;
        }

        .beat-badge.premise {
            background: #e9d5ff;
            color: #7c2d12;
        }

        .beat-description {
            font-size: 0.75rem;
            color: #6b7280;
            margin-top: 0.25rem;
            font-style: italic;
        }

        .node-text {
            color: #1f2937;
            line-height: 1.6;
            margin-bottom: 0.5rem;
        }

        .node-text.root {
            font-weight: 600;
            color: #111827;
        }

        .node-actions {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-top: 0.75rem;
        }

        .node-button {
            display: flex;
            align-items: center;
            font-size: 0.875rem;
            padding: 0.25rem 0.5rem;
            border: none;
            border-radius: 0.25rem;
            cursor: pointer;
            transition: all 0.2s;
        }

        .expand-button {
            color: #2563eb;
            background: none;
        }

        .expand-button:hover {
            color: #1d4ed8;
            background: #dbeafe;
        }

        .regenerate-button {
            color: #ea580c;
            background: none;
        }

        .regenerate-button:hover:not(:disabled) {
            color: #c2410c;
            background: #fed7aa;
        }

        .copy-button {
            color: #059669;
            background: none;
        }

        .copy-button:hover:not(:disabled) {
            color: #047857;
            background: #d1fae5;
        }

        .copy-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .copy-all-section {
            text-align: center;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #e5e7eb;
        }

        .copy-all-button {
            background: #059669;
            color: white;
            font-weight: 600;
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 0.875rem;
        }

        .copy-all-button:hover:not(:disabled) {
            background: #047857;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .copy-all-button:disabled {
            background: #9ca3af;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }

        .node-children {
            margin-left: 1.5rem;
            margin-top: 0.75rem;
        }

        .story-legend {
            text-align: center;
            font-size: 0.875rem;
            color: #6b7280;
            margin-top: 1.5rem;
        }

        .story-legend p {
            margin-bottom: 0.25rem;
        }

        .icon {
            width: 1rem;
            height: 1rem;
            margin-right: 0.25rem;
        }

        .icon-large {
            width: 2rem;
            height: 2rem;
        }

        .spinner {
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        .hidden {
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-title">
                <span style="font-size: 2rem; color: #7c3aed;">📚</span>
                <h1>Fractal Story Tree</h1>
                <span class="header-badge">Inicio • Nudo • Desenlace</span>
            </div>
            <p class="header-description">
                Create stories using the fractal <strong>Inicio-Nudo-Desenlace</strong> structure. 
                Each sentence expands into its own beginning, conflict, and resolution - then each of those can expand infinitely.
            </p>
            <button class="info-toggle" onclick="toggleStructureInfo()">
                <span style="width: 1rem; height: 1rem; margin-right: 0.25rem; display: inline-block;">ℹ️</span>
                <span id="info-toggle-text">Show Fractal Structure</span>
            </button>
        </div>

        <div id="structure-info" class="structure-info">
            <h3 style="font-size: 1.125rem; font-weight: bold; color: #1f2937; margin-bottom: 1rem;">
                🔄 Estructura Fractal: Inicio-Nudo-Desenlace
            </h3>
            <div class="structure-grid">
                <div class="structure-card inicio">
                    <h4>🔵 INICIO</h4>
                    <p style="font-size: 0.875rem; color: #374151;">
                        ¿Cómo comienza esta situación? Presentación, contexto inicial, el punto de partida.
                    </p>
                </div>
                <div class="structure-card nudo">
                    <h4>🟠 NUDO</h4>
                    <p style="font-size: 0.875rem; color: #374151;">
                        ¿Qué problema surge? El conflicto, la complicación, lo que crea tensión.
                    </p>
                </div>
                <div class="structure-card desenlace">
                    <h4>🟢 DESENLACE</h4>
                    <p style="font-size: 0.875rem; color: #374151;">
                        ¿Cómo se resuelve? La conclusión, transformación, o nueva situación.
                    </p>
                </div>
            </div>
            <div class="structure-fractal">
                <h4 style="font-weight: bold; color: #1f2937; margin-bottom: 0.5rem;">♾️ Estructura Fractal</h4>
                <p style="font-size: 0.875rem; color: #374151; margin-bottom: 0.5rem;">
                    Cada oración se expande en <strong>Inicio → Nudo → Desenlace</strong>
                </p>
                <p style="font-size: 0.875rem; color: #374151;">
                    Luego, cada una de esas 3 oraciones puede expandirse de nuevo en su propia estructura Inicio-Nudo-Desenlace, creando un árbol infinito de posibilidades narrativas.
                </p>
            </div>
        </div>

        <div id="start-form" class="start-form">
            <div class="form-group">
                <label class="form-label">Choose a genre (optional):</label>
                <select id="genre-select" class="form-select">
                    <option value="any">Any Genre</option>
                    <option value="comedy">Comedy</option>
                    <option value="drama">Drama</option>
                    <option value="adventure">Adventure</option>
                    <option value="mystery">Mystery</option>
                    <option value="sci-fi">Science Fiction</option>
                    <option value="fantasy">Fantasy</option>
                    <option value="romance">Romance</option>
                    <option value="thriller">Thriller</option>
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Enter your story premise:</label>
                <textarea 
                    id="story-input" 
                    class="form-textarea" 
                    rows="3" 
                    placeholder="Un jardinero terrible gana el concurso de Chelsea por coincidencia"
                ></textarea>
            </div>
            
            <button id="start-button" class="start-button" onclick="startNewStory()">
                Start Fractal Story Tree
            </button>
        </div>

        <div id="story-section" class="hidden">
            <div class="story-header">
                <h2 class="story-title">Your Fractal Story Tree</h2>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button id="copy-all-button" class="copy-all-button" onclick="copyAllStory()">
                        <span class="icon">📋</span>
                        Copy All Story
                    </button>
                    <button class="reset-button" onclick="resetStory()">Start New Story</button>
                </div>
            </div>
            
            <div class="story-container">
                <div id="story-tree"></div>
                
                <div class="copy-all-section">
                    <p style="color: #6b7280; font-size: 0.875rem; margin-bottom: 0.5rem;">
                        💡 Use <strong>Copy</strong> for individual sentences or <strong>Copy All Story</strong> for the complete tree structure
                    </p>
                </div>
            </div>
            
            <div class="story-legend">
                <p>♾️ <strong>Fractal Structure:</strong> Each sentence expands into Inicio-Nudo-Desenlace</p>
                <p>🔵 <span style="color: #2563eb;">INICIO</span> • 🟠 <span style="color: #ea580c;">NUDO</span> • 🟢 <span style="color: #16a34a;">DESENLACE</span></p>
                <p>💡 <strong>Expand</strong> any sentence, <strong>Regenerate</strong> for alternatives, or <strong>Copy</strong> text to clipboard</p>
            </div>
        </div>
    </div>

    <script>
        let storyData = null;
        let expandingNodes = new Set();
        let regeneratingNodes = new Set();

        const narrativeBeats = {
            0: { label: "INICIO", description: "¿Cómo comienza? Situación inicial, presentación", color: "inicio" },
            1: { label: "NUDO", description: "¿Qué problema surge? Conflicto, complicación", color: "nudo" },
            2: { label: "DESENLACE", description: "¿Cómo se resuelve? Resolución, conclusión", color: "desenlace" }
        };

        function toggleStructureInfo() {
            const structureInfo = document.getElementById('structure-info');
            const toggleText = document.getElementById('info-toggle-text');
            
            if (structureInfo.style.display === 'none' || structureInfo.style.display === '') {
                structureInfo.style.display = 'block';
                toggleText.textContent = 'Hide Fractal Structure';
            } else {
                structureInfo.style.display = 'none';
                toggleText.textContent = 'Show Fractal Structure';
            }
        }

        function updateStartButton() {
            const input = document.getElementById('story-input');
            const button = document.getElementById('start-button');
            button.disabled = !input.value.trim();
        }

        document.getElementById('story-input').addEventListener('input', updateStartButton);
        updateStartButton();

        async function startNewStory() {
            const input = document.getElementById('story-input');
            const genre = document.getElementById('genre-select').value;
            
            if (!input.value.trim()) return;

            const rootNode = {
                id: 'root',
                text: input.value.trim(),
                children: [],
                isExpanded: false,
                parent: null,
                beatIndex: null
            };

            storyData = rootNode;
            showStorySection();
            
            // Show loading state
            document.getElementById('story-tree').innerHTML = '<div style="text-align: center; padding: 2rem;"><span style="font-size: 2rem; color: #7c3aed;">⏳</span><p style="margin-top: 1rem; color: #6b7280;">Expanding your story...</p></div>';
            
            await expandSentence(rootNode);
        }

        function showStorySection() {
            document.getElementById('start-form').classList.add('hidden');
            document.getElementById('story-section').classList.remove('hidden');
            renderStoryTree();
        }

        function resetStory() {
            storyData = null;
            expandingNodes.clear();
            regeneratingNodes.clear();
            document.getElementById('start-form').classList.remove('hidden');
            document.getElementById('story-section').classList.add('hidden');
            document.getElementById('story-input').value = '';
            updateStartButton();
        }

        async function expandSentence(node) {
            const nodeId = node.id;
            expandingNodes.add(nodeId);
            renderStoryTree();

            try {
                const genre = document.getElementById('genre-select').value;
                const genreInstruction = genre === 'any' ? '' : `in the ${genre} genre `;

                const prompt = `You are expanding a story using the fractal INICIO-NUDO-DESENLACE structure.

Current sentence: "${node.text}"

Expand this sentence into exactly 3 sentences ${genreInstruction}following the classic narrative structure:

1. **INICIO**: How this situation begins, what sets it up, the initial state or action
2. **NUDO**: What problem, conflict, or complication arises from this situation  
3. **DESENLACE**: How this specific situation resolves, concludes, or transforms

Each sentence should:
- Continue naturally from the original sentence
- Follow the specific narrative function (inicio/nudo/desenlace)
- Be a complete, detailed sentence that could be expanded further
- Maintain the same tense and style as the original

Example:
Original: "Un jardinero terrible gana el concurso de Chelsea por coincidencia"
1. INICIO: "Un jardinero de Pimlico que solo sabe mantener vivas las malas hierbas se estrella con su Morris Minor cerca del lugar del concurso"
2. NUDO: "El público piensa que es un jardín conceptual y recibe una mención especial"  
3. DESENLACE: "El jardinero tiene que fingir ser un experto cuando lo entrevistan los periodistas"

Respond ONLY with a JSON object in this exact format:
{
  "expansions": [
    "INICIO sentence here",
    "NUDO sentence here", 
    "DESENLACE sentence here"
  ]
}

DO NOT OUTPUT ANYTHING OTHER THAN VALID JSON.`;

                console.log('Making API call to expand sentence:', node.text);
                
                const response = await fetch("https://api.anthropic.com/v1/messages", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: "claude-sonnet-4-20250514",
                        max_tokens: 1000,
                        messages: [{ role: "user", content: prompt }]
                    })
                });

                console.log('API Response status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API Error:', errorText);
                    throw new Error(`API request failed: ${response.status} - ${errorText}`);
                }

                const data = await response.json();
                console.log('API Response data:', data);
                
                let responseText = data.content[0].text;
                console.log('Raw response text:', responseText);
                
                responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
                console.log('Cleaned response text:', responseText);
                
                const result = JSON.parse(responseText);
                console.log('Parsed result:', result);
                
                if (!result.expansions || !Array.isArray(result.expansions) || result.expansions.length !== 3) {
                    throw new Error('Invalid response format: expected 3 expansions');
                }
                
                const childNodes = result.expansions.map((text, index) => ({
                    id: `${nodeId}_${index}`,
                    text: text,
                    children: [],
                    isExpanded: false,
                    parent: node,
                    beatIndex: index
                }));

                console.log('Created child nodes:', childNodes);
                
                node.children = childNodes;
                node.isExpanded = true;
                
                console.log('Updated node:', node);

            } catch (error) {
                console.error("Error expanding sentence:", error);
                alert(`Failed to expand the sentence: ${error.message}`);
            } finally {
                expandingNodes.delete(nodeId);
                renderStoryTree();
            }
        }

        async function regenerateSentence(node) {
            if (!node.parent) return;
            
            const nodeId = node.id;
            regeneratingNodes.add(nodeId);
            renderStoryTree();

            try {
                const genre = document.getElementById('genre-select').value;
                const genreInstruction = genre === 'any' ? '' : `in the ${genre} genre `;

                const prompt = `You are regenerating one sentence in a fractal INICIO-NUDO-DESENLACE story structure.

Parent sentence: "${node.parent.text}"

You previously generated 3 expansions (INICIO, NUDO, DESENLACE) for this sentence. Now regenerate ONLY the ${narrativeBeats[node.beatIndex].label} sentence with a completely different approach.

The ${narrativeBeats[node.beatIndex].label} should: ${narrativeBeats[node.beatIndex].description}

Create a single sentence ${genreInstruction}that:
- Is completely different from the previous version
- Still serves the ${narrativeBeats[node.beatIndex].label} function perfectly
- Continues naturally from the parent sentence
- Maintains the same tense and style
- Could be expanded further into its own INICIO-NUDO-DESENLACE

Respond ONLY with a JSON object in this exact format:
{
  "regenerated": "Your new sentence here"
}

DO NOT OUTPUT ANYTHING OTHER THAN VALID JSON.`;

                const response = await fetch("https://api.anthropic.com/v1/messages", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: "claude-sonnet-4-20250514",
                        max_tokens: 1000,
                        messages: [{ role: "user", content: prompt }]
                    })
                });

                if (!response.ok) {
                    throw new Error(`API request failed: ${response.status}`);
                }

                const data = await response.json();
                let responseText = data.content[0].text;
                
                responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
                
                const result = JSON.parse(responseText);
                
                node.text = result.regenerated;
                node.children = [];
                node.isExpanded = false;

            } catch (error) {
                console.error("Error regenerating sentence:", error);
                alert("Failed to regenerate the sentence. Please try again.");
            } finally {
                regeneratingNodes.delete(nodeId);
                renderStoryTree();
            }
        }

        async function toggleNode(node) {
            console.log('Toggling node:', node);
            
            if (!node) {
                console.error('Node is null or undefined');
                return;
            }
            
            if (node.children.length === 0) {
                console.log('Node has no children, expanding...');
                await expandSentence(node);
            } else {
                console.log('Node has children, toggling expanded state');
                node.isExpanded = !node.isExpanded;
                renderStoryTree();
            }
        }

        // Global function to handle clicks from HTML
        window.toggleNode = async function(nodeId) {
            console.log('Toggle node called with ID:', nodeId);
            const node = findNodeById(nodeId);
            if (node) {
                await toggleNode(node);
            } else {
                console.error('Node not found with ID:', nodeId);
            }
        };

        // Global function for regeneration
        window.regenerateNode = async function(nodeId) {
            console.log('Regenerate node called with ID:', nodeId);
            const node = findNodeById(nodeId);
            if (node) {
                await regenerateSentence(node);
            } else {
                console.error('Node not found with ID:', nodeId);
            }
        };

        // Copy functions
        function copyToClipboard(text) {
            if (navigator.clipboard && window.isSecureContext) {
                return navigator.clipboard.writeText(text);
            } else {
                // Fallback for older browsers
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.left = "-999999px";
                textArea.style.top = "-999999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                return new Promise((resolve, reject) => {
                    document.execCommand('copy') ? resolve() : reject();
                    textArea.remove();
                });
            }
        }

        window.copyNode = function(nodeId) {
            const node = findNodeById(nodeId);
            if (!node) return;
            
            copyToClipboard(node.text)
                .then(() => {
                    showCopyFeedback(nodeId, 'Copied!');
                })
                .catch(() => {
                    showCopyFeedback(nodeId, 'Copy failed');
                });
        };

        function showCopyFeedback(nodeId, message) {
            const button = document.querySelector(`button[onclick="copyNode('${nodeId}')"]`);
            if (button) {
                const originalText = button.innerHTML;
                button.innerHTML = `<span class="icon">✅</span>${message}`;
                button.disabled = true;
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.disabled = false;
                }, 1500);
            }
        }

        function collectStoryText(node, depth = 0) {
            let text = '';
            const indent = '  '.repeat(depth);
            
            // Add beat label if applicable
            if (node.beatIndex !== null) {
                const beat = narrativeBeats[node.beatIndex];
                text += `${indent}[${beat.label}] `;
            } else if (depth === 0) {
                text += `${indent}[PREMISE] `;
            }
            
            text += `${node.text}\n`;
            
            // Add expanded children
            if (node.isExpanded && node.children.length > 0) {
                for (const child of node.children) {
                    text += collectStoryText(child, depth + 1);
                }
            }
            
            return text;
        }

        window.copyAllStory = function() {
            if (!storyData) return;
            
            const fullStory = collectStoryText(storyData);
            const storyHeader = `Fractal Story Tree - Generated Story\n${'='.repeat(50)}\n\n`;
            const finalText = storyHeader + fullStory;
            
            copyToClipboard(finalText)
                .then(() => {
                    showGlobalCopyFeedback('Story copied to clipboard!');
                })
                .catch(() => {
                    showGlobalCopyFeedback('Copy failed');
                });
        };

        function showGlobalCopyFeedback(message) {
            const button = document.getElementById('copy-all-button');
            if (button) {
                const originalText = button.innerHTML;
                button.innerHTML = `<span class="icon">✅</span>${message}`;
                button.disabled = true;
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.disabled = false;
                }, 2000);
            }
        }

        function renderNode(node, depth = 0) {
            const isExpanding = expandingNodes.has(node.id);
            const isRegenerating = regeneratingNodes.has(node.id);
            const hasChildren = node.children.length > 0;
            const canExpand = true;
            const canRegenerate = node.parent !== null;
            const currentBeat = node.beatIndex !== null ? narrativeBeats[node.beatIndex] : null;

            let beatClass = 'premise';
            let beatLabel = 'PREMISE';
            let beatDescription = 'Your initial story idea - ready to expand into Inicio-Nudo-Desenlace';

            if (currentBeat) {
                beatClass = currentBeat.color;
                beatLabel = currentBeat.label;
                beatDescription = currentBeat.description;
            }

            const nodeHtml = `
                <div class="story-node">
                    <div class="node-content ${beatClass}">
                        <button class="node-toggle" onclick="toggleNode('${node.id}')" ${!canExpand ? 'style="visibility: hidden;"' : ''}>
                            ${isExpanding ? 
                                '<span class="icon">⏳</span>' : 
                                (node.isExpanded && hasChildren ? 
                                    '<span class="icon">▼</span>' : 
                                    '<span class="icon">▶</span>'
                                )
                            }
                        </button>
                        <div class="node-details">
                            <div class="beat-label">
                                <span class="beat-badge ${beatClass}">${beatLabel}</span>
                                <p class="beat-description">${beatDescription}</p>
                            </div>
                            <p class="node-text ${depth === 0 ? 'root' : ''}">${node.text}</p>
                            
                            <div class="node-actions">
                                ${canExpand && !hasChildren && !isExpanding ? `
                                    <button class="node-button expand-button" onclick="toggleNode('${node.id}')">
                                        <span class="icon">➕</span>
                                        Expand
                                    </button>
                                ` : ''}
                                ${canRegenerate ? `
                                    <button class="node-button regenerate-button" onclick="regenerateNode('${node.id}')" ${isRegenerating ? 'disabled' : ''}>
                                        ${isRegenerating ? 
                                            '<span class="icon">⏳</span>Regenerating...' : 
                                            '<span class="icon">🔄</span>Regenerate'
                                        }
                                    </button>
                                ` : ''}
                                <button class="node-button copy-button" onclick="copyNode('${node.id}')">
                                    <span class="icon">📋</span>
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    ${node.isExpanded && hasChildren ? `
                        <div class="node-children">
                            ${node.children.map(child => renderNode(child, depth + 1)).join('')}
                        </div>
                    ` : ''}
                </div>
            `;

            return nodeHtml;
        }

        function findNodeById(id) {
            function searchNode(node) {
                if (node.id === id) return node;
                for (let child of node.children) {
                    const found = searchNode(child);
                    if (found) return found;
                }
                return null;
            }
            return searchNode(storyData);
        }

        function renderStoryTree() {
            if (!storyData) {
                console.log('No story data to render');
                return;
            }
            
            console.log('Rendering story tree with data:', storyData);
            
            const treeContainer = document.getElementById('story-tree');
            if (!treeContainer) {
                console.error('Story tree container not found');
                return;
            }
            
            treeContainer.innerHTML = renderNode(storyData);
            
            // Initialize Lucide icons after rendering
            setTimeout(() => {
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                } else {
                    console.warn('Lucide icons not available during render');
                }
            }, 100);
        }

        // Initialize Lucide icons on page load
        document.addEventListener('DOMContentLoaded', function() {
            // Wait for lucide to be available
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            } else {
                // Fallback - wait a bit longer for the script to load
                setTimeout(() => {
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    } else {
                        console.warn('Lucide icons failed to load');
                    }
                }, 1000);
            }
        });
    </script>
</body>
</html>
