import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contractConfig.js";

export default function App() {
  const [account, setAccount] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false); // new loading state

  // Connect wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    } else {
      alert("Please install MetaMask!");
    }
  };

  // Load tasks
  const loadTasks = async () => {
    if (!window.ethereum) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      provider
    );

    const taskCount = await contract.taskCount();
    const loadedTasks = [];
    for (let i = 1; i <= taskCount; i++) {
      const task = await contract.tasks(i);
      loadedTasks.push(task);
    }
    setTasks(loadedTasks.reverse());
  };

  // Add task
  const addTask = async () => {
    if (!input) return;
    setLoading(true); // start loading
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );

    const tx = await contract.createTask(input);
    await tx.wait(); // wait for transaction confirmation
    setInput("");
    setLoading(false); // stop loading
    loadTasks();
  };

  // Toggle task
  const toggleTask = async (id) => {
    setLoading(true);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );

    const tx = await contract.toggleTask(id);
    await tx.wait();
    setLoading(false);
    loadTasks();
  };

  useEffect(() => {
    if (account) {
      loadTasks();
    }
  }, [account]);

  // Skeleton loader component
  const TaskSkeleton = () => (
    <div className="animate-pulse flex justify-between items-center p-4 bg-gray-700 rounded-2xl shadow-lg">
      <div className="h-6 bg-gray-500 rounded w-3/4"></div>
      <div className="h-6 w-20 bg-gray-500 rounded"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 text-white flex flex-col items-center p-6">
      {/* Navbar */}
      <nav className="w-full max-w-5xl flex justify-between items-center mb-8 py-4 px-6 bg-gray-900/70 rounded-xl shadow-lg backdrop-blur-sm">
        <h1 className="text-3xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-400">
          Etherlist
        </h1>
        {account ? (
          <span className="px-4 py-2 bg-indigo-600 rounded-full text-sm font-medium truncate max-w-[200px]">
            {account}
          </span>
        ) : (
          <button
            onClick={connectWallet}
            className="px-4 py-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl text-sm font-semibold shadow-md hover:scale-105 transition-transform"
          >
            Connect Wallet
          </button>
        )}
      </nav>

      {/* Input Section */}
      {account && (
        <div className="w-full max-w-2xl flex flex-col gap-6">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl text-black placeholder-gray-500 font-medium 
             focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1 
             focus:text-white transition-all bg-white/10 backdrop-blur-sm"
              placeholder="Add a new task..."
              disabled={loading} // disable input while loading
            />
            <button
              onClick={addTask}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-yellow-400 rounded-xl font-semibold hover:scale-105 transition-transform shadow-md disabled:opacity-50"
              disabled={loading} // disable button while loading
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>

          {/* Task List */}
          <ul className="flex flex-col gap-4">
            {loading && <TaskSkeleton />}
            {!loading && tasks.length === 0 && (
              <p className="text-gray-300 text-center mt-4">
                No tasks yet. Add your first task! ✨
              </p>
            )}
            {!loading &&
              tasks.map((task, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-2xl shadow-lg hover:scale-105 transition-transform"
                >
                  <span
                    className={`text-lg font-medium break-words ${
                      task.completed ? "line-through text-gray-400" : "text-white"
                    }`}
                  >
                    {task.content}
                  </span>
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`px-4 py-2 rounded-lg font-semibold shadow-md ${
                      task.completed
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    } transition-colors`}
                  >
                    {task.completed ? "Undo" : "Done"}
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
