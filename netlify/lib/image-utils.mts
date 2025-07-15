import { getStore } from "@netlify/blobs";
import crypto from 'crypto';

export async function downloadAndSaveImage(mediaUrl: string, title: string): Promise<string> {
  try {
    console.log(`Downloading media file: ${mediaUrl}`);
    
    const originalFilename = extractFilenameFromUrl(mediaUrl);
    const extension = getFileExtension(mediaUrl);
    const hash = crypto.createHash('md5').update(mediaUrl + title).digest('hex').substring(0, 8);
    const filename = `${originalFilename}_${hash}${extension}`;
    
    const response = await fetch(mediaUrl);
    if (!response.ok) {
      throw new Error(`Failed to download media file: ${response.status} ${response.statusText}`);
    }
    
    const mediaBuffer = await response.arrayBuffer();
    const mediaStore = getStore("images");
    await mediaStore.set(filename, mediaBuffer, {
      metadata: { contentType: getContentType(extension), uploadedAt: new Date().toISOString() }
    });
    
    console.log(`Saved media file to blob store: ${filename}`);
    return `/article-images/${filename}`;
  } catch (error) {
    console.error(`Failed to download media file ${mediaUrl}:`, error);
    return mediaUrl;
  }
}

export async function processNotionImages(notionBlocks: any[], title: string): Promise<Record<string, string>> {
  const mediaMapping: Record<string, string> = {};
  for (const block of notionBlocks) {
    if (block.type === 'image' && block.image) {
      const imageData = block.image;
      const imageUrl = imageData.type === 'file' ? imageData.file?.url : imageData.external?.url;
      if (imageUrl) {
        console.log(`Found image in block: ${imageUrl}`);
        const edgePath = await downloadAndSaveImage(imageUrl, title);
        const baseUrl = imageUrl.split('?')[0];
        mediaMapping[baseUrl] = edgePath;
        console.log(`Mapped: ${baseUrl} -> ${edgePath}`);
      }
    }
    if (block.type === 'video' && block.video) {
      const videoData = block.video;
      const videoUrl = videoData.type === 'file' ? videoData.file?.url : videoData.external?.url;
      if (videoUrl) {
        console.log(`Found video in block: ${videoUrl}`);
        const edgePath = await downloadAndSaveImage(videoUrl, title);
        const baseUrl = videoUrl.split('?')[0];
        mediaMapping[baseUrl] = edgePath;
        console.log(`Mapped: ${baseUrl} -> ${edgePath}`);
      }
    }
  }
  return mediaMapping;
}

function extractFilenameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.split('/').pop() || 'media';
    return filename.split('.').slice(0, -1).join('.') || 'media';
  } catch {
    return 'media';
  }
}

function getFileExtension(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const ext = `.${pathname.split('.').pop()?.toLowerCase()}`;
    return ext;
  } catch {
    return '.png';
  }
}

function getContentType(extension: string): string {
  const types: Record<string, string> = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif',
    '.webp': 'image/webp', '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.webm': 'video/webm'
  };
  return types[extension] || 'image/png';
}

export function processMarkdownImages(markdown: string, mediaMapping: Record<string, string>): string {
  let processed = markdown;
  for (const [s3Url, localPath] of Object.entries(mediaMapping)) {
    const baseUrl = s3Url.split('?')[0];
    const pattern = new RegExp(baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:\?[^\s)"\']*)?', 'g');
    processed = processed.replace(pattern, localPath);
    console.log(`Replaced S3 URL: ${baseUrl} -> ${localPath}`);
  }
  return processed;
}