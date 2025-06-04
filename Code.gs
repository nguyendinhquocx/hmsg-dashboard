const FOLDER_ID = '16laL6gC-FQ9h_sluaqampRB9DucBJ67C';

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle("Biểu đồ từ Google Drive")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Hàm include cho phép import file HTML phụ
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getImages() {
  const folder = DriveApp.getFolderById(FOLDER_ID);
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
  // Sắp xếp theo tên file (tăng dần)
  arr.sort((a, b) => a.name.localeCompare(b.name, 'vi', { numeric: true }));
  // Trả về mảng chỉ chứa url
  return arr.map(item => item.url);
}