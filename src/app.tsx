import * as React from 'react';
import Upload from './upload/Upload';

interface State {
  fileList?:any[],
  tokenUrl:any[]
}

export default class App extends React.Component {

  state :State;

  constructor(props: any) {
    super(props);
    this.state = {
      fileList: [
        {
          id: 1,
          name: '名称',
          status: 'success',
          type: 'image',
          src: 'http://v.51zxw.net/m/img/kcbm/705.jpg'
        }
      ],
      tokenUrl: []
    }
  }
  // static getDerivedStateFromProps(nextProps, prevState) {

  // }

  handleChange(files:any) {
    console.log(files);
  }

  render() {
    return (
      <div>
        <Upload
          fileList={this.state.fileList}
          previewMode={false}
          tokenUrl={this.state.tokenUrl}
          onChange={(files:any) => { this.handleChange(files) }}
          maxFileCount={1}
          maxFileSize={1}
          acceptList={[]}
          showFileName={true}
          multiple={false}
          beforeFileAdd={(files:any) => true}
          onCountError={(files:any)  => console.log('文件数量超出', files)}
          onSizeError={(files:any)  => console.log('文件大小错误', files)}
          onTypeError={(files:any)  => console.log('文件类型错误', files)}
          onFileSuccess={(file:any)  => console.log('成功上传文件', file)}
          onFileError={(file:any)  => console.log('文件上传失败', file)}
          onUploadComplete={() => console.log('上传完成')}
        />
      </div>
    );

  }

}
