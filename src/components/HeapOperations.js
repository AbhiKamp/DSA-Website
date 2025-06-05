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

// Heap Insert Operation (Min/Max Heap)
export const heapInsert = (originalHeapArray, value, heapType = 'min') => {
  const newHeapArray = [...originalHeapArray];
  newHeapArray.push(value);
  let currentIndex = newHeapArray.length - 1;
  let parentIndex = Math.floor((currentIndex - 1) / 2);

  const steps = [{
    heap: arrayToTree(newHeapArray),
    description: `Adding ${value} to the ${heapType}-heap.`,
    line: null,
    highlightedNodes: [currentIndex]
  }];

  const shouldSwap = (childVal, parentVal) => {
    if (heapType === 'min') return childVal < parentVal;
    return childVal > parentVal; // Max-heap
  };

  while (currentIndex > 0 && shouldSwap(newHeapArray[currentIndex], newHeapArray[parentIndex])) {
    const valBeingMovedUp = newHeapArray[currentIndex];
    const parentVal = newHeapArray[parentIndex];

    [newHeapArray[currentIndex], newHeapArray[parentIndex]] = [newHeapArray[parentIndex], newHeapArray[currentIndex]];

    steps.push({
      heap: arrayToTree(newHeapArray),
      description: `Sift-up (${heapType}-heap): Swapped ${valBeingMovedUp} (moving up) with its parent ${parentVal}.`,
      line: null,
      highlightedNodes: [currentIndex, parentIndex]
    });

    currentIndex = parentIndex;
    parentIndex = Math.floor((currentIndex - 1) / 2);
  }

  steps.push({
    heap: arrayToTree(newHeapArray),
    description: `${value} is in its correct position in the ${heapType}-heap.`,
    line: null,
    highlightedNodes: [currentIndex]
  });

  return { heap: newHeapArray, steps };
};

// Extract Top Operation (Min/Max Heap) - Renamed from extractMin
export const extractTop = (originalHeapArray, heapType = 'min') => {
  if (originalHeapArray.length === 0) {
    return {
      heap: [],
      steps: [{ heap: null, description: `Heap is empty, cannot extract ${heapType === 'min' ? 'min' : 'max'}.`, line: null, highlightedNodes: [] }],
      extractedValue: null
    };
  }

  const newHeapArray = [...originalHeapArray];
  const steps = [];
  const topValue = newHeapArray[0];

  steps.push({
    heap: arrayToTree(newHeapArray),
    description: `${heapType === 'min' ? 'Minimum' : 'Maximum'} value ${topValue} is at the root of the ${heapType}-heap.`,
    line: null,
    highlightedNodes: [0]
  });

  if (newHeapArray.length === 1) {
    newHeapArray.pop();
    steps.push({
      heap: arrayToTree(newHeapArray),
      description: `Removed ${topValue}. ${heapType}-heap is now empty.`,
      line: null,
      highlightedNodes: []
    });
    return { heap: newHeapArray, extractedValue: topValue, steps };
  }

  const lastElement = newHeapArray.pop();
  newHeapArray[0] = lastElement;
  steps.push({
    heap: arrayToTree(newHeapArray),
    description: `Moved last element ${lastElement} to the root. Original last element index was ${originalHeapArray.length -1}.`,
    line: null,
    highlightedNodes: [0, newHeapArray.length] // newHeapArray.length is the original index of the popped element
  });

  // Heapify down
  let currentIndex = 0;
  const n = newHeapArray.length;

  while (true) {
    let leftChildIndex = 2 * currentIndex + 1;
    let rightChildIndex = 2 * currentIndex + 2;
    let extremeChildIndex = currentIndex; // Will be smallest for min-heap, largest for max-heap

    if (heapType === 'min') {
      if (leftChildIndex < n && newHeapArray[leftChildIndex] < newHeapArray[extremeChildIndex]) {
        extremeChildIndex = leftChildIndex;
      }
      if (rightChildIndex < n && newHeapArray[rightChildIndex] < newHeapArray[extremeChildIndex]) {
        extremeChildIndex = rightChildIndex;
      }
    } else { // Max-heap
      if (leftChildIndex < n && newHeapArray[leftChildIndex] > newHeapArray[extremeChildIndex]) {
        extremeChildIndex = leftChildIndex;
      }
      if (rightChildIndex < n && newHeapArray[rightChildIndex] > newHeapArray[extremeChildIndex]) {
        extremeChildIndex = rightChildIndex;
      }
    }

    if (extremeChildIndex !== currentIndex) {
      const currentVal = newHeapArray[currentIndex];
      const extremeChildVal = newHeapArray[extremeChildIndex];
      steps.push({
        heap: arrayToTree(newHeapArray),
        description: `Sift-down (${heapType}-heap): Comparing ${currentVal} with children. Swapping ${currentVal} with ${heapType === 'min' ? 'smaller' : 'larger'} child ${extremeChildVal}.`,
        line: null,
        highlightedNodes: [currentIndex, extremeChildIndex, leftChildIndex, rightChildIndex].filter(idx => idx < n && idx >=0)
      });

      [newHeapArray[currentIndex], newHeapArray[extremeChildIndex]] = [newHeapArray[extremeChildIndex], newHeapArray[currentIndex]];

      steps.push({
        heap: arrayToTree(newHeapArray),
        description: `Sift-down (${heapType}-heap): Swapped. Element at index ${currentIndex} is now ${newHeapArray[currentIndex]}, element at index ${extremeChildIndex} is ${newHeapArray[extremeChildIndex]}.`,
        line: null,
        highlightedNodes: [currentIndex, extremeChildIndex]
      });
      currentIndex = extremeChildIndex;
    } else {
      break;
    }
  }

  steps.push({
    heap: arrayToTree(newHeapArray),
    description: `${heapType}-heap property restored. Extracted ${topValue}.`,
    line: null,
    highlightedNodes: [currentIndex]
  });

  return { heap: newHeapArray, extractedValue: topValue, steps };
};

// Heapify function (build heap from an arbitrary array)
export const heapify = (originalArray, heapType = 'min') => {
  const newHeapArray = [...originalArray];
  const steps = [{
    heap: arrayToTree(newHeapArray),
    description: `Initial array to be heapified into a ${heapType}-heap.`,
    line: null,
    highlightedNodes: []
  }];

  const n = newHeapArray.length;
  // Start from the last non-leaf node and heapify down
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    let currentIndex = i;
    steps.push({
        heap: arrayToTree(newHeapArray),
        description: `Sift-down (${heapType}-heap): Processing subtree rooted at index ${currentIndex} (value ${newHeapArray[currentIndex]}).`,
        line: null,
        highlightedNodes: [currentIndex]
    });

    while (true) {
      let leftChildIndex = 2 * currentIndex + 1;
      let rightChildIndex = 2 * currentIndex + 2;
      let extremeChildIndex = currentIndex;

      if (heapType === 'min') {
        if (leftChildIndex < n && newHeapArray[leftChildIndex] < newHeapArray[extremeChildIndex]) {
          extremeChildIndex = leftChildIndex;
        }
        if (rightChildIndex < n && newHeapArray[rightChildIndex] < newHeapArray[extremeChildIndex]) {
          extremeChildIndex = rightChildIndex;
        }
      } else { // Max-heap
        if (leftChildIndex < n && newHeapArray[leftChildIndex] > newHeapArray[extremeChildIndex]) {
          extremeChildIndex = leftChildIndex;
        }
        if (rightChildIndex < n && newHeapArray[rightChildIndex] > newHeapArray[extremeChildIndex]) {
          extremeChildIndex = rightChildIndex;
        }
      }

      if (extremeChildIndex !== currentIndex) {
        const currentVal = newHeapArray[currentIndex];
        const extremeChildVal = newHeapArray[extremeChildIndex];
        steps.push({
          heap: arrayToTree(newHeapArray),
          description: `Sift-down (${heapType}-heap): Comparing ${currentVal} with children. Swapping ${currentVal} with ${heapType === 'min' ? 'smaller' : 'larger'} child ${extremeChildVal}.`,
          line: null,
          highlightedNodes: [currentIndex, extremeChildIndex, leftChildIndex, rightChildIndex].filter(idx => idx < n && idx >=0)
        });

        [newHeapArray[currentIndex], newHeapArray[extremeChildIndex]] = [newHeapArray[extremeChildIndex], newHeapArray[currentIndex]];

        steps.push({
          heap: arrayToTree(newHeapArray),
          description: `Sift-down (${heapType}-heap): Swapped. Element at index ${currentIndex} is now ${newHeapArray[currentIndex]}, element at index ${extremeChildIndex} is ${newHeapArray[extremeChildIndex]}.`,
          line: null,
          highlightedNodes: [currentIndex, extremeChildIndex]
        });
        currentIndex = extremeChildIndex;
      } else {
        break;
      }
    }
     steps.push({
        heap: arrayToTree(newHeapArray),
        description: `Sift-down (${heapType}-heap): Subtree at index ${i} (value ${newHeapArray[i]}) is now heapified.`,
        line: null,
        highlightedNodes: [i]
    });
  }

  steps.push({
    heap: arrayToTree(newHeapArray),
    description: `${heapType}-heap construction complete.`,
    line: null,
    highlightedNodes: []
  });

  return { heap: newHeapArray, steps };
};

// Function to create a sample heap for demonstration (always creates a min-heap)
export const createSampleHeap = () => {
  const sampleArray = [4, 10, 3, 5, 1, 15, 7];
  // heapify defaults to 'min'
  const { heap, steps: heapifySteps } = heapify(sampleArray);

  const steps = [{
    heap: arrayToTree(heap),
    description: "Created a sample min-heap.", // Explicitly states min-heap
    line: null,
    highlightedNodes: []
  }];

  return { heap, steps };
};

// Heap Delete Operation (Min/Max Heap)
export const heapDelete = (originalHeapArray, valueToDelete, heapType = 'min') => {
  const workingHeapArray = [...originalHeapArray];
  const steps = [];

  if (workingHeapArray.length === 0) {
    return {
      heap: [],
      steps: [{ heap: null, description: "Heap is empty. Cannot delete.", highlightedNodes: [] }],
      deletedValue: null
    };
  }

  const idxToDelete = workingHeapArray.indexOf(valueToDelete);

  if (idxToDelete === -1) {
    return {
      heap: workingHeapArray,
      steps: [{ heap: arrayToTree(workingHeapArray), description: `Value ${valueToDelete} not found in ${heapType}-heap.`, highlightedNodes: [] }],
      deletedValue: null
    };
  }

  steps.push({
    heap: arrayToTree([...workingHeapArray]),
    description: `Targeting value ${valueToDelete} at index ${idxToDelete} for deletion from ${heapType}-heap.`,
    highlightedNodes: [idxToDelete]
  });

  const originalLength = workingHeapArray.length;
  const lastElement = workingHeapArray[originalLength - 1];

  if (idxToDelete === originalLength - 1) {
    workingHeapArray.pop();
    steps.push({
      heap: arrayToTree([...workingHeapArray]),
      description: `Value ${valueToDelete} is the last element. Removed it.`,
      highlightedNodes: []
    });
  } else {
    workingHeapArray[idxToDelete] = lastElement;
    steps.push({
      heap: arrayToTree(workingHeapArray.slice(0, originalLength)),
      description: `Replaced ${valueToDelete} at index ${idxToDelete} with last element ${lastElement} (from index ${originalLength-1}).`,
      highlightedNodes: [idxToDelete, originalLength - 1]
    });

    workingHeapArray.pop();
    steps.push({
      heap: arrayToTree([...workingHeapArray]),
      description: `Removed original last element from end. ${heapType}-heap size is now ${workingHeapArray.length}. Element at index ${idxToDelete} is now ${workingHeapArray[idxToDelete]}.`,
      highlightedNodes: [idxToDelete]
    });

    let currentIndex = idxToDelete;
    let parentIndex = Math.floor((currentIndex - 1) / 2);

    const shouldSiftUp = (childVal, parentVal) => {
      if (heapType === 'min') return childVal < parentVal;
      return childVal > parentVal; // Max-heap
    };

    if (currentIndex > 0 && shouldSiftUp(workingHeapArray[currentIndex], workingHeapArray[parentIndex])) {
      steps.push({
        heap: arrayToTree([...workingHeapArray]),
        description: `Value ${workingHeapArray[currentIndex]} at index ${currentIndex} might need sift-up in ${heapType}-heap. Comparing with parent ${workingHeapArray[parentIndex]}.`,
        highlightedNodes: [currentIndex, parentIndex]
      });
      while (currentIndex > 0 && shouldSiftUp(workingHeapArray[currentIndex], workingHeapArray[parentIndex])) {
        const valBeingMovedUp = workingHeapArray[currentIndex];
        const currentParentVal = workingHeapArray[parentIndex];
        [workingHeapArray[currentIndex], workingHeapArray[parentIndex]] = [workingHeapArray[parentIndex], workingHeapArray[currentIndex]];
        steps.push({
          heap: arrayToTree([...workingHeapArray]),
          description: `Sift-up (${heapType}-heap): Swapped ${valBeingMovedUp} with parent ${currentParentVal}.`,
          highlightedNodes: [currentIndex, parentIndex]
        });
        currentIndex = parentIndex;
        parentIndex = Math.floor((currentIndex - 1) / 2);
      }
      steps.push({
          heap: arrayToTree([...workingHeapArray]),
          description: `Sift-up (${heapType}-heap) complete. Element ${workingHeapArray[currentIndex]} is in position.`,
          highlightedNodes: [currentIndex]
      });
    } else {
      steps.push({
        heap: arrayToTree([...workingHeapArray]),
        description: `Value ${workingHeapArray[currentIndex]} at index ${currentIndex} did not move up. Checking sift-down for ${heapType}-heap.`,
        highlightedNodes: [currentIndex]
      });

      let currentIdxDown = currentIndex;
      const n = workingHeapArray.length;
      while (true) {
        let leftChildIndex = 2 * currentIdxDown + 1;
        let rightChildIndex = 2 * currentIdxDown + 2;
        let extremeChildIndex = currentIdxDown;

        if (heapType === 'min') {
          if (leftChildIndex < n && workingHeapArray[leftChildIndex] < workingHeapArray[extremeChildIndex]) {
            extremeChildIndex = leftChildIndex;
          }
          if (rightChildIndex < n && workingHeapArray[rightChildIndex] < workingHeapArray[extremeChildIndex]) {
            extremeChildIndex = rightChildIndex;
          }
        } else { // Max-heap
          if (leftChildIndex < n && workingHeapArray[leftChildIndex] > workingHeapArray[extremeChildIndex]) {
            extremeChildIndex = leftChildIndex;
          }
          if (rightChildIndex < n && workingHeapArray[rightChildIndex] > workingHeapArray[extremeChildIndex]) {
            extremeChildIndex = rightChildIndex;
          }
        }

        if (extremeChildIndex !== currentIdxDown) {
          const currentVal = workingHeapArray[currentIdxDown];
          const extremeChildVal = workingHeapArray[extremeChildIndex];
          steps.push({
            heap: arrayToTree([...workingHeapArray]),
            description: `Sift-down (${heapType}-heap): Comparing ${currentVal} with children. Swapping ${currentVal} with ${heapType === 'min' ? 'smaller' : 'larger'} child ${extremeChildVal}.`,
            highlightedNodes: [currentIdxDown, extremeChildIndex, leftChildIndex, rightChildIndex].filter(idx => idx < n && idx >=0)
          });
          [workingHeapArray[currentIdxDown], workingHeapArray[extremeChildIndex]] = [workingHeapArray[extremeChildIndex], workingHeapArray[currentIdxDown]];
          steps.push({
            heap: arrayToTree([...workingHeapArray]),
            description: `Sift-down (${heapType}-heap): Swapped. Element at ${currentIdxDown} is now ${workingHeapArray[currentIdxDown]}, element at ${extremeChildIndex} is ${workingHeapArray[extremeChildIndex]}.`,
            highlightedNodes: [currentIdxDown, extremeChildIndex]
          });
          currentIdxDown = extremeChildIndex;
        } else {
          break;
        }
      }
      steps.push({
          heap: arrayToTree([...workingHeapArray]),
          description: `Sift-down (${heapType}-heap) complete for element originally at index ${idxToDelete}. Current position: ${currentIdxDown}.`,
          highlightedNodes: [currentIdxDown]
      });
    }
  }

  steps.push({
    heap: arrayToTree(workingHeapArray),
    description: `Deletion of ${valueToDelete} from ${heapType}-heap complete. Property restored.`,
    highlightedNodes: []
  });

  return { heap: workingHeapArray, steps, deletedValue: valueToDelete };
};
