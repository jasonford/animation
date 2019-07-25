import React from 'react';
import styled from 'styled-components';
import GIF from 'gif.js.optimized';
import saveBlob from './saveBlob';
import Camera from './Camera.js';
import Frames from './Frames.js';
import Select from 'react-select';

import './App.css';

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
    frameDelay: 125,
    videoInputs: [],
    selectedVideoInputId: null
  }

  componentWillMount = () => {
    this.trashRef = React.createRef();
    navigator
      .mediaDevices
      .enumerateDevices()
      .then(
        devices => {
          this.setState({videoInputs: devices.filter(d => d.kind === 'videoinput')})
        }
      );
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
        <div style={{flexGrow:1, maxHeight: '85vh'}}>
          <Camera
            deviceId={this.state.selectedVideoInputId}
            frameDelay={this.state.frameDelay}
            frames={this.state.frames}
            currentFrame={this.state.currentFrame}
            addFrame={this.addFrame}
            videoStream={this.state.videoStream}
          />
        </div>
        <div>
          <button onClick={this.clear}>clear</button>
          <Select
            styles={{
              container: (styles) => {
                return {
                  display: 'inline-block',
                  ...styles,
                  width: 256
                };
              }
            }}
            value={this.state.selectedVideo}
            onChange={ option => this.setState({selectedVideoInputId: option.value}) }
            options={ this.state.videoInputs.map( vi => ({value: vi.deviceId, label: vi.label }) ) }
          />
          <button onClick={this.downloadGif}>download GIF</button>
        </div>
        <Frames
          style={{height: '15vh'}}
          frames={this.state.frames}
          axis="x"
          onSortEnd={this.onSortEnd}
          onSortStart={()=>this.setState({sorting:true})}
          distance={ 2 }
        />
      </AppContainer>
    );
  }

}


const AppContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`



export default App;
