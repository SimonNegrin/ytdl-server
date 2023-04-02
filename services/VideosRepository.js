
export class VideosRepository {
  constructor(db) {
    this.db = db
  }

  getAllVideos() {
    return this.db.prepare("SELECT * FROM videos ORDER BY createdAt DESC").all()
  }

  checkVideoExists(id) {
    const video = this.db.prepare("SELECT id FROM videos WHERE id = ?").get(id)
    return Boolean(video)
  }

  createVideo(id, url) {
    const info = this.db
      .prepare("INSERT INTO videos (id, url) VALUES (?, ?)")
      .run(id, url)
    return info.changes === 1
  }

  setTitle(id, title) {
    const info = this.db
      .prepare("UPDATE videos SET title = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?")
      .run(title, id)
    return info.changes === 1
  }

  markAsEnded(id, success) {
    const info = this.db
      .prepare("UPDATE videos SET ended = ?, success = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?")
      .run(1, success ? 1 : 0, id)
    return info.changes === 1
  }
}
