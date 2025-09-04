import { Storage } from '@google-cloud/storage'

let storage: Storage | null = null

function getStorage(): Storage {
  if (!storage) {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID
    const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS
    
    if (!projectId) {
      throw new Error('GOOGLE_CLOUD_PROJECT_ID environment variable is required')
    }
    
    storage = new Storage({
      projectId,
      keyFilename: keyFilename || undefined,
    })
  }
  
  return storage
}

export function getBucket() {
  const bucketName = process.env.GCS_BUCKET_NAME
  
  if (!bucketName) {
    throw new Error('GCS_BUCKET_NAME environment variable is required')
  }
  
  return getStorage().bucket(bucketName)
}

export async function uploadFile(
  fileName: string,
  buffer: Buffer,
  contentType: string,
  folder: string = 'uploads'
): Promise<string> {
  const bucket = getBucket()
  const file = bucket.file(`${folder}/${fileName}`)
  
  const stream = file.createWriteStream({
    metadata: {
      contentType,
      cacheControl: 'public, max-age=31536000',
    },
    resumable: false,
  })
  
  return new Promise((resolve, reject) => {
    stream.on('error', (error) => {
      reject(error)
    })
    
    stream.on('finish', () => {
      file.makePublic().then(() => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${folder}/${fileName}`
        resolve(publicUrl)
      }).catch(reject)
    })
    
    stream.end(buffer)
  })
}

export async function deleteFile(fileName: string, folder: string = 'uploads'): Promise<void> {
  const bucket = getBucket()
  const file = bucket.file(`${folder}/${fileName}`)
  
  try {
    await file.delete()
  } catch (error) {
    if ((error as { code?: number }).code !== 404) {
      throw error
    }
  }
}

export async function readJsonFile<T = unknown>(fileName: string): Promise<T | null> {
  const bucket = getBucket()
  const file = bucket.file(fileName)
  
  try {
    const [exists] = await file.exists()
    if (!exists) {
      return null
    }
    
    const [contents] = await file.download()
    return JSON.parse(contents.toString('utf-8')) as T
  } catch (error) {
    console.error(`Error reading ${fileName} from GCS:`, error)
    return null
  }
}

export async function writeJsonFile<T = unknown>(fileName: string, data: T): Promise<void> {
  const bucket = getBucket()
  const file = bucket.file(fileName)
  
  const stream = file.createWriteStream({
    metadata: {
      contentType: 'application/json',
    },
    resumable: false,
  })
  
  return new Promise((resolve, reject) => {
    stream.on('error', reject)
    stream.on('finish', resolve)
    stream.end(JSON.stringify(data, null, 2))
  })
}

export async function listFiles(prefix: string): Promise<string[]> {
  const bucket = getBucket()
  const [files] = await bucket.getFiles({ prefix })
  return files.map(file => file.name)
}