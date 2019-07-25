import React from 'react';
import styled from 'styled-components';
import {SortableContainer, SortableElement} from 'react-sortable-hoc';

const Frame = SortableElement(({value}) => {
  return (
    <img style={{ height: '100%', paddingRight:10, paddingLeft:10}} src={value} />
  );
});

const Frames = SortableContainer(({frames, style}) => {
  return (
    <div style={{...style, whiteSpace: 'nowrap', overflowX: 'scroll', overflowY:'hidden'}}>
      {frames.map((value, index) => (
        <Frame key={`item-${index}`} index={index} value={value} />
      ))}
    </div>
  );
});

const FramesContainer = styled.div`
  background: red;
  overflow-x: scroll;
  overflow-y: hidden;
  white-space: nowrap;
  height: 128px;
`

export default Frames;