const initiateCkeditor = (...args) => {
  return Array.from(args).map(editor_id => newEditor(editor_id));
}

const newEditor = (editor_id) => {
  const ck_editor = document.querySelector(editor_id);

  if (ck_editor === null || ck_editor.editor)
    return false;

  try {
    return ClassicEditor
      .create(ck_editor)
      .then(editor => {
        ck_editor.editor = editor;
        editor.plugins.get('FileRepository').createUploadAdapter = (loader) => new UploadAdapter(loader)
      })
      .catch(error => console.error(error));
  } catch (error) {
    console.log(error);
    console.log('Is ckeditor.js included?', 'https://ckeditor.com/ckeditor-5/download/');
  }
}

class UploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }

  upload () {
    return this.loader.file
      .then(file => new Promise((resolve, reject) => {
        this._initRequest();
        this._initListeners(resolve, reject, file);
        this._sendRequest(file);
      }));
  }

  abort () {
    if (this.xhr)
      this.xhr.abort();
  }

  _initRequest () {
    const xhr = this.xhr = new XMLHttpRequest();
    xhr.open('POST', '/ckeditor_wave/ck_images', true);
    xhr.responseType = 'json';
  }

  _initListeners (resolve, reject, file) {
    const xhr = this.xhr;
    const loader = this.loader;
    const genericErrorText = `Couldn't upload file: ${file.name}.`;

    xhr.addEventListener('error', () => reject(genericErrorText));
    xhr.addEventListener('abort', () => reject());
    xhr.addEventListener('load', () => {
      const response = xhr.response;

      if (! response || response.error)
        return reject(response && response.error ? response.error.message : genericErrorText);

      return resolve({ default: response.url });
    });

    // progress not being displayed currently
    if (xhr.upload) {
      xhr.upload.addEventListener('progress', evt => {
        if (evt.lengthComputable) {
          loader.uploadTotal = evt.total;
          loader.uploaded = evt.loaded;
        }
      });
    }
  }

  _sendRequest (file) {
    const data = new FormData();
    data.append('ck_image', file);
    this.xhr.send(data);
  }
}
