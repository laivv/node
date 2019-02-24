import React from 'react';
import Upload from './upload/Upload.js';
import Previewer from './previewer/Previewer.js';
export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fileList: [
                {
                    id:1,
                    name:'名称',
                    status:'success',
                    type:'image',
                    src:'http://v.51zxw.net/m/img/kcbm/705.jpg'
                }
            ],
            tokenUrl: []
        }
    }
    // static getDerivedStateFromProps(nextProps, prevState) {

    // }

    handleChange(files){
        console.log(files);
    }

    render() {
        return (
            <div>
                <Upload
                    fileList={this.state.fileList}
                    previewMode={false}
                    tokenUrl={this.state.tokenUrl}
                    onChange={files=>{this.handleChange(files)}}
                    maxFileCount={1}
                    maxFileSize={1}
                    acceptList={[]}
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