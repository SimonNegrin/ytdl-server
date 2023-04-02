import ytdl from 'ytdl-core'
import { createWriteStream } from 'node:fs'

const url = 'https://www.youtube.com/watch?v=9bZkp7q19f0'
const output = 'video.mp4'

const onData = (data) => {
  console.log(data)
}

ytdl(url, { dlChunkSize: 100 })
  .on('data', onData)
