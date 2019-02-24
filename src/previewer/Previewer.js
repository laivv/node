import React, { Component } from 'React';
import PropTypes from 'prop-types';
import './Previewer.css';
export default class Previewer extends Component {
    static defaultProps = {
        fileList: [],
        showFileName: false,
        index: 0,
    }
    static propTypes = {
        fileList: PropTypes.array,
        showFileName: PropTypes.bool,
        index: PropTypes.number,
        onClose: PropTypes.func,
        onSwitch: PropTypes.func,
        onFileDownload: PropTypes.func

    }
    constructor(props) {
        super(props);
        this.states = {};
        this.isMouseDown = false;
        this.srcX = 0;
        this.srcY = 0;
        this.offLeft = 0;
        this.offTop = 0;
        const data = this.getStateInfoByIndex(this.props.index);
        this.id = data.id;
        this.state = {
            index: this.props.index,
            file: data.file,
            src: data.src,
            type: data.type,
            status: 'pending',
            computedIndex: this.props.index,
            computedCount: this.props.fileList.filter(item => item.status === 'success').length,
            visible: false,
            left: '50%',
            top: '50%',
            transform: 'rotate(0deg) scale(1) translate(-50%,-50%)'
        }
        this.createStates();
    }
    componentDidMount() {
        this.init();
    }

    updateState(state) {
        return new Promise((resolve, reject) => {
            this.setState({
                ...state
            }, () => resolve());
        })
    }

    getStateInfoByIndex(index) {
        let file = this.props.fileList[index];
        if (file) {
            return {
                id: file.id,
                index,
                src: file.src,
                file,
                type: file.type,
            }
        }
        return {}
    }

    createStates() {
        this.props.fileList.forEach(file => {
            const { id } = file;
            if (this.states[id] === undefined) {
                this.states[id] = {
                    rotate: 0,
                    scale: 1,
                    x: '50%',
                    y: '50%',
                    status: 'pending',
                }
            }
        });
    }
    autoScale(image) {
        let { width: imageWidth, height: imageHeight } = image,
            { innerWidth: screenWidth, innerHeight: screenHeight } = window,
            height = imageHeight,
            width = imageWidth,
            state = this.states[this.id],
            n = 1;
        while (width >= screenWidth) {
            n -= 0.1;
            width = imageWidth * n;
            height = imageHeight * n;
        }
        while (height >= screenHeight) {
            n -= 0.1;
            height = imageHeight * n;
        }
        state.scale = n;
    }
    handleFileLoad(e, status, isImage) {
        let state = this.states[this.id];
        if (state) {
            state.status = status;
            if (status === 'success' && isImage) {
                this.autoScale(e.target);
            }
        }
        this.updateState({
            status
        })
    }
    handleImageDragStart(e) {
        e.preventDefault();
    }
    setLocationCenter() {
        this.updateState({
            left: '50%',
            top: '50%'
        });
    }
    rotate(n) {
        let state = this.states[this.id];
        state.rotate += n;
        if (state.rotate === 360) {
            state.rotate = 0;
        }
        const transform = `rotate(${state.rotate}deg) scale(${state.scale}) translate(-50%,-50%)`;
        this.updateState({
            transform
        })
    }
    scale(n, isNoScale) {
        let state = this.states[this.id];
        if (isNoScale) {
            state.scale = n;

        } else {
            state.scale += n;
            if (state.scale >= 6) {
                state.scale = 6;
            }
            if (state.scale <= 0.1) {
                state.scale = 0.1;
            }
        }

        const transform = `rotate(${state.rotate}deg) scale(${state.scale}) translate(-50%,-50%)`;
        this.updateState({
            transform
        });

    }
    mousedown(e) {
        this.srcX = e.clientX;
        this.srcY = e.clientY;
        let { imageBox } = this;
        this.offLeft = imageBox.offsetLeft;
        this.offTop = imageBox.offsetTop;
        this.isMouseDown = true;
    }
    mousemove(e) {
        if (this.isMouseDown) {
            let { clientX: curX, clientY: curY } = e,
                x = curX - this.srcX,
                y = curY - this.srcY;
            const left = this.offLeft + x + 'px';
            const top = this.offTop + y + 'px';
            this.updateState({
                left,
                top
            })
        }
    }
    resetFileLoadState(nextFile) {
        let state = this.states[this.id];
        if (nextFile.src === this.state.src) {
            let nextState = this.states[nextFile.id];
            nextState.status = state.status === 'success' ? 'success' : 'pending';
        }
        if (state.status !== 'success') {
            state.status = 'pending';
            this.updateState({
                status: 'pending'
            })
        }
    }
    getIndex(n) {
        let index = this.state.index + n,
            maxIndex = this.props.fileList.length - 1;
        if (index > maxIndex || index < 0) {
            return this.state.index;
        }
        while (index > 0 && index < maxIndex && this.props.fileList[index].status !== 'success') {
            index += n;
        }
        if (this.props.fileList[index].status === 'success') {
            return index;
        }
        return this.state.index;
    }
    swicthFile(n) {
        let index = this.getIndex(n);
        if (index !== this.index) {
            let file = this.props.fileList[index];
            this.props.onSwitch && this.props.onSwitch(index, file);
            this.resetFileLoadState(file);
            this.setCurrentIndex(index);
        }
    }
    prevFile() {
        this.swicthFile(-1);
    }
    nextFile() {
        this.swicthFile(1);
    }
    downLoad(e) {
        let next = true;
        if (this.props.onFileDownload) {
            next = this.props.onFileDownload(this.state.file);
            next = next === undefined ? true : next;
        }
        if (!next) {
            e.preventDefault();
        }
    }

    init() {
        document.addEventListener('mousewheel', e => {
            if (this.state.visible && this.state.type === 'image') {
                e.preventDefault();
                this.scale(e.deltaY > 0 ? -0.1 : 0.1);
            }
        });
        document.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });
    }
    open(index){
        this.setCurrentIndex(index);
        this.updateState({visible:true})
    }
    setCurrentIndex(n) {
        let index = n === undefined ? this.state.index : n,
            maxIndex = this.props.fileList.length ? this.props.fileList.length - 1 : 0;
        if (index > maxIndex) {
            index = maxIndex;
        }
        if (index < 0) {
            index = 0;
        }
        let file = this.props.fileList[index];
        if (file) {
            let state = {
                index,
                file,
                src: file.src,
                type: file.type,
                status: 'pending'
            }
            this.id = file.id;
            this.updateState(state);
        }
    }
    closePreviewer() {
        this.props.onClose && this.props.onClose();
        this.updateState({ visible: false })
    }
    render() {
        return (
            <div className="uk-previewer" style={{ display: this.state.visible ? 'block' : 'none' }}>
                {
                    this.props.fileList.length &&
                    <div>
                        {
                            ['image', 'video', 'audio', 'text'].includes(this.state.type) &&
                            <div>
                                {
                                    ['image', 'text'].includes(this.state.type) &&
                                    <div>
                                        {this.state.type === 'image' && this.state.visible &&
                                            <div className="uk-previewer-image-wrapper" style={{ transform: this.state.transform, left: this.state.left, top: this.state.top, display: this.state.status === 'success' ? 'block' : 'none' }}
                                                ref={ref => this.imageBox = ref} onMouseDown={e => this.mousedown(e)} onMouseMove={e => this.mousemove(e)}>
                                                <img className="uk-previewer-image" src={this.state.src} onLoad={e => this.handleFileLoad(e, 'success', true)}
                                                    onDragStart={e => this.handleImageDragStart(e)} onError={e => this.handleFileLoad(e, 'error', true)} />
                                            </div>
                                        }
                                        {this.state.type === 'text' && this.state.visible &&
                                            <div className="uk-previewer-center uk-previewer-text" style={{ display: this.state.status === 'success' ? 'block' : 'none' }}>
                                                {/* <uk-text-viewer src={fileSrc} onLoad={e => this.handleFileLoad(e, 'success', false)}
                                                    onError={e => this.handleFileLoad(e, 'error', false)}></uk-text-viewer> */}
                                            </div>
                                        }
                                        <div style={{ display: this.state.status === 'pending' ? 'block' : 'none' }} className="uk-previewer-loading">
                                            <i className="iconfont1 icon-loading"></i>
                                        </div>
                                        <div style={{ display: this.state.status === 'error' ? 'block' : 'none' }} className="uk-previewer-error uk-previewer-text-center">
                                            <div><i className="iconfont1 icon-tupianjiazaishibai03"></i></div>
                                            <div className="uk-previewer-warn-text">文件加载失败</div>
                                        </div>
                                    </div>
                                }
                                {['video', 'audio'].includes(this.state.type) && this.state.visible &&
                                    <div className="uk-previewer-center uk-previewer-video">
                                        {/* <uk-video-player src={fileSrc} type={fileType}></uk-video-player> */}
                                    </div>
                                }
                            </div>
                        }
                        {
                            !['image', 'video', 'audio', 'text'].includes(this.state.type) && <span className="uk-previewer-center uk-previewer-text-center uk-previewer-unsupport">
                                <div><i className="iconfont1 icon-expressionfailure"></i></div>
                                <div className="uk-previewer-warn-text">无法预览此文件</div>
                            </span>
                        }
                    </div>
                }
                {
                    !this.props.fileList.length && <span className="uk-previewer-center uk-previewer-text-center uk-previewer-unsupport">
                        <div className="uk-previewer-warn-text">没有可预览的文件</div>
                    </span>
                }
                <div className="uk-previewer-close-btn" onClick={() => this.closePreviewer()}>×</div>
                <div className="uk-previewer-prev-btn" onClick={() => this.prevFile()}>&lt;</div>
                <div className="uk-previewer-next-btn" onClick={() => this.nextFile()}>&gt;</div>
                <div className="uk-previewer-footer">
                    {
                        this.props.showFileName && <div className="uk-previewer-file-name">{this.state.file.name}</div>
                    }
                    <div className="uk-previewer-toolbar uk-previewer-clearfix">
                        <span className="uk-previewer-left uk-previewer-index"> {this.state.computedIndex}/{this.state.computedCount} </span>
                        <button className="uk-previewer-mini-hide" onClick={() => this.rotate(90)} title="旋转" disabled={this.state.type !==
                            'image' || !this.props.fileList.length}>
                            <i className="iconfont1 icon-xuanzhuan"></i>
                        </button>
                        <button className="uk-previewer-mini-hide" onClick={() => this.setLocationCenter()} title="居中"
                            disabled={this.state.type !== 'image' || !this.props.fileList.length}>
                            <i className="iconfont1 icon-juzhong"></i>
                        </button>
                        <button onClick={() => this.scale(1, true)} title="原始大小" disabled={this.state.type !== 'image' || !this.props.fileList.length}>
                            <i className="iconfont1 icon-yuanshidaxiao"></i>
                        </button>
                        <button onClick={() => this.scale(0.2)} title="放大" disabled={this.state.type !== 'image' || !this.props.fileList.length}>
                            <i className="iconfont1 icon-fangda"></i>
                        </button>
                        <button onClick={() => this.scale(-0.2)} title="缩小" disabled={this.state.type !== 'image' || !this.props.fileList.length}>
                            <i className="iconfont1 icon-suoxiao"></i>
                        </button>
                        <button onClick={() => this.prevFile()} title="上一个" disabled={!this.state.index || !this.props.fileList.length}>
                            <i className="iconfont1 icon-jiantou"></i>
                        </button>
                        <button onClick={() => this.nextFile()} title="下一个" disabled={this.state.index >= this.props.fileList.length - 1 ||
                            !this.props.fileList.length}>
                            <i className="iconfont1 icon-endarrow"></i>
                        </button>
                        {
                            this.props.fileList.length &&
                            <a onClick={e => this.downLoad(e)} href={this.state.src} download={this.state.file.name} target="_blank" title="下载"
                                className="uk-previewer-right"
                            >
                                <i className="iconfont1 icon-xiazai5"></i>
                            </a>
                        }
                    </div>
                </div>
            </div>
        )
    }
}