import React from 'react';
import UkUpload from './component/uk-upload.js';
export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fileList: [],
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
                <UkUpload
                    fileList={this.state.fileList}
                    previewMode={false}
                    tokenUrl={this.state.tokenUrl}
                    onChange={files=>{this.handleChange(files)}}
                />
            </div>
        );

    }

}