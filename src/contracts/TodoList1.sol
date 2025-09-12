// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TodoList {
    struct Task {
        uint id;
        string content;
        bool completed;
        uint timestamp; 
    }

    mapping(uint => Task) public tasks;
    uint public taskCount;

    event TaskCreated(uint id, string content, bool completed, uint timestamp);
    event TaskToggled(uint id, bool completed);

    function createTask(string memory _content) public {
        taskCount++;
        tasks[taskCount] = Task(taskCount, _content, false, block.timestamp);
        emit TaskCreated(taskCount, _content, false, block.timestamp);
    }

    function toggleTask(uint _id) public {
        Task storage task = tasks[_id];
        task.completed = !task.completed;
        emit TaskToggled(_id, task.completed);
    }
}
