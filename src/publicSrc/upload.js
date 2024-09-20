const bytescale = require("@bytescale/sdk")
const uuid = require("uuid")

/**
 * Opens a file selection dialog and uploads the selected file to S3.
 * @return {Promise<string>} A promise that resolves with the uploaded file name.
 */
module.exports = () => {
  return new Promise((resolve, reject) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';  // Only allow image

    const uploadManager = new bytescale.UploadManager({
      apiKey: "public_kW15cEC3sfYLFmDQCZcpvDWdes81" // This is your API key.
    })

    const onFileSelected = async event => {
      const file = event.target.files[0];
      file.name = `${uuid.v4()}.${file.name}`
      try {
        const { fileUrl, filePath } = await uploadManager.upload({ data: file });
        resolve(fileUrl)
      } catch (e) {
        alert(`Error:\n${e.message}`);
      }
    }
    fileInput.addEventListener('change', onFileSelected)

    fileInput.click();
  })
}
