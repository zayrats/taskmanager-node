﻿# taskmanager-node
# taskmanager-node
GPT
Berikut adalah contoh dokumentasi API yang terperinci untuk API Manajemen Tugas Anda, yang mencakup endpoint untuk operasi CRUD pada tugas, serta autentikasi dan validasi:

Task Management API Documentation
API ini memungkinkan pengguna untuk mengelola tugas-tugas (tasks) mereka melalui operasi CRUD (Create, Read, Update, Delete). API ini menggunakan autentikasi berbasis token (JWT) untuk memastikan keamanan data.

Base URL
Semua permintaan harus diarahkan ke base URL berikut:

arduino
Copy code
http://localhost:3000
Authentication
Semua endpoint memerlukan token autentikasi JWT yang harus disertakan dalam header Authorization setiap permintaan.

Format Header:

makefile
Copy code
Authorization: Bearer <your_access_token>
Endpoints
POST /api/tasks
Membuat tugas baru.

Request Headers:

Content-Type: application/json
Authorization: Bearer <your_access_token>
Request Body:

json
Copy code
{
  "title": "Your Task Title",
  "description": "Your Task Description",
  "dueDate": "YYYY-MM-DD"
}
Responses:

201 Created: Tugas berhasil dibuat. Mengembalikan ID tugas yang baru dibuat.
400 Bad Request: Kesalahan validasi data atau format JSON.
401 Unauthorized: Token JWT tidak valid atau tidak disertakan.
Example Response:

json
Copy code
{
  "message": "Task created",
  "taskId": 12
}
GET /api/tasks
Mengambil semua tugas yang terdaftar.

Request Headers:

Authorization: Bearer <your_access_token>
Responses:

200 OK: Berhasil mengambil daftar tugas.
401 Unauthorized: Token JWT tidak valid atau tidak disertakan.
Example Response:

json
Copy code
[
  {
    "id": 12,
    "title": "Project Meeting",
    "description": "Discuss project requirements",
    "dueDate": "2024-05-30"
  }
]
PUT /api/tasks/:id
Memperbarui tugas yang ada.

Request Headers:

Content-Type: application/json
Authorization: Bearer <your_access_token>
Request Body:

json
Copy code
{
  "title": "Updated Task Title",
  "description": "Updated Task Description",
  "dueDate": "YYYY-MM-DD"
}
Responses:

200 OK: Tugas berhasil diperbarui.
400 Bad Request: Kesalahan validasi data atau format JSON.
404 Not Found: Tugas tidak ditemukan atau ID tidak valid.
401 Unauthorized: Token JWT tidak valid atau tidak disertakan.
Example Response:

json
Copy code
{
  "message": "Task updated"
}
DELETE /api/tasks/:id
Menghapus tugas yang ada.

Request Headers:

Authorization: Bearer <your_access_token>
Responses:

204 No Content: Tugas berhasil dihapus.
404 Not Found: Tugas tidak ditemukan atau ID tidak valid.
401 Unauthorized: Token JWT tidak valid atau tidak disertakan.
