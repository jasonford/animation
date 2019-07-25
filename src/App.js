import React from 'react';
import './App.css';
import styled from 'styled-components';
import Webcam from 'react-webcam';
import GIF from 'gif.js.optimized';
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import saveBlob from './saveBlob';

const savedFrames = []
let frameNum = 0;
let nextFrame = localStorage.getItem(`frame${frameNum}`);

while (nextFrame) {
  savedFrames.push(nextFrame);
  frameNum += 1;
  nextFrame = localStorage.getItem(`frame${frameNum}`)
}

class App extends React.Component {

  state = {
    currentFrame: 0,
    frames: savedFrames,
    frameDelay: 125
  }

  componentWillMount = () => {
    this.trashRef = React.createRef();
  }

  updateCurrentFrame = (currentFrame) => {
    this.setState({currentFrame});
  }

  addFrame = (frame) => {
    const frames = [...this.state.frames, frame];
    window.localStorage.setItem(`frame${frames.length-1}`, frame);
    this.setState({ frames });
  }

  clear = () => {
    localStorage.clear();
    this.setState({frames:[]})
  }

  downloadGif = () => {
    const gif = new GIF({
      workers: 2,
      quality: 10
    });
    this.state.frames.forEach(frame => {
      const img = document.createElement('img');
      img.src = frame;
      gif.addFrame(img, {delay: this.state.frameDelay});
    });
    gif.on('finished', blob => saveBlob(blob, 'animation.gif'));
    gif.render();
  }

  saveLocally = () => {
    localStorage.clear()
    this.state.frames.forEach( (frame, index) => {
      localStorage.setItem(`frame${index}`, frame);
    });
  }

  onSortEnd = ({newIndex, oldIndex}, e) => {
    if (e.path.includes(this.trashRef.current)) {
      this.state.frames.splice(oldIndex, 1)
    }
    else {
      this.state.frames.splice(newIndex, 0, this.state.frames.splice(oldIndex, 1)[0]);
    }
    this.setState(
      {
        frames: [...this.state.frames],
        sorting: false
      },
      this.saveLocally
    );
  }

  render = () => {
    return (
      <AppContainer>
        <div style={{position:'relative', height:'75vh', background: 'black'}}>
          <Camera
            frameDelay={this.state.frameDelay}
            frames={this.state.frames}
            currentFrame={this.state.currentFrame}
            addFrame={this.addFrame}
            videoStream={this.state.videoStream}
          />
          <div style={{position: 'absolute', bottom:0, right:0}}>
            <button onClick={this.downloadGif}>download</button>
            <button onClick={this.clear}>clear</button>
            {this.state.sorting && <i className="material-icons" ref={this.trashRef} style={{color:'red'}}>delete</i>}
          </div>
        </div>
        <Frames
          frames={this.state.frames} axis="x"
          onSortEnd={this.onSortEnd}
          onSortStart={()=>this.setState({sorting:true})}
          distance={ 2 }
        />
      </AppContainer>
    );
  }

}

class Camera extends React.Component {

  state = {
    mode: 'capture'
  }

  constructor(props) {
    super(props);
    this.webcamRef = React.createRef();
  }

  capture = () => {
    this.props.addFrame(this.webcamRef.current.getScreenshot());
  }

  play = () => {
    let playFrame = this.state.playFrame || 0;
    this.setState({mode: 'play', playFrame});
    this.playInterval = setInterval(() => {
      playFrame += 1;
      if (this.props.frames[playFrame] === undefined) {
        playFrame = 0;
      }
      this.setState({ playFrame });
    }, this.props.frameDelay);
  }

  stop = () => {
    clearInterval(this.playInterval);
    this.setState({mode: 'capture'});
  }

  render = () => {
    return this.state.mode === 'capture' ? this.renderCamera() : this.renderPlayer();
  }

  renderCamera = () => {
    return (
      <CameraContainer>
        <Webcam
          audio={false}
          style={{
            width:'100%',
            height:'100%'
          }}
          ref={ this.webcamRef }
          screenshotFormat="image/jpeg"
        />
        <div style={{position:'absolute', bottom:0, left:0, right:0, textAlign:'center'}}>
          <i className="material-icons" style={{color:'red', fontSize:64, cursor:'pointer'}} onClick={this.capture}>camera_alt</i>
          <i className="material-icons" style={{color:'green', fontSize:64, cursor:'pointer'}} onClick={this.play}>play_circle_filled</i>
        </div>
      </CameraContainer>
    );
  }

  renderPlayer = () => {
    return (
      <CameraContainer>
        <Player src={this.props.frames[this.state.playFrame]} />
        <div style={{position:'absolute', bottom:0, left:0, right:0, textAlign:'center'}}>
          <i className="material-icons" style={{color:'red', fontSize:64, cursor:'pointer'}} onClick={this.stop}>stop</i>
        </div>
      </CameraContainer>
    );
  }
}

const Frame = SortableElement(({value}) => {
  return (
    <div style={{display:'inline-block', position: 'relative'}}>
      <img style={{display:'block', height:'25vh'}}src={value} />
    </div>
  );
});

const Frames = SortableContainer(({frames}) => {
  return (
    <div style={{whiteSpace: 'nowrap', overflowX: 'scroll', overflowY:'hidden', height:'25vh'}}>
      {frames.map((value, index) => (
        <Frame key={`item-${index}`} index={index} value={value} />
      ))}
    </div>
  );
});

const AppContainer = styled.div`
  width: 100%;
  height: 100%;
  flex-direction: column
`

const Player = styled.div`
  width: 100%;
  height: 100%;
  background-image: url("${props => props.src}");
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
`
const CameraContainer = styled.div`
  position: relative;
  height: 75vh;
  text-align: center;
`

const FramesContainer = styled.div`
  background: red;
  overflow-x: scroll;
  white-space: nowrap;
  height: 128px;
`

export default App;
