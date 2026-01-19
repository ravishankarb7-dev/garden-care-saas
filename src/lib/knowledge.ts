import fs from 'fs/promises';
import path from 'path';

let cachedContent: string | null = null;
let lastModified: number = 0;

// Path to the User Guide in the Brain directory (or locally if copied)
// Note: In production, this file should be moved to 'src/data' or similar. 
// For now, we point to the artifact location or a local copy.
const GUIDE_PATH = path.join(process.cwd(), '.gemini/antigravity/brain/b58062f5-ee70-476a-a0bf-8dbec04be460/user_guide.md');
// Fallback to a local path if the absolute path is tricky in prod
const LOCAL_GUIDE_PATH = path.join(process.cwd(), 'src/data/user_guide.md');

export async function getKnowledgeBase(): Promise<string> {
    try {
        // Determine which file to check
        // Check local first for production stability
        let targetPath = LOCAL_GUIDE_PATH;

        // If local doesn't exist, try the absolute artifact path (Dev mode)
        try {
            await fs.access(targetPath);
        } catch {
            targetPath = GUIDE_PATH;
        }

        // 1. Check Stats (Lightweight)
        const stats = await fs.stat(targetPath);
        const mtime = stats.mtimeMs;

        // 2. Compare Time
        if (!cachedContent || mtime > lastModified) {
            console.log("[Knowledge] Cache Stale. Reading from disk...");
            cachedContent = await fs.readFile(targetPath, 'utf-8');
            lastModified = mtime;
        } else {
            console.log("[Knowledge] Cache Hit. Using memory.");
        }

        return cachedContent;
    } catch (error) {
        console.error("Failed to load knowledge base:", error);
        return "Standard 28-Day Stabilization Rules apply.";
    }
}
