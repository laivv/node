import React, { Component } from 'React';
import PropTypes from 'prop-types';
export default class Previewer extends Component {
    static defaultProps = {
        fileList: [],
        visible: false,
        showFileName: false,
        index: 0,
    }
    static propTypes = {
        fileList: PropTypes.array,
        visible: PropTypes.bool,
        showFileName: PropTypes.bool,
        index: PropTypes.number,
        onClose: PropTypes.func,
        onSwitch: PropTypes.func,
        onFileDownload: PropTypes.func

    }
    constructor(props) {
        super(props);
        this.fileState = {};
        this.isMouseDown = false;
        this.id ='';
        this.index = 0;
        this.left = '50%';
        this.top = '50%';
        this.srcX = 0;
        this.srcY = 0;
        this.offLeft = 0;
        this.offTop = 0;
        this.state = {
            file: '',
            src: '',
            type: 'image',
            status:'pending',
            computedIndex:0,
        }
    }

    updateState(state){
      return new Promise((resolve,reject)=>{
        this.setState({
            ...state
        },()=>resolve());
      })
    }

    createFileState() {
        this.props.fileList.forEach(file => {
            if (this.fileState[file.id] === undefined) {
                this.fileState[file.id] = {
                    rotate: 0,
                    scale: 1,
                    x: '50%',
                    y: '50%',
                    loadState: 'pending', 
                }
            }
        });
    }
    autoScale(image) {
        let { width: imageWidth, height: imageHeight } = image,
            { innerWidth: screenWidth, innerHeight: screenHeight } = window,
            height = imageHeight,
            width = imageWidth,
            state = this.fileState[this.fileId],
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
        let state = this.state.fileState[this.state.fileId];
        if (state) {
            state.loadState = status;
            if (status === 'success' && isImage) {
                this.autoScale(e.target);
            }
        }
    }
    handleImageDragStart(e) {
        e.preventDefault();
    }
    setLocationCenter() {
        this.left = this.top = '50%';
    }
    rotate(n) {
        let state = this.fileState[this.fileId];
        state.rotate += n;
        if (state.rotate === 360) {
            state.rotate = 0;
        }
    }
    scale(n, isNoScale) {
        let state = this.fileState[this.fileId];
        if (isNoScale) {
            state.scale = n;
            return;
        }
        state.scale += n;
        if (state.scale >= 6) {
            state.scale = 6;
        }
        if (state.scale <= 0.1) {
            state.scale = 0.1;
        }
    }
    mousedown(e) {
        this.srcX = e.clientX;
        this.srcY = e.clientY;
        let { imageBox } = this.$refs;
        this.offLeft = imageBox.offsetLeft;
        this.offTop = imageBox.offsetTop;
        this.isMouseDown = true;
    }
    mousemove(e) {
        if (this.isMouseDown) {
            let { clientX: curX, clientY: curY } = e,
                x = curX - this.srcX,
                y = curY - this.srcY;
            this.left = this.offLeft + x + 'px';
            this.top = this.offTop + y + 'px';
        }
    }
    resetFileLoadState(nextFile) {
        let state = this.fileState[this.fileId];
        if (nextFile.src === this.fileSrc) {
            let nextState = this.fileState[nextFile.fileId];
            nextState.loadState = state.loadState === 'success' ? 'success' : 'pending';
        }
        if (state.loadState !== 'success') {
            state.loadState = 'pending';
        }
    }
    getIndex(n) {
        let index = this.curIndex + n,
            maxIndex = this.fileList.length - 1;
        if (index > maxIndex || index < 0) {
            return this.curIndex;
        }
        while (index > 0 && index < maxIndex && this.fileList[index].status !== 'success') {
            index += n;
        }
        if (this.fileList[index].status === 'success') {
            return index;
        }
        return this.curIndex;
    }
    swicthFile(n) {
        let index = this.getIndex(n);
        if (index !== this.curIndex) {
            let file = this.fileList[index];
            this.onSwitch && this.onSwitch(index, file);
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
            next = this.props.onFileDownload(this.file);
            next = next === undefined ? true : next;
        }
        if (!next) {
            e.preventDefault();
        }
    }
    init() {
        this.$nextTick(() => {
            document.addEventListener('mousewheel', e => {
                if (this.visible && this.fileType === 'image') {
                    e.preventDefault();
                    this.scale(e.deltaY > 0 ? -0.2 : 0.2);
                }
            });
            document.addEventListener('mouseup', () => {
                this.isMouseDown = false;
            });
        });
    }
    setCurrentIndex(n) {
        let index = n === undefined ? this.index : n,
            maxIndex = this.fileList.length ? this.fileList.length - 1 : 0;
        if (index > maxIndex) {
            index = maxIndex;
        }
        if (index < 0) {
            index = 0;
        }
        let file = this.fileList[index];
        if (file) {
            this.file = file;
            this.curIndex = index;
            this.fileId = file.id;
            this.fileSrc = file.src;
            this.fileType = file.type;
            this.$emit('update:index', index);
        }
    }
    closePreviewer() {
        this.onClose && this.onClose();
        this.$emit('update:visible', false);
    }
    render() {
        return (
            <div className="uk-previewer" style={{ display: visible ? 'block' : 'none' }}>
                {
                    fileList.length &&
                    <div>
                        {
                            ['image', 'video', 'audio', 'text'].includes(fileType) &&
                            <div>
                                {
                                    ['image', 'text'].includes(fileType) &&
                                    <div>
                                        {fileType === 'image' && visible &&
                                            <div className="uk-previewer-image-wrapper" style={{ transform: transform, left: left, top: top, display: loadState === 'success' ? 'block' : 'none' }}
                                                ref="imageBox" onMousedown={e => this.mousedown(e)} onMousemove={e => this.mousemove(e)}>
                                                <img className="uk-previewer-image" src={fileSrc} onLoad={e => this.handleFileLoad(e, 'success', true)}
                                                    onDragstart={e => this.handleImageDragStart(e)} onError={e => this.handleFileLoad(e, 'error', true)} />
                                            </div>
                                        }
                                        {fileType === 'text' && visible &&
                                            <div className="uk-previewer-center uk-previewer-text" style={{ display: loadState === 'success' ? 'block' : 'none' }}>
                                                {/* <uk-text-viewer src={fileSrc} onLoad={e => this.handleFileLoad(e, 'success', false)}
                                                    onError={e => this.handleFileLoad(e, 'error', false)}></uk-text-viewer> */}
                                            </div>
                                        }
                                        <div style={{ display: loadState === 'pending' ? 'block' : 'none' }} className="uk-previewer-loading">
                                            <i className="iconfont1 icon-loading"></i>
                                        </div>
                                        <div style={{ display: loadState === 'error' ? 'block' : 'none' }} className="uk-previewer-error uk-previewer-text-center">
                                            <div><i className="iconfont1 icon-tupianjiazaishibai03"></i></div>
                                            <div className="uk-previewer-warn-text">文件加载失败</div>
                                        </div>
                                    </div>
                                }
                                {['video', 'audio'].includes(fileType) && visible &&
                                    <div className="uk-previewer-center uk-previewer-video">
                                        {/* <uk-video-player src={fileSrc} type={fileType}></uk-video-player> */}
                                    </div>
                                }
                            </div>
                        }
                        {
                            !['image', 'video', 'audio', 'text'].includes(fileType) && <span className="uk-previewer-center uk-previewer-text-center uk-previewer-unsupport">
                                <div><i className="iconfont1 icon-expressionfailure"></i></div>
                                <div className="uk-previewer-warn-text">无法预览此文件</div>
                            </span>
                        }
                    </div>
                }
                {
                    !fileList.length && <span className="uk-previewer-center uk-previewer-text-center uk-previewer-unsupport">
                        <div className="uk-previewer-warn-text">没有可预览的文件</div>
                    </span>
                }
                <div className="uk-previewer-close-btn" onClick={() => this.closePreviewer()}>×</div>
                <div className="uk-previewer-prev-btn" onClick={() => this.prevFile()}>&lt;</div>
                <div className="uk-previewer-next-btn" onClick={() => this.nextFile()}>&gt;</div>
                <div className="uk-previewer-footer">
                    {
                        showFileName && <div className="uk-previewer-file-name">{file.name}</div>
                    }
                    <div className="uk-previewer-toolbar uk-previewer-clearfix">
                        <span className="uk-previewer-left uk-previewer-index"> {computedIndex}/{computedCount} </span>
                        <button className="uk-previewer-mini-hide" onClick={() => this.rotate(90)} title="旋转" disabled={fileType !==
                            'image' || !fileList.length}>
                            <i className="iconfont1 icon-xuanzhuan"></i>
                        </button>
                        <button className="uk-previewer-mini-hide" onClick={() => this.setLocationCenter()} title="居中"
                            disabled={fileType !== 'image' || !fileList.length}>
                            <i className="iconfont1 icon-juzhong"></i>
                        </button>
                        <button onClick={() => this.scale(1, true)} title="原始大小" disabled={fileType !== 'image' || !fileList.length}>
                            <i className="iconfont1 icon-yuanshidaxiao"></i>
                        </button>
                        <button onClick={() => this.scale(0.2)} title="放大" disabled={fileType !== 'image' || !fileList.length}>
                            <i className="iconfont1 icon-fangda"></i>
                        </button>
                        <button onClick={() => this.scale(-0.2)} title="缩小" disabled={fileType !== 'image' || !fileList.length}>
                            <i className="iconfont1 icon-suoxiao"></i>
                        </button>
                        <button onClick={() => this.prevFile()} title="上一个" disabled={!curIndex || !fileList.length}>
                            <i className="iconfont1 icon-jiantou"></i>
                        </button>
                        <button onClick={() => this.nextFile()} title="下一个" disabled={curIndex >= fileList.length - 1 ||
                            !fileList.length}>
                            <i className="iconfont1 icon-endarrow"></i>
                        </button>
                        {
                            fileList.length &&
                            <a onClick={e => this.downLoad(e)} href={fileSrc} download={file.name} target="_blank" title="下载"
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