import React from 'react';
import PropTypes from 'prop-types';
import './uk-upload.css';
export default class UkUpload extends React.Component {
    static defaultProps = {
        fileList: [],
        previewMode: false,
        multiple: true,
        tokenUrl: []
    }
    static propTypes = {
        fileList: PropTypes.array.isRequired,
        previewMode: PropTypes.boolean,
        tokenUrl: PropTypes.array
    }
    constructor(props) {
        super(props);
        this.state = {
            count: 0,
            fileList: [],
            supportView: !!FileReader
        }
    }
    createId = function () {
        let id = 0;
        return () => ++id;
    }()
    getExt(file) {
        return file.name.match(/\.(\w{1,4})$/)[1] || '';
    }
    openFileBrowser() {
        this.refs.file.click();
    }
    handleStart(file) {
        if (this.state.supportView) {
            const reader = new FileReader(file.rawFile)
            reader.readAsDataURL();
            reader.onload = () => {
                file.src = reader.result;
            }
        }
    }
    handleFileChange() {
        let fileList = [].slice.call(this.refs.file.files, 0);
        fileList = fileList.map(rawFile => {
            let file = {
                id: this.createId(),
                name: rawFile.name,
                ext: this.getExt(rawFile),
                rawFile: rawFile,
                status: 'pending',
                src: ''
            }
            return file;
        });
        this.setState({
            fileList
        });
    }
    render() {
        let isMutiple = this.props.mutiple;
        let fileList = this.state.fileList;
        return (
            <div>
                {isMutiple ?
                    (
                        <input type="file" className="uk-upload-hidden" ref="file" onChange={() => { this.handleFileChange() }} />
                    ) : (
                        <input type="file" multiple="multiple" className="uk-upload-hidden" ref="file" onChange={() => { this.handleFileChange() }} />
                    )
                }
                <button className="uk-upload-btn" onClick={() => this.openFileBrowser()}>上传文件</button>
                <div className="uk-upload-list uk-upload-clearfix">
                    {
                        fileList.map(item => <div className="uk-upload-item">
                            <div className="uk-upload-item-main">
                                <div>
                                    <img src={item.src} alt="" />
                                </div>
                                {item.name}
                            </div>
                        </div>)
                    }
                </div>
            </div>
        )
    }
}
