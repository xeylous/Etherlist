import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contractConfig.js";

import About from "./components/About.jsx";

export default function App() {
  const [account, setAccount] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState(null);

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

  // Change wallet
  const changeWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        });
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        loadTasks();
      } catch (error) {
        console.error("Wallet change rejected:", error);
      }
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setTasks([]);
  };

  // Load tasks
  const loadTasks = async () => {
    if (!window.ethereum) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
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

    const pendingTasks = loadedTasks.filter((t) => !t.completed);
    setTasks(pendingTasks.reverse());
  };

  // Add task
  const addTask = async () => {
    if (!input) return;
    setLoading(true);
    setAction("add");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );

    const tx = await contract.createTask(input);
    await tx.wait();
    setInput("");
    setLoading(false);
    setAction(null);
    loadTasks();
  };

  // Toggle task
  const toggleTask = async (id) => {
    setLoading(true);
    setAction("done");
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
    setAction(null);
    loadTasks();
  };

  useEffect(() => {
    if (account) {
      loadTasks();
    }

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          loadTasks();
        } else {
          disconnectWallet();
        }
      });
    }
  }, [account]);

  // Skeleton Loader
  const TaskSkeleton = () => (
    <div className="animate-pulse flex justify-between items-center p-4 bg-gray-700 rounded-2xl shadow-lg">
      <div className="h-6 bg-gray-500 rounded w-3/4"></div>
      <div className="h-6 w-20 bg-gray-500 rounded"></div>
    </div>
  );

  const formatTime = (ts) => {
    if (!ts) return "";
    const date = new Date(Number(ts) * 1000);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 text-white">
      <div className="flex flex-col items-center p-4 sm:p-6">
        {/* Navbar */}
        <nav className="w-full max-w-6xl flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 mb-8 py-4 px-6 bg-gray-900/70 rounded-xl shadow-lg backdrop-blur-sm">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-400">
            Etherlist
          </h1>

          {account ? (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <span className="px-3 py-2 bg-indigo-600 rounded-full text-xs sm:text-sm font-medium truncate max-w-[200px] text-center sm:text-left">
                {account}
              </span>
              <div className="flex flex-row gap-3">
                <button
                  onClick={changeWallet}
                  className="px-3 py-2 bg-blue-500 rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-600 transition-colors"
                >
                  Change
                </button>
                <button
                  onClick={disconnectWallet}
                  className="px-3 py-2 bg-red-500 rounded-lg text-xs sm:text-sm font-semibold hover:bg-red-600 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="px-4 py-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl text-sm sm:text-base font-semibold shadow-md hover:scale-105 transition-transform"
            >
              Connect Wallet
            </button>
          )}
        </nav>

        {/* Input Section */}
        {account && (
          <div className="w-full max-w-3xl flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl text-black placeholder-gray-500 font-medium 
                focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1 
                focus:text-white transition-all bg-white/10 backdrop-blur-sm text-sm sm:text-base"
                placeholder="Add a new task..."
                disabled={loading}
              />
              {/* Add Task Button */}
              <button
                onClick={addTask}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-yellow-400 rounded-xl font-semibold hover:scale-105 transition-transform shadow-md disabled:opacity-50 text-sm sm:text-base"
                disabled={loading && action === "add"}
              >
                {loading && action === "add" ? "Adding..." : "Add"}
              </button>
            </div>

            {/* Task List */}
            <ul className="flex flex-col gap-4">
              {loading && <TaskSkeleton />}
              {!loading && tasks.length === 0 && (
                <p className="text-gray-300 text-center mt-4 text-sm sm:text-base">
                  No pending tasks. Add your first one! ✨
                </p>
              )}
              {!loading &&
                tasks.map((task, index) => (
                  <li
                    key={index}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-2xl shadow-lg hover:scale-105 transition-transform"
                  >
                    <div className="w-full sm:w-auto">
                      <span className="block text-base sm:text-lg font-medium break-words text-white">
                        {task.content}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        Started: {formatTime(task.timestamp)}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="px-4 py-2 rounded-lg font-semibold shadow-md bg-green-500 hover:bg-green-600 transition-colors text-sm sm:text-base"
                      disabled={loading && action === "done"}
                    >
                      {loading && action === "done" ? "Task Done..." : "Done"}
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
      <About />
      {/* Footer */}
      <footer className="w-full text-center py-4 bg-gray-900/60 backdrop-blur-sm mt-10">
        <p className="text-xs sm:text-sm text-gray-300">
          Made with <span className="text-pink-400">❤️</span> by{" "}
          <span className="font-semibold text-white">xeylous</span>
        </p>
      </footer>
    </div>
  );
}
