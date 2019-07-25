import React from 'react';
import styled from 'styled-components';
import Webcam from 'react-webcam';

export default class Camera extends React.Component {

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

  pause = () => {
    clearInterval(this.playInterval);
    this.setState({mode: 'pause'})
  }

  stop = () => {
    clearInterval(this.playInterval);
    this.setState({mode: 'capture'});
  }

  render = () => {
    return this.state.mode === 'capture' ? this.renderCamera() : this.renderPlayer();
  }

  renderCamera = () => {
    console.log(this.props.deviceId)
    return (
      <CameraContainer>
        <Webcam
          videoConstraints={{
            deviceId: this.props.deviceId
          }}
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
          {this.state.mode === 'pause' && <i className="material-icons" style={{color:'green', fontSize:64, cursor:'pointer'}} onClick={this.play}>play_circle_filled</i>}
          {this.state.mode === 'play' && <i className="material-icons" style={{color:'red', fontSize:64, cursor:'pointer'}} onClick={this.pause}>pause</i>}
        </div>
      </CameraContainer>
    );
  }
}


const CameraContainer = styled.div`
  position: relative;
  height: 100%;
  width: 100%
  text-align: center;
`;

const Player = styled.div`
  width: 100%;
  height: 100%;
  background-image: url("${props => props.src}");
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
`;