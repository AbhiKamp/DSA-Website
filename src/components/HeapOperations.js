// src/components/HeapOperations.js

// Helper function to convert an array-based heap to a tree structure for react-d3-tree
export const arrayToTree = (heapArray) => {
  if (!heapArray || heapArray.length === 0) {
    return null;
  }

  const nodes = heapArray.map((value, index) => ({
    name: value.toString(),
    id: index, // Keep track of original index for linking
    children: [],
    attributes: { value }, // Store original value if needed
  }));

  // Link nodes based on heap property (parent-child relationship)
  for (let i = 0; i < heapArray.length; i++) {
    const leftChildIndex = 2 * i + 1;
    const rightChildIndex = 2 * i + 2;

    if (leftChildIndex < heapArray.length && nodes[leftChildIndex]) {
      nodes[i].children.push(nodes[leftChildIndex]);
    }
    if (rightChildIndex < heapArray.length && nodes[rightChildIndex]) {
      nodes[i].children.push(nodes[rightChildIndex]);
    }
  }
  return nodes[0]; // Return the root node
};

// Min-Heap Operations
export const heapInsert = (heapArray, value) => {
  const newHeapArray = [...heapArray];
  newHeapArray.push(value);
  let currentIndex = newHeapArray.length - 1;
  let parentIndex = Math.floor((currentIndex - 1) / 2);

  const steps = [{
    heap: arrayToTree(newHeapArray), // Initial state with new value added
    description: `Adding ${value} to the heap.`,
    line: null, // Placeholder for line numbers in visualizer
    highlightedNodes: [currentIndex]
  }];

  while (currentIndex > 0 && newHeapArray[currentIndex] < newHeapArray[parentIndex]) {
    // Swap
    [newHeapArray[currentIndex], newHeapArray[parentIndex]] = [newHeapArray[parentIndex], newHeapArray[currentIndex]];
    
    steps.push({
      heap: arrayToTree(newHeapArray),
      description: `Swapping ${newHeapArray[currentIndex]} (child) with ${newHeapArray[parentIndex]} (parent).`,
      line: null,
      highlightedNodes: [currentIndex, parentIndex]
    });

    currentIndex = parentIndex;
    parentIndex = Math.floor((currentIndex - 1) / 2);
  }

  steps.push({
    heap: arrayToTree(newHeapArray),
    description: `${value} is in its correct position.`,
    line: null,
    highlightedNodes: [currentIndex]
  });
  
  return { heap: newHeapArray, steps };
};

export const extractMin = (heapArray) => {
  if (heapArray.length === 0) {
    return { heap: [], steps: [{ heap: null, description: "Heap is empty, cannot extract min.", line: null }] };
  }

  const newHeapArray = [...heapArray];
  const steps = [];
  const min = newHeapArray[0];

  steps.push({
    heap: arrayToTree(newHeapArray),
    description: `Minimum value ${min} is at the root.`,
    line: null,
    highlightedNodes: [0]
  });

  if (newHeapArray.length === 1) {
    newHeapArray.pop();
    steps.push({
      heap: arrayToTree(newHeapArray),
      description: `Removed ${min}. Heap is now empty.`,
      line: null,
    });
    return { heap: newHeapArray, extractedMin: min, steps };
  }

  // Move the last element to the root
  newHeapArray[0] = newHeapArray.pop();
  steps.push({
    heap: arrayToTree(newHeapArray),
    description: `Moved last element ${newHeapArray[0]} to the root.`,
    line: null,
    highlightedNodes: [0]
  });

  // Heapify down
  let currentIndex = 0;
  while (true) {
    let leftChildIndex = 2 * currentIndex + 1;
    let rightChildIndex = 2 * currentIndex + 2;
    let smallestChildIndex = currentIndex;

    if (leftChildIndex < newHeapArray.length && newHeapArray[leftChildIndex] < newHeapArray[smallestChildIndex]) {
      smallestChildIndex = leftChildIndex;
    }
    if (rightChildIndex < newHeapArray.length && newHeapArray[rightChildIndex] < newHeapArray[smallestChildIndex]) {
      smallestChildIndex = rightChildIndex;
    }

    if (smallestChildIndex !== currentIndex) {
      steps.push({
        heap: arrayToTree(newHeapArray),
        description: `Comparing ${newHeapArray[currentIndex]} with children ${newHeapArray[leftChildIndex] !== undefined ? newHeapArray[leftChildIndex] : ''} ${newHeapArray[rightChildIndex] !== undefined ? newHeapArray[rightChildIndex] : ''}. Swapping ${newHeapArray[currentIndex]} with ${newHeapArray[smallestChildIndex]}.`,
        line: null,
        highlightedNodes: [currentIndex, smallestChildIndex, leftChildIndex, rightChildIndex].filter(idx => idx < newHeapArray.length)
      });

      [newHeapArray[currentIndex], newHeapArray[smallestChildIndex]] = [newHeapArray[smallestChildIndex], newHeapArray[currentIndex]];
      
      steps.push({
        heap: arrayToTree(newHeapArray),
        description: `Swapped ${newHeapArray[smallestChildIndex]} with ${newHeapArray[currentIndex]}.`,
        line: null,
        highlightedNodes: [currentIndex, smallestChildIndex]
      });
      currentIndex = smallestChildIndex;
    } else {
      break; // Heap property is restored
    }
  }

  steps.push({
    heap: arrayToTree(newHeapArray),
    description: `Heap property restored. Extracted ${min}.`,
    line: null,
    highlightedNodes: [currentIndex]
  });

  return { heap: newHeapArray, extractedMin: min, steps };
};

// Heapify function (build heap from an arbitrary array)
export const heapify = (array) => {
  const newHeapArray = [...array];
  const steps = [{
    heap: arrayToTree(newHeapArray), // Initial array before heapify
    description: "Initial array to be heapified.",
    line: null,
  }];

  const n = newHeapArray.length;
  // Start from the last non-leaf node and heapify down
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    let currentIndex = i;
    steps.push({
        heap: arrayToTree(newHeapArray),
        description: `Heapifying subtree rooted at index ${currentIndex} (value ${newHeapArray[currentIndex]}).`,
        line: null,
        highlightedNodes: [currentIndex]
    });

    while (true) {
      let leftChildIndex = 2 * currentIndex + 1;
      let rightChildIndex = 2 * currentIndex + 2;
      let smallestChildIndex = currentIndex;

      if (leftChildIndex < n && newHeapArray[leftChildIndex] < newHeapArray[smallestChildIndex]) {
        smallestChildIndex = leftChildIndex;
      }
      if (rightChildIndex < n && newHeapArray[rightChildIndex] < newHeapArray[smallestChildIndex]) {
        smallestChildIndex = rightChildIndex;
      }

      if (smallestChildIndex !== currentIndex) {
        steps.push({
          heap: arrayToTree(newHeapArray),
          description: `Comparing ${newHeapArray[currentIndex]} with children. Swapping ${newHeapArray[currentIndex]} with ${newHeapArray[smallestChildIndex]}.`,
          line: null,
          highlightedNodes: [currentIndex, smallestChildIndex, leftChildIndex, rightChildIndex].filter(idx => idx < newHeapArray.length)
        });

        [newHeapArray[currentIndex], newHeapArray[smallestChildIndex]] = [newHeapArray[smallestChildIndex], newHeapArray[currentIndex]];
        
        steps.push({
          heap: arrayToTree(newHeapArray),
          description: `Swapped. Current node is ${newHeapArray[smallestChildIndex]}.`,
          line: null,
          highlightedNodes: [currentIndex, smallestChildIndex]
        });
        currentIndex = smallestChildIndex; // Continue heapifying down from the swapped child
      } else {
        break; // Subtree is heapified
      }
    }
     steps.push({
        heap: arrayToTree(newHeapArray),
        description: `Subtree at index ${i} (value ${newHeapArray[i]}) is now heapified.`,
        line: null,
        highlightedNodes: [i]
    });
  }

  steps.push({
    heap: arrayToTree(newHeapArray),
    description: "Heap construction complete.",
    line: null,
  });

  return { heap: newHeapArray, steps };
};

// Function to create a sample heap for demonstration
export const createSampleHeap = () => {
  const sampleArray = [4, 10, 3, 5, 1, 15, 7]; // An example array
  const { heap, steps: heapifySteps } = heapify(sampleArray); // Heapify it
  
  // The initial step for createSampleHeap should show the final heapified array
  const steps = [{
    heap: arrayToTree(heap),
    description: "Created a sample min-heap.",
    line: null,
    highlightedNodes: [] // Optionally highlight the root or all nodes
  }];
  
  return { heap, steps };
};
