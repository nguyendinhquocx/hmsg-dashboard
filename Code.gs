// Danh sách thư mục ảnh (gallery)
const GALLERIES = [
  { name: "PHI", id: "16laL6gC-FQ9h_sluaqampRB9DucBJ67C" },
  { name: "PACKAGE", id: "1P4xeL2I2vOBVoKd-OsQ5zMjxt2ob3Mzr" }
];

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle("Biểu đồ từ Google Drive")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// Trả về danh sách gallery (tên + id)
function getGalleryList() {
  return GALLERIES.map(g => ({ name: g.name, id: g.id }));
}

// Lấy ảnh từ folderId truyền vào
function getImages(folderId) {
  if (!folderId) folderId = GALLERIES[0].id; // default: PHI
  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFiles();
  let arr = [];
  while (files.hasNext()) {
    const file = files.next();
    if (file.getMimeType().startsWith('image/')) {
      const blob = file.getBlob();
      const base64 = Utilities.base64Encode(blob.getBytes());
      const mimeType = blob.getContentType();
      const url = `data:${mimeType};base64,${base64}`;
      arr.push({
        name: file.getName(),
        url: url
      });
    }
  }
  arr.sort((a, b) => a.name.localeCompare(b.name, 'vi', { numeric: true }));
  return arr.map(item => item.url);
}