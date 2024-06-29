import React, { useState, useEffect, useRef } from 'react';
import '../styles/editor.css'
import CircularLoader from './loader';

const TextEditor = () => {
  const editorRef = useRef(null);
  const heading = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  const [headingOption, setHeadingOption] = useState('');

  const [SavedList, setSavedList] = useState()
  const [loading, setLoading] = useState(false);

  const [previewContent, setPreviewContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const [showFileModal, setShowFileModal] = useState(false);
  const [updateFileData, setupdateFileData] = useState()
  const [updateFile, setupdateFile] = useState(false)
  const [selectedOption, setselectedOption] = useState()
  const [selectedId, setSelectedId] = useState();

  useEffect(() => {
    fetchAllFile()  //fetching all file list to get length of array, so that can pass proper id
  }, [])

  const fetchAllFile = async () => {
    try {
      const response = await fetch('https://editor-test.onrender.com/all');
      if (response.ok) {
        const res = await response.json();
        setSelectedId(res.data.length > 0 ? res.data[0].id : '')  //to pass value in dropdown - open by ID
        setSavedList(res.data);
      } else {
        alert('Failed to fetch files.');
      }
    } catch (error) {
      alert('An error occurred while fetching files.');
    }
  }

  const applyStyle = (style, value) => {
    document.execCommand(style, false, value);
  };

  const handleHeadingOptionChange = (event) => {
    const heading_option = event.target.value
    setHeadingOption(heading_option);   //to show value on dropdown
    if (heading_option) {
      applyStyle('formatBlock', event.target.value)
    }
  };

  const promptForTitleAndSave = () => {
    const enteredTitle = prompt('Enter title for the file:');  //to enter title of your choice
    if (enteredTitle) {
      handleSave(enteredTitle);
    }
  }

  const handleSave = async (title) => {
    const content = editorRef.current.innerHTML;
    const date = new Date().toISOString();
    const id = SavedList?.length + 1

    const requestBody = {
      created_at: date,
      id: id,
      json_data: content,
      title: title,
      updated_at: date
    };

    setLoading(true);

    try {
      const response = await fetch('https://editor-test.onrender.com/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        fetchAllFile() // to get file content right after save
        alert('Content saved successfully!');
        handleClear()
      } else {
        alert('Failed to save content.');
      }
    } catch (error) {
      alert('An error occurred while saving content.');
    } finally {
      setLoading(false);
    }
  }

  const handleReview = () => {
    setPreviewContent(editorRef.current.innerHTML);
    setShowPreview(true);
  }

  const handleOpenFile = async () => {
    if (SavedList?.length > 0) {
      setShowFileModal(true);
    } else {
      fetchAllFile()
      setShowFileModal(true)
    }
  };

  const handleFileSelect = (file) => {
    setupdateFile(true)
    setupdateFileData(file)
    editorRef.current.innerHTML = file.json_data;
    setShowFileModal(false);
  };

  const handleUpdateFile = async () => {
    const content = editorRef.current.innerHTML;
    const date = new Date().toISOString();
    const id = updateFileData.id

    const requestBody = {
      created_at: updateFileData.created_at,
      id: id,
      json_data: content,
      title: updateFileData.title + '- Updated',
      updated_at: date
    };

    setLoading(true);

    try {
      const response = await fetch(`https://editor-test.onrender.com/update/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        fetchAllFile()  //to get updated file content right after updation
        alert('Content updated successfully!');
        setupdateFile(false)
        handleClear()
      } else {
        alert('Failed to update content.');
      }
    } catch (error) {
      alert('An error occurred while updating content.');
    } finally {
      setLoading(false);
    }
  }

  const handleDropdownChange = (event) => {
    setselectedOption(event.target.value)
    if (event.target.value === 'list') {
      handleOpenFile()
    }
  };

  const handleIdChange = async (e) => {
    const ID = e.target.value
    setSelectedId(ID)
    const response = await fetch(`https://editor-test.onrender.com/get/${ID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const res = await response.json();
    editorRef.current.innerHTML = res.data.json_data;
  }

  const handleClear = () => {
    setShowFileModal(false)
    setupdateFile(false)
    setselectedOption('')
    setHeadingOption('')
    editorRef.current.innerHTML = '';
  }

  return (<>
    <div className='editor-container'>
      {loading && <CircularLoader />}
      <div className="toolbar">
        <button onClick={() => applyStyle("bold")}> <b> B </b> </button>
        <button onClick={() => applyStyle("italic")}> <i> I </i> </button>
        <button onClick={() => applyStyle("underline")}> <u> U </u> </button>
        <button onClick={() => applyStyle("strikethrough")}> <s> S </s> </button>

        <select id="headingOption" value={headingOption} onChange={handleHeadingOptionChange}>
          <option value="">Heading</option>
          {heading.map(item => (
            <option value={item}>{item}</option>
          ))}
        </select>

        <input type="color" onClick={(e) => applyStyle('foreColor', e.target.value)} />

        <select id='openOption' value={selectedOption} onChange={handleDropdownChange}>
          <option>Select Open option...</option>
          <option value="list">Open by List</option>
          <option value="id">Open by ID</option>
        </select>

        {selectedOption === 'id' && <select id="idSelect" value={selectedId} onChange={handleIdChange}>
          {SavedList?.map((item) => (
            <option key={item.id} value={item.id}>{item.id}</option>
          ))}
        </select>}

        <button onClick={() => handleReview()}>Review</button>
        {updateFile ? <button onClick={() => handleUpdateFile()}>Update</button> : <button onClick={() => promptForTitleAndSave()}>Save</button>}
        <button onClick={() => handleClear()}>Clear</button>
      </div>

      <div className="text-editor" contentEditable ref={editorRef} suppressContentEditableWarning={true}></div>

      {showPreview && (<div className="preview-modal">
        <div className="preview-content">
          <div dangerouslySetInnerHTML={{ __html: previewContent }}></div>
          <button onClick={() => setShowPreview(false)}>Close</button>
        </div>
      </div>)}

      {showFileModal && (<div className="file-modal">
        <div className="file-content">
          <h2>Select a File</h2>
          <ul>
            {SavedList?.length > 0 && SavedList.map(file => {
              return (<li key={file.id} onClick={() => handleFileSelect(file)}>
                {file.title}
              </li>)
            })}
          </ul>
          <button onClick={() => handleClear()}>Close</button>
        </div>
      </div>)}
    </div>
  </>);
};

export default TextEditor;