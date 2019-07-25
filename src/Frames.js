import React from 'react';
import styled from 'styled-components';
import {SortableContainer, SortableElement} from 'react-sortable-hoc';

const Frame = SortableElement(({value, index, onSelect, selected, remove}) => {
  const onClick = () => {
    onSelect && onSelect(index)
  }
  return (
    <div
      onClick={onClick}
      style={{
        height: '100%',
        width: '20%',
        zIndex:10,
        display: 'inline-block',
        backgroundColor: selected ? 'yellow' : '',
        backgroundImage: `url("${value}")`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative'
      }}>
      {
        selected && (
        <i
          style={{position:"absolute", color:'red', zIndex:100, fontSize:32, top:0, right: 0}}
          className="material-icons"
          onClick={()=>remove(index)}
        >
          delete
        </i>
        )
      }
    </div>
  );
});

const Frames = SortableContainer(({frames, style, onSelect, currentFrame, remove}) => {
  return (
    <div style={{...style, whiteSpace: 'nowrap', overflowX: 'scroll', overflowY:'hidden'}}>
      {
        frames.map((value, index) => (
          <Frame
            key={`item-${index}`}
            index={index}
            value={value}
            onSelect={onSelect}
            remove={remove}
            selected={currentFrame === index}
          />
        ))
      }
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