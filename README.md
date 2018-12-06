###  file upload for React
This is a lightweight React upload component

##### build
- development mode
```sh
npm run dev
```
- build component
```sh
npm run build
```

#### Useage
```javascript
import React ,{ Component } from 'react';
import UkUpload from './uk-upload';

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
                <UkUpload
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