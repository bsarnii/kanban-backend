import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Board } from '../task-management/boards/entities/board.entity';
import { dbConfig } from '../config/typeorm.config';
import { Status } from 'src/task-management/boards/entities/status.entity';
import { Task } from 'src/task-management/tasks/entities/task.entity';
import * as argon2 from 'argon2';

const dataSource = new DataSource(dbConfig);

async function seed() {
  await dataSource.initialize();
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const userRepo = queryRunner.manager.getRepository(User);
    const boardRepo = queryRunner.manager.getRepository(Board);
    const statusRepo = queryRunner.manager.getRepository(Status);
    const taskRepo = queryRunner.manager.getRepository(Task);
    // Find existing test user
    const existingUser = await userRepo.findOne({ where: { email: 'test@mykanbanapp.com' } });
    if (existingUser) {
      // Find boards created by the user
      const boards = await boardRepo.find({ where: { createdBy: existingUser.id } });
      for (const board of boards) {
        // Find statuses for the board
        const statuses = await statusRepo.find({ where: { board: board } });
        for (const status of statuses) {
          // Find tasks for the status
          const tasks = await taskRepo.find({ where: { status: status } });
          for (const task of tasks) {
            // Remove subtasks if you have a Subtask entity/repo
            await taskRepo.delete(task.id);
          }
          await statusRepo.delete(status.id);
        }
        await boardRepo.delete(board.id);
      }
      await userRepo.delete(existingUser.id);
      console.log('Old test user and related data deleted');
    }
    // Create new test user
    const users = userRepo.create([
      {
        name: 'Test',
        email: 'test@mykanbanapp.com',
        password: await argon2.hash('testmykanbanapp'),
        emailVerified: true
      },
    ]);
    const testUser = await userRepo.save(users);
    console.log('Test user created');

    const boards = boardRepo.create([
      {
        name: 'Platform launch',
        statuses: [],
        tasks: [],
        createdBy: testUser[0].id,
      }
    ]);
    await boardRepo.save(boards);
    console.log('Default board created for test user');

    const statuses = statusRepo.create([
      { name: 'Todo', board: boards[0] },
      { name: 'In Progress', board: boards[0] },
      { name: 'Done', board: boards[0] },
    ]);
    await statusRepo.save(statuses);
    console.log('Default statuses created for the board');

    const tasks = taskRepo.create([
      {
        name: 'Build UI for onboarding flow',
        description: 'Design and implement the user interface for the onboarding flow, ensuring a smooth user experience from sign-up to first use.',
        board: boards[0],
        status: statuses[0],
        orderIndex: 1,
        subtasks: [
          { name: 'Design mockups', completed: false },
          { name: 'Implement frontend', completed: false },
          { name: 'Review onboarding screens', completed: false },
          { name: 'Integrate with backend', completed: false }
        ]
      },
      {
        name: 'Build UI for search',
        description: 'Create an intuitive and responsive search interface that allows users to easily find content within the application.',
        board: boards[0],
        status: statuses[0],
        orderIndex: 2,
        subtasks: [{ name: 'Design search bar', completed: false }, { name: 'Implement search functionality', completed: false }]
      },
      {
        name: 'Test all major user journeys',
        description: 'Conduct thorough testing of all major user journeys to identify and fix any usability issues or bugs before launch.',
        board: boards[0],
        status: statuses[0],
        orderIndex: 3,
        subtasks: [{ name: 'Create test cases', completed: false }, { name: 'Execute tests', completed: false }]
      },
      {
        name: 'Design settings and search pages',
        description: 'Develop the layout and functionality for the settings and search pages, ensuring they are user-friendly and align with the overall design of the application.',
        board: boards[0],
        status: statuses[1],
        orderIndex: 4,
        subtasks: [{ name: 'Design settings page', completed: true }, { name: 'Design search page', completed: false }]
      },
      {
        name: 'Add account management endpoints',
        description: 'Implement backend endpoints for account management, including user profile updates, password changes, and account deletion.',
        board: boards[0],
        status: statuses[1],
        orderIndex: 5,
        subtasks: [{ name: 'Define API routes', completed: true }, { name: 'Implement endpoint logic', completed: false }]
      },
      {
        name: 'Design onboarding flow',
        description: 'Create a comprehensive onboarding flow that guides new users through the key features of the application and helps them get started quickly.',
        board: boards[0],
        status: statuses[1],
        orderIndex: 6,
        subtasks: [{ name: 'Outline onboarding steps', completed: true }, { name: 'Create onboarding content', completed: true }]
      },
      {
        name: 'Add search endpoints',
        description: 'Develop backend endpoints to support search functionality, allowing users to query and retrieve relevant data efficiently.',
        board: boards[0],
        status: statuses[1],
        orderIndex: 7,
      },
      {
        name: 'Create wireframe prototypes',
        description: 'Develop wireframe prototypes for key application screens to visualize the layout and user flow before final design and development.',
        board: boards[0],
        status: statuses[2],
        orderIndex: 8,
        subtasks: [{ name: 'Identify key screens', completed: true }, { name: 'Create wireframes', completed: true }]
      },
      {
        name: 'Review results of usability tests and iterate',
        description: 'Analyze the results from usability tests, identify areas for improvement, and iterate on designs and functionalities to enhance user experience.',
        board: boards[0],
        status: statuses[2],
        orderIndex: 9,
        subtasks: [{ name: 'Compile test results', completed: true }, { name: 'Plan iterations', completed: true }]
      },
      {
        name: 'Competitor analysis',
        description: 'Conduct a thorough analysis of competitors to identify strengths, weaknesses, opportunities, and threats that can inform our product strategy.',
        board: boards[0],
        status: statuses[2],
        orderIndex: 10
      },
      {
        name: 'Research the market',
        description: 'Perform comprehensive market research to understand current trends, customer needs, and potential gaps in the market that our product can address.',
        board: boards[0],
        status: statuses[2],
        orderIndex: 11
      }
    ]);
    await taskRepo.save(tasks);
    console.log('Default tasks created for the board');
    await queryRunner.commitTransaction();
  } catch (err) {
    await queryRunner.rollbackTransaction();
    console.error('Seeding failed, transaction rolled back:', err);
    process.exit(1);
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

seed();