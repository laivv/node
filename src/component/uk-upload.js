import React from 'react';
import PropTypes from 'prop-types';
import './uk-upload.css';
import UploadFileList from './upload-file-list';
export default class UkUpload extends React.Component {
	static defaultProps = {
		url: 'http://up.qiniu.com',
		fileList: [],
		isOverMaxCount: false,
		previewMode: false,
		multiple: true,
		acceptList: [],
		tokenUrl: [],
	};
	static propTypes = {
		url: PropTypes.string.isRequired,
		fileList: PropTypes.array.isRequired,
		previewMode: PropTypes.bool,
		tokenUrl: PropTypes.array,
		onChange: PropTypes.func,
		maxFileCount: PropTypes.number,
		maxFileSize: PropTypes.number,
		acceptList: PropTypes.array.isRequired,
	};
	constructor(props) {
		super(props);
		this.state = {
			fileList: props.fileList,
			supportView: !!FileReader,
			isOverMaxCount: props.maxFileCount !== undefined && props.fileList.length >= props.maxFileCount,
		};
	}

	createId = (function() {
		let id = 0;
		return () => `${Date.now()}${++id}`;
	})();
	getExt(file) {
		return file.name.match(/\.(\w{1,4})$/)[1] || '';
	}
	openFileBrowser() {
		this.refs.file.click();
	}
	copyFileList() {
		return [...this.state.fileList].map(file => {
			return { ...file };
		});
	}
	getFileByFile(fileList, file) {
		return fileList.filter(rawFile => rawFile.id === file.id)[0] || null;
	}
	updateFile(file, options) {
		let fileList = this.copyFileList();
		file = this.getFileByFile(fileList, file);
		for (let attr in options) {
			file[attr] = options[attr];
		}
		this.updateFileList(fileList);
	}
	updateFileList(fileList) {
		this.setState({
			fileList,
		});
		this.props.onChange && this.props.onChange(fileList);
	}
	handleStart(file) {
		if (this.state.supportView) {
			const reader = new FileReader();
			reader.readAsDataURL(file.rawFile);
			reader.onload = () => {
				this.updateFile(file, { src: reader.result });
			};
		}
	}
	validateFile(file, fileList) {
		if (this.props.maxFileCount !== undefined && fileList.length >= this.props.maxFileCount) {
			return false;
		}
		if (this.props.maxFileSize !== undefined && file.size > this.props.maxFileSize) {
			return false;
		}
		if (this.props.acceptList.length && !this.props.acceptList.includes(file.ext)) {
			return false;
		}
		return true;
	}
	handleLengthChange(fileList) {
		const isOverMaxCount = this.props.maxFileCount !== undefined && fileList.length >= this.props.maxFileCount;
		if (this.state.isOverMaxCount !== isOverMaxCount) {
			this.setState({ isOverMaxCount });
		}
	}
	handleFileChange() {
		let fileList = this.copyFileList();
		const { length } = fileList;
		let addFileList = [].slice.call(this.refs.file.files, 0).map(rawFile => {
			return {
				id: this.createId(),
				name: rawFile.name,
				ext: this.getExt(rawFile),
				rawFile: rawFile,
				status: 'pending',
				progress: 0,
				src: '',
			};
		});
		for (let i = 0, len = addFileList.length; i < len; i++) {
			let file = addFileList[i];
			if (this.validateFile(file, fileList)) {
				this.handleStart(file);
				fileList.push(file);
			}
		}
		if (length !== fileList.length) {
			this.updateFileList(fileList);
			this.handleLengthChange(fileList);
		}
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
		this.handleLengthChange(fileList);
	}
	render() {
		let isMutiple = this.props.mutiple;
		let fileList = this.state.fileList;
		return (
			<div>
				{isMutiple ? (
					<input
						type="file"
						className="uk-upload-hidden"
						ref="file"
						onChange={() => {
							this.handleFileChange();
						}}
					/>
				) : (
					<input
						type="file"
						multiple="multiple"
						className="uk-upload-hidden"
						ref="file"
						onChange={() => {
							this.handleFileChange();
						}}
					/>
				)}

				<UploadFileList
					fileList={fileList}
					onItemClick={file => {
						console.log(file);
					}}
					onItemRemove={file => {
						this.handleFileRemove(file);
					}}
					readonly={false}
					showFileName={true}
					onAddClick={() => this.openFileBrowser()}
					allowUpload={!this.state.isOverMaxCount}
				/>
			</div>
		);
	}
}
