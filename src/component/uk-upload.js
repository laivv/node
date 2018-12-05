import React from 'react';
import PropTypes from 'prop-types';
import './uk-upload.css';
import UploadFileList from './upload-file-list';
import Uploader from './Uploader';
export default class UkUpload extends React.Component {
	static defaultProps = {
		url: 'http://up.qiniu.com',
		fileList: [],
		previewMode: false,
		multiple: true,
		acceptList: [],
		tokenUrl: [],
	};
	static propTypes = {
		url: PropTypes.string.isRequired,
		fileList: PropTypes.array,
		multiple: PropTypes.bool,
		previewMode: PropTypes.bool,
		tokenUrl: PropTypes.array,
		onChange: PropTypes.func,
		maxFileCount: PropTypes.number,
		maxFileSize: PropTypes.number,
		acceptList: PropTypes.array,
		beforeFileAdd:PropTypes.func,
		onCountError:PropTypes.func,
		onTypeError:PropTypes.func,
		onSizeError:PropTypes.func,
		onFileSuccess:PropTypes.func,
	};
	constructor(props) {
		super(props);
		this.state = {
			isQiniu:/\.qiniu\./gi.test(this.props.url),
			tokens:{},
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
	isImage(file){
		return ['jpg','png','gif','bmp','webp','jpeg'].includes(file.ext);
	}
	handleStart(file) {
		if (this.state.supportView && this.isImage(file)) {
			const reader = new FileReader();
			reader.readAsDataURL(file.rawFile);
			reader.onload = () => {
				this.updateFile(file, { src: reader.result });
			};
		}
	}
	isError(file, fileList) {
		return this.isCountError(fileList) || this.isTypeError(file) || this.isSizeError(file);
	}
	isTypeError(file){
		if (this.props.acceptList.length && !this.props.acceptList.includes(file.ext)) {
			return true;
		}
		return false;
	}
	isSizeError(file){
		if (this.props.maxFileSize !== undefined && file.size > this.props.maxFileSize) {
			return true;
		}
		return false;
	}
	isCountError(fileList){
		if (this.props.maxFileCount !== undefined && fileList.length >= this.props.maxFileCount) {
			return true;
		}
		return false
	}
	createGuid(len, radix) {
		let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
		let uuid = [],
			i;
		radix = radix || chars.length;
		if (len) {
			for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)];
		} else {
			let r;
			uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
			uuid[14] = '4';
			for (i = 0; i < 36; i++) {
				if (!uuid[i]) {
					r = 0 | (Math.random() * 16);
					uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r];
				}
			}
		}
		return uuid.join('');
	}
	getKey(file) {
		let ext = file.ext ? '.' + file.ext : '';
		let key = (this.state.tokens.prefix ? this.state.tokens.prefix : 'A') + '.' + this.createGuid(8, 16) + ext;
		return key;
	}
	upload(file){
		let options = {file};
		if(this.state.isQiniu){
			options.key = this.getKey(file);
			options.token = this.state.token; 
		}else{
			Object.assign(options,this.state.tokens);
		}
		new Uploader(this.props.url)
		.upload(options)
		.setDataType('json')
		.start(file=>{
			//file.status = 'pending';
			this.updateFile(file,{status:'pending'});
		})
		.progress((file,progress)=>{
			//file.progress = progress;
			this.updateFile(file,{progress});
		})
		.then((file,response)=>{
			let src = undefined;
			if(this.props.onFileSuccess){
				let params = Object.keys(this.state.tokens).length ? this.state.tokens : undefined;
				src = this.props.onFileSuccess(file,response,params);
				if(file.src){
					this.updateFile(file,{src:file.src,status:'success'});
					return;
				}
				src = src === undefined ? (this.state.isQiniu ? this.state.tokens.domain + response.key : response) : src;
			}
			this.updateFile(file,{src,status:'success'})
			
		})
		.catch(file=>{
			//file.status = 'error';
			this.updateFile(file,{status:'error'})
		})
	}
	handleLengthChange(fileList) {
		const isOverMaxCount = this.props.maxFileCount !== undefined && fileList.length >= this.props.maxFileCount;
		if (this.state.isOverMaxCount !== isOverMaxCount) {
			this.setState({ isOverMaxCount });
		}
	}
	handleFileChange() {
		if(this.refs.file.value === ''){
			return;
		}
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
		this.refs.file.value = '';
		let countErrorFiles = [],
			typeErrorFiles = [],
			sizeErrorFiles = [];
		for (let i = 0, len = addFileList.length; i < len; i++) {
			let file = addFileList[i];
			if (!this.isError(file, fileList)) {
				let next = true;
				if(this.props.beforeFileAdd){
					next = this.props.beforeFileAdd(file);
					next = next === undefined ? true : next;
				}
				if(next){
					fileList.push(file);
					this.handleStart(file);
					this.upload(file);
				}
				
			}else{
				if(this.isCountError(fileList)){
					countErrorFiles.push(file);
				}
				else if(this.isTypeError(file)){
					typeErrorFiles.push(file);
				}else if(this.isSizeError(file)){
					sizeErrorFiles.push(file)
				}
			}
		}
		if (length !== fileList.length) {
			this.updateFileList(fileList);
			this.handleLengthChange(fileList);
		}
		this.props.onCountError && countErrorFiles.length && this.props.onCountError(countErrorFiles);
		this.props.onTypeError && typeErrorFiles.length && this.props.onTypeError(typeErrorFiles);
		this.props.onSizeError && sizeErrorFiles.length && this.props.onSizeError(sizeErrorFiles);

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
