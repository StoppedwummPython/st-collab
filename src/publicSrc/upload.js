const { S3, PutObjectCommand } = require('@aws-sdk/client-s3');
const uuid = require("uuid")

const bucket = new S3({
  endpoint: "https://s3.sirv.com",
  credentials: {
    accessKeyId: "umber.secure@gmail.com", // Replace with your credentials (not recommended for production)
    secretAccessKey: "qR9gZzekAJbsDI69ViBWKgboiK1Sdkb2fSwBwJvXXHS0CC3W" // Replace with your credentials (not recommended for production)
  },
  region: "us-east-1"
});

/**
 * Opens a file selection dialog and uploads the selected file to S3.
 * @return {Promise<string>} A promise that resolves with the uploaded file name.
 */
module.exports =  () => {
  return new Promise((resolve, reject) => {
    try {
      // Create a file selection dialog using a modern approach (e.g., FileReader API)
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';  // Only allow image files

      /**
       * Uploads a file to S3.
       * @param {File} file The file to upload.
       * @return {Promise<void>} A promise that resolves when the upload is complete.
       */
      const uploadFile = async (file) => {
        try {
        if (!file) {
          console.error('No file selected.');
          return;
        }

        if (!file.name) {
          console.error('File name is null or undefined.');
          return;
        }

        if (!file.type) {
          console.error('File type is null or undefined.');
          return;
        }

        // Generate a unique file name using a UUID
        const fileName = `${uuid.v4()}_${file.name}`;
        const fileType = file.type;  // Get file type for potential content-type setting

        // Prepare upload parameters
        const params = {
          Bucket: 'stcollabcdn', // Replace with your bucket name
          Key: fileName,
          Body: file,
        };

        try {
          // Upload the file to S3 (using the provided bucket instance)
          const command = new PutObjectCommand(params);
          await bucket.send(command);
          console.log(`File "${fileName}" uploaded successfully to S3!`);
          resolve(fileName)
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      } catch (error) {
        alert("It looks like an error occured. Please go to s3.sirv.com to accept the certificate, if that doesn't help, report error to Stoppedwumm")
        console.error('Error uploading file:', error);
      }
      };

      // Add an event listener to the file input to upload the selected file
      fileInput.addEventListener('change', async (event) => {
        const selectedFile = event.target.files[0];
        await uploadFile(selectedFile);
      });

      // Trigger the file selection dialog (consider user experience enhancements)
      fileInput.click();
    } catch (error) {
      alert("It looks like an error occured. Please go to s3.sirv.com to accept the certificate, if that doesn't help, report error to Stoppedwumm")
      console.error('Error uploading file:', error);
    }
  })
};
