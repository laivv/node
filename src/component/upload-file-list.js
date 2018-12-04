import React from 'react';
import PropTypes from 'prop-types';
import './uk-upload.css';
export default class UploadFileList extends React.Component {
    static defaultProps = {
        fileList: [],
        readonly: false,
        disabledUpload: false
    }
    static propTypes = {
        fileList: PropTypes.array.isRequired,
        readonly: PropTypes.boolean.isRequired,
        disabledUpload: PropTypes.boolean.isRequired
    }
    render() {
        return (
            <div className="uk-upload-list uk-upload-clearfix">
                {
                    this.props.fileList.map(item => <div className="uk-upload-item">
                        <div className="uk-upload-item-main">
                            <div>
                                <img src={item.src} alt="" />
                            </div>
                            {item.name}
                        </div>
                    </div>)
                }
            </div>
        )
    }
}

