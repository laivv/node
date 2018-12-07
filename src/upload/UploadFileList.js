import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './UploadFileList.css';
export default class UploadFileList extends Component {
	static defaultProps = {
		fileList: [],
		readonly: false,
		showFileName: false,
	};
	static propTypes = {
		fileList: PropTypes.array.isRequired,
		readonly: PropTypes.bool.isRequired,
		showFileName: PropTypes.bool.isRequired,
		allowUpload: PropTypes.bool.isRequired,
		onItemClick: PropTypes.func,
		onItemRemove: PropTypes.func,
		onAddClick: PropTypes.func,
		onRetryClick: PropTypes.func,
	};
	constructor(props) {
		super(props);
		// this.state = {
		// 	allowUpload: props.allowUpload,
		// };
	}
	// static getDerivedStateFromProps(props, state) {
	// 	if (props.allowUpload !== state.allowUpload) {
	// 		return {
	// 			allowUpload: props.allowUpload,
	// 		};
	// 	}
	// 	return null;
	// }
	handleFileClick(item) {
		return () => {
			this.props.onItemClick && this.props.onItemClick(item);
		};
	}
	handleFileRemove(item) {
		return () => {
			this.props.onItemRemove && this.props.onItemRemove(item);
		};
	}
	handleAddClick() {
		this.props.onAddClick && this.props.onAddClick();
	}
	handRetryClick(file) {
		return () => {
			this.props.onRetryClick && this.props.onRetryClick(file);
		}
	}
	render() {
		return (
			<div className="uk-upload-list uk-upload-clearfix">
				{this.props.fileList.map(item => (
					<div className="uk-upload-item" key={item.id} data-id={`guid-${item.id}`}>
						<div className="uk-upload-fill-parent uk-upload-item-inner">
							<div className="uk-upload-match-parent" onClick={this.handleFileClick(item)}>
								<div className="uk-upload-match-parent uk-upload-image">
									{item.type === 'image' &&
										<img className="uk-upload-max-parent uk-upload-center" src={item.src} alt="" />
									}
									{
										item.type !== 'image' &&
										<div className="uk-upload-match-parent">
											<span
												className={`iconfont0 uk-upload-center ${item.type === 'text' ? 'icon-wenbenwenjian' : ''} ${item.type === 'file' ? 'icon-file' : ''} ${item.type === 'audio' ? 'icon--file-music' : ''} ${item.type === 'video' ? 'icon-filevideo' : ''} ${item.type === 'rar' ? 'icon-filezip' : ''}`}
											>
											</span>
										</div>
									}
								</div>
								{item.status !== 'success' &&
									<div className="uk-upload-fill-parent uk-upload-mask">
										{['waiting', 'pending'].includes(item.status) &&

											<span className="uk-upload-center uk-upload-progress">{item.progress}%</span>
										}
										{
											item.status === 'error' && (
												<div className="uk-upload-match-parent uk-upload-error-mask">
													<span className="uk-upload-center uk-upload-error">
														<i className="iconfont0 icon-error"></i>
													</span>
													<span className="uk-upload-center uk-upload-retry" onClick={this.handRetryClick(item)}>
														<i className="iconfont0 icon-iconziti38"></i>
													</span></div>)
										}
									</div>
								}
								{!this.props.readonly && (
									<div className="uk-upload-item-remove" onClick={this.handleFileRemove(item)}>
										×
									</div>
								)}
								{this.props.showFileName && (
									<div className="uk-upload-name" title={item.name}>
										{item.name}
									</div>
								)}
							</div>
						</div>
					</div>
				))}
				{this.props.allowUpload && !this.props.readonly && (
					<div className="uk-upload-item">
						<div className="uk-upload-fill-parent uk-upload-item-inner">
							<div
								className="uk-upload-match-parent uk-upload-add-btn"
								onClick={() => this.handleAddClick()}
							>
								<div className="uk-upload-add-icon">+</div>
							</div>
						</div>
					</div>
				)}
			</div>
		);
	}
}
