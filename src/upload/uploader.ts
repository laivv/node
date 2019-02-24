export default class Uploader {

  private xhr: XMLHttpRequest = null;
  private formData: FormData;
  private file: File;
  private url: string;
  private startCallback: (file: File) => void;
  private successCallback: (response: any, file: File) => void;
  private errorCallback: (file: File) => void;
  private progressCallback: (file: File, progress: number) => void;
  private isDone: boolean = false;
  private isCalled: boolean = false;
  private isSuccess: boolean = false;
  private dataType: string = null;

  constructor(url: string) {
    if (new.target !== Uploader) {
      return new Uploader(url);
    }
  }
  upload(options: any) {
    this.formData = new FormData();
    for (const key in options) {
      if (options.hasOwnProperty(key)) {
        const value: any = options[key];
        if (
          value !== undefined &&
          (value instanceof File || (value.rawFile && value.rawFile instanceof File))
        ) {
          this.file = value;
          this.formData.append(key, value instanceof File ? value : value.rawFile);
        } else {
          this.formData.append(key, value);
        }
      }
    }
    return this;
  }
  setDataType(type: string) {
    this.dataType = type
      .toString()
      .trim()
      .toLowerCase();
    return this;
  }
  start(fn: (file: File) => void) {
    const self = this;
    this.startCallback = fn;
    this.xhr = new XMLHttpRequest();
    this.xhr.onloadstart = () => {
      self.startCallback && self.startCallback(self.file);
    };
    this.xhr.onload = () => {
      self.isDone = true;
      if (self.xhr.status === 200 || self.xhr.status === 304) {
        self.isSuccess = true;
      } else {
        self.isSuccess = false;
      }
      let response: any = self.xhr.responseText;
      try {
        response = JSON.parse(response);
      } catch (e) {
        if (self.dataType === 'json') {
          self.isSuccess = false;
        }
      }
      if (self.isSuccess && self.successCallback) {
        self.successCallback(response, self.file);
        self.isCalled = true;
      }
      if (!self.isSuccess && self.errorCallback) {
        self.errorCallback(self.file);
        self.isCalled = true;
      }
    };
    this.xhr.onerror = () => {
      self.isDone = true;
      self.isSuccess = false;
      if (self.errorCallback) {
        self.errorCallback(self.file);
        self.isCalled = true;
      }
    };
    this.xhr.upload.onprogress = e => {
      if (self.progressCallback) {
        const progress: number = e.total ? (e.loaded / e.total) * 100 : 0;
        self.progressCallback(self.file, Math.floor(progress));
      }
    };
    setTimeout(() => {
      this.xhr.open('POST', this.url);
      this.xhr.send(this.formData);
    }, 0);
    return this;
  }
  progress(fn: (file: File, progress: number) => void) {
    this.progressCallback = fn;
    return this;
  }
  then(fn: (resopnse: any, file: File) => void) {
    this.successCallback = fn;
    if (this.isDone && !this.isCalled && this.isSuccess) {
      let response: any = this.xhr.responseText;
      try {
        response = JSON.parse(response);
      } catch (e) { }
      this.successCallback(response, this.file);
    }
    return this;
  }
  catch(fn: (file: File) => void) {
    this.errorCallback = fn;
    if (this.isDone && !this.isCalled && !this.isSuccess) {
      this.errorCallback(this.file);
    }
    return this;
  }
}
