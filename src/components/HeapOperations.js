
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

  const steps = [
    {
      heap: arrayToTree(newHeapArray), // Initial state with new value added
      description: `Adding ${value} to the heap.`,
      line: null, // Placeholder for line numbers in visualizer
      highlightedNodes: [currentIndex],
    },
  ];

  while (
    currentIndex > 0 &&
    newHeapArray[currentIndex] < newHeapArray[parentIndex]
  ) {
    // Swap
    [newHeapArray[currentIndex], newHeapArray[parentIndex]] = [
      newHeapArray[parentIndex],
      newHeapArray[currentIndex],
    ];

    steps.push({
      heap: arrayToTree(newHeapArray),
      description: `Swapping ${newHeapArray[currentIndex]} (child) with ${newHeapArray[parentIndex]} (parent).`,
      line: null,
      highlightedNodes: [currentIndex, parentIndex],
    });

    currentIndex = parentIndex;
    parentIndex = Math.floor((currentIndex - 1) / 2);
  }

  steps.push({
    heap: arrayToTree(newHeapArray),
    description: `${value} is in its correct position.`,
    line: null,
    highlightedNodes: [currentIndex],
  });

  return { heap: newHeapArray, steps };
};

export const extractMin = (heapArray) => {
  if (heapArray.length === 0) {
    return {
      heap: [],
      steps: [
        {
          heap: null,
          description: "Heap is empty, cannot extract min.",
          line: null,
          highlightedNodes: [],
        },
      ],
    };
  }

  const newHeapArray = [...heapArray];
  const steps = [];
  const min = newHeapArray[0];

  steps.push({
    heap: arrayToTree(newHeapArray),
    description: `Minimum value ${min} is at the root.`,
    line: null,
    highlightedNodes: [0],
  });

  if (newHeapArray.length === 1) {
    newHeapArray.pop();
    steps.push({
      heap: arrayToTree(newHeapArray),
      description: `Removed ${min}. Heap is now empty.`,
      line: null,
      highlightedNodes: [],
    });
    return { heap: newHeapArray, extractedMin: min, steps };
  }

  // Move the last element to the root
  newHeapArray[0] = newHeapArray.pop();
  steps.push({
    heap: arrayToTree(newHeapArray),
    description: `Moved last element ${newHeapArray[0]} to the root.`,
    line: null,
    highlightedNodes: [0, newHeapArray.length], // Highlight original position of last element too
  });

  // Heapify down
  let currentIndex = 0;
  while (true) {
    let leftChildIndex = 2 * currentIndex + 1;
    let rightChildIndex = 2 * currentIndex + 2;
    let smallestChildIndex = currentIndex;

    if (
      leftChildIndex < newHeapArray.length &&
      newHeapArray[leftChildIndex] < newHeapArray[smallestChildIndex]
    ) {
      smallestChildIndex = leftChildIndex;
    }
    if (
      rightChildIndex < newHeapArray.length &&
      newHeapArray[rightChildIndex] < newHeapArray[smallestChildIndex]
    ) {
      smallestChildIndex = rightChildIndex;
    }

    if (smallestChildIndex !== currentIndex) {
      steps.push({
        heap: arrayToTree(newHeapArray),
        description: `Comparing ${newHeapArray[currentIndex]} with children ${
          newHeapArray[leftChildIndex] !== undefined
            ? newHeapArray[leftChildIndex]
            : ""
        } ${
          newHeapArray[rightChildIndex] !== undefined
            ? newHeapArray[rightChildIndex]
            : ""
        }. Swapping ${newHeapArray[currentIndex]} with ${
          newHeapArray[smallestChildIndex]
        }.`,
        line: null,
        highlightedNodes: [
          currentIndex,
          smallestChildIndex,
          leftChildIndex,
          rightChildIndex,
        ].filter((idx) => idx < newHeapArray.length && idx >= 0),
      });

      [newHeapArray[currentIndex], newHeapArray[smallestChildIndex]] = [
        newHeapArray[smallestChildIndex],
        newHeapArray[currentIndex],
      ];

      steps.push({
        heap: arrayToTree(newHeapArray),
        description: `Swapped ${newHeapArray[smallestChildIndex]} with ${newHeapArray[currentIndex]}.`,
        line: null,
        highlightedNodes: [currentIndex, smallestChildIndex],
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
    highlightedNodes: [currentIndex],
  });

  return { heap: newHeapArray, extractedMin: min, steps };
};

// Heapify function (build heap from an arbitrary array)
export const heapify = (array) => {
  const newHeapArray = [...array];
  const steps = [
    {
      heap: arrayToTree(newHeapArray), // Initial array before heapify
      description: "Initial array to be heapified.",
      line: null,
      highlightedNodes: [],
    },
  ];

  const n = newHeapArray.length;
  // Start from the last non-leaf node and heapify down
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    let currentIndex = i;
    steps.push({
      heap: arrayToTree(newHeapArray),
      description: `Heapifying subtree rooted at index ${currentIndex} (value ${newHeapArray[currentIndex]}).`,
      line: null,
      highlightedNodes: [currentIndex],
    });

    while (true) {
      let leftChildIndex = 2 * currentIndex + 1;
      let rightChildIndex = 2 * currentIndex + 2;
      let smallestChildIndex = currentIndex;

      if (
        leftChildIndex < n &&
        newHeapArray[leftChildIndex] < newHeapArray[smallestChildIndex]
      ) {
        smallestChildIndex = leftChildIndex;
      }
      if (
        rightChildIndex < n &&
        newHeapArray[rightChildIndex] < newHeapArray[smallestChildIndex]
      ) {
        smallestChildIndex = rightChildIndex;
      }

      if (smallestChildIndex !== currentIndex) {
        steps.push({
          heap: arrayToTree(newHeapArray),
          description: `Comparing ${newHeapArray[currentIndex]} with children. Swapping ${newHeapArray[currentIndex]} with ${newHeapArray[smallestChildIndex]}.`,
          line: null,
          highlightedNodes: [
            currentIndex,
            smallestChildIndex,
            leftChildIndex,
            rightChildIndex,
          ].filter((idx) => idx < n && idx >= 0),
        });

        [newHeapArray[currentIndex], newHeapArray[smallestChildIndex]] = [
          newHeapArray[smallestChildIndex],
          newHeapArray[currentIndex],
        ];

        steps.push({
          heap: arrayToTree(newHeapArray),
          description: `Swapped. Current node is ${newHeapArray[smallestChildIndex]}.`, // This description is a bit off, current node is newHeapArray[currentIndex]
          line: null,
          highlightedNodes: [currentIndex, smallestChildIndex],
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
      highlightedNodes: [i],
    });
  }

  steps.push({
    heap: arrayToTree(newHeapArray),
    description: "Heap construction complete.",
    line: null,
    highlightedNodes: [],
  });

  return { heap: newHeapArray, steps };
};

// Function to create a sample heap for demonstration
export const createSampleHeap = () => {
  const sampleArray = [4, 10, 3, 5, 1, 15, 7]; // An example array
  const { heap, steps: heapifySteps } = heapify(sampleArray); // Heapify it

  const steps = [
    {
      heap: arrayToTree(heap),
      description: "Created a sample min-heap.",
      line: null,
      highlightedNodes: [],
    },
  ];

  return { heap, steps };
};

// Min-Heap Delete Operation
export const heapDelete = (heapArray, valueToDelete) => {
  const workingHeapArray = [...heapArray]; // Use a mutable copy for operations
  const steps = [];

  if (workingHeapArray.length === 0) {
    return {
      heap: [],
      steps: [
        {
          heap: null,
          description: "Heap is empty. Cannot delete.",
          highlightedNodes: [],
        },
      ],
      deletedValue: null,
    };
  }

  const idxToDelete = workingHeapArray.indexOf(valueToDelete);

  if (idxToDelete === -1) {
    return {
      heap: workingHeapArray,
      steps: [
        {
          heap: arrayToTree(workingHeapArray),
          description: `Value ${valueToDelete} not found in heap.`,
          highlightedNodes: [],
        },
      ],
      deletedValue: null,
    };
  }

  steps.push({
    heap: arrayToTree([...workingHeapArray]), // Show initial state before modification for this step
    description: `Targeting value ${valueToDelete} at index ${idxToDelete} for deletion.`,
    highlightedNodes: [idxToDelete],
  });

  const originalLength = workingHeapArray.length;
  const lastElement = workingHeapArray[originalLength - 1];

  // If the element to delete is the last element
  if (idxToDelete === originalLength - 1) {
    workingHeapArray.pop();
    steps.push({
      heap: arrayToTree([...workingHeapArray]),
      description: `Value ${valueToDelete} is the last element. Removed it.`,
      highlightedNodes: [], // No specific node to highlight after removal, or highlight parent if meaningful
    });
  } else {
    // Replace the element to delete with the last element
    workingHeapArray[idxToDelete] = lastElement;
    steps.push({
      // Show state after replacement but before pop
      heap: arrayToTree(workingHeapArray.slice(0, originalLength)), // Visualize with last element still notionally at end
      description: `Replaced ${valueToDelete} at index ${idxToDelete} with last element ${lastElement} (from index ${
        originalLength - 1
      }).`,
      highlightedNodes: [idxToDelete, originalLength - 1],
    });

    // Remove the last element
    workingHeapArray.pop();
    steps.push({
      heap: arrayToTree([...workingHeapArray]),
      description: `Removed original last element from end. Heap size is now ${workingHeapArray.length}. Element at index ${idxToDelete} is now ${workingHeapArray[idxToDelete]}.`,
      highlightedNodes: [idxToDelete],
    });

    // Heapify:
    // The element at idxToDelete might be smaller than its parent (needs sift-up)
    // or larger than its children (needs sift-down).

    let currentIndex = idxToDelete;
    let parentIndex = Math.floor((currentIndex - 1) / 2);

    // Try Sift-Up
    if (
      currentIndex > 0 &&
      workingHeapArray[currentIndex] < workingHeapArray[parentIndex]
    ) {
      steps.push({
        heap: arrayToTree([...workingHeapArray]),
        description: `Value ${workingHeapArray[currentIndex]} at index ${currentIndex} is smaller than parent ${workingHeapArray[parentIndex]} at index ${parentIndex}. Starting sift-up.`,
        highlightedNodes: [currentIndex, parentIndex],
      });
      while (
        currentIndex > 0 &&
        workingHeapArray[currentIndex] < workingHeapArray[parentIndex]
      ) {
        [workingHeapArray[currentIndex], workingHeapArray[parentIndex]] = [
          workingHeapArray[parentIndex],
          workingHeapArray[currentIndex],
        ];
        steps.push({
          heap: arrayToTree([...workingHeapArray]),
          description: `Swapped ${workingHeapArray[parentIndex]} (now at ${currentIndex}) with ${workingHeapArray[currentIndex]} (now at ${parentIndex}).`,
          highlightedNodes: [currentIndex, parentIndex],
        });
        currentIndex = parentIndex;
        parentIndex = Math.floor((currentIndex - 1) / 2);
      }
      steps.push({
        heap: arrayToTree([...workingHeapArray]),
        description: `Sift-up complete. Element ${workingHeapArray[currentIndex]} is in position.`,
        highlightedNodes: [currentIndex],
      });
    } else {
      // Try Sift-Down
      // No sift-up needed or possible, so check for sift-down
      steps.push({
        heap: arrayToTree([...workingHeapArray]),
        description: `Value ${workingHeapArray[currentIndex]} at index ${currentIndex} did not move up. Checking sift-down.`,
        highlightedNodes: [currentIndex],
      });

      let currentIdxDown = currentIndex;
      while (true) {
        let leftChildIndex = 2 * currentIdxDown + 1;
        let rightChildIndex = 2 * currentIdxDown + 2;
        let smallestChildIndex = currentIdxDown; // Assume current is smallest

        if (
          leftChildIndex < workingHeapArray.length &&
          workingHeapArray[leftChildIndex] <
            workingHeapArray[smallestChildIndex]
        ) {
          smallestChildIndex = leftChildIndex;
        }
        if (
          rightChildIndex < workingHeapArray.length &&
          workingHeapArray[rightChildIndex] <
            workingHeapArray[smallestChildIndex]
        ) {
          smallestChildIndex = rightChildIndex;
        }

        if (smallestChildIndex !== currentIdxDown) {
          steps.push({
            heap: arrayToTree([...workingHeapArray]),
            description: `Comparing ${workingHeapArray[currentIdxDown]} with children. Swapping ${workingHeapArray[currentIdxDown]} with ${workingHeapArray[smallestChildIndex]}.`,
            highlightedNodes: [
              currentIdxDown,
              smallestChildIndex,
              leftChildIndex,
              rightChildIndex,
            ].filter((idx) => idx < workingHeapArray.length && idx >= 0),
          });
          [
            workingHeapArray[currentIdxDown],
            workingHeapArray[smallestChildIndex],
          ] = [
            workingHeapArray[smallestChildIndex],
            workingHeapArray[currentIdxDown],
          ];
          steps.push({
            heap: arrayToTree([...workingHeapArray]),
            description: `Swapped. Element at ${currentIdxDown} is now ${workingHeapArray[currentIdxDown]}, element at ${smallestChildIndex} is ${workingHeapArray[smallestChildIndex]}.`,
            highlightedNodes: [currentIdxDown, smallestChildIndex],
          });
          currentIdxDown = smallestChildIndex; // Move down to the smallest child's position
        } else {
          break; // Heap property is locally satisfied for this path
        }
      }
      // Only add this step if a sift-down actually happened and changed currentIdxDown's position
      if (currentIdxDown !== currentIndex) {
        steps.push({
          heap: arrayToTree([...workingHeapArray]),
          description: `Sift-down complete. Element ${workingHeapArray[currentIdxDown]} is in position.`,
          highlightedNodes: [currentIdxDown],
        });
      } else {
        steps.push({
          heap: arrayToTree([...workingHeapArray]),
          description: `No sift-down needed. Element ${workingHeapArray[currentIndex]} is in correct position.`,
          highlightedNodes: [currentIndex],
        });
      }
    }
  }

  steps.push({
    heap: arrayToTree(workingHeapArray),
    description: `Deletion of ${valueToDelete} complete. Heap property restored.`,
    highlightedNodes: [],
  });

  return { heap: workingHeapArray, steps, deletedValue: valueToDelete };
};
