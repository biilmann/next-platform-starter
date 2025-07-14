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

export async function processNotionImages(notionBlocks: any[], title: string): Promise<{ [key: string]: string }> {
  const mediaMapping: { [key: string]: string } = {};
  for (const block of notionBlocks) {
    if (block.type === 'image' && block.image) {
      const imageData = block.image;
      let imageUrl: string | null = null;
      if (imageData.type === 'file' && imageData.file?.url) {
        imageUrl = imageData.file.url;
      } else if (imageData.type === 'external' && imageData.external?.url) {
        imageUrl = imageData.external.url;
      }
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
      let videoUrl: string | null = null;
      if (videoData.type === 'file' && videoData.file?.url) {
        videoUrl = videoData.file.url;
      } else if (videoData.type === 'external' && videoData.external?.url) {
        videoUrl = videoData.external.url;
      }
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
    const nameWithoutExt = filename.split('.').slice(0, -1).join('.');
    return nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').substring(0, 50) || 'media';
  } catch {
    return 'media';
  }
}

function getFileExtension(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const extension = pathname.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return `.${extension}`;
    }
    if (['mp4', 'mov', 'webm', 'avi', 'mkv', 'wmv', 'flv', 'ogv'].includes(extension || '')) {
      return `.${extension}`;
    }
    return '.png';
  } catch {
    return '.png';
  }
}

function getContentType(extension: string): string {
  const contentTypes: { [key: string]: string } = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.webm': 'video/webm',
    '.avi': 'video/x-msvideo', '.mkv': 'video/x-matroska', '.wmv': 'video/x-ms-wmv',
    '.flv': 'video/x-flv', '.ogv': 'video/ogg'
  };
  return contentTypes[extension.toLowerCase()] || 'image/png';
}

export function processMarkdownImages(markdown: string, mediaMapping: { [key: string]: string }): string {
  let processed = markdown;
  for (const [s3Url, localPath] of Object.entries(mediaMapping)) {
    const baseUrl = s3Url.split('?')[0];
    const pattern = new RegExp(s3Url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:\?[^\s)"\']*)?', 'g');
    const basePattern = new RegExp(baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:\?[^\s)"\']*)?', 'g');
    processed = processed.replace(pattern, localPath).replace(basePattern, localPath);
    console.log(`Replaced S3 URL: ${baseUrl} -> ${localPath}`);
  }
  return processed;
}