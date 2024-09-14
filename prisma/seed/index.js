import bcrypt from 'bcrypt';
import db from '#helper/db.mjs';
import { roleData } from './data/auth/roles.mjs';
import { userData } from './data/auth/users.mjs';
import { todoData } from './data/content/todos.mjs';
import { tagData } from './data/content/tags.mjs';

const SALT_ROUNDS = 10;

async function main() {
  console.log('Start seeding ...');

  // Seed Roles
  for (const role of roleData) {
    try {
      const existingRole = await db.role.findUnique({
        where: { name: role.name },
      });
      if (!existingRole) {
        await db.role.create({ data: role });
        console.log(`Role ${role.name} seeded`);
      } else {
        console.log(`Role ${role.name} already exists.`);
      }
    } catch (error) {
      console.error(`Error seeding role ${role.name}:`, error);
    }
  }

  // Seed Users
  for (const user of userData) {
    try {
      const existingUser = await db.user.findUnique({
        where: { username: user.username },
      });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash('pw123', SALT_ROUNDS);
        const newUser = await db.user.create({
          data: {
            name: user.name,
            username: user.username,
            password: hashedPassword,
          },
        });

        // Assign roles to the user
        for (const roleName of user.roles) {
          const role = await db.role.findUnique({ where: { name: roleName } });
          if (role) {
            await db.userRole.create({
              data: {
                userName: newUser.name,
                roleName: role.name,
              },
            });
          }
        }

        console.log(`User ${user.username} seeded with roles`);
      } else {
        console.log(`User ${user.username} already exists.`);
      }
    } catch (error) {
      console.error(`Error seeding user ${user.username}:`, error);
    }
  }

  // Seed Tags
  for (const tag of tagData) {
    try {
      const existingTag = await db.tag.findUnique({
        where: { name: tag.name },
      });
      if (!existingTag) {
        await db.tag.create({ data: tag });
        console.log(`Tag ${tag.name} seeded`);
      } else {
        console.log(`Tag ${tag.name} already exists.`);
      }
    } catch (error) {
      console.error(`Error seeding tag ${tag.name}:`, error);
    }
  }

  // Seed ToDos
  for (const todo of todoData) {
    try {
      const user = await db.user.findUnique({
        where: { username: todo.username },
      });
      if (user) {
        const newToDo = await db.toDo.create({
          data: {
            title: todo.title,
            description: todo.description,
            completed: todo.completed,
            username: user.username,
          },
        });

        // Assign tags to the to-do
        for (const tagName of todo.tags) {
          const tag = await db.tag.findUnique({ where: { name: tagName } });
          if (tag) {
            await db.toDo.update({
              where: { id: newToDo.id },
              data: {
                category: {
                  connect: { name: tag.name },
                },
              },
            });
          }
        }

        console.log(`ToDo "${todo.title}" seeded`);
      }
    } catch (error) {
      console.error(`Error seeding todo "${todo.title}":`, error);
    }
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
