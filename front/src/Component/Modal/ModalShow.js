import React, { useState } from 'react';
import PropTypes from 'prop-types';
import handleSubmit from '../UploadImage.js'

// function to handle the files
function handleFile(files) {
  alert("Number of files: " + files.length);
}

// drag drop file component
export const DragDropFile = () => {
  // drag state
  const [dragActive, setDragActive] = React.useState(false);
  // ref
  const inputRef = React.useRef(null);
  
  // handle drag events
  const handleDrag = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  // triggers when file is dropped
  const handleDrop = function(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files);
    }
  };
  
  // triggers when file is selected with click
  const handleChange = function(e) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files);
    }
  };
  
  // triggers the input when the button is clicked
  const onButtonClick = () => {
    inputRef.current.click();
  };
  
  return (
    // form element to upload files
    <form id="form-file-upload" onDragEnter={handleDrag} onSubmit={handleSubmit}>
      {/* input element to select files */}
      <input ref={inputRef} type="file" id="input-file-upload" multiple={true} onChange={handleChange} />
      {/* label element to drag and drop files */}
      <label id="label-file-upload" htmlFor="input-file-upload" className={dragActive ? "drag-active" : "" }>
        <div>
          <p>Drag and drop your file here or</p>
          {/* button element to trigger input */}
          <button className="upload-button" onClick={onButtonClick}>Upload a file</button>
        </div> 
      </label>
      {/* div element to handle drag events */}
      { dragActive && <div id="drag-file-element" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div> }
    </form>
  );
};

// modal component
export default class Modal extends React.Component {
  render() {
    if (!this.props.show) {
      return null;
    }
    return (
      <div class="modal" id="modal">
        <h2>Modal Window</h2>
        {/* drag and drop file component */}
        <DragDropFile />
        {/* content element */}
        <div class="content">
          {this.props.children}
        </div>
        {/* actions element */}
        <div class="actions">
          {/* button element to close the modal */}
          <button class="toggle-button" onClick={this.props.onClose}>
            close
          </button>
        </div>
      </div>
    );
  }
}

// propTypes for Modal component
Modal.propTypes = {
  onClose: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired
};
