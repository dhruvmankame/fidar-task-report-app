require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('./config/db');
const User = require('./models/User');
const Task = require('./models/Task');

async function run() {
  await connectDB(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task_report');

  await User.deleteMany({});
  await Task.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);
  const manager = await User.create({
    name: 'Priya Manager',
    email: 'manager@fidar.com',
    passwordHash,
    role: 'manager',
  });
  const emp = await User.create({
    name: 'Dhruv Mankame',
    email: 'dhruv@fidar.com',
    passwordHash,
    role: 'employee',
  });
  const emp2 = await User.create({
    name: 'Aisha Khan',
    email: 'aisha@fidar.com',
    passwordHash,
    role: 'employee',
  });

  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();

  await Task.create([
    {
      title: 'Design login screen',
      description: 'Build the React Native login and register UI.',
      status: 'Completed',
      priority: 'High',
      dueDate: new Date(now - 2 * day),
      assignedTo: emp._id,
      assignedToName: emp.name,
      createdBy: manager._id,
      comments: [{ author: manager._id, authorName: manager.name, text: 'Looks great, ship it!' }],
    },
    {
      title: 'Set up REST API',
      description: 'Express + MongoDB CRUD endpoints for tasks.',
      status: 'In Progress',
      priority: 'High',
      dueDate: new Date(now + 1 * day),
      assignedTo: emp._id,
      assignedToName: emp.name,
      createdBy: manager._id,
      comments: [
        {
          author: emp._id,
          authorName: emp.name,
          text: 'Finished auth + task routes today, starting on reports tomorrow.',
          isUpdate: true,
        },
      ],
    },
    {
      title: 'Write project README',
      description: 'Setup instructions, screenshots and API docs.',
      status: 'To Do',
      priority: 'Medium',
      dueDate: new Date(now + 3 * day),
      assignedTo: emp._id,
      assignedToName: emp.name,
      createdBy: manager._id,
    },
    {
      title: 'Fix overdue task badge',
      description: 'Tasks past their due date should show a red badge.',
      status: 'To Do',
      priority: 'Low',
      dueDate: new Date(now - 1 * day),
      assignedTo: emp._id,
      assignedToName: emp.name,
      createdBy: manager._id,
    },
    {
      title: 'Prepare demo video',
      description: 'Record a short walkthrough of all screens.',
      status: 'To Do',
      priority: 'Medium',
      dueDate: new Date(now + 5 * day),
      assignedTo: manager._id,
      assignedToName: manager.name,
      createdBy: manager._id,
    },
    {
      title: 'QA test the mobile app',
      description: 'Run through every screen on a real device and log bugs.',
      status: 'Completed',
      priority: 'Medium',
      dueDate: new Date(now - 1 * day),
      assignedTo: emp2._id,
      assignedToName: emp2.name,
      createdBy: manager._id,
      comments: [
        {
          author: emp2._id,
          authorName: emp2.name,
          text: 'Tested login, dashboard and tasks on Android — all working. Filed 2 minor UI bugs.',
          isUpdate: true,
        },
      ],
    },
    {
      title: 'Design app icon & splash',
      description: 'Create the launcher icon and splash screen assets.',
      status: 'In Progress',
      priority: 'Low',
      dueDate: new Date(now + 2 * day),
      assignedTo: emp2._id,
      assignedToName: emp2.name,
      createdBy: manager._id,
    },
  ]);

  console.log('\n✅ Seeded database');
  console.log('   Login as manager:   manager@fidar.com / password123');
  console.log('   Login as employee:  dhruv@fidar.com   / password123');
  console.log('   Login as employee:  aisha@fidar.com   / password123\n');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
