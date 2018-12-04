import React from 'react';
import PropTypes from 'prop-types';
import './upload-file-list.css';
export default class UploadFileList extends React.Component {
    static defaultProps = {
        fileList: [],
        readonly: false,
        disabledUpload: false
    }
    static propTypes = {
        fileList: PropTypes.array.isRequired,
        readonly: PropTypes.bool.isRequired,
        disabledUpload: PropTypes.bool.isRequired,
        onItemClick: PropTypes.func,
        onItemRemove: PropTypes.func
    }
    handleFileClick(item) {
        return () => {
            this.props.onItemClick && this.props.onItemClick(item)
        }
    }
    handleFileRemove(item) {
        return () => {
            this.props.onItemRemove && this.props.onItemRemove(item)
        }
    }
    render() {
        return (
            <div className="uk-upload-list uk-upload-clearfix">
                {
                    this.props.fileList.map(item => <div className="uk-upload-item" key={item.id}>
                        <div className="uk-upload-item-main">
                            <div className="uk-upload-match-parent" onClick={this.handleFileClick(item)}>
                                <img className="uk-upload-match-parent" src={item.src} alt="" />
                            </div>
                            <div className="uk-upload-item-remove" onClick={this.handleFileRemove(item)}>
                                ×
                            </div>
                            {item.name}
                        </div>
                    </div>)
                }
            </div>
        )
    }
}

