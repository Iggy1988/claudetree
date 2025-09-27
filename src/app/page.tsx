"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type BeatIndex = 0 | 1 | 2;

type BeatKey = "premise" | "inicio" | "nudo" | "desenlace";

interface StoryNode {
  id: string;
  text: string;
  children: StoryNode[];
  isExpanded: boolean;
  parentId: string | null;
  beatIndex: BeatIndex | null;
}

interface BeatMeta {
  label: string;
  description: string;
  colorKey: Exclude<BeatKey, "premise">;
}

const GENRES = [
  { value: "any", label: "Any Genre" },
  { value: "comedy", label: "Comedy" },
  { value: "drama", label: "Drama" },
  { value: "adventure", label: "Adventure" },
  { value: "mystery", label: "Mystery" },
  { value: "sci-fi", label: "Science Fiction" },
  { value: "fantasy", label: "Fantasy" },
  { value: "romance", label: "Romance" },
  { value: "thriller", label: "Thriller" },
] as const;

const BEATS: Record<BeatIndex, BeatMeta> = {
  0: {
    label: "INICIO",
    description: "¿Cómo comienza? Situación inicial, presentación",
    colorKey: "inicio",
  },
  1: {
    label: "NUDO",
    description: "¿Qué problema surge? Conflicto, complicación",
    colorKey: "nudo",
  },
  2: {
    label: "DESENLACE",
    description: "¿Cómo se resuelve? Resolución, conclusión",
    colorKey: "desenlace",
  },
};

const BEAT_STYLES: Record<BeatKey, { container: string; badge: string }> = {
  premise: {
    container:
      "border-l-4 border-slate-400 bg-slate-50",
    badge: "bg-purple-100 text-purple-700",
  },
  inicio: {
    container: "border-l-4 border-blue-500 bg-blue-100",
    badge: "bg-blue-200 text-blue-800",
  },
  nudo: {
    container: "border-l-4 border-orange-500 bg-orange-100",
    badge: "bg-orange-200 text-orange-800",
  },
  desenlace: {
    container: "border-l-4 border-green-500 bg-green-100",
    badge: "bg-green-200 text-green-800",
  },
};

const PROMPT_TEMPLATE = `You are expanding a story using the fractal INICIO-NUDO-DESENLACE structure.

Current sentence: "{{sentence}}"

Expand this sentence into exactly 3 sentences {{genreInstruction}}following the classic narrative structure:

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

function findNodeById(node: StoryNode, id: string): StoryNode | null {
  if (node.id === id) {
    return node;
  }

  for (const child of node.children) {
    const found = findNodeById(child, id);
    if (found) {
      return found;
    }
  }

  return null;
}

function updateNodeById(
  node: StoryNode,
  id: string,
  updater: (target: StoryNode) => StoryNode,
): StoryNode {
  if (node.id === id) {
    return updater(node);
  }

  return {
    ...node,
    children: node.children.map((child) => updateNodeById(child, id, updater)),
  };
}

async function copyTextToClipboard(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "absolute";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
}

function createChildId(parentId: string, index: number) {
  const random = Math.random().toString(36).slice(2, 8);
  return `${parentId}-${index}-${Date.now()}-${random}`;
}

export default function Home() {
  const [genre, setGenre] = useState<string>("any");
  const [storyInput, setStoryInput] = useState<string>("");
  const [storyData, setStoryData] = useState<StoryNode | null>(null);
  const [expandingNodes, setExpandingNodes] = useState<Set<string>>(new Set());
  const [regeneratingNodes, setRegeneratingNodes] = useState<Set<string>>(new Set());
  const [copiedNodeId, setCopiedNodeId] = useState<string | null>(null);
  const [copyAllFeedback, setCopyAllFeedback] = useState<string | null>(null);
  const [showStructureInfo, setShowStructureInfo] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyAllTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const storyDataRef = useRef<StoryNode | null>(storyData);

  useEffect(() => {
    storyDataRef.current = storyData;
  }, [storyData]);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }
      if (copyAllTimeoutRef.current) {
        clearTimeout(copyAllTimeoutRef.current);
      }
    };
  }, []);

  const narrativeBeats = useMemo(() => BEATS, []);

  const addNodeFlag = useCallback((setter: (value: Set<string>) => void, nodeId: string) => {
    setter((prev) => {
      const updated = new Set(prev);
      updated.add(nodeId);
      return updated;
    });
  }, []);

  const removeNodeFlag = useCallback((setter: (value: Set<string>) => void, nodeId: string) => {
    setter((prev) => {
      const updated = new Set(prev);
      updated.delete(nodeId);
      return updated;
    });
  }, []);

  const callExpansionApi = useCallback(
    async (sentence: string) => {
      const genreInstruction = genre === "any" ? "" : `in the ${genre} genre `;
      const prompt = PROMPT_TEMPLATE.replace("{{sentence}}", sentence).replace(
        "{{genreInstruction}}",
        genreInstruction,
      );

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const rawText: string = data?.content?.[0]?.text ?? "";
      const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      let parsed: { expansions?: string[] };
      try {
        parsed = JSON.parse(cleaned);
      } catch (parseError) {
        throw new Error("Failed to parse model response as JSON");
      }

      if (!Array.isArray(parsed.expansions) || parsed.expansions.length !== 3) {
        throw new Error("Invalid response format: expected 3 expansions");
      }

      return parsed.expansions as [string, string, string];
    },
    [genre],
  );

  const setNodeChildren = useCallback((nodeId: string, expansions: [string, string, string]) => {
    setStoryData((previous) => {
      if (!previous) {
        return previous;
      }

      return updateNodeById(previous, nodeId, (node) => ({
        ...node,
        isExpanded: true,
        children: expansions.map((text, index) => ({
          id: createChildId(nodeId, index),
          text,
          children: [],
          isExpanded: false,
          parentId: nodeId,
          beatIndex: index as BeatIndex,
        })),
      }));
    });
  }, []);

  const expandNode = useCallback(
    async (nodeId: string, isRegeneration = false) => {
      const currentNode = storyDataRef.current ? findNodeById(storyDataRef.current, nodeId) : null;
      if (!currentNode) {
        return;
      }

      const flagSetter = isRegeneration ? setRegeneratingNodes : setExpandingNodes;

      addNodeFlag(flagSetter, nodeId);
      setError(null);

      try {
        const expansions = await callExpansionApi(currentNode.text);
        setNodeChildren(nodeId, expansions);
      } catch (apiError) {
        const message = apiError instanceof Error ? apiError.message : "Unknown error";
        setError(message);
      } finally {
        removeNodeFlag(flagSetter, nodeId);
      }
    },
    [addNodeFlag, callExpansionApi, removeNodeFlag, setNodeChildren],
  );

  const toggleNode = useCallback(
    async (nodeId: string) => {
      const current = storyDataRef.current ? findNodeById(storyDataRef.current, nodeId) : null;
      if (!current) {
        return;
      }

      if (current.children.length === 0) {
        await expandNode(nodeId, false);
        return;
      }

      setStoryData((previous) => {
        if (!previous) {
          return previous;
        }

        return updateNodeById(previous, nodeId, (node) => ({
          ...node,
          isExpanded: !node.isExpanded,
        }));
      });
    },
    [expandNode],
  );

  const regenerateNode = useCallback(
    async (nodeId: string) => {
      await expandNode(nodeId, true);
    },
    [expandNode],
  );

  const startNewStory = useCallback(async () => {
    const trimmed = storyInput.trim();
    if (!trimmed) {
      return;
    }

    const rootNode: StoryNode = {
      id: "root",
      text: trimmed,
      children: [],
      isExpanded: false,
      parentId: null,
      beatIndex: null,
    };

    setStoryData(rootNode);
    setCopiedNodeId(null);
    setCopyAllFeedback(null);
    setError(null);

    await expandNode("root", false);
  }, [expandNode, storyInput]);

  const resetStory = useCallback(() => {
    setStoryData(null);
    setStoryInput("");
    setExpandingNodes(new Set());
    setRegeneratingNodes(new Set());
    setCopiedNodeId(null);
    setCopyAllFeedback(null);
    setError(null);
  }, []);

  const handleCopyNode = useCallback(
    async (nodeId: string) => {
      const node = storyDataRef.current ? findNodeById(storyDataRef.current, nodeId) : null;
      if (!node) {
        return;
      }

      try {
        await copyTextToClipboard(node.text);
        setCopiedNodeId(nodeId);
        if (copiedTimeoutRef.current) {
          clearTimeout(copiedTimeoutRef.current);
        }
        copiedTimeoutRef.current = setTimeout(() => {
          setCopiedNodeId(null);
        }, 1500);
      } catch (copyError) {
        const message = copyError instanceof Error ? copyError.message : "Failed to copy";
        setError(message);
      }
    },
    [],
  );

  const collectStoryText = useCallback((node: StoryNode, depth = 0): string => {
    const indent = "  ".repeat(depth);
    let prefix = "";

    if (node.beatIndex !== null) {
      const beat = narrativeBeats[node.beatIndex];
      prefix = `[${beat.label}] `;
    } else if (depth === 0) {
      prefix = "[PREMISE] ";
    }

    let content = `${indent}${prefix}${node.text}\n`;

    if (node.isExpanded) {
      for (const child of node.children) {
        content += collectStoryText(child, depth + 1);
      }
    }

    return content;
  }, [narrativeBeats]);

  const copyAllStory = useCallback(async () => {
    if (!storyDataRef.current) {
      return;
    }

    const storyText = collectStoryText(storyDataRef.current);
    const header = `Fractal Story Tree - Generated Story\n${"=".repeat(50)}\n\n`;

    try {
      await copyTextToClipboard(header + storyText);
      setCopyAllFeedback("Story copied to clipboard!");
      if (copyAllTimeoutRef.current) {
        clearTimeout(copyAllTimeoutRef.current);
      }
      copyAllTimeoutRef.current = setTimeout(() => {
        setCopyAllFeedback(null);
      }, 2000);
    } catch (copyError) {
      const message = copyError instanceof Error ? copyError.message : "Failed to copy story";
      setError(message);
    }
  }, [collectStoryText]);

  const hasStarted = Boolean(storyData);
  const isRootExpanding = expandingNodes.has("root");

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-6 md:p-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="rounded-2xl bg-white p-6 shadow-lg">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-3 text-purple-700">
              <span className="text-3xl">🌳</span>
              <h1 className="text-3xl font-bold text-slate-800">
                Fractal Story Tree
              </h1>
              <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium">
                Narrative Explorer
              </span>
            </div>
            <p className="max-w-3xl text-sm text-slate-600 md:text-base">
              Expand any story idea into an infinite narrative tree using the classic
              Inicio → Nudo → Desenlace structure. Each sentence can grow into three more,
              revealing new twists and resolutions.
            </p>
            <button
              type="button"
              className="flex items-center gap-2 text-sm font-medium text-purple-600 transition-colors hover:text-purple-800"
              onClick={() => setShowStructureInfo((prev) => !prev)}
            >
              <span>{showStructureInfo ? "Hide" : "Show"} Fractal Structure</span>
              <span aria-hidden>▾</span>
            </button>
          </div>

          {showStructureInfo && (
            <section className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-6 shadow-inner md:grid-cols-3">
              <article className="rounded-lg bg-blue-100 p-4">
                <h4 className="text-lg font-semibold text-blue-900">INICIO</h4>
                <p className="mt-2 text-sm text-blue-800">
                  Presenta la situación inicial y establece el escenario de la historia.
                </p>
              </article>
              <article className="rounded-lg bg-orange-100 p-4">
                <h4 className="text-lg font-semibold text-orange-900">NUDO</h4>
                <p className="mt-2 text-sm text-orange-800">
                  Introduce el conflicto o problema que complica la situación inicial.
                </p>
              </article>
              <article className="rounded-lg bg-green-100 p-4">
                <h4 className="text-lg font-semibold text-green-900">DESENLACE</h4>
                <p className="mt-2 text-sm text-green-800">
                  Muestra cómo se resuelve o transforma la situación planteada.
                </p>
              </article>
              <div className="md:col-span-3">
                <div className="rounded-lg bg-white p-5 shadow-sm">
                  <h4 className="text-lg font-semibold text-slate-800">♾️ Estructura Fractal</h4>
                  <p className="mt-2 text-sm text-slate-700">
                    Cada oración se expande en <strong>Inicio → Nudo → Desenlace</strong>. Luego, cada
                    una de esas tres oraciones puede expandirse de nuevo, creando un árbol infinito de
                    posibilidades narrativas.
                  </p>
                </div>
              </div>
            </section>
          )}
        </header>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!hasStarted && (
          <section className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Choose a genre (optional):
                </label>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  value={genre}
                  onChange={(event) => setGenre(event.target.value)}
                >
                  {GENRES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Enter your story premise:
                </label>
                <textarea
                  className="h-28 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder="Un jardinero terrible gana el concurso de Chelsea por coincidencia"
                  value={storyInput}
                  onChange={(event) => setStoryInput(event.target.value)}
                />
              </div>

              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-700 disabled:bg-slate-400"
                onClick={startNewStory}
                disabled={!storyInput.trim() || isRootExpanding}
              >
                {isRootExpanding ? "Expanding your story…" : "Start Fractal Story Tree"}
              </button>
            </div>
          </section>
        )}

        {hasStarted && storyData && (
          <section className="flex flex-col gap-4">
            <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-white p-6 shadow-lg md:flex-row md:items-center">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">Your Fractal Story Tree</h2>
                <p className="text-sm text-slate-600">
                  Expand, regenerate, or copy any sentence to continue growing your narrative.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                  onClick={copyAllStory}
                >
                  <span>📋</span>
                  {copyAllFeedback ?? "Copy All Story"}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
                  onClick={resetStory}
                >
                  Start New Story
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <StoryNodeView
                node={storyData}
                depth={0}
                expandingNodes={expandingNodes}
                regeneratingNodes={regeneratingNodes}
                copiedNodeId={copiedNodeId}
                onToggle={toggleNode}
                onRegenerate={regenerateNode}
                onCopy={handleCopyNode}
              />
              <div className="mt-6 border-t border-slate-200 pt-4 text-sm text-slate-600">
                💡 Use <strong>Copy</strong> for individual sentences or <strong>Copy All Story</strong> for the complete tree structure.
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 text-sm text-slate-600 shadow-lg">
              <p>♾️ <strong>Fractal Structure:</strong> Each sentence expands into Inicio → Nudo → Desenlace.</p>
              <p className="mt-2">🔵 <span className="text-blue-600">INICIO</span> • 🟠 <span className="text-orange-600">NUDO</span> • 🟢 <span className="text-green-600">DESENLACE</span></p>
              <p className="mt-2">💡 <strong>Expand</strong> any sentence, <strong>Regenerate</strong> for alternatives, or <strong>Copy</strong> text to clipboard.</p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

interface StoryNodeViewProps {
  node: StoryNode;
  depth: number;
  expandingNodes: Set<string>;
  regeneratingNodes: Set<string>;
  copiedNodeId: string | null;
  onToggle: (nodeId: string) => Promise<void> | void;
  onRegenerate: (nodeId: string) => Promise<void> | void;
  onCopy: (nodeId: string) => Promise<void>;
}

function StoryNodeView({
  node,
  depth,
  expandingNodes,
  regeneratingNodes,
  copiedNodeId,
  onToggle,
  onRegenerate,
  onCopy,
}: StoryNodeViewProps) {
  const isExpanding = expandingNodes.has(node.id);
  const isRegenerating = regeneratingNodes.has(node.id);
  const hasChildren = node.children.length > 0;
  const canRegenerate = node.parentId !== null;
  const beatKey: BeatKey =
    node.beatIndex !== null ? BEATS[node.beatIndex].colorKey : "premise";
  const beatMeta = node.beatIndex !== null ? BEATS[node.beatIndex] : null;
  const styles = BEAT_STYLES[beatKey];

  return (
    <div className="space-y-3">
      <div className={`flex gap-3 rounded-xl p-4 transition ${styles.container}`}>
        <button
          type="button"
          className="h-8 w-8 rounded-md bg-white text-lg text-slate-600 shadow-sm transition hover:bg-slate-100"
          onClick={() => onToggle(node.id)}
          disabled={isExpanding}
          aria-label={hasChildren ? (node.isExpanded ? "Collapse" : "Expand") : "Generate expansions"}
        >
          {isExpanding ? "⏳" : hasChildren ? (node.isExpanded ? "▼" : "▶") : "➕"}
        </button>
        <div className="flex-1 space-y-2">
          <div>
            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${styles.badge}`}>
              {beatMeta?.label ?? "PREMISE"}
            </span>
            <p className="mt-1 text-xs italic text-slate-600">
              {beatMeta?.description ?? "Your initial story idea - ready to expand into Inicio-Nudo-Desenlace"}
            </p>
          </div>
          <p className={`text-sm leading-relaxed text-slate-800 ${depth === 0 ? "font-semibold text-slate-900" : ""}`}>
            {node.text}
          </p>
          <div className="flex flex-wrap gap-2">
            {!hasChildren && !isExpanding && (
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-blue-700"
                onClick={() => onToggle(node.id)}
              >
                <span>➕</span>
                Expand
              </button>
            )}
            {canRegenerate && (
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md bg-orange-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-orange-700 disabled:bg-orange-300"
                onClick={() => onRegenerate(node.id)}
                disabled={isRegenerating}
              >
                {isRegenerating ? "⏳ Regenerating…" : "🔄 Regenerate"}
              </button>
            )}
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700"
              onClick={() => onCopy(node.id)}
            >
              <span>📋</span>
              {copiedNodeId === node.id ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>
      {node.isExpanded && hasChildren && (
        <div className="space-y-3 border-l border-slate-200 pl-6">
          {node.children.map((child) => (
            <StoryNodeView
              key={child.id}
              node={child}
              depth={depth + 1}
              expandingNodes={expandingNodes}
              regeneratingNodes={regeneratingNodes}
              copiedNodeId={copiedNodeId}
              onToggle={onToggle}
              onRegenerate={onRegenerate}
              onCopy={onCopy}
            />
          ))}
        </div>
      )}
    </div>
  );
}
