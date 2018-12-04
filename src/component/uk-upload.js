import React from 'react';
import PropTypes from 'prop-types';
import './uk-upload.css';
import UploadFileList from './upload-file-list';
export default class UkUpload extends React.Component {
    static defaultProps = {
        url: 'http://up.qiniu.com',
        fileList: [],
        previewMode: false,
        multiple: true,
        tokenUrl: []
    }
    static propTypes = {
        url: PropTypes.string.isRequired,
        fileList: PropTypes.array.isRequired,
        previewMode: PropTypes.bool,
        tokenUrl: PropTypes.array,
        onChange: PropTypes.func,
        maxFileCount: PropTypes.number,
        maxFileSize: PropTypes.number,
        acceptList: PropTypes.array
    }
    constructor(props) {
        super(props);
        this.state = {
            fileList: props.fileList,
            supportView: !!FileReader
        }
    }
    // static getDerivedStateFromProps(nextProps, prevState) {
    //     if(nextProps.fileList != prevState.fileList){
    //         return {
    //             fileList:nextProps.fileList,
    //             previewMode:nextProps.previewMode,
    //             multiple:nextProps.multiple
    //         }
    //     }
    //     return null;
    // }
    createId = function () {
        let id = 0;
        return () => `${Date.now()}${++id}`;
    }()
    getExt(file) {
        return file.name.match(/\.(\w{1,4})$/)[1] || '';
    }
    openFileBrowser() {
        this.refs.file.click();
    }
    copyFileList() {
        return [...this.state.fileList].map(file => {
            return { ...file };
        })
    }
    getFileByFile(fileList, file) {
        return fileList.filter(rawFile => rawFile.id === file.id)[0] || null;
    }
    updateFile(file, options) {
        let fileList = this.copyFileList();
        file = this.getFileByFile(fileList, file)
        for (let attr in options) {
            file[attr] = options[attr];
        }
        this.updateFileList(fileList);
    }
    updateFileList(fileList) {
        this.setState({
            fileList
        })
        this.props.onChange && this.props.onChange(fileList);
    }
    handleStart(file) {
        if (this.state.supportView) {
            const reader = new FileReader()
            reader.readAsDataURL(file.rawFile);
            reader.onload = () => {
                this.updateFile(file, { src: reader.result })
            }
        }
    }
    handleFileChange() {
        let fileList = [].slice.call(this.refs.file.files, 0)
            .map(rawFile => {
                let file = {
                    id: this.createId(),
                    name: rawFile.name,
                    ext: this.getExt(rawFile),
                    rawFile: rawFile,
                    status: 'pending',
                    src: ''
                }
                this.handleStart(file);
                return file;
            }).concat(this.copyFileList());
        this.updateFileList(fileList);
    }
    getFileIndex(fileList, file) {
        for (let i = 0, len = fileList.length; i < len; i++) {
            let item = fileList[i];
            if (item.id === file.id) {
                return i;
            }
        }
        return -1;
    }
    removeFile(fileList, file) {
        let index = this.getFileIndex(fileList, file);
        if (index !== -1) {
            fileList.splice(index, 1);
        }
        return fileList;
    }
    handleFileRemove(file) {
        let fileList = this.copyFileList();
        this.removeFile(fileList, file);
        this.updateFileList(fileList);

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
                <UploadFileList
                    fileList={fileList}
                    onItemClick={file => { console.log(file) }}
                    onItemRemove={file => { this.handleFileRemove(file) }}
                >
                </UploadFileList>
            </div>
        )
    }
}
