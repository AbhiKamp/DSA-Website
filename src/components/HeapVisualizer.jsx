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
  arrayToTree
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
  }
};

const HeapVisualizer = () => {
  const [heapArray, setHeapArray] = useState([]); // Stores the heap as an array
  const [tree, setTree] = useState(null); // Stores the tree structure for react-d3-tree
  const [operation, setOperation] = useState("Select Operation");
  const [value, setValue] = useState(""); // For Insert (single value) or Build Heap (comma-separated)
  const [speed, setSpeed] = useState(100);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("An error occurred.");
  const [showInfo, setShowInfo] = useState(false);
  const [showCodePanel, setShowCodePanel] = useState(true);
  const [currentStep, setCurrentStep] = useState("");
  const [currentLine, setCurrentLine] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [extractedValue, setExtractedValue] = useState(null); // To display extracted min value
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showHelperInfo, setShowHelperInfo] = useState(true);
  const [highlightedTreeNodes, setHighlightedTreeNodes] = useState([]);


  const animationFrame = useRef(null);
  const animationState = useRef({ index: 0, results: [] }); // results are the 'steps' from HeapOperations
  const dropdownRef = useRef(null);
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

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "?" || (event.key === "/" && event.shiftKey)) {
        setShowKeyboardShortcuts(prev => !prev);
      }
      if (event.key === "Enter" && !isAnimating) {
        handleOperation();
      }
      if (event.key === "Escape" && isAnimating) {
        stopAnimation();
      }
      if (event.key === " " && isAnimating) {
        togglePause();
        event.preventDefault();
      }
      if (event.key === "g" && !event.ctrlKey && !event.metaKey) {
        handleCreateSampleHeap();
      }
      if (event.key === "c" && !event.ctrlKey && !event.metaKey) {
        setShowCodePanel(prev => !prev);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      if (animationFrame.current) clearTimeout(animationFrame.current);
    };
  }, [heapArray, isAnimating]); // Add heapArray and isAnimating to dependencies

  const displayError = (message) => {
    setErrorMessage(message);
    setShowError(true);
    setTimeout(() => setShowError(false), 3000);
  };

  const stopAnimation = () => {
    if (animationFrame.current) clearTimeout(animationFrame.current);
    animationFrame.current = null;
    setIsAnimating(false);
    setIsPaused(false);
    // Set tree to the final state based on the current heapArray
    setTree(arrayToTree(heapArray));
    setHighlightedTreeNodes([]); // Clear highlights
  };

  const togglePause = () => setIsPaused(!isPaused);

  const handleOperation = () => {
    if (operation === "Select Operation") {
      displayError("Please select an operation.");
      return;
    }
    stopAnimation();
    setExtractedValue(null); // Clear previous extracted value

    let operationResult = { heap: [...heapArray], steps: [] };

    try {
      switch (operation) {
        case "Insert":
          if (!value.trim() || isNaN(parseInt(value.trim()))) {
            displayError("Please enter a valid number for Insert.");
            return;
          }
          operationResult = heapInsert([...heapArray], parseInt(value.trim()));
          setHeapArray(operationResult.heap);
          break;
        case "Extract Min":
          if (heapArray.length === 0) {
            displayError("Heap is empty. Cannot extract min.");
            // Ensure steps are cleared or show empty message
            operationResult = { heap: [], steps: [{ heap: null, description: "Heap is empty.", highlightedNodes: [] }] };
            setHeapArray([]); // Update heapArray state
          } else {
            operationResult = extractMin([...heapArray]);
            setHeapArray(operationResult.heap);
            setExtractedValue(operationResult.extractedMin);
          }
          break;
        case "Build Heap from Array":
          if (!value.trim()) {
            displayError("Please enter comma-separated numbers for Build Heap.");
            return;
          }
          const inputArray = value.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
          if (inputArray.length === 0 && value.trim() !== "") {
             displayError("Invalid input. Please use comma-separated numbers (e.g., 10,5,20).");
             return;
          }
          operationResult = heapify(inputArray);
          setHeapArray(operationResult.heap);
          break;
        default:
          return;
      }

      if (operationResult.steps && operationResult.steps.length > 0) {
        animationState.current = { index: 0, results: operationResult.steps };
        setIsAnimating(true);
        updateAnimation();
      } else {
        // If no steps (e.g. error in operation, or immediate operation), ensure UI reflects current heapArray
        setTree(arrayToTree(heapArray));
        setCurrentStep(operationResult.steps?.[0]?.description || "Operation complete.");
        setHighlightedTreeNodes(operationResult.steps?.[0]?.highlightedNodes || []);
      }
    } catch (error) {
      console.error("Operation error:", error);
      displayError(`Operation failed: ${error.message}`);
      // Rollback or set to a safe state if needed
      // For now, just log and display error. The heapArray might be in an intermediate state.
    }
  };
  
  const updateAnimation = () => {
    const { index, results } = animationState.current;

    if (isPaused) {
      animationFrame.current = setTimeout(updateAnimation, 100); // Check again soon if paused
      return;
    }

    if (index >= results.length) {
      setIsAnimating(false);
      // Final state: ensure the tree reflects the final heapArray
      setTree(arrayToTree(heapArray)); 
      setCurrentStep(results[results.length - 1]?.description || "Animation complete.");
      setHighlightedTreeNodes(results[results.length -1]?.highlightedNodes || []);
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
    // Allow numbers and commas for "Build Heap from Array"
    if (operation === "Build Heap from Array") {
      if (/^[\d, ]*$/.test(input)) {
        setValue(input);
      }
    } else { // For "Insert", only allow numbers
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
    setOperation("Select Operation");
    setValue("");
    setExtractedValue(null);
    setHighlightedTreeNodes([]);
  };

  const clearHeap = () => {
    stopAnimation();
    setHeapArray([]);
    setTree(null);
    setCurrentStep("Heap cleared.");
    setExtractedValue(null);
    setHighlightedTreeNodes([]);
  };

  const handleOperationSelect = (op) => {
    setOperation(op);
    setValue(""); // Clear input when changing operation
    setDropdownOpen(false);
    // Update placeholder based on operation
    if (op === "Insert") {
        // Placeholder logic handled by input field directly
    } else if (op === "Build Heap from Array") {
        // Placeholder logic handled by input field directly
    }
  };

  const currentAlgorithmInfo = algorithmInfo[operation] || {};

  const handleCreateSampleHeap = () => {
    stopAnimation();
    const { heap, steps } = createSampleHeap();
    setHeapArray(heap);
    setExtractedValue(null);
    if (steps && steps.length > 0) {
      // To show the initial state of the sample heap immediately
      setTree(steps[0].heap); 
      setCurrentStep(steps[0].description);
      setHighlightedTreeNodes(steps[0].highlightedNodes || []);
      // If you want to animate its creation (e.g. if heapify has steps)
      // animationState.current = { index: 0, results: steps };
      // setIsAnimating(true);
      // updateAnimation();
    } else {
      setTree(arrayToTree(heap)); // Fallback if no steps
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
      default:
        return "// Select an operation to view code";
    }
  };

  // Determine input placeholder based on current operation
  const getInputPlaceholder = () => {
    if (operation === "Insert") return "Enter a number (e.g., 10)";
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
        <div className="control-group">
          <div className="dropdown-container" ref={dropdownRef}>
            <button 
              className={`dropdown-button ${dropdownOpen ? 'open' : ''}`} 
              onClick={() => setDropdownOpen(prev => !prev)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              {operation}
            </button>
            <div className={`dropdown-menu ${dropdownOpen ? 'show' : ''}`}>
              <button onClick={() => handleOperationSelect("Insert")}>Insert</button>
              <button onClick={() => handleOperationSelect("Extract Min")}>Extract Min</button>
              <button onClick={() => handleOperationSelect("Build Heap from Array")}>Build Heap from Array</button>
            </div>
          </div>
          
          {["Insert", "Build Heap from Array"].includes(operation) && (
            <div className="input-group">
              <label>Value:</label>
              <input 
                type="text" 
                value={value} 
                onChange={handleValueChange} 
                placeholder={getInputPlaceholder()}
                maxLength={operation === "Insert" ? 3 : 100} // Adjust maxLength
              />
            </div>
          )}
        </div>
        
        <div className="action-buttons">
          <button className="action-button" onClick={handleOperation} disabled={isAnimating && !isPaused}>
            {isAnimating && !isPaused ? "Running..." : "Run"}
          </button>
          
          {isAnimating && (
            <button className="action-button" onClick={togglePause}>
              {isPaused ? "Resume" : "Pause"}
            </button>
          )}
          
          <button className="action-button" onClick={stopAnimation} disabled={!isAnimating}>
            Stop
          </button>
          
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
        
        <div className="control-group">
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
              <div className="shortcut-group"><h4>Operations</h4><div className="shortcut-item"><span className="shortcut-keys"><kbd>Enter</kbd></span><span className="shortcut-description">Run selected operation</span></div><div className="shortcut-item"><span className="shortcut-keys"><kbd>Space</kbd></span><span className="shortcut-description">Pause/resume animation</span></div><div className="shortcut-item"><span className="shortcut-keys"><kbd>Esc</kbd></span><span className="shortcut-description">Stop animation</span></div><div className="shortcut-item"><span className="shortcut-keys"><kbd>G</kbd></span><span className="shortcut-description">Create sample heap</span></div></div>
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
