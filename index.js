import ytdl from 'ytdl-core'
import { createWriteStream } from 'node:fs'
import express from 'express'
import { join } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

config()

const prisma = new PrismaClient()
const app = express()

app.use(express.json())
app.use(express.static(process.env.VIDEOS_DIR))

app.post('/download', async (req, res) => {
  const { url: rawURL } = req.body
  const url = new URL(rawURL)
  const id = url.searchParams.get('v')

  if (!id) {
    res.status(400).send('Invalid URL')
    return
  }

  const video = await prisma.video.findUnique({
    where: { id }
  })

  if (video) {
    res.status(400).send('Video already exists')
    return
  }

  await prisma.video.create({
    data: {
      id,
      url: rawURL,
    },
  })

  ytdl(rawURL)
    .on('info', async (info) => {
      await setTitle(id, info.videoDetails.title)
    })
    .on('error', async (error) => {
      console.log(error)
      await markAsEnded(id, false)
    })
    .on('end', async () => {
      await markAsEnded(id, true)
    })
    .pipe(createWriteStream(join(process.env.VIDEOS_DIR, `${id}.mp4`)))
  
  res.send('Download started')
})

app.get('/videos', async (req, res) => {
  const videos = await prisma.video.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })
  res.json(videos)
})

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Server is running on port ${process.env.SERVER_PORT}`)
})

async function setTitle(id, title) {
  await prisma.video.update({
    where: { id },
    data: { title },
  })
}

async function markAsEnded(id, success) {
  await prisma.video.update({
    where: { id },
    data: {
      ended: true,
      success,
    },
  })
}
