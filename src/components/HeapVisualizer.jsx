import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import Tree from 'react-d3-tree';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  heapInsert,
  extractMin,
  heapify,
  createSampleHeap,
  arrayToTree,
  heapDelete // Import heapDelete
} from './HeapOperations'; // Import heap operations
import '../styles/code-highlighter.css';
import '../styles/TreeVisualizer.css'; // Can reuse or create HeapVisualizer.css later
import '../styles/HeapVisualizer.css';

// Tree visualization styles (can be adjusted for heaps)
const nodeSize = { x: 140, y: 140 }; // Consider adjusting for heap layout
const foreignObjectSize = { width: 80, height: 80 };

// Tree node rendering - modified for heap node highlighting via ID
const renderCustomNodeElement = ({ nodeDatum, hierarchyPointNode, highlightedNodes }) => {
  const depth = hierarchyPointNode.depth || 0;
  // Highlight if nodeDatum.id is in the highlightedNodes array
  const isHighlighted = highlightedNodes && highlightedNodes.includes(nodeDatum.id);
  
  return (
    <g className={`depth-${depth}`}>
      <circle 
        r={isHighlighted ? 28 : 25} 
        fill={isHighlighted ? "#ff7f50" : "#2A623D"} 
        stroke={isHighlighted ? "#ff5722" : "#4CAF50"}
        strokeWidth={isHighlighted ? 3 : 1}
        strokeDasharray={isHighlighted ? "4,2" : ""}
        filter={isHighlighted ? "url(#glow)" : ""}
        className="node-circle"
      />
      <defs>
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3 3" result="glow"/>
          <feMerge>
            <feMergeNode in="glow"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <foreignObject 
        width={foreignObjectSize.width} 
        height={foreignObjectSize.height} 
        x={-foreignObjectSize.width / 2} 
        y={-foreignObjectSize.height / 2}
        className="tree-node-foreign-object"
      >
        <div className={`tree-node ${isHighlighted ? 'highlighted' : ''}`}>
          <h3>{nodeDatum.name}</h3>
          {/* Heaps typically don't have manual toggle for children in this context */}
        </div>
      </foreignObject>
    </g>
  );
};

// Enhanced CodeHighlighter component (remains the same)
const CodeHighlighter = ({ code, currentLine }) => {
  const codeContainerRef = useRef(null);
  
  if (!code) return null;
  
  const lineProps = (lineNumber) => {
    const style = { display: 'block' };
    if (lineNumber === currentLine) {
      style.backgroundColor = '#2a4d38';
      style.borderLeft = '3px solid #4CAF50';
    }
    return { style };
  };
  
  useEffect(() => {
    if (currentLine && codeContainerRef.current) {
      const lineElement = codeContainerRef.current.querySelector(`[data-line-number="${currentLine}"]`);
      if (lineElement) {
        setTimeout(() => {
          lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [currentLine, code]);
  
  return (
    <div 
      className="algorithm-code"
      ref={codeContainerRef}
      style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        flex: 1,
        position: 'relative'
      }}
    >
      <SyntaxHighlighter
        language="javascript"
        style={atomDark}
        wrapLines={true}
        showLineNumbers={true}
        lineProps={lineNumber => lineProps(lineNumber)}
        customStyle={{
          margin: 0,
          padding: '0.75rem',
          borderRadius: '6px',
          backgroundColor: '#0d1117',
          fontSize: '0.85rem',
          lineHeight: '1.8',
          height: 'auto', 
          overflow: 'auto',
          flex: 1,
          minHeight: '300px'
        }}
        lineNumberStyle={{
          minWidth: '2.5em',
          paddingRight: '1em',
          color: '#6e7681',
          textAlign: 'right'
        }}
      >
        {code}
      </SyntaxHighlighter>
      
      {currentLine && (
        <div style={{
          position: 'absolute',
          top: '4px',
          right: '8px',
          background: 'rgba(0,0,0,0.5)',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          Line: {currentLine}
        </div>
      )}
    </div>
  );
};

// Spring animation configuration (remains the same)
const springAnim = {
  type: "spring",
  damping: 20,
  stiffness: 300
};

// Algorithm explanations for Heap Operations
const algorithmInfo = {
  "Insert": {
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1) (if modifying input array), O(n) for steps",
    description: "Inserts an element into the min-heap. The new element is added to the end, then it 'bubbles up' to its correct position to maintain the heap property.",
    pseudocode: `function heapInsert(heapArray, value):
  heapArray.push(value)
  currentIndex = heapArray.length - 1
  parentIndex = floor((currentIndex - 1) / 2)

  while currentIndex > 0 and heapArray[currentIndex] < heapArray[parentIndex]:
    swap(heapArray[currentIndex], heapArray[parentIndex])
    currentIndex = parentIndex
    parentIndex = floor((currentIndex - 1) / 2)
  return heapArray`
  },
  "Extract Min": {
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1) (if modifying input array), O(n) for steps",
    description: "Removes and returns the smallest element (root) from the min-heap. The last element is moved to the root, then it 'sinks down' (heapify-down) to maintain the heap property.",
    pseudocode: `function extractMin(heapArray):
  if heapArray is empty:
    return null
  
  min = heapArray[0]
  heapArray[0] = heapArray.pop() // Move last element to root
  
  currentIndex = 0
  while true:
    leftChildIndex = 2 * currentIndex + 1
    rightChildIndex = 2 * currentIndex + 2
    smallest = currentIndex

    if leftChildIndex < heapArray.length and heapArray[leftChildIndex] < heapArray[smallest]:
      smallest = leftChildIndex
    if rightChildIndex < heapArray.length and heapArray[rightChildIndex] < heapArray[smallest]:
      smallest = rightChildIndex

    if smallest != currentIndex:
      swap(heapArray[currentIndex], heapArray[smallest])
      currentIndex = smallest
    else:
      break
  return min`
  },
  "Build Heap from Array": {
    timeComplexity: "O(n)",
    spaceComplexity: "O(1) (in-place), O(n) for steps",
    description: "Builds a min-heap from an arbitrary array. It iterates from the last non-leaf node upwards, applying heapify-down to each node.",
    pseudocode: `function buildHeap(array):
  n = array.length
  for i from floor(n / 2) - 1 down to 0:
    heapifyDown(array, n, i) // Similar to extractMin's sink down
  return array`
  },
  "Delete": {
    timeComplexity: "O(log n) after O(n) find, or O(log n) if index known",
    spaceComplexity: "O(1) (if modifying input array), O(n) for steps",
    description: "Deletes a specific value from the heap. The element is found, replaced by the last element, then heapify-up or heapify-down is performed.",
    pseudocode: `function heapDelete(heapArray, valueToDelete):
  idxToDelete = findIndexOf(valueToDelete) // O(n)
  if idxToDelete == -1: return "Not found"

  heapArray[idxToDelete] = heapArray.pop() // Replace with last and shorten

  // If new element is smaller than parent, sift up
  parentIdx = floor((idxToDelete - 1) / 2)
  if idxToDelete > 0 and heapArray[idxToDelete] < heapArray[parentIdx]:
    siftUp(heapArray, idxToDelete)
  // Else, sift down
  else:
    siftDown(heapArray, heapArray.length, idxToDelete)
  return heapArray`
  }
};

const HeapVisualizer = () => {
  const [heapArray, setHeapArray] = useState([]); // Stores the heap as an array
  const [tree, setTree] = useState(null); // Stores the tree structure for react-d3-tree
  const [operation, setOperation] = useState("Insert"); // Default operation to Insert
  const [value, setValue] = useState(""); // For Insert (single value) or Build Heap (comma-separated)
  const [speed, setSpeed] = useState(100);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("An error occurred.");
  const [showInfo, setShowInfo] = useState(false);
  const [showCodePanel, setShowCodePanel] = useState(true);
  const [currentStep, setCurrentStep] = useState("");
  const [currentLine, setCurrentLine] = useState(0);
  // const [isPaused, setIsPaused] = useState(false); // Removed
  const [extractedValue, setExtractedValue] = useState(null); // To display extracted min value
  const [deletedValDisplay, setDeletedValDisplay] = useState(null); // To display deleted value
  // Removed: dropdownOpen, dropdownRef
  const [showHelperInfo, setShowHelperInfo] = useState(true);
  const [highlightedTreeNodes, setHighlightedTreeNodes] = useState([]);
  // Removed: showValueInput state


  const animationFrame = useRef(null);
  const animationState = useRef({ index: 0, results: [] }); // results are the 'steps' from HeapOperations
  // Removed: dropdownRef
  const treeContainerRef = useRef(null);

  useEffect(() => {
    if (showHelperInfo) {
      const timer = setTimeout(() => setShowHelperInfo(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [showHelperInfo]);

  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  useEffect(() => {
    // Update tree visualization whenever heapArray changes and not animating
    // Or if animation finishes and tree needs to be set to final state from heapArray
    if (!isAnimating) {
      setTree(arrayToTree(heapArray));
    }

    // Removed handleClickOutside for dropdown

    const handleKeyDown = (event) => {
      if (event.key === "?" || (event.key === "/" && event.shiftKey)) {
        setShowKeyboardShortcuts(prev => !prev);
      }
      // Removed Enter key for generic handleOperation
      if (event.key === "Escape" && isAnimating) {
        stopAnimation();
      }
      // Removed Space key for pause/resume
      if (event.key === "g" && !event.ctrlKey && !event.metaKey) {
        handleCreateSampleHeap();
      }
      if (event.key === "c" && !event.ctrlKey && !event.metaKey) {
        setShowCodePanel(prev => !prev);
      }
    };

    // document.removeEventListener("mousedown", handleClickOutside); // Removed
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      // document.removeEventListener("mousedown", handleClickOutside); // Removed
      document.removeEventListener("keydown", handleKeyDown);
      if (animationFrame.current) clearTimeout(animationFrame.current);
    };
  }, [heapArray, isAnimating]); // Add heapArray and isAnimating to dependencies

  // Removed: useEffect for showValueInput

  const displayError = (message) => {
    setErrorMessage(message);
    setShowError(true);
    setTimeout(() => setShowError(false), 3000);
  };

  const stopAnimation = () => {
    if (animationFrame.current) clearTimeout(animationFrame.current);
    animationFrame.current = null;
    setIsAnimating(false);
    // setIsPaused(false); // Removed
    // Set tree to the final state based on the current heapArray
    setTree(arrayToTree(heapArray));
    setHighlightedTreeNodes([]); // Clear highlights
  };

  // Removed togglePause function

  // Removed old handleOperation function

  // New individual handlers for each operation
  const handleInsert = () => {
    setOperation("Insert");
    stopAnimation();
    setExtractedValue(null);
    setDeletedValDisplay(null);

    if (!value.trim() || isNaN(parseInt(value.trim()))) {
      displayError("Please enter a valid number for Insert.");
      return;
    }
    const operationResult = heapInsert([...heapArray], parseInt(value.trim()));
    setHeapArray(operationResult.heap);
    setValue(""); // Clear input after operation

    if (operationResult.steps && operationResult.steps.length > 0) {
      animationState.current = { index: 0, results: operationResult.steps };
      setIsAnimating(true);
      updateAnimation();
    } else {
      setTree(arrayToTree(operationResult.heap));
      setCurrentStep(operationResult.steps?.[0]?.description || "Insert complete.");
      setHighlightedTreeNodes(operationResult.steps?.[0]?.highlightedNodes || []);
    }
  };

  const handleExtractMin = () => {
    setOperation("Extract Min");
    stopAnimation();
    setExtractedValue(null);
    setDeletedValDisplay(null);
    setValue(""); // Clear value as it's not used

    let operationResult;
    if (heapArray.length === 0) {
      displayError("Heap is empty. Cannot extract min.");
      operationResult = { heap: [], steps: [{ heap: null, description: "Heap is empty.", highlightedNodes: [] }] };
      setHeapArray([]);
    } else {
      operationResult = extractMin([...heapArray]);
      setHeapArray(operationResult.heap);
      setExtractedValue(operationResult.extractedMin);
    }

    if (operationResult.steps && operationResult.steps.length > 0) {
      animationState.current = { index: 0, results: operationResult.steps };
      setIsAnimating(true);
      updateAnimation();
    } else {
      setTree(arrayToTree(operationResult.heap));
      setCurrentStep(operationResult.steps?.[0]?.description || "Extract Min complete.");
      setHighlightedTreeNodes(operationResult.steps?.[0]?.highlightedNodes || []);
    }
  };
  
  const handleDelete = () => {
    setOperation("Delete");
    stopAnimation();
    setExtractedValue(null);
    setDeletedValDisplay(null);

    if (!value.trim() || isNaN(parseInt(value.trim()))) {
      displayError("Please enter a valid number for Delete.");
      return;
    }
    const operationResult = heapDelete([...heapArray], parseInt(value.trim()));
    setHeapArray(operationResult.heap);
    setDeletedValDisplay(operationResult.deletedValue);
    setValue(""); // Clear input after operation


    if (operationResult.steps && operationResult.steps.length > 0) {
      animationState.current = { index: 0, results: operationResult.steps };
      setIsAnimating(true);
      updateAnimation();
    } else {
      setTree(arrayToTree(operationResult.heap));
      setCurrentStep(operationResult.steps?.[0]?.description || "Delete complete.");
      setHighlightedTreeNodes(operationResult.steps?.[0]?.highlightedNodes || []);
    }
  };

  const handleBuildHeap = () => {
    setOperation("Build Heap from Array");
    stopAnimation();
    setExtractedValue(null);
    setDeletedValDisplay(null);

    if (!value.trim()) {
      displayError("Please enter comma-separated numbers for Build Heap.");
      return;
    }
    const inputArray = value.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
    if (inputArray.length === 0 && value.trim() !== "") {
       displayError("Invalid input. Please use comma-separated numbers (e.g., 10,5,20).");
       return;
    }
    const operationResult = heapify(inputArray);
    setHeapArray(operationResult.heap);
    setValue(""); // Clear input after operation

    if (operationResult.steps && operationResult.steps.length > 0) {
      animationState.current = { index: 0, results: operationResult.steps };
      setIsAnimating(true);
      updateAnimation();
    } else {
      setTree(arrayToTree(operationResult.heap));
      setCurrentStep(operationResult.steps?.[0]?.description || "Build Heap complete.");
      setHighlightedTreeNodes(operationResult.steps?.[0]?.highlightedNodes || []);
    }
  };

  const updateAnimation = () => {
    const { index, results } = animationState.current;

    // Removed isPaused check
    // if (isPaused) {
    //   animationFrame.current = setTimeout(updateAnimation, 100); // Check again soon if paused
    //   return;
    // }

    if (index >= results.length) {
      setIsAnimating(false);
      // Final state: ensure the tree reflects the final heapArray
      setTree(arrayToTree(heapArray)); 
      // setCurrentStep(results[results.length - 1]?.description || "Animation complete."); // Old message
      setCurrentStep("Operation complete. Ready for next input."); // New neutral message
      // setHighlightedTreeNodes(results[results.length -1]?.highlightedNodes || []); // Old highlighting logic
      setHighlightedTreeNodes([]); // Clear all highlights
      return;
    }

    const currentResult = results[index];
    
    // The 'heap' property in each step is already a tree structure from arrayToTree
    setTree(currentResult.heap || null); 
    setCurrentStep(currentResult.description || "");
    setCurrentLine(currentResult.line || 0); // If line numbers are used in HeapOperations
    setHighlightedTreeNodes(currentResult.highlightedNodes || []);


    animationState.current.index++;
    
    const delay = (1000 - speed * 9); // Use speed for delay
    animationFrame.current = setTimeout(updateAnimation, delay);
  };

  const handleSpeedChange = (e) => setSpeed(parseInt(e.target.value));
  
  const handleValueChange = (e) => {
    const input = e.target.value;
    if (operation === "Build Heap from Array") {
      if (/^[\d, ]*$/.test(input)) {
        setValue(input);
      }
    } else { // For "Insert" and "Delete", only allow numbers
      if (/^\d*$/.test(input)) {
        setValue(input);
      }
    }
  };

  const resetHeap = () => {
    stopAnimation();
    setHeapArray([]);
    setTree(null);
    setCurrentStep("");
    setCurrentLine(0);
    // setOperation("Select Operation"); // Before
    setOperation("Insert"); // After, to match default state and always-visible input
    setValue("");
    setExtractedValue(null);
    setDeletedValDisplay(null);
    setHighlightedTreeNodes([]);
    setValue(""); // Added
  };

  const clearHeap = () => {
    stopAnimation();
    setHeapArray([]);
    setTree(null);
    setCurrentStep("Heap cleared.");
    setExtractedValue(null);
    setDeletedValDisplay(null);
    setHighlightedTreeNodes([]);
  };

  // Removed handleOperationSelect

  const currentAlgorithmInfo = algorithmInfo[operation] || {}; // Still useful for info panel

  const handleCreateSampleHeap = () => {
    setOperation("Insert"); // Added to reset context for the input field
    stopAnimation();
    const { heap, steps } = createSampleHeap();
    setHeapArray(heap);
    setExtractedValue(null);
    setDeletedValDisplay(null); // Ensure this is also cleared
    setValue(""); // Added

    if (steps && steps.length > 0) {
      setTree(steps[0].heap); 
      setCurrentStep(steps[0].description);
      setHighlightedTreeNodes(steps[0].highlightedNodes || []);
    } else {
      setTree(arrayToTree(heap)); 
      setCurrentStep("Sample heap created.");
    }
  };
  
  const getOperationCode = () => {
    switch (operation) {
      case "Insert":
        return `// Min-Heap Insert
function heapInsert(heapArray, value) {
  heapArray.push(value);
  let currentIndex = heapArray.length - 1;
  let parentIndex = Math.floor((currentIndex - 1) / 2);

  while (currentIndex > 0 && heapArray[currentIndex] < heapArray[parentIndex]) {
    // Swap
    [heapArray[currentIndex], heapArray[parentIndex]] = 
      [heapArray[parentIndex], heapArray[currentIndex]];
    
    currentIndex = parentIndex;
    parentIndex = Math.floor((currentIndex - 1) / 2);
  }
  return heapArray;
}`;
      case "Extract Min":
        return `// Min-Heap Extract Min
function extractMin(heapArray) {
  if (heapArray.length === 0) return null;
  const min = heapArray[0];
  if (heapArray.length === 1) {
    heapArray.pop();
    return min;
  }
  heapArray[0] = heapArray.pop(); // Move last to root
  let currentIndex = 0;
  while (true) {
    let leftChild = 2 * currentIndex + 1;
    let rightChild = 2 * currentIndex + 2;
    let smallest = currentIndex;

    if (leftChild < heapArray.length && heapArray[leftChild] < heapArray[smallest]) {
      smallest = leftChild;
    }
    if (rightChild < heapArray.length && heapArray[rightChild] < heapArray[smallest]) {
      smallest = rightChild;
    }
    if (smallest !== currentIndex) {
      [heapArray[currentIndex], heapArray[smallest]] = 
        [heapArray[smallest], heapArray[currentIndex]];
      currentIndex = smallest;
    } else {
      break;
    }
  }
  return min;
}`;
      case "Build Heap from Array":
        return `// Build Min-Heap (Heapify)
function heapifyDown(array, n, i) { // Helper for buildHeap
  let smallest = i;
  let left = 2 * i + 1;
  let right = 2 * i + 2;

  if (left < n && array[left] < array[smallest]) smallest = left;
  if (right < n && array[right] < array[smallest]) smallest = right;

  if (smallest !== i) {
    [array[i], array[smallest]] = [array[smallest], array[i]];
    heapifyDown(array, n, smallest);
  }
}

function buildHeap(array) {
  const n = array.length;
  // Start from the last non-leaf node
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapifyDown(array, n, i);
  }
  return array;
}`;
      case "Delete":
        return `// Min-Heap Delete Value
function heapDelete(heapArray, valueToDelete) {
  let idxToDelete = heapArray.indexOf(valueToDelete);
  if (idxToDelete === -1) return heapArray; // Not found

  const lastElement = heapArray.pop();
  if (idxToDelete === heapArray.length) { // If it was the last element
    return heapArray;
  }
  heapArray[idxToDelete] = lastElement;

  const parentIndex = Math.floor((idxToDelete - 1) / 2);

  // Heapify-up if smaller than parent
  if (idxToDelete > 0 && heapArray[idxToDelete] < heapArray[parentIndex]) {
    let current = idxToDelete;
    let parent = parentIndex;
    while (current > 0 && heapArray[current] < heapArray[parent]) {
      [heapArray[current], heapArray[parent]] = [heapArray[parent], heapArray[current]];
      current = parent;
      parent = Math.floor((current - 1) / 2);
    }
  } 
  // Else, heapify-down
  else {
    let current = idxToDelete;
    while (true) {
      let left = 2 * current + 1;
      let right = 2 * current + 2;
      let smallest = current;
      if (left < heapArray.length && heapArray[left] < heapArray[smallest]) smallest = left;
      if (right < heapArray.length && heapArray[right] < heapArray[smallest]) smallest = right;
      if (smallest !== current) {
        [heapArray[current], heapArray[smallest]] = [heapArray[smallest], heapArray[current]];
        current = smallest;
      } else break;
    }
  }
  return heapArray;
}`;
      default:
        return "// Select an operation to view code";
    }
  };

  // Determine input placeholder based on current operation
  const getInputPlaceholder = () => {
    if (operation === "Insert") return "Enter a number (e.g., 10)";
    if (operation === "Delete") return "Enter value to delete";
    if (operation === "Build Heap from Array") return "e.g., 10,5,20,8,1";
    return "Enter value";
  };
  
  return (
    <div className="tree-visualizer-container"> {/* Reusing class name for now */}
      <div className="sorting-bg-overlay"></div>
      <div className="floating-orb orb-1"></div>
      <div className="floating-orb orb-2"></div>
      
      <motion.header 
        className="app-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Link to="/" className="home-button">
          <FaHome size={16} />
          <span>Home</span>
        </Link>
        <h1 style={{ flex: 1, textAlign: 'center', fontSize: '1.5rem' }}>Min-Heap Visualizer</h1>
      </motion.header>
      
      <div className="tree-controls">
        {/* Input field is now unconditionally rendered */}
        <div className="control-group value-input-group">
          <div className="input-group">
            <label htmlFor="heapValueInput">Value:</label>
            <input 
              id="heapValueInput"
              type="text" 
              value={value} 
              onChange={handleValueChange} 
              placeholder={getInputPlaceholder()}
              maxLength={operation === "Insert" || operation === "Delete" ? 5 : 100} 
              aria-label="Value for heap operation"
            />
          </div>
        </div>
        
        <div className="action-buttons main-operations"> {/* Group for new operation buttons */}
          <button className="action-button" onClick={handleInsert}>
            Insert
          </button>
          <button className="action-button" onClick={handleExtractMin}>
            Extract Min
          </button>
          <button className="action-button" onClick={handleDelete}>
            Delete Value
          </button>
          <button className="action-button" onClick={handleBuildHeap}>
            Build Heap from Array
          </button>
        </div>

        <div className="action-buttons utility-operations"> {/* Group for existing utility buttons */}
          {/* Removed Pause/Resume button */}
          {/* Removed Stop button */}
          <button className="action-button generate-button" onClick={handleCreateSampleHeap}>
            Create Sample Heap
          </button>
          <button className="action-button" onClick={clearHeap}>
            Clear Heap
          </button>
          <button className="action-button" onClick={resetHeap}>
            Reset
          </button>
        </div>
        
        <div className="control-group misc-controls"> {/* Group for speed, info, etc. */}
          <div className="range-group">
            <label htmlFor="speed">Speed:</label>
            <input 
              type="range" 
              id="speed" 
              min="1" 
              max="100" 
              value={speed} 
              onChange={handleSpeedChange} 
              className="range-slider" 
            />
          </div>
          
          <button 
            className={`info-button ${showInfo ? 'active' : ''}`} 
            onClick={() => setShowInfo(!showInfo)}
          >
            About this algorithm
          </button>
          
          <button 
            className={`code-toggle-button ${showCodePanel ? 'active' : ''}`}
            onClick={() => setShowCodePanel(!showCodePanel)}
          >
            {showCodePanel ? 'Hide Code' : 'Show Code'}
          </button>
          
          <button 
            className="shortcuts-button"
            onClick={() => setShowKeyboardShortcuts(true)}
            title="Keyboard Shortcuts"
          >
            <span className="keyboard-icon">⌨</span> Shortcuts
          </button>
        </div>
      </div>
      
      {showError && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
      
      {showHelperInfo && (
        <motion.div 
          className="helper-info"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="helper-info-header">
            <h3>🌲 Min-Heap Visualizer</h3>
            <button onClick={() => setShowHelperInfo(false)} className="close-button">×</button>
          </div>
          <div className="helper-info-content">
            <p><strong>Getting Started:</strong></p>
            <ul>
              <li>Use <strong>Create Sample Heap</strong> to start with a pre-filled heap.</li>
              <li>Try <strong>Insert</strong> to add values, <strong>Extract Min</strong> to remove the smallest.</li>
              <li>Use <strong>Build Heap from Array</strong> with comma-separated numbers (e.g., 23,1,35,7).</li>
              <li>Adjust <strong>Speed</strong> for animation pace. Click and drag to pan, scroll to zoom.</li>
            </ul>
          </div>
        </motion.div>
      )}
      
      <div className="tree-visualization-area">
        {showInfo && operation !== "Select Operation" && (
          <motion.div 
            className="algorithm-info"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={springAnim}
          >
            <h3>{operation}</h3>
            <p><strong>Description:</strong> {currentAlgorithmInfo.description}</p>
            <p><strong>Time Complexity:</strong> {currentAlgorithmInfo.timeComplexity}</p>
            <p><strong>Space Complexity:</strong> {currentAlgorithmInfo.spaceComplexity}</p>
            <div className="pseudocode">
              <h4>Pseudocode:</h4>
              <pre>{currentAlgorithmInfo.pseudocode}</pre>
            </div>
          </motion.div>
        )}
        
        <div className="tree-display" ref={treeContainerRef}>
          {tree && tree.name ? ( // Check if tree and tree.name exist
            <>
              <div className="tree-controls-overlay">
                <button 
                  className="zoom-button" 
                  onClick={() => { /* Zoom reset logic here */ }}
                >
                  Reset Zoom
                </button>
              </div>
              <div className="tree-interaction-hint">
                 <span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/><path d="M11 17H13V11H11V17ZM12 7C11.17 7 10.5 7.67 10.5 8.5C10.5 9.33 11.17 10 12 10C12.83 10 13.5 9.33 13.5 8.5C13.5 7.67 12.83 7 12 7Z" fill="currentColor"/></svg>
                  Drag to pan, scroll to zoom
                </span>
              </div>
              <Tree
                data={tree}
                orientation="vertical"
                pathFunc="diagonal"
                translate={{ 
                  x: treeContainerRef.current ? treeContainerRef.current.clientWidth / 2 : 300, 
                  y: 80
                }}
                nodeSize={{ x: 100, y: 120 }} // Slightly smaller x for heap
                separation={{ siblings: 1.2, nonSiblings: 1.8 }} // Adjusted for heap
                renderCustomNodeElement={(props) => renderCustomNodeElement({ ...props, highlightedNodes: highlightedTreeNodes })}
                enableLegacyTransitions={true}
                transitionDuration={500}
                zoom={0.7} // Adjusted zoom
                scaleExtent={{ min: 0.2, max: 1.5 }}
                collapsible={false} // Heaps are generally not collapsible by user
                initialDepth={999}
                rootNodeClassName="tree-root-node"
                branchNodeClassName="tree-branch-node"
                leafNodeClassName="tree-leaf-node"
              />
            </>
          ) : (
            <div className="empty-tree-message">
              <div className="empty-tree-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C12.5523 22 13 21.5523 13 21V13C13 12.4477 12.5523 12 12 12C11.4477 12 11 12.4477 11 13V21C11 21.5523 11.4477 22 12 22Z" fill="currentColor"/><path d="M12 2C11.4477 2 11 2.44772 11 3V4C11 4.55228 11.4477 5 12 5C12.5523 5 13 4.55228 13 4V3C13 2.44772 12.5523 2 12 2Z" fill="currentColor"/><path d="M19.071 19.071C19.4616 18.6805 19.4616 18.0474 19.071 17.6568L15.7426 14.3284C15.3521 13.9379 14.719 13.9379 14.3284 14.3284C13.9379 14.719 13.9379 15.3521 14.3284 15.7426L17.6569 19.071C18.0474 19.4616 18.6805 19.4616 19.071 19.071Z" fill="currentColor"/><path fillRule="evenodd" clipRule="evenodd" d="M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8ZM6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18C8.68629 18 6 15.3137 6 12Z" fill="currentColor"/></svg>
              </div>
              <h3>Heap is empty</h3>
              <p>Select an operation to start, or use "Create Sample Heap".</p>
              <button 
                onClick={handleCreateSampleHeap}
                className="action-button generate-button"
                style={{ marginTop: "1rem" }}
              >
                Create Sample Heap
              </button>
            </div>
          )}
        </div>
        
        {showCodePanel && (
          <div className="code-panel">
            <CodeHighlighter code={getOperationCode()} currentLine={currentLine} />
          </div>
        )}
      </div>
      
      {extractedValue !== null && (
        <div className="traversal-result"> {/* Reusing class for simplicity */}
          <h3>Extracted Min: <span className="result-item">{extractedValue}</span></h3>
        </div>
      )}

      {deletedValDisplay !== null && (
        <div className="traversal-result">
          <h3>Deleted Value: <span className="result-item">{deletedValDisplay}</span></h3>
        </div>
      )}
      
      <div className="visualization-status">
        <div className="status-header">
          <div className="status-icon">
            {isAnimating ? <div className="status-running" title="Animation running"><div className="dot dot1"></div><div className="dot dot2"></div><div className="dot dot3"></div></div> : <div className="status-ready" title="Ready">✓</div>}
          </div>
          <div className="status-title">{isAnimating ? 'Visualizing: ' + operation : 'Status'}</div>
        </div>
        <div className="current-step">{currentStep}</div>
      </div>
      
      {showKeyboardShortcuts && (
         <motion.div 
          className="keyboard-shortcuts-overlay"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => setShowKeyboardShortcuts(false)}
        >
          <motion.div 
            className="keyboard-shortcuts-modal"
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="shortcuts-header">
              <h3>Keyboard Shortcuts</h3>
              <button className="close-button" onClick={() => setShowKeyboardShortcuts(false)}>×</button>
            </div>
            <div className="shortcuts-content">
              <div className="shortcut-group"><h4>Navigation</h4><div className="shortcut-item"><span className="shortcut-keys"><kbd>?</kbd></span><span className="shortcut-description">Show/hide keyboard shortcuts</span></div><div className="shortcut-item"><span className="shortcut-keys"><kbd>Home</kbd></span><span className="shortcut-description">Return to homepage</span></div></div>
              <div className="shortcut-group"><h4>Operations</h4><div className="shortcut-item"><span className="shortcut-keys"><kbd>Enter</kbd></span><span className="shortcut-description">Run selected operation (if input focused)</span></div>{/* <div className="shortcut-item"><span className="shortcut-keys"><kbd>Space</kbd></span><span className="shortcut-description">Pause/resume animation</span></div> */} <div className="shortcut-item"><span className="shortcut-keys"><kbd>Esc</kbd></span><span className="shortcut-description">Stop animation (if running)</span></div><div className="shortcut-item"><span className="shortcut-keys"><kbd>G</kbd></span><span className="shortcut-description">Create sample heap</span></div></div>
              <div className="shortcut-group"><h4>View</h4><div className="shortcut-item"><span className="shortcut-keys"><kbd>C</kbd></span><span className="shortcut-description">Toggle code panel</span></div></div>
              <div className="shortcut-group"><h4>Tree Interaction</h4><div className="shortcut-item"><span className="shortcut-description">Click and drag to pan the tree</span></div><div className="shortcut-item"><span className="shortcut-description">Use mouse wheel to zoom in/out</span></div></div>
            </div>
            <div className="shortcuts-footer"><button onClick={() => setShowKeyboardShortcuts(false)}>Close</button></div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default HeapVisualizer;
