#  React-upload
轻量级的react上传组件，支持图片预览，音频和视频播放

## build
- development mode
```sh
npm run dev
```
- build component
```sh
npm run build
```

## Usage
```javascript
import React ,{ Component } from 'react';
import Upload from './upload';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fileList: []
        }
    }

    render() {
        return (
            <div>
                <Upload
                    fileList={this.state.fileList}
                    previewMode={false}
                    tokenUrl={[]}
                    onChange={files=>console.log(files)}
                    maxFileCount={1}
                    maxFileSize={1}
                    acceptList={['gif']}
                    showFileName={true}
                    multiple={false}
                    beforeFileAdd={file=>!console.log('beforeFileAdd')}
                    onCountError={files=>console.log('文件数量超出',files)}
                    onSizeError={files=>console.log('文件大小错误',files)}
                    onTypeError={files=>console.log('文件类型错误',files)}
                    onFileSuccess={file=>console.log('成功上传文件',file)}
                    onFileError={file=>console.log('文件上传失败',file)}
                    onUploadComplete={()=>console.log('上传完成')}
                />
            </div>
        );
    }
}
```