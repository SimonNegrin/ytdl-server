import ytdl from "ytdl-core"
import { createWriteStream } from "node:fs"
import express from "express"
import { join } from "node:path"
import betterSqlite3 from "better-sqlite3"
import { VideosRepository } from '../services/VideosRepository.js'

export default async function serve() {
  const db = betterSqlite3(process.env.DATABASE_PATH)
  const app = express()

  db.pragma("journal_mode = WAL")
  const videosRepository = new VideosRepository(db)

  app.use(express.json())
  app.use(express.static(process.env.VIDEOS_DIR))

  app.post("/download", async (req, res) => {
    const { url: rawURL } = req.body
    const url = new URL(rawURL)
    const id = url.searchParams.get("v")

    if (!id) {
      res.status(400).send("Invalid URL")
      return
    }

    if (videosRepository.checkVideoExists(id)) {
      res.status(400).send("Video already exists")
      return
    }

    videosRepository.createVideo(id, rawURL)

    ytdl(rawURL)
      .on("info", (info) => {
        videosRepository.setTitle(id, info.videoDetails.title)
      })
      .on("error", (error) => {
        console.log(error)
        videosRepository.markAsEnded(id, false)
      })
      .on("end", () => {
        videosRepository.markAsEnded(id, true)
      })
      .pipe(createWriteStream(join(process.env.VIDEOS_DIR, `${id}.mp4`)))

    res.send("Download started")
  })

  app.get("/videos", async (req, res) => {
    const videos = videosRepository.getAllVideos()
    res.json(videos)
  })

  app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server is running on port ${process.env.SERVER_PORT}`)
  })

}
