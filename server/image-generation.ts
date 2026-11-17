import type { Request, RequestHandler, Response } from "express";

const ASPECT_RATIOS = ["1:1", "3:4", "4:3", "9:16", "16:9"] as const;
const IMAGE_SIZES = ["1K", "2K", "4K"] as const;
const IMAGE_ENGINES = ["flux", "flux-realism", "flux-anime", "flux-3d", "turbo"] as const;
const MAX_PROMPT_LENGTH = 4000;
const MAX_POLLINATIONS_IMAGE_BYTES = 20 * 1024 * 1024;

type GeminiClient = {
  models: {
    generateContent: (options: Record<string, any>) => Promise<any>;
  };
};

type ImageGenerationDependencies = {
  getGeminiClient: () => GeminiClient | null;
  fetchPollinations?: typeof fetch;
  createSeed?: () => number;
};

type ImageRequestBody = {
  prompt?: unknown;
  style?: unknown;
  aspectRatio?: unknown;
  imageSize?: unknown;
  lighting?: unknown;
  cameraAngle?: unknown;
  engine?: unknown;
  strictAdherence?: unknown;
  detailLevel?: unknown;
  negativePrompt?: unknown;
  seed?: unknown;
  base64Image?: unknown;
  editInstruction?: unknown;
  characterReference?: unknown;
};

const dimensionsByAspectRatio: Record<(typeof ASPECT_RATIOS)[number], [number, number]> = {
  "1:1": [1024, 1024],
  "3:4": [768, 1024],
  "4:3": [1024, 768],
  "9:16": [720, 1280],
  "16:9": [1280, 720],
};

function invalidRequest(res: Response, message: string) {
  return res.status(400).json({ error: message });
}

function isOneOf<T extends readonly string[]>(value: unknown, options: T): value is T[number] {
  return typeof value === "string" && options.includes(value);
}

function parseSeed(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    return Number.NaN;
  }
  return value;
}

function imageError(res: Response) {
  return res.status(502).json({
    error: "Não foi possível gerar a imagem. O Gemini e o Pollinations não responderam corretamente. Verifique a conexão e tente novamente.",
  });
}

async function createPollinationsImage(
  fetchPollinations: typeof fetch,
  imageUrl: string,
): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);
  try {
    const response = await fetchPollinations(imageUrl, { signal: controller.signal });
    const contentType = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() || "";
    if (!response.ok || !contentType.startsWith("image/") || !response.body) {
      try {
        await response.body?.cancel();
      } catch {
        // The response cannot be used; report it through the fallback error.
      }
      return null;
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        totalBytes += value.byteLength;
        if (totalBytes > MAX_POLLINATIONS_IMAGE_BYTES) {
          await reader.cancel();
          return null;
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    if (totalBytes === 0) return null;

    const imageBytes = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
    return `data:${contentType};base64,${imageBytes.toString("base64")}`;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export function createImageGenerationHandler(
  dependencies: ImageGenerationDependencies,
): RequestHandler {
  const fetchPollinations = dependencies.fetchPollinations || fetch;
  const createSeed = dependencies.createSeed || (() => Math.floor(Math.random() * 9_999_999));

  return async (req: Request, res: Response) => {
    try {
      const body = (req.body && typeof req.body === "object" ? req.body : {}) as ImageRequestBody;
      const {
        prompt: rawPrompt,
        style: rawStyle = "Fotorealista 8K",
        aspectRatio = "16:9",
        imageSize = "1K",
        lighting: rawLighting = "Luz Volumétrica de Cinema",
        cameraAngle: rawCameraAngle = "Grande Angular 24mm",
        engine = "flux",
        strictAdherence = true,
        detailLevel = 90,
        negativePrompt: rawNegativePrompt = "blurry, low quality, bad anatomy, deformed, distorted, duplicate, watermark, text",
        seed: rawSeed,
        base64Image,
        editInstruction: rawEditInstruction,
        characterReference: rawCharacterReference,
      } = body;

      if (typeof rawPrompt !== "string" || !rawPrompt.trim()) {
        return invalidRequest(res, "Descreva a imagem que deseja gerar antes de continuar.");
      }
      const prompt = rawPrompt.trim();
      if (prompt.length > MAX_PROMPT_LENGTH) {
        return invalidRequest(res, `A descrição deve ter no máximo ${MAX_PROMPT_LENGTH} caracteres.`);
      }
      if (!isOneOf(aspectRatio, ASPECT_RATIOS)) {
        return invalidRequest(res, "Proporção inválida. Escolha uma das opções disponíveis e tente novamente.");
      }
      if (!isOneOf(imageSize, IMAGE_SIZES)) {
        return invalidRequest(res, "Tamanho inválido. Escolha 1K, 2K ou 4K e tente novamente.");
      }
      if (!isOneOf(engine, IMAGE_ENGINES)) {
        return invalidRequest(res, "Motor de imagem inválido. Selecione um motor disponível e tente novamente.");
      }
      const parsedSeed = parseSeed(rawSeed);
      if (Number.isNaN(parsedSeed)) {
        return invalidRequest(res, "A semente deve ser um número inteiro igual ou maior que zero.");
      }

      const optionalTextFields = [
        ["estilo", rawStyle],
        ["iluminação", rawLighting],
        ["ângulo da câmera", rawCameraAngle],
        ["prompt negativo", rawNegativePrompt],
        ["instrução de edição", rawEditInstruction],
        ["referência de personagem", rawCharacterReference],
      ] as const;
      for (const [label, value] of optionalTextFields) {
        if (value !== undefined && value !== null && typeof value !== "string") {
          return invalidRequest(res, `O campo ${label} deve ser um texto.`);
        }
      }

      const style = typeof rawStyle === "string" ? rawStyle : "Fotorealista 8K";
      const lighting = typeof rawLighting === "string" ? rawLighting : "Luz Volumétrica de Cinema";
      const cameraAngle = typeof rawCameraAngle === "string" ? rawCameraAngle : "Grande Angular 24mm";
      const negativePrompt = typeof rawNegativePrompt === "string" ? rawNegativePrompt : "";
      const editInstruction = typeof rawEditInstruction === "string" ? rawEditInstruction.trim() : "";
      const characterReference = typeof rawCharacterReference === "string" ? rawCharacterReference.trim() : "";
      const userPrompt = editInstruction
        ? `${editInstruction} (baseado em: ${prompt || "imagem"})`
        : prompt;
      if (userPrompt.length > MAX_PROMPT_LENGTH) {
        return invalidRequest(res, `A descrição completa deve ter no máximo ${MAX_PROMPT_LENGTH} caracteres.`);
      }
      const [width, height] = dimensionsByAspectRatio[aspectRatio];
      const chosenSeed = parsedSeed ?? createSeed();

      const characterDescriptor = characterReference
        ? `known character reference "${characterReference}"; preserve canonical face, hairstyle, costume, colors, accessories and silhouette`
        : "no specific known character reference";

      let translatedEnglishPrompt = userPrompt;
      const ai = dependencies.getGeminiClient();
      if (ai) {
        const translationModels = ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.7-flash"];
        for (const model of translationModels) {
          try {
            const translation = await ai.models.generateContent({
              model,
              contents: `You are an expert prompt engineer and literal translator for text-to-image AI models (FLUX.1 Dev, Midjourney v6, SDXL).
The user gave this prompt in Portuguese or another language: "${userPrompt}"
Selected style: "${style}"
Selected lighting: "${lighting}"
Selected camera/angle: "${cameraAngle}"
Character reference: "${characterReference || "None"}"

Translate this request into an ultra-precise English prompt that strictly follows every requested subject, detail, action, count, color and condition. Preserve any named character's canonical visual identity. Output only the final English prompt text.`,
            });
            if (typeof translation.text === "string" && translation.text.trim().length > 5) {
              translatedEnglishPrompt = translation.text.trim().replace(/^"|"$/g, "");
              break;
            }
          } catch (error) {
            console.warn("[Image Generation] Gemini prompt translation failed:", error);
          }
        }
      }

      if (translatedEnglishPrompt === userPrompt) {
        translatedEnglishPrompt = `${userPrompt}, ${style}, ${lighting}, ${cameraAngle}, sharp focus, intricate textures, masterpiece, high fidelity 8k`;
      }

      const detailDescriptor = Number(detailLevel) >= 85
        ? "ultra-detailed textures, micro-details, sharp focus, high fidelity"
        : Number(detailLevel) >= 60
          ? "detailed textures, balanced sharpness, clean composition"
          : "clean shapes, simple textures, clear subject";
      const adherenceDescriptor = strictAdherence === false
        ? "allow tasteful creative interpretation while preserving the main subject"
        : "strictly follow every requested subject, count, color, action and composition detail";
      const avoidDescriptor = negativePrompt.trim() ? `avoid: ${negativePrompt.trim()}` : "";
      const finalPromptForEngine = [
        translatedEnglishPrompt,
        style,
        lighting,
        cameraAngle,
        characterDescriptor,
        detailDescriptor,
        adherenceDescriptor,
        avoidDescriptor,
        "8k UHD",
      ].filter(Boolean).join(", ");
      const encodedPrompt = encodeURIComponent(finalPromptForEngine);

      let modelParam: (typeof IMAGE_ENGINES)[number] = "flux";
      if (engine !== "flux") modelParam = engine;
      const generatedImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${chosenSeed}&model=${modelParam}&nologo=true&enhance=false`;

      if (ai) {
        const imageModels = ["gemini-3.1-flash-lite-image", "gemini-3.1-flash-image"];
        for (const model of imageModels) {
          try {
            const parts: any[] = [];
            if (typeof base64Image === "string" && base64Image) {
              const match = base64Image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
              if (match) {
                parts.push({ inlineData: { data: match[2], mimeType: match[1] } });
              }
            }
            parts.push({
              text: `Create a visual that follows this complete specification exactly: ${finalPromptForEngine}. Preserve every requested subject, count, color, action and composition detail.`,
            });
            const imageResponse = await ai.models.generateContent({
              model,
              contents: { parts },
              config: {
                imageConfig: {
                  aspectRatio,
                  imageSize,
                },
              },
            });
            const candidateParts = imageResponse.candidates?.[0]?.content?.parts || [];
            for (const part of candidateParts) {
              const inlineData = part.inlineData;
              if (
                typeof inlineData?.data === "string" &&
                /^image\/[a-zA-Z0-9.+-]+$/.test(inlineData.mimeType || "image/png")
              ) {
                const mime = inlineData.mimeType || "image/png";
                return res.json({
                  success: true,
                  source: "gemini-image-engine",
                  model,
                  imageUrl: `data:${mime};base64,${inlineData.data}`,
                  prompt: userPrompt,
                  translatedPrompt: translatedEnglishPrompt,
                  style,
                  aspectRatio,
                  imageSize,
                  seed: chosenSeed,
                });
              }
            }
          } catch (error) {
            console.warn(`[Image Generation] Gemini image model ${model} failed; trying fallback:`, error);
          }
        }
      }

      const pollinationsImage = await createPollinationsImage(fetchPollinations, generatedImageUrl);
      if (!pollinationsImage) return imageError(res);

      return res.json({
        success: true,
        source: `apolo-${modelParam}-engine`,
        imageUrl: pollinationsImage,
        prompt: userPrompt,
        translatedPrompt: translatedEnglishPrompt,
        style,
        aspectRatio,
        imageSize,
        seed: chosenSeed,
        message: "Imagem gerada pelo Pollinations após o Gemini não disponibilizar uma imagem.",
      });
    } catch (error) {
      console.error("[Image Generation] Unexpected error:", error);
      return res.status(500).json({
        error: "Ocorreu um erro inesperado ao preparar a imagem. Revise os parâmetros e tente novamente.",
      });
    }
  };
}
